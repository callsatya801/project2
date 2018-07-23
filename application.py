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
maxMessages = 10

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
    #Redirect to Initial Page - up on load based on local storage it moves to default channel.

    # set current Channel
    currChannel = 'general'
    #re-load the lists to send as parameters
    print(f"I'm in index method with channel list: {channel_list}")
    return render_template("index.html")

@socketio.on("connect")
def on_connect():
    #socketio.displayName=''
    session['username']=''
    session['room']=''
    print(f'Satya: serverside onconnect socket invoked - {request.sid}')

@socketio.on("newMsg")
def on_newMsg(data):
    print(f'Satya: serverside on newMsg  - {data}')
    # Add the new Message to MessageHistory for a given channel
    global channel_chatMessages
    global maxMessages

    msgTime= datetime.datetime.now().strftime("%A, %d. %B %Y %I:%M%p")
    chatMsg = {'user':session['username'],'msgTime':msgTime, 'message':data['newMsg']}
    userRoom = session['room']
    #append the chat message.
    #check the lenght of the channel messages - and remove the topelement if
    #message count > 100
    channel_chatMessages[userRoom].append(chatMsg)
    if len(channel_chatMessages[userRoom]) > maxMessages:
        channel_chatMessages[userRoom].pop(0)

    print(f"channel messages - {chatMsg} - {data['room']} -- {channel_chatMessages}")

    #Broadcast the message to the channel
    emit("appendNewMsg",chatMsg, broadcast=True, room=userRoom )

@socketio.on("newUser")
def on_newUser(data):
    global channel_list
    global channel_chatMessages
    print(f'Satya: serverside on on_newUser  - {data}')
    if data["User"] in users:
        return False
    else:
        #request.displayName=data
        users.append(data["User"])
        session['username'] = data["User"]
        #check if user local storage channel exists
        if data["channel"] in channel_list:
            userRoom= data["channel"]
        else:
            userRoom=channel_list[0]
        session['room'] = userRoom
        print(f'Satya: serverside on before join room  - {userRoom}')

        join_room(userRoom)

        #All Available Members
        emit("usernames", users, broadcast=True)

        #All Available Members
        emit("channelList", channel_list, broadcast=True)

        #Refresh the old messages to new User for a give channel
        chatMessages = channel_chatMessages[userRoom]
        emit('switchRoomRefresh', {'channel':userRoom, 'messages':chatMessages},room=userRoom)
        #emit("refreshMsgHistory", channel_chatMessages[userRoom], broadcast=True, room=userRoom)

        # Channel specific users
        emit("roomUsers", {'users':users, 'room':userRoom}, broadcast=True, room=userRoom)
        return True

#On creating the new Channels - Channels are not Room Specifc
#It needs to be propogated to all users connected
@socketio.on("newChannel")
def on_newChannel(data):
    global channel_list
    global channel_chatMessages
    print(f'Satya: serverside on on_newChannel  - {data}')
    if data in channel_list:
        return False
    else:
        channel_list.append(data)
        #All Available Members
        emit("channelList", channel_list, broadcast=True)
        channel_chatMessages[data] =[]
        return True

@socketio.on("switchRoom")
def on_switchRoom(data):
    print(f'Satya: serverside on switchRoom  - {data}')
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
        print(f"channel messages - {data} -- {chatMessages}")
        return True


@socketio.on("disconnect")
def on_disconnect():
    if session['username'] in users:
        users.remove(session['username'])
    #print(f"Satya: serverside on disconnectUser -- {users}")
    print(f"Satya: serverside on disconnectUser -- {session['username']}")
    emit("usernames", users, broadcast=True)

    # Channel specific users
    userRoom = session['room']
    emit("roomUsers", {'users':users, 'room':userRoom}, broadcast=True, room=userRoom)

# handles all namespaces without an explicit error handler
@socketio.on_error_default
def default_error_handler(e):
    pass