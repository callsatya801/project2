document.addEventListener('DOMContentLoaded', () => {

            // Socket-io - specific code
            // Connect to websocket
            var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

            socket.on('appendNewMsg', data => {
                console.log(`data received thru appendNewMsg - ${data.user} -${data.msgTime} - ${data.message}`);

                //append the new message to the existing messages
                const li = document.createElement('li');
                li.innerHTML = `<strong>${data.user}:</strong> <div class="text-muted">${data.msgTime}</div> <p class="card-text">${data.message}</p> `;
                document.querySelector('#chatMsgList').append(li);

                //after adding new message - scroll
                scroll_chat_window();

            });

            socket.on('usernames', data => {
                console.log(`data received thru usernames - ${data}`);

                //Update the Users list - remove the Whole userlist and re-display
                var pId = '#usersArea';
                var pTemplate = '#t_cMembers';
                var id_to_Add = 'oUsers';
                let element = document.querySelector(pId);

                //if Element found remove the content- add the respective HadlebarTemplate and pass respective content
                if (element) {
                    //find the child element and remove
                    cElement = document.querySelector(id_to_Add);
                    if (cElement) {
                        cElement.remove();
                    }
                    const template = Handlebars.compile(document.querySelector(pTemplate).innerHTML);
                    // Add content to DOM.
                    const content = template({
                        'id': id_to_Add,
                        'contents': data
                    });
                    element.innerHTML = content;
                }
            });

            // Update Channel List
            socket.on('channelList', data => {
                console.log(`data received thru channelList - ${data}`);

                //Update the Users list - remove the Whole userlist and re-display
                var pId = '#yChannels';
                var pTemplate = '#t_yChannels';
                var id_to_Add = 'subscribedChannels';
                let element = document.querySelector(pId);

                //if Element found remove the content- add the respective HadlebarTemplate and pass respective content
                if (element) {
                    //find the child element and remove
                    cElement = document.querySelector(id_to_Add);
                    if (cElement) {
                        cElement.remove();
                    }
                    const template = Handlebars.compile(document.querySelector(pTemplate).innerHTML);
                    // Add content to DOM.
                    const content = template({
                        'id': id_to_Add,
                        'contents': data
                    });
                    element.innerHTML = content;
                }
            });

            socket.on('roomUsers', data => {
                console.log(`data received thru roomUsers - ${data}`);
            });

            // Socket-io - specific code

            // set onDisplay Name form
            document.querySelector('#setDisplayName').onsubmit = () => {
                console.log('inside setDisplayName ');

                const newUser = document.querySelector('#displayName').value;
                // reset the value
                document.querySelector('#displayName').value = '';
                socket.emit('newUser', newUser, function(conf) {

                    console.log(`trying to find the conf: ${conf}`);
                    // use acknowledge to check if success/fail
                    if (conf) {
                        //New User - successful
                        //Hide the Display User entry form and Display the Chat Area
                        document.querySelector('#displayNameArea').style.display = "none";
                        document.querySelector('#pageArea').style.display = "block";

                        document.querySelector('#dUserName').innerHTML = newUser;
                        console.log(`trying to set the value of new display name: ${newUser}`);

                    } else {
                        //New User - Not successful
                        //Hide the Display User entry form and Display the Chat Area
                        document.querySelector('#dUserName').innerHTML = '';

                        document.querySelector('#displayNameArea').style.display = "block";
                        document.querySelector('#pageArea').style.display = "none";
                        document.querySelector('#displayNameError').innerHTML = "Display Username is already taken. Please try with NEW Display Name:"
                    }

                });

                //return false - enforce not to refresh the page
                return false;
            };

            // set onSubmit on Create New Channel
            document.querySelector('#chatMsgForm').onsubmit = () => {
                console.log('inside send new message ');

                const nChatMsg = document.querySelector('#newChatMsg').value;
                // reset the value
                document.querySelector('#newChatMsg').value = '';
                socket.emit('newMsg', {
                    'room': 'general',
                    'newMsg': nChatMsg
                });

                //return false - enforce not to refresh the page
                return false;
            };

            //scroll
            scroll_chat_window();

            // Set links up to load new pages.
            set_Your_channel_links();

            // set onSubmit on Create New Channel
            document.querySelector('#newChannelForm').onsubmit = () => {
                console.log('inside Create Channel');

                const nChannel = document.querySelector('#newChannel').value;
                // reset the value
                document.querySelector('#newChannel').value = '';

                console.log(`${nChannel}`);
                //emit
                socket.emit("newChannel", nChannel, function(conf) {
                    console.log(`trying to find the conf: ${conf}`);
                    // use acknowledge to check if success/fail
                    if (conf) {
                        //new Channel - successful - show Success Confirmation
                        //document.querySelector('#displayNameError').innerHTML="Display Username is already taken. Please try with NEW Display Name:"
                        console.log(`${nChannel} - Created successfully !`);
                    } else {
                        //New User - Not successful - Show Error
                        //document.querySelector('#displayNameError').innerHTML="Display Username is already taken. Please try with NEW Display Name:"
                        console.log(`${nChannel} - Not Created successfully  - Try new Channel Name !`);
                    }

                });

                //return false - enforce not to refresh the page
                return false;

            };

            function scroll_chat_window() {
                // setting the chat messages area to the bottom - most recent message
                var element = document.getElementById("chatMessages");
                element.scrollTop = element.scrollHeight;
            }

            // Set the Navigation Links - for Channels - Reset on each refresh
            function set_Your_channel_links() {
                console.log('Inside set_Your_channel_links');
                // Set links up to load new pages.
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.onclick = () => {
                        load_page(link.dataset.channelid);
                        console.log(link.dataset.channelid)
                        return false;
                    };
                });

            };

            // Renders contents of new page in main view.
            function load_page(name) {
                const request = new XMLHttpRequest();
                request.open('GET', `/${name}`);
                request.onload = () => {
                    const responseData = JSON.parse(request.responseText);
                    document.querySelector('#title').innerHTML = `Chatterbox - ${responseData.currentChannel}`;
                    document.querySelector('#currChannelHeader').innerHTML = `Current #Channel# - ${responseData.currentChannel}`;

                    var idList = ['#chatMsgList', '#availableChannels', '#oUsers'];
                    var i;
                    for (i = 0; i < idList.length; i++) {
                        console.log(idList[i]);
                        let element = document.querySelector(idList[i]);
                        console.log(element);
                        if (element) {
                            element.remove();
                        };
                    };

                    //Loop thru the Parent IDs and add them to page along with child IDs
                    var pIdList = ['#chatMessages', '#aChannels', '#usersArea'];
                    var pTemplateList = ['#t_cMsgs', '#t_aChannels', '#t_cMembers'];
                    var idList_to_Add = ['chatMsgList', 'availableChannels', 'oUsers'];
                    var pContentList = [responseData.channelChatMsgs, responseData.allChannels, responseData.channelUsers];
                    for (i = 0; i < pIdList.length; i++) {
                        console.log(pIdList[i]);
                        let element = document.querySelector(pIdList[i]);
                        console.log(element);

                        //if Element found - add the respective HadlebarTemplate and pass respective content
                        if (element) {
                            console.log(pTemplateList[i]);
                            const template = Handlebars.compile(document.querySelector(pTemplateList[i]).innerHTML);
                            // Add content to DOM.
                            const content = template({
                                'id': idList_to_Add[i],
                                'contents': pContentList[i]
                            });
                            element.innerHTML = content;
                        };
                    };

                    console.log(responseData);
                    var element = document.getElementById("chatMessages");
                    element.scrollTop = element.scrollHeight;

                    // Set links up to load new pages.
                    set_Your_channel_links();

                };
                request.send();
            }
        }
