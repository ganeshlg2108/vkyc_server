const express = require('express');
const app = express();
//  Works only for localhost
// const server = require('http').Server(app);
//Connection Over HTTPS - Avoids local host issue
const https = require("https")
const fs = require('fs')
var server = https.createServer({ 
  key: fs.readFileSync('code.key'),
  cert: fs.readFileSync('code.crt')
}, app);
const io = require('socket.io')(server);
const port = process.env.PORT || 1124;
const {v4:uuidv4} = require('uuid');
const {ExpressPeerServer} = require('peer')

var folder = './sessions/';

//Delete files inside a folder
fs.readdir(folder, (err, files) => {
  if (err) throw err;
  for (const file of files) {
      console.log(file + ' : File Deleted Successfully.');
      // fs.unlinkSync(folder+file);
      fs.rmSync(folder+file, { recursive: true, force: true });
  }
});


var bodyParser = require('body-parser'); 

app.use(bodyParser.json({limit: '10mb'})); 
    app.use(bodyParser.urlencoded({limit: '10mb', extended: true }));


//HTTPS CONNECTION
const peer = ExpressPeerServer(server , {
  debug:true
});
app.use('/peerjs', peer);
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.get('/' , (req,res)=>{
  // res.send(uuidv4());
  res.render('startVKYC')
});
app.get('/COMPLETED' , (req,res)=>{
  res.render('completed');
});
app.get('/APPROVED' , (req,res)=>{
  res.render('success');
});
app.get('/REJECTED' , (req,res)=>{
  res.render('failed');
});
app.get('/:room' , (req,res)=>{
  console.log(req.params.room)
  var data = req.params.room

  console.log(typeof data)
  console.log(data.toString())

  if(data!='favicon.ico'){
  var roomData = JSON.parse(data)
  

  var count = 0;
  if (!fs.existsSync(`sessions/${roomData.room}`)) {
    fs.mkdirSync(`sessions/${roomData.room}`);
    fs.writeFileSync(`sessions/${roomData.room}/${roomData.username}.txt`,'in session')
    const files = fs.readdirSync(`sessions/${roomData.room}`)
    count = files.length
    }else{
      fs.writeFileSync(`sessions/${roomData.room}/${roomData.username}.txt`,'in session')
      const files = fs.readdirSync(`sessions/${roomData.room}`)
      count = files.length
    }
    console.log("Session Count : "+count.toString())
    if(count<=2){
    res.render('index' , {RoomId:roomData.room,Username:roomData.username});
    }else{
      res.send("SESSION IS FULL")
    }
  }
});

app.post('/disconnect',(req, res) => {
  console.log(req.body)
  const files = fs.readdirSync(`sessions/${req.body.user.roodID}`)
  if(files.length==1){
    fs.unlinkSync(`sessions/${req.body.user.roodID}/${fileName}.txt`)
  }
  files.forEach(file=>{
    console.log(file)
    const fileName = file.replace('.txt','')
    if(fileName!=req.body.user.username){
      fs.unlinkSync(`sessions/${req.body.user.roodID}/${fileName}.txt`)
    }
  })
  res.send(req.body)
})

io.on("connection" , (socket)=>{
  socket.on('newUser' , (id , room)=>{
    socket.join(room);
    socket.to(room).broadcast.emit('userJoined' , id);
    socket.on('disconnect' , ()=>{
        socket.to(room).broadcast.emit('userDisconnect' , id);
    })
  })
})

server.listen(port,console.log(`server runs on port ${port}`))

// Works only for localhost
// server.listen(port , ()=>{
//   console.log("Server running on port : " + port);
// })
