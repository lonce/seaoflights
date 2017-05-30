var express = require("express"),
    app = express(),
    server = require('http').createServer(app),
    io = require("socket.io").listen(server);

var k_portnum = 8082; // default, overridden by input if any

console.log("messageServer is starting with command line arguments:");
process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});
if (process.argv.length < 3){
    console.log("usage: node myserver portnum");
    process.exit(1);
}
k_portnum=process.argv[2] || k_portnum;

//****************************************************************************
// sol is the location that nginx looks for to reverse proxy
var m_useRoot="/sol/www/";
app.use(express.static(__dirname + m_useRoot));


server.listen(process.argv[2] || k_portnum);
console.log("Connected and listening on port " + k_portnum);

var clientMap = {};
var reverseClientMap = {};
var connectionID = 0;

io.sockets.on("connection", function (socket) {
  socket.myID = connectionID++;
  console.log("Got a connection, assigning myID = " + socket.myID);
  socket.on("setLocation", function(data) {
      clientMap[data.seatingSection] = clientMap[data.seatingSection] || [];
      clientMap[data.seatingSection].push(socket.myID);
      reverseClientMap[socket.myID] = data.seatingSection;
      socket.emit('seatingAck', {seatingSection:data.seatingSection});
  });
  socket.emit('init', {clientId: socket.myID});
  socket.emit('setMovement', {movement: 0});
  socket.on("disconnect", function () {
    console.log("Socket with myID = " + socket.myID + " disconnected!");
    var clientSection = reverseClientMap[socket.myID];
    delete reverseClientMap[socket.myID];
    var clientIdx = clientMap[clientSection].indexOf(socket.myID);
    clientMap[clientSection].splice(clientIdx, 1);
  });
});


exports.server = server;
