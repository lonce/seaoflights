var firstMovement = {
  init: function(sock) {
    this.messageHandler(sock);
    this.meter = new p5.Amplitude();
    this.osc = new p5.SinOsc();
    this.env = new p5.Env();
    this.env.setADSR(0.01, 0.1, 1, 0.5);
    this.env.setRange(1, 0);
    this.osc.amp(this.env);
    this.osc.start();
  },
  draw: function() {
    var level = this.meter.getLevel();
    var bgColor = color(
        config.visual.bg.H,
        config.visual.bg.S,
        config.visual.bg.B,
        pow(level, config.visual.bg.alphaFactor));

    noStroke();
    fill(bgColor);
    rect(0, 0, width, height);
  },
  messageHandler: function(sock) {
    sock.on("setNote", this.setNote);
  },
  touchStarted: function() {
    this.noteOn();
  },
  touchEnded: function() {
    this.noteOff();
  },
  noteOn: function() {
    this.env.triggerAttack();
  },
  noteOff: function() {
    this.env.triggerRelease();
  },
  setNote: function(payload) {
    this.osc.freq(midiToFreq(payload.note));
  }
}

var movements = [
  firstMovement
]


