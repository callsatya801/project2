document.addEventListener('DOMContentLoaded', () => {

    // Socket-io - specific code
    // Connect to websocket
      var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

      //check localStorageVariable - User and initail channel
      if (localStorage.getItem('lsUser'))
      {   var lsUser=localStorage.getItem('lsUser');
          //default current channel to general
          var lsCurrChannel='general';
          if(localStorage.getItem('lsCurrChannel'))
          {
              lsCurrChannel=localStorage.getItem('lsCurrChannel');
          }
          setInitialUser(socket, lsUser,lsCurrChannel);
      }

       socket.on('appendNewMsg', data=>
                    {
                     console.log(`data received thru appendNewMsg - ${data.user} -${data.msgTime} - ${data.message}`);
                     htmlStr = `<div class="card w-100">
                                 <div class="card-body">
                                    <p class="card-title mb-0 font-weight-bold" style="padding-right:10px"><strong>${data.user}</strong>
                                        <small class="text-muted">(${data.msgTime})</small>
                                    </p>
                                    <p class="card-text">${data.message}</p>
                                 </div>
                                </div>`;

                       //append the new message to the existing messages
                     const textElement = document.createElement('text');
                     textElement.className="border-0 list-group-item flex-column align-items-start";
                     textElement.innerHTML=htmlStr;
                     document.querySelector('#chatMsgList').appendChild(textElement);


                     //after adding new message - scroll
                      scroll_chat_window();
                    }
          );


       socket.on('privateMsg', data=>
                    {
                     console.log(`data received thru privateMsg - ${data.user} -${data.msgTime} - ${data.message}`);

                     htmlStr = `<div class="d-flex w-100 ">
                                  <small class="mb-0 font-weight-bold" style="padding-right:10px">${data.user}</small>
                                  <small class="text-muted">(${data.msgTime})</small>
                                </div>
                                  <p class="text-muted" style="font-size:120%"><b>Private Message:</b><i>${data.message}</i></p>`;

                       //append the new message to the existing messages
                     const textElement = document.createElement('text');
                     textElement.className="border-0 list-group-item flex-column align-items-start";
                     textElement.innerHTML=htmlStr;
                     document.querySelector('#chatMsgList').appendChild(textElement);


                     //after adding new message - scroll
                      scroll_chat_window();
                    }
          );


        socket.on('usernames', data=>
                {
                     console.log(`data received thru usernames - ${data}`);

                     //Update the Users list - remove the Whole userlist and re-display
                    var pId='#usersArea';
                    var pTemplate= '#t_cMembers';
                    var id_to_Add= 'oUsers';
                	let element = document.querySelector(pId);

        	        //if Element found remove the content- add the respective HadlebarTemplate and pass respective content
        	        if(element)
        	        {
        	          //find the child element and remove
        	          cElement = document.querySelector(id_to_Add);
        	          if (cElement) {cElement.remove();}
                      const template = Handlebars.compile(document.querySelector(pTemplate).innerHTML);
                     // Add content to DOM.
                      const content = template({'id': id_to_Add, 'contents':data});
        	          element.innerHTML=content;
        	       }
                }
          );

        // Update Channel List
        socket.on('channelList', data=>
                    {
                    console.log(`data received thru channelList - ${data}`);
                    //Update the Channel list - remove the Whole userlist and re-display
                    var pId='#yChannels';
                    var pTemplate= '#t_yChannels';
                    var id_to_Add= 'subscribedChannels';
                	let element = document.querySelector(pId);

        	        //if Element found remove the content- add the respective HadlebarTemplate and pass respective content
        	        if(element)
        	        {
        	          //find the child element and remove
        	          cElement = document.querySelector(id_to_Add);
        	          if (cElement) {cElement.remove();}
                      const template = Handlebars.compile(document.querySelector(pTemplate).innerHTML);
                     // Add content to DOM.
                      const content = template({'id': id_to_Add, 'contents':data});
        	          element.innerHTML=content;
        	        }
        	       // Set links up to load new pages.
                   //set_Your_channel_links();
                    document.querySelectorAll('button').forEach(button => {
                    button.onclick = () => {
                        //load_page(link.dataset.channelid);
                        socket.emit('switchRoom',button.dataset.channelid);

                        console.log(button.dataset.channelid);
                        return false;
                        };
                    });
                }
          );

        socket.on('switchRoomRefresh', data=>
                {
                    console.log(`data received thru switchRoomRefresh - ${data.channel} -${data.messages} `);
                    //Update the Title and Current Channel Display
                    let title_element = document.querySelector('#title');
                    if (title_element)
                      {
                          title_element.innerHTML=`Chatterbox - ${data.channel}`;
                      }

                    //Update Chat Window - Title
                    let ctitle_element = document.querySelector('#currChannelHeader');
                    if (ctitle_element)
                      {
                          ctitle_element.innerHTML=`You are in Channel# : <strong>${data.channel}</strong>`;
                          //set localStorge
                          localStorage.setItem('lsCurrChannel',data.channel);
                      }

                    //find the message area and rebuilt from history
                    var pId='#chatMessages';
                    var pTemplate= '#t_cMsgs';
                    var id_to_Add= 'chatMsgList';
                	let element = document.querySelector(pId);

        	        //if Element found remove the content- add the respective HadlebarTemplate and pass respective content
        	        if(element)
        	        {
        	          //find the child element and remove
        	          cElement = document.querySelector(id_to_Add);
        	          if (cElement) {cElement.remove();}
                      const template = Handlebars.compile(document.querySelector(pTemplate).innerHTML);
                     // Add content to DOM.
                      const content = template({'id': id_to_Add, 'contents':data.messages});
        	          element.innerHTML=content;
        	        }
        	        //scroll to bottom of the messages
        	        scroll_chat_window();
                }
             );


        socket.on('switchRoomRefreshxx', data=>
                    {
                     console.log(`data received thru roomUsers - ${data.channel} -${data.messages} `);
                }
          );
    // Socket-io - specific code

    // set onDisplay Name form
     document.querySelector('#setDisplayName').onsubmit = () => {
           console.log('inside setDisplayName ');

          const newUser = document.querySelector('#displayName').value;
          // reset the value
          document.querySelector('#displayName').value='';

          setInitialUser(socket, newUser,'general');

          //return false - enforce not to refresh the page
          return false;
      };

    // set onSubmit on Create New Channel
     document.querySelector('#chatMsgForm').onsubmit = () => {
           console.log('inside send new message ');

          const nChatMsg = document.querySelector('#newChatMsg').value;
          // reset the value
          document.querySelector('#newChatMsg').value='';

          socket.emit('newMsg',{'newMsg':nChatMsg });

          //return false - enforce not to refresh the page
          return false;
      };

     // set onDisplay Name form
      document.querySelector('#newChannelForm').onsubmit = () => {
                console.log('inside Create Channel ');

                const nChannel = document.querySelector('#newChannel').value;
                // reset the value
                document.querySelector('#newChannel').value='';
                socket.emit('newChannel', nChannel, function(conf) {

                    console.log(`trying to find the conf: ${conf}`);
                    // use acknowledge to check if success/fail
                    if (conf) {
                        console.log(` ${nChannel} - created successfully`);
                    } else {
                        console.log(` ${nChannel} - created NOT successfully - Try with New Name`);
                    }

                });

                //return false - enforce not to refresh the page
                return false;
            };
     //scroll
     scroll_chat_window();


});

function scroll_chat_window()
{
    // setting the chat messages area to the bottom - most recent message
    var element = document.getElementById("chatMessages");
	element.scrollTop = element.scrollHeight;
}


function setInitialUser (socket,iUser,iChannel )
{
          socket.emit('newUser',{'User':iUser,'channel':iChannel}, function(conf){

          console.log(`trying to find the conf: ${conf}`);
           // use acknowledge to check if success/fail
           if (conf)
           {
            //New User - successful
            //Hide the Display User entry form and Display the Chat Area
            document.querySelector('#displayNameArea').style.display="none";
            document.querySelector('#pageArea').style.display="block";

            document.querySelector('#dUserName').innerHTML=iUser;
            console.log(`trying to set the value of new display name: ${iUser}`);
            //set local storage variable for User
            localStorage.setItem('lsUser',iUser);
           }
           else
           {
            //New User - Not successful
            //Hide the Display User entry form and Display the Chat Area
             document.querySelector('#dUserName').innerHTML='';

            document.querySelector('#displayNameArea').style.display="block";
            document.querySelector('#pageArea').style.display="none";
            document.querySelector('#displayNameError').innerHTML="Display Username is already taken. Please try with NEW Display Name:"
           }

          });
}