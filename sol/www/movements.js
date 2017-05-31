var firstMovement = {
  shakeThreshold: 20,
  initialADSR: {
    a: 0.01,
    d: 0.1,
    s: 1,
    r: 0.5
  },
  backgroundColors: {
    l: {H: 10, S: 50, B:80},
    c: {H: 40, S: 50, B: 80},
    r: {H: 70, S: 50, B:80}
  },
  filterParams: {
    max: 5000,
    min: 100,
    qMax: 15,
    qMin: 0.001
  },
  init: function(sock) {
    this.messageHandler(sock);
    this.meter = new p5.Amplitude();
    this.osc = new p5.SawOsc(440);
    this.env = new p5.Env();
    this.filter = new p5.LowPass();
    this.osc.disconnect();
    this.osc.connect(this.filter);
    this.env.setADSR(
        this.initialADSR.a,
        this.initialADSR.d,
        this.initialADSR.s,
        this.initialADSR.r);
    this.env.setRange(1, 0);
    this.osc.amp(this.env);
    this.osc.start();
    this.bg = clientConfig.visual.bg;
    setShakeThreshold(this.shakeThreshold);
  },
  draw: function() {
    background(0);
    var level = this.meter.getLevel();
    var bgAlpha = pow(level, clientConfig.visual.bg.alphaFactor);
    var baseColor = this.backgroundColors[state.seatingSection];
    var bgColor = color(
        baseColor.H,
        baseColor.S,
        baseColor.B,
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
    this.setFilter(mouseX/width, mouseY/height);
    this.noteOn();
  },
  touchMoved: function() {
    this.setFilter(mouseX/width, mouseY/height);
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
  setNote: function(self, payload) {
    self.osc.freq(midiToFreq(payload.note));
  },
  setADSR: function(self, payload) {
    self.env.setADSR(payload.a, payload.d, payload.s, payload.r);
  },
  mute: function() {
    this.env.mult(0);
  },
  unmute: function() {
    this.env.mult(1);
  },
  setGain: function(gain) {
    this.env.mult(gain);
  },
  setFilter: function(x, y) {
    var freq = x * this.filterParams.max + this.filterParams.min;
    var res = (1-y) * this.filterParams.qMax + this.filterParams.qMin;
    this.filter.set(freq, res);
  },
  deviceShaken: function() {
    this.env.play();
  }
}

var secondMovement = {
  backgroundColors: {
    l: {H: 10, S: 50, B:80},
    c: {H: 40, S: 50, B: 80},
    r: {H: 70, S: 50, B:80}
  },
  filterParams: {
    max: 5000,
    min: 100,
    qMax: 15,
    qMin: 0.001
  },
  init: function(sock) {
    this.messageHandler(sock);
    this.meter = new p5.Amplitude();
    this.osc = new p5.SawOsc(440);
    this.filter = new p5.LowPass();
    this.osc.disconnect();
    this.osc.connect(this.filter);
    this.osc.amp(1);
    this.osc.start();
    this.bg = clientConfig.visual.bg;
  },
  draw: function() {
    background(0);
    var level = this.meter.getLevel();
    var bgAlpha = pow(level, clientConfig.visual.bg.alphaFactor);
    var baseColor = this.backgroundColors[state.seatingSection];
    var bgColor = color(
        baseColor.H,
        baseColor.S,
        baseColor.B,
        bgAlpha);

    noStroke();
    fill(bgColor);
    rect(0, 0, width, height);
  },
  messageHandler: function(sock) {
    var self = this;
    sock.on("setNote", function (payload) {self.setNote(self, payload)});
  },
  deviceMoved: function() {
    console.log("device moved");
    var x = (rotationX + 180)/360;
    var y = (rotationY + 180)/360;
    setFilter(x, y);
  },
  setNote: function(self, payload) {
    self.osc.freq(midiToFreq(payload.note));
  },
  mute: function() {
    this.osc.amp(0);
  },
  unmute: function() {
    this.osc.amp(1);
  },
  setGain: function(gain) {
    this.osc.amp(gain);
  },
  setFilter: function(x, y) {
    var freq = x * this.filterParams.max + this.filterParams.min;
    var res = (1-y) * this.filterParams.qMax + this.filterParams.qMin;
    console.log("Filter set to ", freq, ", ", res);
    this.filter.set(freq, res);
  }
}

var movements = [
  firstMovement,
  secondMovement
]


