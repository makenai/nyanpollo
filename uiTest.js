var UI = require('./lib/ui');

var currentData = {
  temperature: 79,
  pressure: 60,
  accel: {
    x: 10,
    y: 20,
    z: 30,
    pitch: 40,
    roll: 50,
    acceleration: 60,
    inclination: 70,
    orientation: 80
  },
  gyro: {
    x: 10,
    y: 23,
    z: 1,
    pitch: 7,
    roll: 80,
    yaw: 2,
    rate: 6,
    isCalibrated: true
  }
};

var ui = new UI('Nyanpollo');
ui.onQuit( function() {
  process.exit(0);
});
ui.update( currentData );
ui.log('Ready.');
for(var i=0;i<100;i++) {
  ui.log('Something: ' + i);
}

setInterval(function() {
  var s = String( new Date() );
  ui.log( s );
}, 5000);