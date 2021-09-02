
const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
let cors = require("cors");

const {generateMessage} = require('./utils/Message');
const {isValidString} = require('./utils/StringUtil');
const {UsersList} = require('./utils/UserList');


const publicPath = path.join(__dirname,"/../public");
const port = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);
let userList = new UsersList();

//for local host
// var ExpressPeerServer = require('peer').ExpressPeerServer;
// var peerExpress = require('express');
// var peerApp = peerExpress();
// var peerServer = require('http').createServer(peerApp);
// var options = { debug: true }
// var peerPort = 9000;
// peerApp.use('/peerjs', ExpressPeerServer(peerServer, options));
// peerServer.listen(peerPort);


// for Heroku
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true,
  
});
app.use('/peerjs', peerServer);
app.use(cors());

app.use(express.static(publicPath));
 

server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
})
io.on('connection', (socket) =>{
    console.log("New user just connected.");
    
   
    socket.on('join',(params,callback) =>{
        if(!isValidString(params.room) || !isValidString(params.name)){
            callback("Name and room are required!");
        }
        else{
            socket.join(params.room);

            userList.removeUser(socket.id);
            userList.addUser(socket.id,params.name,params.room,params.peerId);
            console.log(userList)

            io.to(params.room).emit('updateUserlist',userList.getUsersName(params.room))
            socket.emit('messageFromServer',generateMessage('Admin',`Welcome to room ${params.room} !!`));
            socket.broadcast.to(params.room).emit('messageFromServer',generateMessage('Admin',`${params.name} joined the room !!`));
            socket.broadcast.to(params.room).emit('peer-connected',params.peerId);
            console.log('peerId',params.peerId);
            callback();
        }
       
        
    } )


    socket.on('createMessage', (message, callback) =>{
        let user = userList.getUser(socket.id);
        if(user && isValidString(message.text)){
            io.to(user.room).emit('messageFromServer',generateMessage(user.name,message.text));
            callback();
        }
    })
    socket.on('disconnect', () =>{
        let leftUser = userList.removeUser(socket.id); 
         
        if(leftUser){
            io.to(leftUser.room).emit('user-disconnected',leftUser.peerId )
            io.to(leftUser.room).emit('updateUserlist',userList.getUsersName(leftUser.room));
            io.to(leftUser.room).emit('messageFromServer',generateMessage('Admin',`${leftUser.name} left the room.`));
            
            console.log("A user just left");
        }
    })
})

