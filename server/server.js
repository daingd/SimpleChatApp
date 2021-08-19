
const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');


const publicPath = path.join(__dirname,"/../public");
const port = process.env.PORT || 8090;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);

app.use(express.static(publicPath));


server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
})
io.on('connection', (socket) =>{
    console.log("New user just join the room");

    socket.emit('messageFromServer', {
        'from' : 'Admin',
        'text' : 'Welcone to chat room',
        'createdAt' :  Date.now
    })
    socket.broadcast.emit('messageFromServer', {
        'from' : 'Admin',
        'text' : 'A new user has joined the room',
        'createdAt' :  Date.now
    })

    socket.on('createMessage', (massage) =>{
        console.log("recieve message: ", massage);
        io.emit('messageFromServer', {
            'from' : massage.from,
            'text' : massage.text,
            'createdAt' : massage.createdAt
        })

    })

    socket.emit('messageFromServer', {
        Message : "Hello from server" 
    });


    socket.on('disconnect', (socket) =>{
        console.log("New user just leave the room");
    })
})

