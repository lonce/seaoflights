var firstMovement = {
  name: "1-) Tapping movement",
  init: function() {
    var table = $('#sectionsTable');
    var sliders = $("<tr class='adsr-sliders'><td>A</br>D</br>S</br>R</td><td><div class='a-slider' data-scope='section' data-target='l' data-param='a'></div><div class='d-slider' data-scope='section' data-target='l' data-param='d'></div><div class='s-slider' data-scope='section' data-target='l' data-param='s'></div><div class='r-slider' data-scope='section' data-target='l' data-param='r'></div></td><td><div class='a-slider' data-scope='section' data-target='c' data-param='a'></div><div class='d-slider' data-scope='section' data-target='c' data-param='d'></div><div class='s-slider' data-scope='section' data-target='c' data-param='s'></div><div class='r-slider' data-scope='section' data-target='c' data-param='r'></div></td><td><div class='a-slider' data-scope='section' data-target='r' data-param='a'></div><div class='d-slider' data-scope='section' data-target='r' data-param='d'></div><div class='s-slider' data-scope='section' data-target='r' data-param='s'></div><div class='r-slider' data-scope='section' data-target='r' data-param='r'></div></td></tr>");
    table.append(sliders);
    var globalCtrl = $('.generalControls');
    var generalSliders = $("<div class='a-slider' data-scope='all' data-target='' data-param='a'></div><div class='d-slider' data-scope='all' data-target='' data-param='d'></div><div class='s-slider' data-scope='all' data-target='' data-param='s'></div><div class='r-slider' data-scope='all' data-target='' data-param='r'></div>");
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
  }
}

var movements = [
  firstMovement
]


