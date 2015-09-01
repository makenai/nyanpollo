var winston = require('winston');
var raspi = require('raspi-io');
var five = require('johnny-five');
var board = new five.Board({
  io: new raspi()
});

// Data Logger
var logger = new winston.Logger({
  transports: [
    new winston.transports.File({
      json: true,
      filename: 'nyanpollo.log'
    }),
    new winston.transports.Console()
  ],
  exitOnError: false
});


board.on("ready", function() {

  var barometer = new five.Barometer({ controller: "BMP180" });
  var temperature = new five.Temperature({ controller: "BMP180" });
  var imu = new five.IMU({ controller: "MPU6050" });
  var currentData = {};

  barometer.on("change", function() {
    currentData.pressure = this.pressure;
  });

  temperature.on("change", function(err,data) {
    currentData.temperature = data.F;
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
  });

  setInterval(function() {
    logger.log('info', 'data', currentData);    
  }, 500);

});
