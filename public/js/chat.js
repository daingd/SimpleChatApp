let socket = io('/');
const myVideo = document.createElement('video');
myVideo.muted = true;
let myVideoStream;
const peers = {};
const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port : '443'
})

const videoGrid = document.getElementById('video-grid');
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo,stream);
  
  myPeer.on("call", (call) => {
    call.answer(stream);
    peers[call.peer] = call;
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    });
    call.on('close',() => {
      video.remove();
    })
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
  if (peers[peerId]) {
    console.log("a user just left");
    peers[peerId].close();
    
    delete peers[peerId];
    console.log(peers);
  }

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



const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const leave = () => {
 
  socket.disconnect();
  window.location.href = '/';
}

