var blessed = require('blessed');

var logScrollBack = 1000;
var logLines = 5;

function UI( title ) {
  this.screen = blessed.screen({
    smartCSR: true,
    title: title
  });

  this.screen.key(['q', 'C-c'], function(ch, key) {
    if ( this.onQuit ) {
      this.onQuit();
    }
  }.bind(this));

  this.setup();

  this.screen.key(['j'], function(ch, key) {
    this.logDisplay.scroll( -logLines );
  }.bind(this));

  this.screen.key(['k'], function(ch, key) {
    this.logDisplay.scroll( logLines );
  }.bind(this));

  this.screen.key(['escape'], function(ch, key) {
    this.logDisplay.scroll( logScrollBack );
  }.bind(this));

  this.screen.render();
}

UI.prototype = {

  setup: function() {

    this.baro = blessed.listtable({
      parent: this.screen,
      width: '50%',
      top: 10,
      height: 5,
      border: {
        type: 'line'
      },
      align: 'right',
      style: {
        label: {
          bold: true
        }
      },
      label: ' Barometer '
    });


    this.gyro = blessed.listtable({
      parent: this.screen,
      width: '50%',
      height: 10,
      border: {
        type: 'line'
      },
      align: 'right',
      style: {
        label: {
          bold: true
        }
      },
      label: ' Gyro '
    });

    this.accel = blessed.listtable({
      parent: this.screen,
      width: '50%',
      height: 10,
      left: '50%',
      border: {
        type: 'line'
      },
      align: 'right',
      style: {
        label: {
          bold: true
        }
      },
      label: ' Accelerometer '
    });

    this.logDisplay = blessed.log({
      parent: this.screen,
      width: '100%',
      border: {
        type: 'line'
      },
      scrollback: logScrollBack,
      scrollbar: true,
      top: 15,
      height: logLines + 2,
      style: {
        label: {
          bold: true
        }
      },
      label: ' Log '
    });

    this.logDisplay.focus();


  },

  onQuit: function( callback ) {
    this.onQuit = callback;
  },

  update: function( currentData ) {

    this.baro.setData(
      extractTable( currentData, ['pressure', 'temperature'] )
    );

    this.gyro.setData(
      extractTable( currentData.gyro, ['x', 'y', 'z', 'pitch', 'roll', 'yaw', 'isCalibrated'] )
    );

    this.accel.setData(
      extractTable( currentData.accel, ['x', 'y', 'z', 'pitch', 'roll', 'acceleration', 'inclination', 'orientation'] )
    );

    this.screen.render();

  },

  log: function( message ) {
    this.logDisplay.log( message );
    this.screen.render();
  }

};

function extractTable( obj, keys ) {
  var rows = [];
  for ( var id in keys ) {
    var key = keys[ id ];
    rows.push([ key, String( obj[ key ] ) ]);
  }
  return rows;
}

function tablizeObject( obj, parent ) {
  var rows = [];
  var keys = Object.keys( obj ).sort();
  for ( var id in keys ) {
    var key = keys[ id ];
    if ( typeof obj[ key ] !== 'object' ) {
      var label = parent ? parent + '.' + key : key;
      rows.push( [ label, String(obj[ key ]) ] );
    } else {
      var nested = tablizeObject( obj[ key ], key );
      rows = rows.concat( nested );
    }
  };
  return rows;
}

module.exports = UI;