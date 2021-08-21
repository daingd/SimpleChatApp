
const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const {generateMessage} = require('./utils/Message');
const {isValidString} = require('./utils/StringUtil');
const {UsersList} = require('./utils/UserList');



const publicPath = path.join(__dirname,"/../public");
const port = process.env.PORT || 8090;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);
let userList = new UsersList();

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
            userList.addUser(socket.id,params.name,params.room);

            io.to(params.room).emit('updateUserlist',userList.getUsersName(params.room))

            socket.emit('messageFromServer',generateMessage('Admin',`Welcome to room ${params.room} !!`));
            socket.broadcast.to(params.room).emit('messageFromServer',generateMessage('Admin',`${params.name} joined the room !!`));
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
            io.to(leftUser.room).emit('updateUserlist',userList.getUsersName(leftUser.room));
            io.to(leftUser.room).emit('messageFromServer',generateMessage('Admin',`${leftUser.name} left the room.`));
            console.log("A user just left");
        }
    })
})

