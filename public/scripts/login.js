const socket = new WebSocket('ws://localhost:3000');

socket.onopen = () => {
    const tk = localStorage.getItem('TOKEN')
    if (tk) return window.location.href = "/chat"
    console.log('Connected sucsesfully!')
}

function login() {
    const ussrName = document.getElementById('ussrName').value;
    const passwd = document.getElementById('passwd').value;
    const loginData = {
        eventType: 'Login',
        ussrName: ussrName,
        passwd: passwd
    }
    socket.send(JSON.stringify(loginData))
}

function register() {
    const ussrName = document.getElementById('ussrNameR').value;
    const passwd = document.getElementById('passwd2').value;
    const passwdRep = document.getElementById('passwd3').value;
    if (passwd != passwdRep) return alert("Passwords must be same");
    const registerData = {
        eventType: 'Register',
        ussrName: ussrName,
        passwd: passwd
    };
    socket.send(JSON.stringify(registerData));

}

socket.onmessage = (msg) => {
    const pureData = msg.data;
    const data = JSON.parse(pureData)
    console.log(data)
    console.log(data.successType)
    console.log(data.eventType)
    if (data.eventType == "Success" && data.successType == 'Login') {
        localStorage.setItem('TOKEN', data.token)
        window.location.href = '/chat'
    }
}