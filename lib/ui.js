var blessed = require('blessed');

var logScrollBack = 1000;
var logLines = 3;

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
      height: 4,
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

    this.compass = blessed.listtable({
      parent: this.screen,
      width: '50%',
      top: 12,
      left: '50%',
      height: 4,
      border: {
        type: 'line'
      },
      align: 'right',
      style: {
        label: {
          bold: true
        }
      },
      label: ' Compass '
    });



    this.gyro = blessed.listtable({
      parent: this.screen,
      width: '50%',
      left: '50%',
      height: 12,
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
      top: 16,
      height: logLines + 2,
      style: {
        label: {
          bold: true
        }
      },
      label: ' Log '
    });

/*
    this.nyan = blessed.box({
      parent: this.screen,
      width: '50%',
      left: '50%',
      tags: true,
      top: 10,
      height: 5,
      content:
        "{red-fg}-_-_-_-_-_-_-_-_-_-_{/red-fg},------,  .   o    +\n" +
        "{yellow-fg}_-_-_-_-_-_-_-_-_-_-{/yellow-fg}|   /\\_/\\\n" +
        "{green-fg}-_-_-_-_-_-_-_-_-_-~{/green-fg}|__( ^ .^)  +     +\n" +
        "{blue-fg}_-_-_-_-_-_-_-_-_-_-{/blue-fg}\"\"  \"\"    .   o\n"
    });
*/

    this.logDisplay.focus();


  },

  onQuit: function( callback ) {
    this.onQuit = callback;
  },

  update: function( currentData ) {

    this.baro.setData(
      extractTable( currentData, ['pressure', 'temperature'] )
    );

    this.compass.setData(
      extractTable( currentData, ['heading', 'bearing'] )
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
    var date = new Date().toISOString();
    this.logDisplay.log( date + ': ' + message );
    this.screen.render();
  }

};

function extractTable( obj, keys ) {
  var rows = [];
  for ( var id in keys ) {
    var key = keys[ id ];
    if ( typeof obj[ key ] == 'object' ) {
      rows = rows.concat( tablizeObject( obj[ key ], key ) );
    } else {
      rows.push([ key, String( obj[ key ] ) ]);
    }
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
