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

  $('.controls .movement ul').empty();

  movements.forEach(function(mv, idx) {
      var mvmtBtn = $("<li><button id='" + idx + "'>" + mv.name + '</button></li>');
      mvmtBtn.on('click', setMovement);
      $('.controls .movements ul').append(mvmtBtn);
  });

  $('#mute').on('click', function() {
      socket.emit('muteAll', {});
  });

  $('#unmute').on('click', function() {
      socket.emit('unmuteAll', {});
  });
});

function setMovement(ev) {
    var el = $(ev.target)[0];
    console.log("Setting movement to ", el.id);
    $('.controls .movements ul li').removeClass('active');
    $(el).parent().addClass('active');
    socket.emit('changeMovement', {movement: el.id});
}
