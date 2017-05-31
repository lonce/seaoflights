var firstMovement = {
  name: "First movement",
  init: function(sock) {
    this.messageHandler(sock);
    this.meter = new p5.Amplitude();
    this.osc = new p5.SinOsc(440);
    this.env = new p5.Env();
    this.env.setADSR(0.01, 0.1, 1, 0.5);
    this.env.setRange(1, 0);
    this.osc.amp(this.env);
    this.osc.start();
  },
  draw: function() {
    background(0);
    var level = this.meter.getLevel();
    var bgAlpha = pow(level, clientConfig.visual.bg.alphaFactor);
    var bgColor = color(
        clientConfig.visual.bg.H,
        clientConfig.visual.bg.S,
        clientConfig.visual.bg.B,
        bgAlpha);

    noStroke();
    fill(bgColor);
    rect(0, 0, width, height);
  },
  messageHandler: function(sock) {
    sock.on("setNote", this.setNote);
    sock.on("setADSR", this.setADSR);
  },
  touchStarted: function() {
    this.noteOn();
  },
  touchEnded: function() {
    this.noteOff();
  },
  noteOn: function() {
    console.log("Play note");
    this.env.triggerAttack();
  },
  noteOff: function() {
    console.log("Stop note");
    this.env.triggerRelease();
  },
  setNote: function(payload) {
    this.osc.freq(midiToFreq(payload.note));
  },
  setADSR: function(payload) {
    this.env.setADSR(payload);
  },
  mute: function() {
    this.env.setRange(0,0);
  },
  unmute: function() {
    this.env.setRange(1,0);
  },
  setGain: function(gain) {
    this.env.setRange(gain,0);
  }
}

var movements = [
  firstMovement
]


