var state = {
  clientId: -1,
  seatingSection: "C",
  movement: -1
};

var socket = null;

var globalMessageHandler = {
  "init": initClient,
  "seatingAck": seatingCheck,
  "mute": muteClient,
  "setMovement": setMovement
}

function audienceInit() {
  // TODO: Make these pretty
  alert("Please make sure your phone isn't silenced, and the volume is turned up.");
  alert("Please make sure your device rotation is locked, and your device doesn't go to sleep.");
  alert("If you ever have issues with the instrument, please reload the page and your instrument will be reinitialized. Enjoy!");
  state.seatingSection = prompt("Enter the general area of the audience you're seated at(this doesn't have to be exact) : (L)eft, (C)enter, (R)ight", "");
  conn = io.connect(conn.serverAddr);
  conn.on('message', handleMessage);
}

function initClient(payload) {
  state.clientId = payload.clientId;
  console.log("Server initialized this client with the id ", state.clientId, ", responding with the seating section info, ", state.seatingSection);
  conn.send({clientId: state.clientId, seatingSection: state.seatingSection});
}

function seatingCheck(payload) {
  if(payload.seatingSection !== state.seatingSection) {
    console.log("Server has outdated seating information for me, correcting");
    sendMessage({clientId: state.clientId, seatingSection: state.seatingSection});
  } else {
    console.log("Server has correct seating information for me, moving on");
  }
}


function handleMessage(msg) {
  if(msg.destId === "all" || msg.destId === clientId) {
    if(state.movement >= 0) {
      state.movement.messageHandler[msg.header](msg.payload);
    } else {
      globalMessageHandler[msg.header](msg.payload);
    }
  }
}

function mute(payload) {
  console.log("Muting client");
}

function setMovement(payload) {
  state.movement = -1;
  console.log("Unsetting movement so new movement can be initialized");
  movements[payload.movement].init();
  console.log("Setting movement to: ", payload.movement);
  state.movement = payload.movement;
}

function setup() {
  frameRate(config.frameRate);
  audienceInit();
  connectToServer();
  colorMode(HSB, 100, 100, 100, 1);
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  if (state.movement > -1 && state.movement.draw) {
    state.movement.draw();
  } else {
    console.log("No phase set, skipping draw");
  }
}

function touchStarted() {
  if(state.movement > -1 && state.movement.touchStarted) {
    state.movement.touchStarted();
  }
}

function touchEnded() {
  if(state.movement > -1 && state.movement.touchEnded) {
    state.movement.touchEnded();
  }
}

function deviceShaken() {
  if(state.movement > -1 && state.movement.deviceShaken) {
    state.movement.deviceShaken();
  }
}

function deviceMoved() {
  if(state.movement > -1 && state.movement.deviceMoved) {
    state.movement.deviceMoved();
  }
}
