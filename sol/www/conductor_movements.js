var nosection = {
  name: "0-) Initial movement(no sections)",
  init: function() {
    var globalCtrl = $('.generalControls');
    var generalSliders = $("<div class='nosec-mv'><div class='a-slider' data-scope='all' data-target='' data-param='a'></div><div class='d-slider' data-scope='all' data-target='' data-param='d'></div><div class='s-slider' data-scope='all' data-target='' data-param='s'></div><div class='r-slider' data-scope='all' data-target='' data-param='r'></div></div>");
    console.log("Tapping movement initialized conductor side");
    globalCtrl.append(generalSliders);
    $('.a-slider').slider({
      min: 0,
      max: 2,
      value: 0.05,
      step: 0.01,
      change: updateADSR
    });
    $('.d-slider').slider({
      min: 0,
      max: 2,
      value: 0.05,
      step: 0.01,
      change: updateADSR
    });
    $('.s-slider').slider({
      min: 0,
      max: 1,
      value: 1,
      step: 0.01,
      change: updateADSR
    });
    $('.r-slider').slider({
      min: 0,
      max: 10,
      value: 0.1,
      step: 0.05,
      change: updateADSR
    });
    var whisperSlider = $("<div class='whisper-slider nosec-mv'></div>");
    $('.generalControls').append(whisperSlider);
    $('.whisper-slider').slider({
      min: 0,
      max: 125,
      value: 5,
      step: 1,
      change: function(event, ui) {
        var whisperVal = parseFloat(ui.value);
        console.log("Setting whisper to ", whisperVal);
        socket.emit('setWhisperProb', {whisperProb: whisperVal});
      }
    });
    function updateADSR(event, ui) {
      var sliderCell = $(ui.handle).parent().parent();
      var atk = parseFloat(sliderCell.children('.a-slider').slider("option", "value"));
      var dec = parseFloat(sliderCell.children('.d-slider').slider("option", "value"));
      var sus = parseFloat(sliderCell.children('.s-slider').slider("option", "value"));
      var rel = parseFloat(sliderCell.children('.r-slider').slider("option", "value"));
      var scope = $(ui.handle).parent().data("scope");
      var target = $(ui.handle).parent().data("target");
      console.log("Update ", scope, " ", target, " attack:", atk, " decay:", dec, " sus:", sus, " release:", rel);
      socket.emit('setADSR', {scope: scope, target: target, a: atk, d: dec, s: sus, r: rel});
    };
  },
  cleanup: function() {
    $('.nosec-mv').remove();
  }
}
var tapping = {
  name: "1-) Tapping movement",
  chords: [
    [48, 55, 60],
    [55, 62, 67],
    [53, 60, 65],
    [57, 64, 69]
    ],
  init: function() {
    var table = $('#sectionsTable');
    var sliders = $("<tr class='adsr-sliders tap-mv'><td>A</br>D</br>S</br>R</td><td><div class='a-slider' data-scope='section' data-target='l' data-param='a'></div><div class='d-slider' data-scope='section' data-target='l' data-param='d'></div><div class='s-slider' data-scope='section' data-target='l' data-param='s'></div><div class='r-slider' data-scope='section' data-target='l' data-param='r'></div></td><td><div class='a-slider' data-scope='section' data-target='c' data-param='a'></div><div class='d-slider' data-scope='section' data-target='c' data-param='d'></div><div class='s-slider' data-scope='section' data-target='c' data-param='s'></div><div class='r-slider' data-scope='section' data-target='c' data-param='r'></div></td><td><div class='a-slider' data-scope='section' data-target='r' data-param='a'></div><div class='d-slider' data-scope='section' data-target='r' data-param='d'></div><div class='s-slider' data-scope='section' data-target='r' data-param='s'></div><div class='r-slider' data-scope='section' data-target='r' data-param='r'></div></td></tr>");
    table.append(sliders);
    var globalCtrl = $('.generalControls');
    var generalSliders = $("<div class='tap-mv'><div class='a-slider' data-scope='all' data-target='' data-param='a'></div><div class='d-slider' data-scope='all' data-target='' data-param='d'></div><div class='s-slider' data-scope='all' data-target='' data-param='s'></div><div class='r-slider' data-scope='all' data-target='' data-param='r'></div></div>");
    console.log("Tapping movement initialized conductor side");
    globalCtrl.append(generalSliders);
    $('.a-slider').slider({
      min: 0,
      max: 2,
      value: 0.05,
      step: 0.01,
      change: updateADSR
    });
    $('.d-slider').slider({
      min: 0,
      max: 2,
      value: 0.05,
      step: 0.01,
      change: updateADSR
    });
    $('.s-slider').slider({
      min: 0,
      max: 1,
      value: 1,
      step: 0.01,
      change: updateADSR
    });
    $('.r-slider').slider({
      min: 0,
      max: 10,
      value: 0.1,
      step: 0.05,
      change: updateADSR
    });
    function updateADSR(event, ui) {
      var sliderCell = $(ui.handle).parent().parent();
      var atk = parseFloat(sliderCell.children('.a-slider').slider("option", "value"));
      var dec = parseFloat(sliderCell.children('.d-slider').slider("option", "value"));
      var sus = parseFloat(sliderCell.children('.s-slider').slider("option", "value"));
      var rel = parseFloat(sliderCell.children('.r-slider').slider("option", "value"));
      var scope = $(ui.handle).parent().data("scope");
      var target = $(ui.handle).parent().data("target");
      console.log("Update ", scope, " ", target, " attack:", atk, " decay:", dec, " sus:", sus, " release:", rel);
      socket.emit('setADSR', {scope: scope, target: target, a: atk, d: dec, s: sus, r: rel});
    }
    this.chords.forEach(function (chord, idx) {
      var chordBtn = $("<button class='tap-mv chord-btn'>Chord ", idx, "</button>");
      chordBtn.on('click', function() {
        console.log("Sending new chord");
        socket.emit('chordChange', {chord: chord});
      });
      $('.generalControls').append(chordBtn);
    });
  },
  cleanup: function() {
     $('.tap-mv').remove();
  }
}

var drone = {
  name: "2-) Drone movement",
  init: function() {
  },
  cleanup: function() {
    $('.drone-mv').remove();
  }
}

var glitch = {
  name: "3-) Glitch movement",
  init: function() {
    var glitchSlider = $("<div class='glitch-slider glitch-mv'></div>");
    $('.generalControls').append(glitchSlider);
    $('.glitch-slider').slider({
      min: 0,
      max: 1,
      value: 0,
      step: 0.01,
      change: function(event, ui) {
        var glitchVal = parseFloat(ui.value);
        console.log("Setting glitch to ", glitchVal);
        socket.emit('setGlitch', {glitch: glitchVal});
      }
    });
  },
  cleanup: function() {
    $('.glitch-mv').remove();
  }
}

var shakey = {
  name: "4-) Shaking bells movement",
  init: function() {
    var bellButton = $("<button class='shake-mv'>Send samples</button>");
    bellButton.on('click', function() {
      console.log("Sending sample init to clients");
      socket.emit('loadSamples', {});
    });
    $('.generalControls').append(bellButton);
  },
  cleanup: function() {
    $('.shake-mv').remove();
  }
};

var movements = [
  nosection,
  tapping,
  drone,
  glitch,
  shakey
]
