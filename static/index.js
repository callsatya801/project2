document.addEventListener('DOMContentLoaded', () => {

    // setting the chat messages area to the bottom - most recent message
    var element = document.getElementById("chatMessages");
	element.scrollTop = element.scrollHeight;

    // Set links up to load new pages.
    document.querySelectorAll('.nav-link').forEach(link => {
        link.onclick = () => {
            load_page(link.dataset.channelid);
            console.log(link.dataset.channelid)
            return false;
        };
    });
});

// Renders contents of new page in main view.
function load_page(name) {
    const request = new XMLHttpRequest();
    request.open('GET', `/${name}`);
    request.onload = () => {
        const responseData= JSON.parse(request.responseText);
        document.querySelector('#title').innerHTML = `Chatterbox - ${responseData.currentChannel}`;
        document.querySelector('#currChannelHeader').innerHTML = `Current #Channel# - ${responseData.currentChannel}`;

        var idList=['#chatMsgList', '#aChannels','#yChannels', '#oUsers' ];
        var i ;
        for (i=0; i < idList.length; i++)
        {
        	console.log(idList[i]);
        	var element = document.querySelector(idList[i]);
        	console.log(element);
        	if(element)
        	  {element.remove(); };
        };

        console.log(responseData);
    };
    request.send();
}