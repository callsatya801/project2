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

# list of all channels
channel_list = ['general','Channel2']

#most recent messages -- 100
#{'channelName':[{user:<username>,msgTime:<msgTime>,msg:<msg>}]}
channel_chatMessages = {}

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


@app.route("/<channel_ID>")
def switchChannel(channel_ID):
    return '1'

@app.route("/create", methods=["POST"])
def createChannel():
    # append the new channel if valid to channel list
    global channel_list

    #get the new channelName
    nChannel = request.form.get("newChannel")
    print(f"Inside Create Routine - with form value - {nChannel}")


    if nChannel in channel_list:
        print(f"Inside Create Routine - with form value - {nChannel} - Success-false")
        return jsonify({"success": False})
    else:
        channel_list.append(nChannel)
        print(f"Inside Create Routine - with form value - {nChannel} - Success-true")
        return jsonify({"success": True, "newChannel":nChannel})

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
    msgTime= datetime.datetime.now().strftime("%A, %d. %B %Y %I:%M%p")
    chatMsg = {'user':session['username'],'msgTime':msgTime, 'message':data['newMsg']}
    userRoom = session['room']
    print(f"channel messages - {chatMsg} - {data['room']} -- {channel_chatMessages}")

    #Broadcast the message to the channel
    emit("appendNewMsg",chatMsg, broadcast=True, room=userRoom )

@socketio.on("newUser")
def on_newUser(data):
    global channel_list
    print(f'Satya: serverside on on_newUser  - {data}')
    if data in users:
        return False
    else:
        #request.displayName=data
        users.append(data)
        session['username'] = data
        if data[0] == 'C':
            userRoom= channel_list[1]
        else:
            userRoom=channel_list[0]
        session['room'] = userRoom
        print(f'Satya: serverside on before join room  - {userRoom}')

        join_room(userRoom)

        #All Available Members
        emit("usernames", users, broadcast=True)

        # Channel specific users
        emit("roomUsers", {'users':users, 'room':userRoom}, broadcast=True, room=userRoom)
        return True

#On creating the new Channels - Channels are not Room Specifc
#It needs to be propogated to all users connected
@socketio.on("newChannel")
def on_newChannel(data):
    global channel_list
    print(f'Satya: serverside on on_newChannel  - {data}')
    if data in channel_list:
        return False
    else:
        channel_list.append(data)
        #All Available Members
        emit("channelList", channel_list, broadcast=True)
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
        emit('switchRoomRefresh', {'channel':data, 'messages':chatMessages})
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


