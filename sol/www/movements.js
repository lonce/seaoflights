var sampleFiles = [
  "assets/bowl.mp3",
  "assets/lg-bell.mp3",
  "assets/md-bell.mp3",
  "assets/sm-bell.mp3"
];

var nosection = {
  initialADSR: {
                 a: 0.01,
                 d: 0.1,
                 s: 1,
                 r: 0.05
               },
  backgroundColor: {H: 10, S: 50, B:80},
  oscBank: [
    {type: p5.TriOsc, offset: function(freq) {return freq}, osc: null},
    {type: p5.TriOsc, offset: function(freq) {return freq + freq/2}, osc: null},
    {type: p5.TriOsc, offset: function(freq) {return freq - freq/2}, osc: null}
  ],
  init: function(sock) {
      this.messageHandler(sock);
      this.meter = new p5.Amplitude();
      this.env = new p5.Env();
      this.env.setADSR(
          this.initialADSR.a,
          this.initialADSR.d,
          this.initialADSR.s,
          this.initialADSR.r);
      this.env.setRange(1, 0);
      this.reverb = new p5.Reverb();
      this.reverb.amp(8);
      var self = this;
      this.oscBank.forEach(function(osc) {
        osc.osc = new osc.type();
        osc.osc.amp(self.env);
        osc.osc.freq(osc.offset(440));
        osc.osc.start();
        osc.osc.disconnect();
        self.reverb.process(osc.osc, 0.5, 0.8);
      });
      this.bg = clientConfig.visual.bg;
    },
    cleanup: function() {
               this.oscBank.forEach(function(osc) {
                 osc.osc.stop();
                 if(osc.osc) osc.osc.dispose();
               });
               if(this.env) this.env.dispose();
               if(this.meter) this.meter.dispose();
               if(this.reverb) this.reverb.dispose();
             },
    draw: function() {
            background(0);
            if (this.meter) {
              var level = this.meter.getLevel();
            } else {
              var level = 0;
            }
            var bgAlpha = pow(level, clientConfig.visual.bg.alphaFactor);
            var baseColor = this.backgroundColor;
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

var tap = {
  initialADSR: {
    a: 0.01,
    d: 0.1,
    s: 1,
    r: 0.05
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
  oscBank: {
             l: [
                  {type: p5.TriOsc, offset: function(freq) {return freq}, osc: null},
                  {type: p5.TriOsc, offset: function(freq) {return freq + freq/2}, osc: null},
                  {type: p5.TriOsc, offset: function(freq) {return freq - freq/2}, osc: null}
                ],
             c: [
                  {type: p5.SawOsc, offset: function(freq) {return freq}, osc: null},
                  {type: p5.SawOsc, offset: function(freq) {return freq + freq/2}, osc: null},
                  {type: p5.SawOsc, offset: function(freq) {return freq - freq/2}, osc: null}
                ],
             r: [
                  {type: p5.SinOsc, offset: function(freq) {return freq}, osc: null},
                  {type: p5.SinOsc, offset: function(freq) {return freq + freq/2}, osc: null},
                  {type: p5.SinOsc, offset: function(freq) {return freq - freq/2}, osc: null}
                ],
  },
  init: function(sock) {
    if (!state.seatingSection) {
      var self = this;
      console.log("Movement wants seating info");
      getSeatingCb(function() {
        self.restOfInit(sock);
      });
    } else {
      this.restOfInit(sock);
    }
  },
  restOfInit: function(sock) {
    console.log("Initing rest");
    this.messageHandler(sock);
    this.meter = new p5.Amplitude();
    this.env = new p5.Env();
    this.env.setADSR(
        this.initialADSR.a,
        this.initialADSR.d,
        this.initialADSR.s,
        this.initialADSR.r);
    this.env.setRange(1, 0);
    this.reverb = new p5.Reverb();
    this.reverb.amp(8);
    var self = this;
    this.oscBank[state.seatingSection].forEach(function(osc) {
      osc.osc = new osc.type();
      osc.osc.amp(self.env);
      osc.osc.freq(osc.offset(440));
      osc.osc.start();
      osc.osc.disconnect();
      self.reverb.process(osc.osc, 0.5, 0.8);
    });
    this.bg = clientConfig.visual.bg;
  },
  cleanup: function() {
    if(state.seatingSection) {
      this.oscBank[state.seatingSection].forEach(function(osc) {
        osc.osc.stop();
        if(osc.osc) osc.osc.dispose();
      });
      if(this.env) this.env.dispose();
      if(this.meter) this.meter.dispose();
      if(this.reverb) this.reverb.dispose();
    }
  },
  draw: function() {
    var seatingSection = state.seatingSection || 'c';
    background(0);
    if (this.meter) {
      var level = this.meter.getLevel();
    } else {
      var level = 0;
    }
    var bgAlpha = pow(level, clientConfig.visual.bg.alphaFactor);
    var baseColor = this.backgroundColors[seatingSection];
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
    var seatingSection = state.seatingSection || 'c';
    this.oscBank[seatingSection].forEach(function(osc) {
      var freq = osc.offset(midiToFreq(note));
      console.log("Setting osc freq to ", freq);
      osc.osc.freq(freq);
    });
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
  oscBank: {
             l: [
                  {type: p5.TriOsc, offset: (freq) => {freq}, osc: null},
                  {type: p5.TriOsc, offset: (freq) => {freq + freq/2}, osc: null},
                  {type: p5.TriOsc, offset: (freq) => {freq - freq/2}, osc: null}
                ],
             c: [
                  {type: p5.SawOsc, offset: (freq) => {freq}, osc: null},
                  {type: p5.SawOsc, offset: (freq) => {freq + freq/2}, osc: null},
                  {type: p5.SawOsc, offset: (freq) => {freq - freq/2}, osc: null}
                ],
             r: [
                  {type: p5.SinOsc, offset: (freq) => {freq}, osc: null},
                  {type: p5.SinOsc, offset: (freq) => {freq + freq/2}, osc: null},
                  {type: p5.SinOsc, offset: (freq) => {freq - freq/2}, osc: null}
                ],
  },
  modFreq: 60,
  modDepth: 100,
  ampFreq: 1,
  ampDepth: 1,
  init: function(sock) {
    var self = this;
    if (!state.seatingSection) {
      getSeatingCb(function() {
        self.restOfInit(sock);
      });
    } else {
      this.restOfInit(sock);
    }
  },
  restOfInit: function(sock){
    console.log("Initing rest");
    this.messageHandler(sock);
    this.meter = new p5.Amplitude();
    this.modOsc = new p5.SinOsc();
    this.modOsc.start();
    this.modOsc.disconnect();
    this.modOsc.amp(this.modDepth);
    this.modOsc.freq(this.modFreq);
    this.reverb = new p5.Reverb();
    this.reverb.amp(8);
    var self = this;
    this.oscBank[state.seatingSection].forEach(function(osc) {
      osc.osc = new osc.type();
      osc.osc.amp(1);
      osc.osc.freq(osc.offset(440));
      osc.osc.start();
      osc.osc.disconnect();
      osc.osc.freq(self.modOsc);
      self.reverb.process(osc.osc, 0.5, 0.8);
    });
    this.bg = clientConfig.visual.bg;
  },
  cleanup: function() {
    this.oscBank[state.seatingSection].forEach(function(osc) {
      osc.osc.stop();
      if (osc.osc) osc.osc.dispose();
    });
    this.modOsc.stop();
    if (this.modOsc) this.modOsc.dispose();
    if (this.reverb) this.reverb.dispose();
    if (this.meter) this.meter.dispose();
  },
  draw: function() {
    background(0);
    var seatingSection = state.seatingSection || 'c';
    if (this.meter) {
      var level = this.meter.getLevel();
    } else {
      var level = 0;
    }
    var bgAlpha = pow(level, clientConfig.visual.bg.alphaFactor);
    var baseColor = this.backgroundColors[seatingSection];
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
    var seatingSection = state.seatingSection || 'c';
    this.oscBank[seatingSection].forEach(function(osc) {
      osc.osc.amp(0);
    });
  },
  unmute: function() {
    var seatingSection = state.seatingSection || 'c';
    this.oscBank[seatingSection].forEach(function(osc) {
      osc.osc.amp(1);
    });
  },
  setGain: function(gain) {
    var seatingSection = state.seatingSection || 'c';
    this.oscBank[seatingSection].forEach(function(osc) {
      osc.osc.amp(gain);
    });
  },
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
  oscBank: {
             l: [
                  {type: p5.TriOsc, offset: (freq) => {freq}, osc: null}
             ],
             c: [
                  {type: p5.SawOsc, offset: (freq) => {freq}, osc: null}
                ],
             r: [
                  {type: p5.SinOsc, offset: (freq) => {freq}, osc: null}
                ],
  },
  baseFreq: 440,
  glitchFreq: 100,
  glitch: 0,
  glitchOffset: 100,
  init: function(sock) {
    var self = this;
    if (!state.seatingSection) {
      getSeatingCb(function() {
        self.restOfInit(sock);
      });
    } else {
      this.restOfInit(sock);
    }
  },
  restOfInit: function(sock) {
    console.log("Initing rest");
    this.messageHandler(sock);
    this.meter = new p5.Amplitude();
    this.reverb = new p5.Reverb();
    this.reverb.amp(8);
    var self = this;
    this.oscBank[state.seatingSection].forEach(function(osc) {
      osc.osc = new osc.type();
      osc.osc.amp(1);
      osc.osc.freq(osc.offset(440));
      osc.osc.start();
      osc.osc.disconnect();
      self.reverb.process(osc.osc, 0.5, 0.8);
    });
    this.bg = clientConfig.visual.bg;
  },
  cleanup: function() {
    var seatingSection = state.seatingSection || 'c';
    this.oscBank[seatingSection].forEach(function(osc) {
      osc.osc.stop();
      if (osc.osc) osc.osc.dispose();
    });
    if (this.filter) this.filter.dispose();
    if (this.meter) this.meter.dispose();
  },
  draw: function() {
    var seatingSection = state.seatingSection || 'c';
    background(0);
    if (this.meter) {
      var level = this.meter.getLevel();
    } else {
      var level = 0;
    }
    var bgAlpha = pow(level, clientConfig.visual.bg.alphaFactor);
    var baseColor = this.backgroundColors[seatingSection];
    var bgColor;
    var glitchVal = this.glitchFreq*this.glitch;
    var thisThold = random(100);
    console.log("Glitch prob: ", glitchVal, " threshold:", thisThold);
    if(glitchVal > thisThold) {
      var self = this;
      var randomOffset = random(-this.glitchOffset, this.glitchOffset)*this.glitch;
      this.oscBank[seatingSection].forEach(function(osc) {
        osc.osc.freq(self.baseFreq + randomOffset);
      });
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
    var seatingSection = state.seatingSection || 'c';
    this.oscBank[seatingSection].forEach(function(osc) {
      osc.osc.amp(0);
    });
  },
  unmute: function() {
    var seatingSection = state.seatingSection || 'c';
    this.oscBank[seatingSection].forEach(function(osc) {
      osc.osc.amp(1);
    });
  },
  setGain: function(gain) {
    var seatingSection = state.seatingSection || 'c';
    this.oscBank[seatingSection].forEach(function(osc) {
      osc.osc.amp(gain);
    });
  },
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
    if (!state.seatingSection) {
      getSeatingCb(function() {
        self.restOfInit(sock);
      });
    } else {
      this.restOfInit(sock);
    }
  },
  restOfInit: function(sock) {
    console.log("Initing rest");
    var self = this;
    this.messageHandler(sock);
    this.meter = new p5.Amplitude();
    this.bg = clientConfig.visual.bg;
    this.sound = loadSound(sampleFiles[state.clientId % sampleFiles.length], function() {alert("In this section, shake your phone to make a sound. Feel free to accompany the piece however you want. Tap the screen once to start");});
    this.sound.playMode('restart');
    setShakeThreshold(this.shakeThreshold);
  },
  cleanup: function() {
    if(this.meter) this.meter.dispose();
  },
  draw: function() {
    var seatingSection = state.seatingSection || 'c';
    background(0);
    if(this.meter) {
      var level = this.meter.getLevel();
    } else {
      var level = 0;
    }
    var bgAlpha = pow(level, clientConfig.visual.bg.alphaFactor);
    var baseColor = this.backgroundColors[seatingSection];
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
     console.log("Play sound");
     this.sound.play();
   }
  }
}

var movements = [
  nosection,
  tap,
  drone,
  glitch,
  shakey
]

