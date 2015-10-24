var SerialPort = require("serialport");
var config = require('/mnt/usb/config.json');
var child = require('child_process');
var util = require('util');

// If we don't hear from the GPS in 5 minutes, give up
setTimeout(function() {
  console.log('Timed out waiting for GPS, aborting.');
  process.exit(1);
}, 300000);

var serialport = new SerialPort.SerialPort("/dev/ttyUSB0", { 
  baudrate: 9600,
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
  flowControl: true,
  parser: SerialPort.parsers.readline("\n")
});

serialport.on('open', function(){
  console.log('Waiting for GPS signal...');
  serialport.on('data', function(data){
    var matches = data.match(/(\d{2})(\d{2})(\d{2})h/);
    if ( matches ) {
      var hh = matches[1];
      var mm = matches[2];
      var ss = matches[3];

      var dateStr = util.format('%s %s:%s:%s', config.date, hh, mm, ss);
      child.exec('date -s "' + dateStr + '"', function (error, stdout, stderr) {
        console.log( "Setting date to " + dateStr );
        if(error) {
          console.log(stderr);
          process.exit(error.code);
        }
        console.log('Success!');
        process.exit(0);
      });
    }
  });
});
