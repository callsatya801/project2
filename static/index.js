document.addEventListener('DOMContentLoaded', () => {

    // Socket-io - specific code
    // Connect to websocket
      var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

      socket.on('connect', ()=> {console.log('connected thru web scocket')}
          );

        socket.on('appendNewMsg', data=>
                    {
                     console.log(`data received thru appendNewMsg - ${data.user} -${data.msgTime} - ${data.message}`);

                     //append the new message to the existing messages
                     const li = document.createElement('li');
                     li.innerHTML = `appendNewMsg:  ${data.user} -${data.msgTime} - ${data.message}`;
                     document.querySelector('#chatMsgList').append(li);

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


    // Socket-io - specific code

    // set onDisplay Name form
     document.querySelector('#setDisplayName').onsubmit = () => {
           console.log('inside setDisplayName ');

          const newUser = document.querySelector('#displayName').value;
          // reset the value
          document.querySelector('#displayName').value='';
          socket.emit('newUser',newUser, function(conf){

          console.log(`trying to find the conf: ${conf}`);
           // use acknowledge to check if success/fail
           if (conf)
           {
            //New User - successful
            //Hide the Display User entry form and Display the Chat Area
            document.querySelector('#displayNameArea').style.display="none";
            document.querySelector('#pageArea').style.display="block";

            document.querySelector('#dUserName').innerHTML=newUser;
            console.log(`trying to set the value of new display name: ${newUser} for element ${elment}`);

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

          //return false - enforce not to refresh the page
          return false;
      };

    // set onSubmit on Create New Channel
     document.querySelector('#chatMsgForm').onsubmit = () => {
           console.log('inside send new message ');

          const nChatMsg = document.querySelector('#newChatMsg').value;
          // reset the value
          document.querySelector('#newChatMsg').value='';
          socket.emit('newMsg',{'User':'xxxx','newMsg':nChatMsg });

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
          // Initialize new request
          const request = new XMLHttpRequest();
          const nChannel = document.querySelector('#newChannel').value;

          // reset the value
          document.querySelector('#newChannel').value='';

          console.log(`${nChannel}`);
          request.open('POST', '/create');

          // Callback function for when request completes
          request.onload = () => {

              // Extract JSON data from request
              const data = JSON.parse(request.responseText);

              // Update the result div
              if (data.success) {
                  const newChannel = `${data.newChannel}`;
                  console.log(`OnRequest Onload data success- ${data.newChannel}`);
                  var node = document.createElement("a");
                  node.className = "nav-link";
                  node.innerHTML = newChannel;
                  document.querySelector('#availableChannels').appendChild(node);
              }
              else {
                  console.log('OnRequest Onload data false');
                  document.querySelector('#gMsgArea').innerHTML = 'There was an error.';
              }
          };

          // Add data to send with request - adding the attribute expected in the route
          const data = new FormData();
          data.append('newChannel', nChannel);

          // Send request
          request.send(data);

          console.log('inside Create Channel - before return false');
           return false;
      };

});

function scroll_chat_window()
{
    // setting the chat messages area to the bottom - most recent message
    var element = document.getElementById("chatMessages");
	element.scrollTop = element.scrollHeight;
}

// Set the Navigation Links - for Channels - Reset on each refresh
function set_Your_channel_links()
{
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
        const responseData= JSON.parse(request.responseText);
        document.querySelector('#title').innerHTML = `Chatterbox - ${responseData.currentChannel}`;
        document.querySelector('#currChannelHeader').innerHTML = `Current #Channel# - ${responseData.currentChannel}`;

        var idList=['#chatMsgList', '#availableChannels','#subscribedChannels', '#oUsers' ];
        var i ;
        for (i=0; i < idList.length; i++)
        {
        	console.log(idList[i]);
        	let element = document.querySelector(idList[i]);
        	console.log(element);
        	if(element)
        	  {element.remove(); };
        };

         //Loop thru the Parent IDs and add them to page along with child IDs
        var pIdList=['#chatMessages', '#aChannels','#yChannels', '#usersArea' ];
        var pTemplateList=['#t_cMsgs', '#t_aChannels','#t_yChannels', '#t_cMembers' ];
        var idList_to_Add=['chatMsgList', 'availableChannels','subscribedChannels', 'oUsers' ];
        var pContentList=[responseData.channelChatMsgs, responseData.allChannels,responseData.subscrChannels,responseData.channelUsers];
        for (i=0; i < pIdList.length; i++)
        {
        	console.log(pIdList[i]);
        	let element = document.querySelector(pIdList[i]);
        	console.log(element);

        	//if Element found - add the respective HadlebarTemplate and pass respective content
        	if(element)
        	  {
        	     console.log(pTemplateList[i]);
                 const template = Handlebars.compile(document.querySelector(pTemplateList[i]).innerHTML);
                 // Add content to DOM.
                 const content = template({'id': idList_to_Add[i], 'contents':pContentList[i]});
        	     element.innerHTML=content;
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