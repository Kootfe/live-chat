const express = require('express');
const WebSocket = require('ws');
const HTTP = require('http');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const favicon = require('serve-favicon');

const saltRounds = 10; 
const PORT = 3000; // Server port

// Function to generate a token
function generateToken() {
    return crypto.randomBytes(128).toString('hex');
}


fs.readFile('./user.json', 'utf-8', (err, data) => {
    if (err) {
        console.error('Error reading users file:', err);
        return;
    }

    try {
        users = JSON.parse(data);
    } catch (parseError) {
        console.error('Error parsing users file:', parseError);
        return;
    }
})

let users = [];
const app = express();
const server = HTTP.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use('/scripts', express.static(path.join(__dirname, 'public/scripts')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, './public/root.html'));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, './public/login.html'));
});

app.get("/chat", (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get("/dev", (req, res) => {
    res.sendFile(path.join(__dirname, './public/dev.html'));
});

app.get("/test1234", (req, res) => {
    res.sendFile(path.join(__dirname, './public/test.html'));
});


wss.on('connection', ws => {
    ws.send('New mission has arrived!');
    console.log('anan')
    ws.on('message', msg => {
        console.log(msg)
        let data;
        try {
            data = JSON.parse(msg.toString());
        } catch (error) {
            console.error('Invalid message format:', error);
            return;
        }
        console.log(data)
        if (data.eventType === "Message") {
            const user = users.find(u => u.token === data.token);
            if (user) {
                const msg = {
                    eventType: "Broadcast",
                    message: data.msg,
                    author: user.ussrName
                };
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(msg));
                    }
                });
            }
        } else if (data.eventType === "Login") {
            const user = users.find(u => u.ussrName === data.ussrName);
            if (user) {
                bcrypt.compare(data.passwd, user.passwd, (err, result) => {
                    if (err) {
                        console.error(err)
                        return;
                    }
                    if (result) {
                        const success = {
                            eventType: 'Success',
                            successType: 'Login',
                            token: user.token
                        };
                        ws.send(JSON.stringify(success));
                        console.log('Login success:', JSON.stringify(success));
                    } else {
                        console.log('Login failed: Invalid credentials');
                    }
                })
            } else {
                console.log('Login failed: No user');
            }
        } else if (data.eventType === "Info") {
            if (data.infoType === "Fail" && data.status === "Token Fail") {
                const command = {
                    eventType: "Command",
                    commandType: "Fix & Reset",
                    status: "Token"
                };
                ws.send(JSON.stringify(command));
            } else if (data.infoType == "Success" && data.status == "Token Succses") {
                const user = users.find(u => u.token === data.token);
                console.log(user)
                if (!user) {
                    const command = {
                        eventType: "Command",
                        commandType: "Fix & Reset",
                        status: "Token"
                    };
                    return ws.send(JSON.stringify(command));
                }
                if (user) {
                    console.log("New soldier embarked:", user.ussrName);
                }
            }
        } else if (data.eventType === "Register") {
            console.log('Register event received:', data);
            bcrypt.hash(data.passwd, saltRounds, (err, hashedPass) => {
                token = generateToken();
                if (err) { 
                    console.error(err)
                    return;
                }

                const newUssr = {
                    ussrName: data.ussrName,
                    passwd: hashedPass,
                    token: token
                };
                users.push(newUssr);
                const success = {
                    eventType: 'Success',
                    successType: 'Login',
                    token: token
                };
                ws.send(JSON.stringify(success));
                fs.writeFile('./user.json', JSON.stringify(users, null, 2), 'utf8', (err) => {
                    if(err) {
                        console.error(err);
                    } else {
                        console.log(users);
                    };
                })
                console.log('Updated users list:', users);
            })
            
        }
    });
});



server.listen(3000, () => {
    console.log(`Server running on http://0.0.0.0:3000`);
});

