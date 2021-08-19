
let socket = io();
socket.on('connect', () =>{
    console.log("Connecting to server");
});
socket.on('disconnect', () =>{
    console.log("disconected from server");
});

socket.on('messageFromServer', (message) => {
    console.log("Message from server : ", message);
})

