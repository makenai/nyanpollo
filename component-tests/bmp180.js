var raspi = require('raspi-io');
var five = require('johnny-five');
var board = new five.Board({
  io: new raspi()
});

board.on("ready", function() {
  var barometer = new five.Barometer({
    controller: "BMP180"
  });
  var temperature = new five.Temperature({
    controller: "BMP180"
  });

  barometer.on("change", function() {
//    console.log("pressure: ", this.pressure);
  });
  temperature.on("change", function(err,data) {
    console.log("temperature: ", data.F);
  });
});
