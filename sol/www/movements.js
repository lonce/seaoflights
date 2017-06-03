var sampleFiles = [
  "assets/bowl.mp3",
  "assets/lg-bell.mp3",
  "assets/md-bell.mp3",
  "assets/sm-bell.mp3"
];

//TODO: Record samples
//TODO: No more section mutes


var welcome = {
  backgroundColor: {H: 10, S: 50, B:80},
  shakeThreshold: 20,
  whisperProb: 5,
  whisperDenom: 250,
  initialized: false,
  init: function(sock) {
    this.whisper = loadSound("assets/whispers/en.mp3");
    this.foreignWhispers = [
      loadSound("assets/whispers/tur.mp3"),
      loadSound("assets/whispers/ger.mp3"),
      loadSound("assets/whispers/chi.mp3"),
      loadSound("assets/whispers/fre.mp3"),
      loadSound("assets/whispers/ita.mp3"),
      loadSound("assets/whispers/jap.mp3"),
      loadSound("assets/whispers/hin.mp3"),
      loadSound("assets/whispers/ara.mp3"),
      loadSound("assets/whispers/kur.mp3"),
      loadSound("assets/whispers/spa.mp3"),
    ];
    this.messageHandler(sock);
    this.meter = new p5.Amplitude();
    this.bg = clientConfig.visual.bg;
    setShakeThreshold(this.shakeThreshold);
    this.initialized = true;
  },
  cleanup: function() {
    if(this.initialized) {
      if(this.meter) this.meter.dispose();
      if(this.whisper) this.whisper.dispose();
      this.foreignWhispers.forEach(function (whisper) {
        whisper.dispose();
      });
    }
  },
  draw: function() {
    background(0);
    if(this.initialized){
        var level = this.meter.getLevel();
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
            if(this.whisper.isLoaded() && (random(1000) < this.whisperProb)) {
                var thisWhisper = this.foreignWhispers[floor(random(this.foreignWhispers.length))];
                if (thisWhisper.isLoaded()) {
                    thisWhisper.play();
                }
            }
        }
  },
  messageHandler: function(sock) {
    var self = this;
    sock.on("setWhisperProb",function (payload) {self.setWhisperProb(self, payload)});
  },
  touchStarted: function() {
    if(this.whisper.isLoaded()) {
      this.whisper.play();
    }
  },
  setWhisperProb: function(self, payload) {
    self.whisperProb = payload.whisperProb;
  },
  mute: function() {
    this.whisper.amp(0);
    this.foreignWhispers.forEach(function(whisper) {
      whisper.amp(0);
    });
  },
  unmute: function() {
    this.whisper.amp(1);
    this.foreignWhispers.forEach(function(whisper) {
      whisper.amp(1);
    });
  },
  setGain: function(gain) {
    this.whisper.amp(gain);
    this.foreignWhispers.forEach(function(whisper) {
      whisper.amp(gain);
    });
  }
}

var vibraslap = {
  backgroundColor: {H: 10, S: 50, B:80},
  shakeThreshold: 20,
  initialized: false,
  muted: false,
  init: function(sock) {
    this.slap = loadSound("assets/shakeSound.mp3", function() { alert("Your phone is ready. Tap the black screen once to activate and shake your phone to play!")});
    this.meter = new p5.Amplitude();
    this.bg = clientConfig.visual.bg;
    setShakeThreshold(this.shakeThreshold);
    this.initialized = true;
  },
  cleanup: function() {
    if(this.initialized) {
      if(this.meter) this.meter.dispose();
      if(this.slap) this.slap.dispose();
    }
  },
  draw: function() {
    background(0);
    var level = this.meter.getLevel();
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
  deviceShaken() {
    if (this.initialized && this.slap.isLoaded() && !this.muted) {
      this.slap.play();
    }
  },
  mute: function() {
    this.muted = true;
  },
  unmute: function() {
    this.muted = false;
  },
  setGain: function(gain) {
    if (this.initialized) {
      this.whisper.amp(gain);
    }
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
    {type: p5.SinOsc, offset: function(freq) {return freq + 1}, osc: null},
    {type: p5.SinOsc, offset: function(freq) {return freq - 1}, osc: null}
    ],
    c: [
    {type: p5.SawOsc, offset: function(freq) {return freq}, osc: null},
    {type: p5.TriOsc, offset: function(freq) {return freq + freq/2}, osc: null},
    {type: p5.SinOsc, offset: function(freq) {return freq - freq/2}, osc: null}
    ],
    r: [
    {type: p5.SawOsc, offset: function(freq) {return freq}, osc: null},
    {type: p5.TriOsc, offset: function(freq) {return freq + freq/2}, osc: null},
    {type: p5.SinOsc, offset: function(freq) {return freq - freq/2}, osc: null}
    ],
  },
  initialized: false,
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
  firstNotes: {
    l: 48,
    c: 52,
    r: 55,
  },
  restOfInit: function(sock) {
    console.log("Initing rest");
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
    var initialNote = this.firstNotes[state.seatingSection];
    this.oscBank[state.seatingSection].forEach(function(osc) {
      osc.osc = new osc.type();
      osc.osc.amp(self.env);
      osc.osc.freq(osc.offset(midiToFreq(initialNote)));
      osc.osc.start();
      osc.osc.disconnect();
      self.reverb.process(osc.osc, 0.5, 0.8);
    });
    this.bg = clientConfig.visual.bg;
    this.messageHandler(sock);
    this.initialized = true;
  },
  cleanup: function() {
    if(this.initialized) {
      this.initialized = false;
      var self = this;
      var seat = state.seatingSection;
      setTimeout(function() {
        self.oscBank[seat].forEach(function(osc) {
            osc.osc.stop();
            if(osc.osc) osc.osc.dispose();
        });
        if(self.meter) self.meter.dispose();
        if(self.reverb) self.reverb.dispose();
    }, 7000);
    }
  },
  draw: function() {
    if(this.initialized) {
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
    }
  },
  messageHandler: function(sock) {
    var self = this;
    sock.on("setADSR", function (payload) {self.setADSR(self, payload)});
    sock.on("setChord", function (payload) {self.setChordS(self, payload)});
  },
  touchStarted: function() {
    console.log("touch started");
    if (this.initialized) {
      this.noteOff();
      this.noteOn();
      return false;
    }
  },
  touchEnded: function() {
    if (this.initialized) {
      this.noteOff();
      return false;
    }
  },
  noteOn: function() {
    if(this.initialized) {
      this.env.triggerAttack();
    }
  },
  noteOff: function() {
    if(this.initialized) {
      this.env.triggerRelease();
    }
  },
  setChordS: function(self, payload) {
    self.setChord(payload);
  },
  setChord: function(payload) {
    if(this.initialized) {
      var chord = payload.chord;
      var note = chord[state.clientId % chord.length];
      this.setNote(note);
    }
  },
  setNote: function(note) {
    if (this.initialized) {
      this.oscBank[state.seatingSection].forEach(function(osc) {
        var freq = osc.offset(midiToFreq(note));
        console.log("Setting osc freq to ", freq);
        osc.osc.freq(freq);
      });
    }
  },
  setADSR: function(self, payload) {
    console.log("set ADSR");
    if(this.initialized && self.env) {
        console.log("Setting ADSR");
        self.env.setADSR(payload.a, payload.d, payload.s, payload.r);
    }
  },
  mute: function() {
    if(this.initialized && this.env){
      this.env.mult(0);
    }
  },
  unmute: function() {
    if(this.initialized && this.env){
      this.env.mult(1);
    }
  },
  setGain: function(gain) {
    if(this.env){
      this.env.mult(gain);
    }
  }
}

var drone = {
  backgroundColors: {
    l: {H: 10, S: 50, B:80},
    c: {H: 40, S: 50, B:80},
    r: {H: 70, S: 50, B:80}
  },
  initialized: false,
  baseNote: 48,
  muted: false,
  clinkTimeout: 5000,
  muteClink: false,
  baseFreq: 440,
  glitchFreq: 100,
  glitch: 0,
  glitchOffset: 2000,
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
    this.meter = new p5.Amplitude();

    this.pulse1 = new p5.Pulse();
    this.pulse2 = new p5.Pulse();
    this.tri1 = new p5.TriOsc();
    this.tri2 = new p5.TriOsc();
    this.noise = new p5.Noise();

    this.pulseGn1 = new p5.Gain();
    this.pulseGn1.amp(0.33);
    this.pulseGn2 = new p5.Gain();
    this.pulseGn2.amp(0.33)
    this.triGn1 = new p5.Gain();
    this.triGn1.amp(1);
    this.triGn2 = new p5.Gain();
    this.triGn2.amp(1);
    this.noiseGn = new p5.Gain();
    this.noiseGn.amp(0.3);

    this.lpf = new p5.LowPass();
    this.lpf.res(15);
    this.rev = new p5.Reverb();
    this.env = new p5.Env();

    this.oscillators = [
        this.pulse1,
        this.pulse2,
        this.tri1,
        this.tri2,
        this.noise
    ];

    this.gains = [
        this.pulseGn1,
        this.pulseGn2,
        this.triGn1,
        this.triGn2,
        this.noiseGn
    ];

    var self = this;

    this.oscillators.forEach(function(osc, idx) {
        osc.disconnect();
        osc.amp(self.env);
        self.gains[idx].setInput(osc);
        self.gains[idx].connect(self.lpf);
        osc.start();
    });
    this.env.setADSR(1, 1, 1, 0);
    this.env.triggerAttack();

    this.lpf.disconnect();
    this.rev.process(this.lpf, 2, 2);

    this.bg = clientConfig.visual.bg;
    this.messageHandler(sock);
    this.initialized = true;
  },
  cleanup: function() {
    if (this.initialized) {
        this.initialized = false;
      this.oscillators.forEach(function(osc) {
          if(osc) {
              osc.stop();
              osc.dispose();
          }
      });
      this.gains.forEach(function(gain) {
          gain.dispose();
      });
      if (this.env) this.env.dispose();
      if (this.lpf) this.lpf.dispose();
      if (this.reverb) this.reverb.dispose();
      if (this.meter) this.meter.dispose();
    }
  },
  draw: function() {
    background(0);
    if (this.initialized) {
        var seatingSection = state.seatingSection || 'c';
        if (this.meter) {
          var level = this.meter.getLevel();
        } else {
          var level = 0;
        }
        var bgAlpha = pow(level, clientConfig.visual.bg.alphaFactor);
        var baseColor = this.backgroundColors[seatingSection];
        var glitchVal = this.glitchFreq*this.glitch;
        var thisThold = random(100);
        if(glitchVal > thisThold) {
          console.log("Glitching")
          var self = this;
          var randomOffset = random(this.glitchOffset)*this.glitch;
          this.oscillators.forEach(function(osc, idx) {
              if(idx < self.oscillators.length-1) {
                  osc.freq(midiToFreq(self.baseNote) + randomOffset);
              }
          });
          bgColor = color(
              baseColor.H + random(-this.glitchOffset/20, this.glitchOffset/20)*this.glitch,
              baseColor.S,
              baseColor.B,
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
    }
  },
  messageHandler: function(sock) {
    var self = this;
    sock.on("setChord", function(payload) {self.setChordS(self, payload)});
    sock.on("setGlitch", function(payload) {console.log(payload);self.setGlitch(self, payload)});
  },
  mute: function() {
    if (this.initialized) {
      this.pulseGn1.amp(0);
      this.pulseGn2.amp(0)
      this.triGn1.amp(0);
      this.triGn2.amp(0);
      this.noiseGn.amp(0);
    }
  },
  unmute: function() {
    if (this.initialized) {
      this.pulseGn1.amp(0.33);
      this.pulseGn2.amp(0.33)
      this.triGn1.amp(1);
      this.triGn2.amp(1);
      this.noiseGn.amp(0.3);
    }
  },
  setGain: function(gain) {
      if(this.initialized){
        this.pulseGn1.amp(0.33*gain);
        this.pulseGn2.amp(0.33*gain)
        this.triGn1.amp(1*gain);
        this.triGn2.amp(1*gain);
        this.noiseGn.amp(0.3*gain);
      }
  },
  setChordS: function(self, payload) {
    self.setChord(payload);
  },
  setChord: function(payload) {
    if(this.initialized) {
      var chord = payload.chord;
      var note = chord[state.clientId % chord.length];
      this.setNote(note);
    }
  },
  setNote: function(note) {
      if (this.initialized) {
          this.baseNote = note;
          this.tri1.freq(midiToFreq(note));
          this.pulse1.freq(midiToFreq(note+7));
      }
  },
  setGlitch: function(self, payload) {
    console.log(payload);
    self.glitch = payload.glitch;
    var noiseGain = max([0, 0.66*(0.5-self.glitch)]);
    console.log(noiseGain);
    self.noiseGn.amp(noiseGain);
  },
  deviceMoved: function() {
      if(this.initialized) {

          var x = (((rotationX + 180) + 90) % 360) - 180 ;
          //if(x< -90) x = -90;
          //if(x>90) x = 90;
          var normX = abs(x/180);
          var lpFreq = 350 + pow(normX, 3)*3000;
          this.lpf.freq(lpFreq);


          var normZ = abs((rotationZ - 180)/360.0);
          //var rampedZ = pow(normZ, 2);
          //var lpFreq = 350 + rampedZ*3000;
          //console.log("LPF: ", lpFreq);
        //console.log("initialized and moved. Z: ", rotationZ, " x: ", rotationX, " y: ", rotationY);
        //this.lpf.freq(lpFreq);
        var modLevel = normZ*1000;
        //console.log(modLevel);
        this.tri2.freq(midiToFreq(this.baseNote) + modLevel);
        //this.pulse2.freq(midiToFreq(this.baseNote + 7) + (rotationY/180.0)*10);
      }
  },
}

var shakey = {
  shakeThreshold: 50,
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
  timedOut: false,
  restOfInit: function(sock) {
    console.log("Initing rest");
    var self = this;
    this.meter = new p5.Amplitude();
    this.bg = clientConfig.visual.bg;
    this.sound = loadSound(sampleFiles[state.clientId % sampleFiles.length], function() {alert("In this section, shake your phone to make a sound. Feel free to accompany the piece however you want. Tap the screen once to start");});
    this.sound.
    setShakeThreshold(this.shakeThreshold);
    this.messageHandler(sock);
    this.initialized = true;
  },
  cleanup: function() {
    if(this.initialized) {
      this.initialized = false;
      if(this.meter) this.meter.dispose();
    }
  },
  draw: function() {
    background(0);
    if(this.initialized) {
      var seatingSection = state.seatingSection || 'c';
      if(this.meter) {
        var level = this.meter.getLevel();
      } else {
        console.log("No level");
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
    }
  },
  messageHandler: function(sock) {
    var self = this;
    sock.on("fadeOut", self.fadeOut());
  },
  fadeOut: function() {
    if(this.initialized && this.env) {
      this.env.triggerRelease();
    }
  },
  mute: function() {
    if(this.initialized && this.sound) {
      this.sound.setVolume(0);
    }
  },
  unmute: function() {
    if(this.initialized && this.sound) {
      this.sound.setVolume(1);
    }
  },
  setGain: function(gain) {
    if(this.initialized && this.sound) {
      this.sound.setVolume(gain);
    }
  },
  deviceShaken: function() {
    if(this.initialized) {
      if (this.sound && this.sound.isLoaded() && !this.sound.isPlaying()) {
        this.sound.play();
        this.timedOut = true;
        var self = this;
        setTimeout(function() {
          self.timedOut = false;
        }, 2000);
      }
    }
  }
}

var movements = [
  welcome,
  vibraslap,
  tap,
  drone,
  shakey
]

