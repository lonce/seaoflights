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
    var self = this;
    sock.on("setNote", function (payload) {self.setNote(self, payload)});
    sock.on("setADSR", function (payload) {self.setADSR(self, payload)});
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
  setNote: function(self, payload) {
    self.osc.freq(midiToFreq(payload.note));
  },
  setADSR: function(self, payload) {
    console.log("Setting attack:", payload.a, " decay:", payload.d, " sus:", payload.s, " release:", payload.r);
    self.env.setADSR(payload.a, payload.d, payload.s, payload.r);
  },
  mute: function() {
    console.log("Muted");
    this.env.mult(0);
  },
  unmute: function() {
    this.env.mult(1);
  },
  setGain: function(gain) {
    console.log("Setting gain to ", gain);
    this.env.mult(gain);
  }
}

var movements = [
  firstMovement
]


