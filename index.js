process.env.LANG="en_US.UTF-8"
process.env.NCURSES_NO_UTF8_ACS="1"
var UI = require('./lib/dumb-ui');
var winston = require('winston');
var raspi = require('raspi-io');
var five = require('johnny-five');
var RaspiCam = require("raspicam");
var board = new five.Board({
  io: new raspi()
});

var started = new Date();
var filename = '/mnt/usb/nyanpollo-' + started.toISOString().replace(/:/g, '_');

// Data Logger
var logger = new winston.Logger({
  transports: [
    new winston.transports.File({
      json: true,
      filename: filename + '.log'
    })
  ],
  exitOnError: false
});

var camera = new RaspiCam({ 
      mode: 'video',
      output: filename + '.h264',
      t: 0
});

var ui = new UI('Nyanpollo');
ui.onQuit( function() {
  camera.stop();
  process.exit(0);
});

board.on("ready", function() {

  ui.log('Board ready.');

  var barometer = new five.Barometer({ controller: "BMP180" });
  var temperature = new five.Temperature({ controller: "BMP180" });
  var imu = new five.IMU({ controller: "MPU6050" });
  var compass = new five.Compass({ controller: "HMC5883L" });
  var button = new five.Button('GPIO25');
  var currentData = {};

  camera.start();

  button.on('down', function() {
    ui.log('button');
  });

  compass.on("data", function() {
    currentData.heading = Math.floor(this.heading);
    currentData.bearing = this.bearing.name;
  });

  barometer.on("change", function() {
    currentData.pressure = this.pressure;
    ui.update( currentData );
    ui.log('read baro data');
  });

  temperature.on("change", function(err,data) {
    currentData.temperature = data.F;
    ui.update( currentData );
    ui.log('read temperature data');
  });

  imu.on("change", function() {
    currentData.accel = {
      x: this.accelerometer.x,
      y: this.accelerometer.y,
      z: this.accelerometer.z,
      pitch: this.accelerometer.pitch,
      roll: this.accelerometer.roll,
      acceleration: this.accelerometer.acceleration,
      inclination: this.accelerometer.inclination,
      orientation: this.accelerometer.orientation
    };
    currentData.gyro = {
      x: this.gyro.x,
      y: this.gyro.y,
      z: this.gyro.z,
      pitch: this.gyro.pitch,
      roll: this.gyro.roll,
      yaw: this.gyro.yaw,
      rate: this.gyro.rate,
      isCalibrated: this.gyro.isCalibrated
    };
    ui.update( currentData );
    ui.log('read imu data');
  });

  setInterval(function() {
    logger.log('info', 'data', currentData);    
  }, 500);

});
