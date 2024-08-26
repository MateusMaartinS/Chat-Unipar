var stompClient = null;
var username = null;
var userColors = {};

document.getElementById("welcome-form").style.display = "block";

function enterChatRoom() {
    username = document.getElementById("username").value.trim();

    if (username) {
        var welcomeForm = document.getElementById("welcome-form");
        welcomeForm.classList.add('hide');
        setTimeout(() => {
            welcomeForm.style.display = 'none';
            var chatRoom = document.getElementById('chat-room');
            chatRoom.style.display = 'block';
            setTimeout(() => { chatRoom.classList.add('show'); }, 10);
        }, 550);

        userColors[username] = getRandomColor();
        connect();
    } else {
        alert("Por favor, insira um nickname!");
    }
}

function connect() {
    var socket = new SockJS('http://9e7df17fa210.ngrok.app/chat-websocket', {
        headers: {
            'ngrok-skip-browser-warning': 'true'
        }
    });
    stompClient = Stomp.over(socket);

    stompClient.connect({}, function (frame) {
        console.log('conectando...' + frame);

        stompClient.subscribe('/topic/public', function (messageOutput) {
            showMessage(JSON.parse(messageOutput.body));
        });

        stompClient.send("/app/addUser", {}, JSON.stringify({
            sender: username,
            type: 'JOIN'
        }));
    });
}

function showMessage(message) {
    var messageElement = document.createElement('div');
    
    if (!(message.sender in userColors)) {
        userColors[message.sender] = getRandomColor();
    }

    var color = userColors[message.sender] || '#000000';

    if (message.type === 'JOIN') {
        messageElement.innerHTML = `<span style="color:${color};">${message.sender}</span> entrou na sala`;
    } else if (message.type === 'LEAVE') {
        messageElement.innerHTML = `<span style="color:${color};">${message.sender}</span> saiu da sala`;
    } else {
        messageElement.innerHTML = `<span style="color:${color};">${message.sender}</span> disse: ${message.content}`;
    }

    document.getElementById('messages').appendChild(messageElement);
    var messagesContainer = document.getElementById('messages');
    messagesContainer.appendChild(messageElement);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function sendMessage() {
    var messageContent = document.getElementById("messageInput").value.trim();

    if (messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageContent,
            type: 'CHAT',
            color: userColors[username] 
        };
        stompClient.send('/app/sendMessage', {}, JSON.stringify(chatMessage));
        document.getElementById("messageInput").value = '';
    }
}

function leaveChat() {
    if (stompClient) {
        var chatMessage = {
            sender: username,
            type: 'LEAVE'
        };
        stompClient.send("/app/leaveUser", {}, JSON.stringify(chatMessage));
        stompClient.disconnect(() => {
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

document.getElementById("messageInput").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
});

document.getElementById("username").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        enterChatRoom(); 
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        event.preventDefault();
        if (document.getElementById('chat-room').style.display === 'block') {
            leaveChat();
        }
    }
});

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
