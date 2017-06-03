/*
 * Global client code that handles initial client-side setup and the
 * first connection with the server. Upon connection, the server should
 * send the client an "init" message with the "clientId" in the data
 * that it will use in the future to refer to this client. In response
 * the client sends its id alongside its seating section, to which the
 * server responds with a "seatingAck" message including its id and
 * seating section. If this is correct, the initial handshake is done.
 */

var socket = io();

var state = {
  clientId: -1,
  seatingSection: false,
  movementId: 0,
  movement: null
};


function globalMessageHandler(sock) {
  sock.on("init", initClient);
  sock.on("getSeating", getSeatingSock);
  sock.on("seatingAck", seatingCheck);
  sock.on("mute", muteClient);
  sock.on("unmute", unmuteClient);
  sock.on("setMovement", setMovement);
  sock.on("setGain", setGain);
}

function audienceInit() {
  // TODO: Make these pretty
  //alert("Please make sure your phone isn't silenced, and the volume is turned up.");
  //alert("Please make sure your device rotation is locked, and your device doesn't go to sleep.");
  //alert("If you ever have issues with the instrument, please reload the page and your instrument will be reinitialized. Enjoy!");
  globalMessageHandler(socket);
  socket.connect();
}

function initClient(data) {
  state.clientId = data.clientId;
  console.log("Server initialized this client with the id ", state.clientId);
  var dat = data.ackData
  console.log("Other data: ", dat);
  if(dat.movement) {
    console.log("Server said my movement should be ", dat.movement);
    setMovement(dat);
  }
}

function getSeatingSock(data) {
  getSeatingCb();
};

function getSeatingCb(cb) {
  $('body').append($("<div id='locationPrompt'>Please tap your section as indicated by the conductors</div>"));
  $('#locationPrompt').dialog({
    buttons: [
    {
      text: "Left",
      click: function() {
        $(this).dialog("close");
        $(this).remove();
        setLocation("l");
        cb();
      }
    },
    {
      text: "Center",
      click: function() {
        $(this).dialog("close");
        $(this).remove();
        setLocation("c");
        cb();
      }
    },
    {
      text: "Right",
      click: function() {
        $(this).dialog("close");
        $(this).remove();
        setLocation("r");
        cb();
      }
    },
    ],
    draggable: false,
    closeOnEscape: false,
    modal: true,
    resizable: false,
    dialogClass: "no-close"
  });
}

function setLocation(loc) {
  console.log("setting location to ", loc);
  state.seatingSection = loc;
  socket.emit("setLocation", {seatingSection: loc});
}

function pausecomp(millis)
{
    var date = new Date();
    var curDate = null;
    do { curDate = new Date(); }
    while(curDate-date < millis);
}

function seatingCheck(data) {
  if(data.seatingSection !== state.seatingSection) {
    console.log("Server has outdated seating information for me, correcting");
    sendMessage("setLocation", {seatingSection: state.seatingSection});
  } else {
    console.log("Server has correct seating information for me, moving on");
		pausecomp(500);
    if(data.gain) {
      console.log("Server said my gain should be ", data.gain);
      setGain(data);
    }
    if(data.mute) {
      console.log("Server said my mute should be ", data.mute);
      muteClient();
    }
    if(data.glitch) {
      if (state.movement && state.movement.setGlitch) {
        state.movement.setGlitch(data);
      }
    }
    if(data.chord && state.movement && state.movement.setChord) {
      state.movement.setChord(data);
    }
    if(data.ADSR && state.movement && state.movement.setADSR) {
      state.movement.setADSR({a: data.a, d: data.d, s: data.s, r: data.r});
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
  if (state.movement && state.movementId === data.movement) {
    console.log("Reinitializing current movement ", state.movementId);
    state.movement.cleanup();
    state.movement.init(socket);
    return;
  }
  if (state.movement && state.movement.cleanup) {
    state.movement.cleanup();
  };
  state.movement = null;
  movements[data.movement].init(socket);
  console.log("Setting movement to: ", data.movement);
  state.movement = movements[data.movement];
  state.movementId = data.movement;
}

function setup() {
  frameRate(32);
  audienceInit();
  state.movement = movements[0];
  state.movement.init(socket);
  state.movementId = 0;
  colorMode(HSB, 100, 100, 100, 1);
  createCanvas(windowWidth, windowHeight);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  if (state.movement && state.movement.draw) {
    state.movement.draw();
  }
}
function touchStarted() {
  if(state.movement && state.movement.touchStarted) {
    state.movement.touchStarted();
  }
}

function touchEnded() {
  console.log("Touch Ended");
  console.log(state.movement);
  if(state.movement && state.movement.touchEnded) {
    console.log("Calling Touch Ended");
    state.movement.touchEnded();
  }
}

function deviceShaken() {
  if(state.movement && state.movement.deviceShaken) {
    state.movement.deviceShaken();
  }
}

function deviceMoved() {
  if(state.movement && state.movement.deviceMoved) {
    state.movement.deviceMoved();
  }
}
