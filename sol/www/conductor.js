var socket = io();
var clientId = -1;
$(document).ready(function() {
  socket.connect();
  socket.on("init", function(data) {
      if(clientId > -1 && data.clientId != clientId) {
        console.log("Server trying to give me a new id, telling it my real id");
        socket.emit("idCorrection", {wrongId: data.clientId, rightId: clientId});
      } else {
        console.log("Poor server thinks I'm just another phone. Time to teach it a lesson!");
        socket.emit("conductor", {clientId: data.clientId});
      }
  });
  socket.on("clientcount", function(data) {
    console.log("Got new client count: ", data);
    $('#sectionsTable .counts .l').html(data.l);
    $('#sectionsTable .counts .c').html(data.c);
    $('#sectionsTable .counts .r').html(data.r);
  });

  $('.controls .movements ul').empty();

  $('.gain-slider').slider({
    min: 0,
    max: 1,
    value: 1,
    step: 0.01,
    change: function(event, ui) {
      console.log($(ui.handle).parent());
      var value = parseFloat(ui.value);
      var info = $(ui.handle).parent().data();
      var scope = info['scope'];
      var target = info['target'];
      console.log("setting gain of ", scope, " ", target, " to ", value);
      socket.emit('setGain', {scope: scope, target: target, gain: parseFloat(value)});
    }
  });

  movements.forEach(function(mv, idx) {
      var mvmtBtn = $("<li><button id='" + idx + "'>" + mv.name + '</button></li>');
      mvmtBtn.on('click', setMovement);
      $('.controls .movements ul').append(mvmtBtn);
  });

  $('.mute').on('click', function(ev) {
    var info = $(ev.target).data();
    var scope = info['scope'];
    var target = info['target'];
    socket.emit('mute', {scope: scope, target:target});
  });
  $('.unmute').on('click', function(ev) {
    var info = $(ev.target).data();
    var scope = info['scope'];
    var target = info['target'];
    socket.emit('unmute', {scope: scope, target:target});
  });
});

function setMovement(ev) {
    var el = $(ev.target)[0];
    console.log("Setting movement to ", el.id);
    $('.controls .movements ul li').removeClass('active');
    $(el).parent().addClass('active');
    socket.emit('changeMovement', {movement: el.id});
}
