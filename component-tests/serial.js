var SerialPort = require("serialport");

var serialport = new SerialPort.SerialPort("/dev/ttyUSB0", { 
  baudrate: 9600,
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
  flowControl: true,
  parser: SerialPort.parsers.readline("\n")
});
serialport.on('open', function(){
  console.log('Serial Port Opend');
  serialport.on('data', function(data){
    console.log( data );
//    console.log( data.toString() );
  });
});
