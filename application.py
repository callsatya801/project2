import os

import time
import datetime

from random import random
from math import floor

from flask import Flask, jsonify, render_template, request, session
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Global lists
users=[]
maxMessages = 100
userSID = {}

# list of all channels
channel_list = ['general']

#most recent messages -- 100
#{'channelName':[{user:<username>,msgTime:<msgTime>,msg:<msg>}]}
channel_chatMessages = {'general':[]}

# set current Channel
currChannel = 'general'

@app.route("/")
def index():
    #return "Project 2: TODO"

    # set current Channel
    currChannel = 'general'
    #re-load the lists to send as parameters
    return render_template("index.html")

@socketio.on("connect")
def on_connect():
    session['username']=''
    session['room']=''

@socketio.on("newMsg")
def on_newMsg(data):
    # Add the new Message to MessageHistory for a given channel
    global channel_chatMessages
    global maxMessages

    msgTime= datetime.datetime.now().strftime("%A, %d. %B %Y %I:%M%p")
    user = session['username']

    isPrivateMsg = False
    #Check if new Message is a private message
    nMsg = data['newMsg'].strip();
    if(nMsg[0:3]=='/p:'):
        nMsg = nMsg[3:]
        isPrivateMsg=True
        print(f" In message - a private message {nMsg}")

        #Remove any white spaces between UserName
        nMsg = nMsg.strip()
        idx = nMsg.find(':')
        if(idx != -1):
            pUserName=nMsg[0:idx]
            nMsg = nMsg[idx+1:]

            # Remove any white spaces after userName - for message
            nMsg = nMsg.strip()
            print(f"User extracted - {pUserName} with Message - {nMsg}")

    chatMsg = {'user':user,'msgTime':msgTime, 'message':nMsg}
    if isPrivateMsg:
        #check if user exists - if exists
        if pUserName in userSID:
            print(f" user exists in UserSID - with ID: {userSID[pUserName]}")
            emit("privateMsg",chatMsg, room=userSID[pUserName])
            return
        else:
            print(f" user Does not exist in UserSID")
            return

    userRoom = session['room']

    #append the chat message.
    #check the lenght of the channel messages - and remove the topelement if
    #message count > 100
    channel_chatMessages[userRoom].append(chatMsg)
    if len(channel_chatMessages[userRoom]) > maxMessages:
        channel_chatMessages[userRoom].pop(0)

    #Broadcast the message to the channel
    emit("appendNewMsg",chatMsg, broadcast=True, room=userRoom )


@socketio.on("newUser")
def on_newUser(data):
    global channel_list
    global channel_chatMessages
    print(f'Satya: serverside on on_newUser  - {data}')
    l_newUser = data["User"].strip();
    if len(l_newUser)==0:
        return False

    if l_newUser in users:
        return False
    else:
        #request.displayName=data
        users.append(l_newUser)

        #store request SID against user to send private messages
        userSID[l_newUser]=request.sid

        session['username'] = l_newUser
        #check if user local storage channel exists
        if data["channel"] in channel_list:
            userRoom= data["channel"]
        else:
            userRoom=channel_list[0]
        session['room'] = userRoom

        #join in to che room ==channel
        join_room(userRoom)

        #All Available Members
        emit("usernames", users, broadcast=True)

        #All Available Members
        emit("channelList", channel_list, broadcast=True)

        #Refresh the old messages to new User for a give channel
        chatMessages = channel_chatMessages[userRoom]
        emit('switchRoomRefresh', {'channel':userRoom, 'messages':chatMessages},room=userRoom)

        return True

#On creating the new Channels - Channels are not Room Specifc
#It needs to be propogated to all users connected
@socketio.on("newChannel")
def on_newChannel(data):
    global channel_list
    global channel_chatMessages

    l_newChannel = data.strip();
    if len(l_newChannel)==0:
        return False


    if l_newChannel in channel_list:
        return False
    else:
        channel_list.append(l_newChannel)

        #All Available Members
        emit("channelList", channel_list, broadcast=True)
        channel_chatMessages[l_newChannel] =[]
        return True

@socketio.on("switchRoom")
def on_switchRoom(data):
    # Add the new Message to MessageHistory for a given channel
    global channel_chatMessages

    # Trying to switch room from current room to same room - No action needed
    if session['room'] == data:
        return True
    else:
        #leave current room
        leave_room(session['room'])

        #set userRoom to new Room
        session['room'] = data
        #Join new room
        join_room(data)
        chatMessages = channel_chatMessages[data]

        emit('switchRoomRefresh', {'channel':data, 'messages':chatMessages},room=data)
        return True

@socketio.on("disconnect")
def on_disconnect():
    if session['username'] in users:
        users.remove(session['username'])
        userSID.pop(session['username'])

    emit("usernames", users, broadcast=True)
    print(f" User - {session['username']} is leaving on-disconnect")
    # Channel specific users
    userRoom = session['room']
    emit("roomUsers", {'users':users, 'room':userRoom}, broadcast=True, room=userRoom)

# handles all namespaces without an explicit error handler
@socketio.on_error_default
def default_error_handler(e):
    pass