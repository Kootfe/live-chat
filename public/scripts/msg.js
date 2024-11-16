const socket = new WebSocket('ws://localhost:3000');

const token = localStorage.getItem('TOKEN');

socket.onopen = () => {
    if (!token) {
       const message = {
           eventType: "Info",
           infoType: "Fail",
           status: "Token Fail"
       }
       socket.send(JSON.stringify(message))
    } else {
       const message = {
           eventType: "Info",
           infoType: "Success",
           status: "Token Succses",
           token: token
       }
       socket.send(JSON.stringify(message))
    }
    console.log('Connected to WebSocket server');
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.eventType === "Command") {
        if (data.commandType === "Fix & Reset") {
            if (data.status === "Token") {
                localStorage.clear();
                alert('Please login again.');
                window.location.href = "/";
            }
        }
    } else if (data.eventType === "Broadcast") {
        const messagesContainer = document.getElementById('messages');
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.innerText = `${data.author}: ${data.message}`;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
};



socket.onerror = (error) => {
    console.error('WebSocket error: ', error);
};

socket.onclose = () => {
    console.log('Disconnected from WebSocket server');
};

function sendMessage() {
    const message = document.getElementById('messageInput').value;
    const msgEvent = {
        eventType: 'Message',
        msg: `${message}`,
        token: `${token}`
    }
    socket.send(JSON.stringify(msgEvent));
}