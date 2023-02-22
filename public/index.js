const socket = io('/');
const peer = new Peer();
let myVideoStream;
let myId;
// var videoGrid = document.getElementById('videoDiv')
var videoGrid = document.getElementById('cards')
var myvideo = document.createElement('video');
var innerhtml = document.getElementById('inner-div')
var roomData = document.getElementById('roomid')
myvideo.muted = true;
const peerConnections = {}
navigator.mediaDevices.getUserMedia({
  video:true,
  audio:true
}).then((stream)=>{
  myVideoStream = stream;
  addVideo(myvideo , stream);
  peer.on('call' , call=>{
    call.answer(stream);
      const vid = document.createElement('video');
    call.on('stream' , userStream=>{
      addVideo(vid , userStream);
    })
    call.on('error' , (err)=>{
      alert(err)
    })
    call.on("close", () => {
        console.log(vid);
        vid.remove();
    })
    peerConnections[call.peer] = call;
  })
}).catch(err=>{
    alert(err.message)
})
peer.on('open' , (id)=>{
  myId = id;
  socket.emit("newUser" , id , roomID);
})
peer.on('error' , (err)=>{
  alert(err.type);
});
socket.on('userJoined' , id=>{
  console.log("new user joined")
  const call  = peer.call(id , myVideoStream);
  const vid = document.createElement('video');
  call.on('error' , (err)=>{
    alert(err);
  })
  call.on('stream' , userStream=>{
    addVideo(vid , userStream);
  })
  call.on('close' , ()=>{
    vid.remove();
    console.log("user disconect")
  })
  peerConnections[id] = call;
})
socket.on('userDisconnect' , id=>{
  console.log(`Disconnected User : ${username}`)
  
//   fetch('https://10.10.30.127:4000/disconnect', {
//     mode: 'no-cors',
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({ "username": username })
// })
// .then(response => response.json())
// .then(response => console.log(JSON.stringify(response)))

fetch('https://192.168.0.105:4000/disconnect', {  
  method: 'post',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({ "user": {
    "roodID" : roomID,
    "username" : username
  }}),
})

// const body = {
//   userId: 1,
//   title: "Fix my bugs",
//   completed: false
// };
// $.post("https://10.10.30.127:4000/disconnect", body, (data, status) => {
//   console.log(data);
// });

  if(peerConnections[id]){
    peerConnections[id].close();
  }
  if(username=="USER"){
    location.href = "COMPLETED"
  }
})
function addVideo(video , stream){
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  if(username=="ADMIN"){
    // innerhtml.appendChild('<button id="buttonSuccess">APPROVE</button><button id="buttonFailure">CANCEL</button>')
    console.log(innerhtml.innerHTML)
    if(innerhtml.innerHTML==""){
      innerhtml.innerHTML += "<button id=\"buttonSuccess\">APPROVE</button><button id=\"buttonFailure\">REJECT</button>"
      roomData.innerHTML += `ROOM ID : ${roomID}`
      var buttonSuccess = document.getElementById('buttonSuccess')
      var buttonFailure = document.getElementById('buttonFailure')
      buttonSuccess.onclick = function () {
        location.href = "APPROVED"
      };
      buttonFailure.onclick = function () {
        location.href = "REJECTED"
      };
    }
  }
  videoGrid.appendChild(video);
}
