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

var globalParamMap = {};
var clientMap = {};
var reverseClientMap = {};
var clientSocketMap = {};
var sectionParamMap = {};
var connectionID = 0;
var conductorID = -1;
var conductorSock = -1;

function getClientNumbers() {
  var l= 0;
  var r= 0;
  var c= 0;
  if (clientMap['l']) {
    l = clientMap['l'].length;
  }
  if (clientMap['r']) {
    r = clientMap['r'].length;
  }
  if (clientMap['c']) {
    c = clientMap['c'].length;
  }
  return {r: r, c: c, l: l};
}

function dropClient(id) {
    if(clientSocketMap[id]) {
      delete clientSocketMap[id];
    }
    var clientSection = reverseClientMap[id];
    if(clientMap[clientSection]) {
      delete reverseClientMap[id];
      var clientIdx = clientMap[clientSection].indexOf(id);
      clientMap[clientSection].splice(clientIdx, 1);
    }
    if (conductorID > -1) {
      console.log("I have a conductor, telling it client counts");
      conductorSock.emit('clientcount', getClientNumbers());
    }
}

io.sockets.on("connection", function (socket) {
  socket.myID = connectionID++;
  clientSocketMap[socket.myID] = socket;
  console.log("Got a connection, assigning myID = " + socket.myID);
  socket.on("setLocation", function(data) {
      clientMap[data.seatingSection] = clientMap[data.seatingSection] || [];
      if(socket.myID in reverseClientMap) {
        var clientSection = reverseClientMap[socket.myID];
        delete reverseClientMap[socket.myID];
        if(clientMap[clientSection]) {
          var clientIdx = clientMap[clientSection].indexOf(socket.myID);
          if (clientIdx > -1) {
            clientMap[clientSection].splice(clientIdx, 1);
          }
        }
      }
      clientMap[data.seatingSection].push(socket.myID);
      reverseClientMap[socket.myID] = data.seatingSection;
      var ackData = sectionParamMap;
      console.log("Extra data ", ackData);
      ackData = ackData || {};
      ackData.seatingSection = data.seatingSection;
      socket.emit('seatingAck', ackData);
      if (conductorID > -1) {
        var clientData = getClientNumbers();
        console.log("I have a conductor ", conductorID, " telling it client counts, ", clientData);
        conductorSock.emit('clientcount', clientData);
      }
  });
  socket.on("conductor", function(data) {
    console.log("Socket with myID = " + socket.myID + " is actually a conductor!");
    dropClient(socket.myID);
    conductorID = socket.myID;
    conductorSock = socket;
    var clientData = getClientNumbers();
    console.log("I have a conductor ", conductorID, " telling it client counts, ", clientData);
    socket.emit('clientcount', clientData);
  });
  socket.on("changeMovement", function(data) {
    sectionParamMap.movement = data.movement;
    socket.broadcast.emit("setMovement", {movement: data.movement});
  });
  socket.on("mute", function(data) {
    if (data.scope === "all") {
      socket.broadcast.emit("mute", {});
      sectionParamMap.mute = true;
    } else if (data.scope === "section") {
      var ids = clientMap[data.target];
      if (ids) {
        ids.forEach(function(id) {
          clientSocketMap[id].emit("mute", {});
        });
      }
    } else if (data.scope === "id") {
      clientSocketMap[parseInt(data.target)].emit("mute", {});
    } else {
      console.log("Mute message without scope, ignoring");
    }
  });
  socket.on("unmute", function(data) {
    if (data.scope === "all") {
      socket.broadcast.emit("unmute", {});
      sectionParamMap.mute = false;
    } else if (data.scope === "section") {
      var ids = clientMap[data.target];
      if (ids) {
        ids.forEach(function(id) {
          clientSocketMap[id].emit("unmute", {});
        });
      }
    } else if (data.scope === "id") {
      clientSocketMap[parseInt(data.target)].emit("unmute", {});
    } else {
      console.log("Unmute message without scope, ignoring");
    }
  });
  socket.on("setGain", function(data) {
    if (data.scope === "all") {
      sectionParamMap.gain = data.gain;
      socket.broadcast.emit("setGain", {gain: data.gain});
    } else if (data.scope === "section") {
      var ids = clientMap[data.target];
      if (ids) {
        ids.forEach(function(id) {
          clientSocketMap[id].emit("setGain", {gain: data.gain});
        });
      }
    } else if (data.scope === "id") {
      clientSocketMap[parseInt(data.target)].emit("setGain", {gain: data.gain});
    } else {
      console.log("setGain message without scope, ignoring");
    }
  });
  socket.on("setADSR", function(data) {
    var adsr = {a: data.a, d: data.d, s: data.s, r: data.r};
    if (data.scope === "all") {
      sectionParamMap.ADSR = adsr;
      socket.broadcast.emit("setADSR", adsr);
    } else if (data.scope === "section") {
      var ids = clientMap[data.target];
      if (ids) {
        ids.forEach(function(id) {
          clientSocketMap[id].emit("setADSR", adsr);
        });
      }
    } else if (data.scope === "id") {
      clientSocketMap[parseInt(data.target)].emit("setADSR", adsr);
    } else {
      console.log("setGain message without scope, ignoring");
    }
  });
  socket.on("setGlitch", function(data) {
    sectionParamMap.glitch = data.glitch;
    console.log("Setting glitch to ", data.glitch);
    socket.broadcast.emit("setGlitch", data);
  });
  socket.on("setWhisperProb", function(data) {
    sectionParamMap.whisperProb = data.whisperProb;
    console.log("Setting whisper prob to ", data.whisperProb);
    socket.broadcast.emit("setWhisperProb", data);
  });
  socket.on("chordChange", function(data) {
    sectionParamMap.chord = data.chord;
    console.log("Setting chord to ", data.chord);
    socket.broadcast.emit("setChord", data);
  });
  socket.on("getSeating", function(data) {
    console.log("Get seating");
    socket.broadcast.emit("getSeating", data);
  });
  socket.on("disconnect", function () {
    console.log("Socket with myID = " + socket.myID + " disconnected!");
    dropClient(socket.myID);
  });
  socket.on('idCorrection', function(data) {
    dropClient(socket.myID);
    socket.myID = data.rightID;
    clientSocketMap[socket.myID] = socket;
    socket.emit('init', {clientId: socket.myID});
  });
  socket.emit('init', {clientId: socket.myID, ackData: sectionParamMap});
});


exports.server = server;
