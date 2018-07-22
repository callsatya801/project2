import os

import time
import datetime

from random import random
from math import floor

from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Global lists
subscrChannels=[]
channelUsers=[]
channelMessages=[]
channel_list=[]

currChannel=""
userName=""

# set default user-testing
userName='user1'

# set current Channel
currChannel = 'general'


# list of all users
users=[]
for i in range(0,5):
    users.append('user'+str(i))


# list of all channels
channel_list = ['general']
for i in range(0,5):
    channel_list.append('channel_'+str(i))


#Users Channel List
user_channels=[]
for user in users:
   user_channels.append({'user':user, 'channels':channel_list})

#Channel Users List
channel_users=[]
for channel in channel_list:
    cUsers = []
    for i in range(floor(random()*6)):
        cUsers.append('user'+str(i))
    channel_users.append({'channel':channel, 'users':cUsers})


#most recent messages -- 100
channel_chatMessages = []
for channel in channel_list:
    chatMessage=[]
    for i in range(0,50):
        userx ='user'+str(floor(random()*6))
        msgTime= datetime.datetime.now().strftime("%A, %d. %B %Y %I:%M%p")
        msg = f"message from : {userx} ---------- message:{i} --- for channel: {channel}"
        chatMessage.append({'user':userx,'msgTime':msgTime, 'message':msg})
    channel_chatMessages.append({'channel':channel, 'messages':chatMessage})


def reload():

    global subscrChannels
    global channelUsers
    global channelMessages
    global channel_chatMessages
    global channel_list
    global currChannel
    global userName

    # Extract the subscription channels by User
    # looping thru the list and extract the list
    for x in user_channels:
        if x["user"] ==userName:
            subscrChannels = x["channels"]
            break

    print(f"user: {userName} and subscrChannels:{subscrChannels}")


    # Extract the users subscribed to specific channels
    # looping thru the list and extract the users list
    for x in channel_users:
        if x["channel"] ==currChannel:
            channelUsers = x["users"]
            break

    #print(f"currChannel: {currChannel} and channelUsers:{channelUsers}")

    # Extract the all messages for a given channel
    # looping thru the list and extract the messages list
    for x in channel_chatMessages:
        if x["channel"] ==currChannel:
            channelMessages = x["messages"]
            break

    #print(f"currChannel: {currChannel} and channelMessages:{channelMessages}")
    return


@app.route("/")
def index():
    #return "Project 2: TODO"
    #set the Initial User on Load.
    # this may not be executed -
    userName='user1'

    # set current Channel
    currChannel = 'general'
    #re-load the lists to send as parameters
    reload()
    print(f"I'm in index method with channel list: {subscrChannels}")
    return render_template("index.html", userName=userName, allChannels=channel_list, subscrChannels=subscrChannels, currentChannel= currChannel,channelUsers=channelUsers, channelChatMsgs=channelMessages )


@app.route("/<channel_ID>")
def switchChannel(channel_ID):
    #set the current channel to new Channel.
    global currChannel
    global userName

    currChannel = channel_ID
    #re-load the lists to send as parameters
    reload()
    print(f"I'm in switchChannel ChannelID:{channel_ID} with channel messages: {channelMessages[0]}")
    channelDict={
        "userName": userName,
        "allChannels": channel_list,
        "subscrChannels": subscrChannels,
        "currentChannel": currChannel,
        "channelUsers": channelUsers,
        "channelChatMsgs": channelMessages
    }
    return jsonify (channelDict)

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
    print(f'Satya: serverside onconnect socket invoked - {request.sid}')

@socketio.on("newMsg")
def on_newMsg(data):
    print(f'Satya: serverside on newMsg  - {data}')
    # Add the new Message to MessageHistory for a given channel
    global channel_chatMessages
    msgTime= datetime.datetime.now().strftime("%A, %d. %B %Y %I:%M%p")
    chatMsg = {'user':data["User"],'msgTime':msgTime, 'message':data["newMsg"]}
    channel_chatMessages['channel'=='general']['messages'].append(chatMsg)
    print(f"channel messages - {channel_chatMessages['channel'=='general']['messages']}")

    #Broadcast the message to the channel
    emit("appendNewMsg",chatMsg, broadcast=True )
