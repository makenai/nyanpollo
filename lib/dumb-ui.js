function UI( title ) {
}

UI.prototype = {

  setup: function() {
  },

  onQuit: function( callback ) {
    this.onQuit = callback;
  },

  update: function( currentData ) {
    console.log( currentData );
  },

  log: function( message ) {
    console.log( message );
  }

};

module.exports = UI;
