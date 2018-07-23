# Project 2

Web Programming with Python and JavaScript

Milestone 1
Display Name: When a user visits your web application for the first time, they should be prompted to type in a display name that will eventually be associated with every message the user sends.
If a user closes the page and returns to your app later, the display name should still be remembered.
>>> Added - OnLoad Page - initially checks for LocalStorage if any user/channel details are stored.
>> If user info exists in local storage - page is redirected to stored channel - or Default to general if channel do not exist
>>> If users are not stored locally - Display input field to enter display name and once validated against online users redirects to general - default channel

Channel Creation: Any user should be able to create a new channel, so long as its name doesn’t conflict with the name of an existing channel.
>>> Input box and submit button provided on side navigational bar - to enter new channel. It validates against exiting channel, if it doesn't it creates new else no changes.

Channel List: Users should be able to see a list of all current channels, and selecting one should allow the user to view the channel.
We leave it to you to decide how to display such a list.
>>> Once the channel is created - Your channel list is updated and broadcasted to all users - not specific to any room.

Milestone 2

Messages View: Once a channel is selected, the user should see any messages that have already been sent in that channel, up to a maximum of 100 messages.
Your app should only store the 100 most recent messages per channel in server-side memory.
>>> Storing the most recent 100 messages. On saving every message against the channel - I pop the old messages once we reach maxMessages - 100
>>> up on switching the channel - the messages are refreshed from the list

Sending Messages: Once in a channel, users should be able to send text messages to others the channel. When a user sends a message, their display name and the timestamp of the message should be associated with the message. All users in the channel should then see the new message (with display name and timestamp) appear on their channel page.
Sending and receiving messages should NOT require reloading the page.
>>> Created channels to broadcast messages. Broadcasted messages to only specific channels. Members in the channel will be able to see
>>> members list always shows all connected to application irrespective of channel they are in.
>>> Their current channel is shown on ChatMessages Title and Title of the Page.

Milestone 3
Remembering the Channel: If a user is on a channel page, closes the web browser window, and goes back to your web application,
your application should remember what channel the user was on previously and take the user back to that channel.
>>> able to acheive this using LocalStorage. Updating the local storage on newUsers and swithcing the channel to store the current channel

Personal Touch: Add at least one additional feature to your chat application of your choosing! Feel free to be creative,
but if you’re looking for ideas, possibilities include: supporting deleting one’s own messages,
supporting use attachments (file uploads) as messages, or supporting private messaging between two users.
Other ideas are certainly possible. If unsure of whether your idea for a personal touch would qualify, contact your teaching fellow for input!
>>


Other Info:
Tried to use icons from google - material designe to beautify the chat
"https://fonts.googleapis.com/icon?family=Material+Icons"

Implemented - JavaScript Template Handlers