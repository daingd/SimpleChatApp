

let socket = io();

socket.on('connect', () =>{
    let searchQuery = window.location.search.substring(1);
    let params = JSON.parse('{"' + decodeURI(searchQuery).replace(/&/g, '","').replace(/\+/g, ' ').replace(/=/g,'":"') + '"}');
    console.log(params);
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




