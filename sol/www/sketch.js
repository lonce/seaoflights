/*
 * Global client code that handles initial client-side setup and the
 * first connection with the server. Upon connection, the server should
 * send the client an "init" message with the "clientId" in the data
 * that it will use in the future to refer to this client. In response
 * the client sends its id alongside its seating section, to which the
 * server responds with a "seatingAck" message including its id and
 * seating section. If this is correct, the initial handshake is done.
 */

var state = {
  clientId: -1,
  seatingSection: "c",
  movement: -1
};

var socket = io();

function globalMessageHandler(sock) {
  sock.on("init", initClient);
  sock.on("seatingAck", seatingCheck);
  sock.on("mute", muteClient);
  sock.on("unmute", unmuteClient);
  sock.on("setMovement", setMovement);
  sock.on("setGain", setGain);
}

function audienceInit() {
  // TODO: Make these pretty
  alert("Please make sure your phone isn't silenced, and the volume is turned up.");
  alert("Please make sure your device rotation is locked, and your device doesn't go to sleep.");
  alert("If you ever have issues with the instrument, please reload the page and your instrument will be reinitialized. Enjoy!");
  state.seatingSection = prompt("Enter the general area of the audience you're seated at(this doesn't have to be exact) : (L)eft, (C)enter, (R)ight", "").toLowerCase();
  globalMessageHandler(socket);
  socket.connect();
}

function initClient(data) {
  state.clientId = data.clientId;
  console.log("Server initialized this client with the id ", state.clientId, ", responding with the seating section info, ", state.seatingSection);
  socket.emit("setLocation", {seatingSection: state.seatingSection});
}

function seatingCheck(data) {
  if(data.seatingSection !== state.seatingSection) {
    console.log("Server has outdated seating information for me, correcting");
    sendMessage("setLocation", {seatingSection: state.seatingSection});
  } else {
    console.log("Server has correct seating information for me, moving on");
    console.log("Other data: ", data);
    if(data.movement) {
      console.log("Server said my movement should be ", data.movement);
      setMovement(data);
    }
    if(data.gain) {
      console.log("Server said my gain should be ", data.gain);
      setGain(data);
    }
    if(data.mute) {
      console.log("Server said my mute should be ", data.mute);
      muteClient();
    }
  }
}

function muteClient(data) {
  if (state.movement.mute) {
    state.movement.mute();
  }
}

function unmuteClient(data) {
  if (state.movement.unmute) {
    state.movement.unmute();
  }
}

function setGain(data) {
  if (state.movement.setGain) {
    state.movement.setGain(data.gain);
  }
}

function setMovement(data) {
  state.movement = null;
  var movement = parseInt(data.movement);
  movements[data.movement].init(socket);
  console.log("Setting movement to: ", data.movement);
  state.movement = movements[data.movement];
}

function setup() {
  frameRate(32);
  audienceInit();
  colorMode(HSB, 100, 100, 100, 1);
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  if (state.movement.draw) {
    state.movement.draw();
  }
}

function touchStarted() {
  if(state.movement.touchStarted) {
    state.movement.touchStarted();
  }
}

function touchEnded() {
  if(state.movement.touchEnded) {
    state.movement.touchEnded();
  }
}

function deviceShaken() {
  if(state.movement.deviceShaken) {
    state.movement.deviceShaken();
  }
}

function deviceMoved() {
  if(state.movement.deviceMoved) {
    state.movement.deviceMoved();
  }
}
