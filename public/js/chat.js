let socket = io();
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};
const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
})

const videoGrid = document.getElementById('video-grid');
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo,stream);
  
  myPeer.on("call", (call) => {
    call.answer(stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    });
  });

  socket.on('peer-connected', (peerId) => {
    setTimeout(connectToNewUser,1000,peerId,stream)
  });
})

const connectToNewUser = (peerId,myVideoStream) => {
  const call = myPeer.call(peerId,myVideoStream);
  peers[peerId] = call;
  console.log(peers)
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    addVideoStream(video,userVideoStream);
  });
  call.on('close',() => {
    video.remove();
  })
}

const addVideoStream = (video,stream) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  })
  videoGrid.append(video);
}




myPeer.on('open', (id) =>{
    let searchQuery = window.location.search.substring(1);
    let params = JSON.parse('{"' + decodeURI(searchQuery).replace(/&/g, '","').replace(/\+/g, ' ').replace(/=/g,'":"') + '"}');
    params['peerId']= id;
    console.log('mine id',id);
    socket.emit('join', params, (err) => {
      if(err){
        alert(err);
        window.location.href = '/';
      }
    })
    
});
socket.on('updateUserlist', (userList) =>{
    let ol = document.createElement('ol');
    userList.forEach((username) => {
        let li = document.createElement('li');
        li.innerHTML = username;
        ol.appendChild(li);
    })
    let sideBar = document.querySelector('#users');
    sideBar.innerHTML = '';
    sideBar.appendChild(ol);

})
socket.on('disconnect', () =>{
    console.log("disconected from server");
});

socket.on('user-disconnected', peerId => {
  if (peers[peerId]) peers[peerId].close()
})


socket.on('messageFromServer', (message) => {
  const formattedTime = moment(message.createdAt).format('LT');
  const template = document.querySelector('#message-template').innerHTML;
  const html = Mustache.render(template, {
    from: message.from,
    text: message.text,
    createdAt: formattedTime
  });

  const div = document.createElement('div');
  div.innerHTML = html

  document.querySelector('#messages').appendChild(div);
});

window.onload=function(){
    document.querySelector('.submit-btn').addEventListener('click',(e) =>{
        e.preventDefault();
        socket.emit('createMessage',{
            text : document.querySelector('input[name = "message"]').value    
        },  
        () =>{
           let messages = document.querySelectorAll('.message');
           messages[messages.length -1].scrollIntoView();
           document.querySelector('input[name="message"]').value = '';       
        })
    });
}




