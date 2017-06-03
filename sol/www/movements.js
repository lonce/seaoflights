var sampleFiles = [
  "assets/bowl.mp3",
  "assets/lg-bell.mp3",
  "assets/md-bell.mp3",
  "assets/sm-bell.mp3"
];


var nosection = {
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
            var thisWhisper = this.foreignWhispers[random(this.foreignWhispers.length)];
            if (thisWhisper.isLoaded()) {
              thisWhisper.play();
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
                this.initialized = true;
              },
  cleanup: function() {
             if(this.initialized) {
               this.oscBank[state.seatingSection].forEach(function(osc) {
                 osc.osc.stop();
                 if(osc.osc) osc.osc.dispose();
               });
               if(this.meter) this.meter.dispose();
               if(this.reverb) this.reverb.dispose();
               this.initialized = false;
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
                    if(this.initialized) {
                      sock.on("setADSR", function (payload) {self.setADSR(self, payload)});
                      sock.on("setChord", function(payload) {self.setChordS(self, payload)});
                    }
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
             if(this.initialized && self.env) self.env.setADSR(payload.a, payload.d, payload.s, payload.r);
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
             if ( state.seatingSection) {
               this.oscBank[state.seatingSection].forEach(function(osc) {
                 osc.osc.stop();
                 if (osc.osc) osc.osc.dispose();
               });
               this.modOsc.stop();
               if (this.modOsc) this.modOsc.dispose();
               if (this.reverb) this.reverb.dispose();
               if (this.meter) this.meter.dispose();
             }
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
          if (state.seatingSection) {
            this.oscBank[state.seatingSection].forEach(function(osc) {
              osc.osc.amp(0);
            });
          }
        },
  unmute: function() {
            if (state.seatingSection) {
              this.oscBank[state.seatingSection].forEach(function(osc) {
                osc.osc.amp(1);
              });
            }
          },
  setGain: function(gain) {
             if (state.seatingSection) {
               this.oscBank[state.seatingSection].forEach(function(osc) {
                 osc.osc.amp(gain);
               });
             }
           },
  touchEnded: function() {
                return false;
              },
  touchStarted: function() {
                  return false;
                },
  deviceShaken: function() {
                  return false;
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
  oscBank: {
             l: [
             {type: p5.TriOsc, offset: function(freq) {return freq}, osc: null}
             ],
               c: [
               {type: p5.SawOsc, offset: function(freq) {return freq}, osc: null}
             ],
               r: [
               {type: p5.SinOsc, offset: function(freq) {return freq}, osc: null}
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
             if ( state.seatingSection) {
               this.oscBank[state.seatingSection].forEach(function(osc) {
                 osc.osc.stop();
                 if (osc.osc) osc.osc.dispose();
               });
               if (this.filter) this.filter.dispose();
               if (this.meter) this.meter.dispose();
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
          var baseColor = this.backgroundColors[state.seatingSection];
          var bgColor;
          var glitchVal = this.glitchFreq*this.glitch;
          var thisThold = random(100);
          console.log("Glitch prob: ", glitchVal, " threshold:", thisThold);
          if(glitchVal > thisThold) {
            var self = this;
            var randomOffset = random(-this.glitchOffset, this.glitchOffset)*this.glitch;
            this.oscBank[state.seatingSection].forEach(function(osc) {
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
          if ( state.seatingSection) {
            this.oscBank[state.seatingSection].forEach(function(osc) {
              osc.osc.amp(0);
            });
          }
        },
  unmute: function() {
            if ( state.seatingSection) {
              this.oscBank[state.seatingSection].forEach(function(osc) {
                osc.osc.amp(1);
              });
            }
          },
  touchStarted: function() {
                  return false;
                },
  touchEnded: function() {
                return false;
              },
  deviceShaken: function() {
                  return false;
                },
  setGain: function(gain) {
             if ( state.seatingSection) {
               this.oscBank[state.seatingSection].forEach(function(osc) {
                 if (osc.osc) {
                   osc.osc.amp(gain);
                 }
               });
             }
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
                setShakeThreshold(this.shakeThreshold);
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
                  console.log("Shaken!");
                  if (this.sound && this.sound.isLoaded()) {
                    console.log("Play sound");
                    this.sound.play();
                  }
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

