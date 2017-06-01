var sampleFiles = [
  "assets/bowl.mp3",
  "assets/lg-bell.mp3",
  "assets/md-bell.mp3",
  "assets/sm-bell.mp3"
];

var tap = {
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
  cleanup: function() {
    this.osc.stop();
    this.osc.dispose();
    this.env.dispose();
    this.meter.dispose();
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
    sock.on("setADSR", function (payload) {self.setADSR(self, payload)});
    sock.on("setChord", function(payload) {self.setChord(self, payload)});
  },
  touchStarted: function() {
    this.noteOff();
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
  setChord: function(self, payload) {
    var chord = payload.chord;
    var note = chord[state.clientId % chord.length];
    self.setNote(note);
  },
  setNote: function(note) {
    this.osc.freq(midiToFreq(note));
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
  }
}

var drone = {
  backgroundColors: {
    l: {H: 10, S: 50, B:80},
    c: {H: 40, S: 50, B:80},
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
  cleanup: function() {
    this.osc.stop();
    this.osc.dispose();
    this.filter.dispose();
    this.meter.dispose();
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
  touchStarted: function() {
    this.setFilter(mouseX/width, mouseY/height);
  },
  setFilter: function(x, y) {
    var freq = x * this.filterParams.max + this.filterParams.min;
    var res = (1-y) * this.filterParams.qMax + this.filterParams.qMin;
    console.log("Filter set to ", freq, ", ", res);
    this.filter.set(freq, res);
  }
}

var glitch = {
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
  baseFreq: 440,
  glitchFreq: 100,
  glitch: 0,
  glitchOffset: 100,
  init: function(sock) {
    this.messageHandler(sock);
    this.meter = new p5.Amplitude();
    this.osc = new p5.SawOsc(this.baseFreq);
    this.filter = new p5.LowPass();
    this.osc.disconnect();
    this.osc.connect(this.filter);
    this.osc.amp(1);
    this.osc.start();
    this.bg = clientConfig.visual.bg;
  },
  cleanup: function() {
    this.osc.stop();
    this.osc.dispose();
    this.filter.dispose();
    this.meter.dispose();
  },
  draw: function() {
    background(0);
    var level = this.meter.getLevel();
    var bgAlpha = pow(level, clientConfig.visual.bg.alphaFactor);
    var baseColor = this.backgroundColors[state.seatingSection];
    var bgColor;
    var glitchVal = this.glitchFreq*this.glitch;
    var thisThold = random(100);
    console.log("Glitch prob: ", glitchVal, " threshold:", thisThold);
    if(glitchVal > thisThold) {
      var randomOffset = random(-this.glitchOffset, this.glitchOffset)*this.glitch;
      console.log("Glitched offset: ", randomOffset);
      this.osc.freq(this.baseFreq + randomOffset);
      bgColor = color(
          baseColor.H + random(-this.glitchOffset, this.glitchOffset)*this.glitch,
          baseColor.S + random(-this.glitchOffset, this.glitchOffset)*this.glitch,
          baseColor.B + random(-this.glitchOffset, this.glitchOffset)*this.glitch,
          bgAlpha);
    } else {
      bgColor = color(
          baseColor.H,
          baseColor.S,
          baseColor.B,
          bgAlpha);
    }
    noStroke();
    fill(bgColor);
    rect(0, 0, width, height);
  },
  messageHandler: function(sock) {
    var self = this;
    sock.on("setNote", function (payload) {self.setNote(self, payload)});
    sock.on("setGlitch", function(payload) {self.setGlitch(self, payload)});
    sock.on("setGlitchFreq", function(payload) {self.setGlitchFreq(self, payload)});
  },
  deviceMoved: function() {
    console.log("device moved");
    var x = (rotationX + 180)/360;
    var y = (rotationY + 180)/360;
    setFilter(x, y);
  },
  setNote: function(self, payload) {
    self.baseFreq = midiToFreq(payload.note);
  },
  setGlitch: function(self, payload) {
    console.log("setting glitch to ", payload.glitch);
    self.glitch = payload.glitch;
  },
  setGlitchFreq: function(self, payload) {
    self.glitchFreq = payload.glitchFreq;
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

var shakey = {
  shakeThreshold: 20,
  backgroundColors: {
    l: {H: 10, S: 50, B:80},
    c: {H: 40, S: 50, B: 80},
    r: {H: 70, S: 50, B:80}
  },
  init: function(sock) {
    var self = this;
    this.messageHandler(sock);
    this.meter = new p5.Amplitude();
    this.bg = clientConfig.visual.bg;
    this.sound = loadSound(sampleFiles[state.clientId % sampleFiles.length], function() {console.log("sample loaded")});
    this.sound.playMode('restart');
    setShakeThreshold(this.shakeThreshold);
  },
  cleanup: function() {
    this.meter.dispose();
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
  },
  mute: function() {
    this.sound.setVolume(0);
  },
  unmute: function() {
    this.sound.setVolume(1);
  },
  setGain: function(gain) {
    this.sound.setVolume(gain);
  },
  deviceShaken: function() {
   console.log("Shaken!");
   if (this.sound.isLoaded()) {
     this.sound.play();
   }
  }
}

var movements = [
  tap,
  drone,
  glitch,
  shakey
]


