var stompClient = null;
var username = null;

document.getElementById("welcome-form").style.display = "block";

    function enterChatRoom() {
        username = document.getElementById("username").value.trim();
    
        if(username){
            var welcomeForm = document.getElementById("welcome-form");
            welcomeForm.classList.add('hide');
            setTimeout(() => {
                welcomeForm.style.display = 'none';
                var chatRoom = document.getElementById('chat-room');
                chatRoom.style.display = 'block';
                setTimeout(() => { chatRoom.classList.add('show'); }, 10);
            }, 550);
            connect();
        } else {
            alert("Por favor, inserir um nickname");
        }
    }

    function connect() {

        var socket = new SockJS('https://75a5d5e89ffe.ngrok.app/chat-websocket', {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        stompClient = Stomp.over(socket);

        stompClient.connect({}, function (frame){
            console.log('conectando...'+ frame);

            stompClient.subscribe('/topic/public', function(messageOutput) {
                showMessage(JSON.parse(messageOutput.body));
            });

            stompClient.send("/app/addUser", {}, JSON.stringify({
                sender: username,
                type :'JOIN'
            }));
        });
    }
    function showMessage(message){
        var messageElement = document.createElement('div');

        if(message.type === 'JOIN'){
            messageElement.innerText = message.sender + " entrou na sala ";
        }else if(message.type === 'LEAVE') {
            messageElement.innerText = message.sender + " saiu da sala ";
        }else {
            messageElement.innerText = message.sender + " disse: " + message.content;
        }    
     
     document.getElementById('messages').appendChild(messageElement);
    }

    function sendMessage(){
        var messageContent = document.getElementById("messageInput").value.trim();

        if(messageContent && stompClient){
            var chatMessage = {
                sender: username,
                content: messageContent,
                type: 'CHAT'
            };
            stompClient.send('/app/sendMessage',{},JSON.stringify(chatMessage));
            document.getElementById("messageInput").value = '';
        }
    }

    function leaveChat(){
        if (stompClient){
            var chatMessage = {
                sender: username,
                type: 'LEAVE'
            };
        stompClient.send("/app/leaveUser",{},JSON.stringify(chatMessage));
        stompClient.disconnect(()=>{
            console.log("Desconectado");

        
            var chatRoom = document.getElementById("chat-room");
            chatRoom.classList.remove('show');
            setTimeout(() => {
                chatRoom.style.display = "none";
                var welcomeForm = document.getElementById('welcome-form');
                welcomeForm.style.display = 'block';
                setTimeout(() => { welcomeForm.classList.remove('hide'); }, 10);
            }, 550); 
        });


        
        }
    }
