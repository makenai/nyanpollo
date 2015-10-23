(function() {
  var EventEmitter, _, i2c, tick, wire,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore');

  wire = require('../build/Release/i2c');

  EventEmitter = require('events').EventEmitter;

  tick = setImmediate || process.nextTick;

  i2c = (function(superClass) {
    extend(i2c, superClass);

    i2c.prototype.history = [];

    function i2c(address1, options) {
      this.address = address1;
      this.options = options != null ? options : {};
      _.defaults(this.options, {
        debug: false,
        device: "/dev/i2c-1"
      });
      if (this.options.debug) {
        require('repl').start({
          prompt: "i2c > "
        }).context.wire = this;
        process.stdin.emit('data', '');
      }
      process.on('exit', (function(_this) {
        return function() {
          return _this.close();
        };
      })(this));
      this.on('data', (function(_this) {
        return function(data) {
          return _this.history.push(data);
        };
      })(this));
      this.on('error', function(err) {
        return console.log("Error: " + error);
      });
      this.open(this.options.device, (function(_this) {
        return function(err) {
          if (!err) {
            return _this.setAddress(_this.address);
          }
        };
      })(this));
    }

    i2c.prototype.scan = function(callback) {
      return wire.scan(function(err, data) {
        return tick(function() {
          return callback(err, _.filter(data, function(num) {
            return num >= 0;
          }));
        });
      });
    };

    i2c.prototype.setAddress = function(address) {
      wire.setAddress(address);
      return this.address = address;
    };

    i2c.prototype.open = function(device, callback) {
      return wire.open(device, function(err) {
        return tick(function() {
          return callback(err);
        });
      });
    };

    i2c.prototype.close = function() {
      return wire.close();
    };

    i2c.prototype.write = function(buf, callback) {
      this.setAddress(this.address);
      if (!Buffer.isBuffer(buf)) {
        buf = new Buffer(buf);
      }
      return wire.write(buf, function(err) {
        return tick(function() {
          return callback(err);
        });
      });
    };

    i2c.prototype.writeByte = function(byte, callback) {
      this.setAddress(this.address);
      return wire.writeByte(byte, function(err) {
        return tick(function() {
          return callback(err);
        });
      });
    };

    i2c.prototype.writeBytes = function(cmd, buf, callback) {
      this.setAddress(this.address);
      if (!Buffer.isBuffer(buf)) {
        buf = new Buffer(buf);
      }
      return wire.writeBlock(cmd, buf, function(err) {
        return tick(function() {
          return callback(err);
        });
      });
    };

    i2c.prototype.read = function(len, callback) {
      this.setAddress(this.address);
      return wire.read(len, function(err, data) {
        return tick(function() {
          return callback(err, data);
        });
      });
    };

    i2c.prototype.readByte = function(callback) {
      this.setAddress(this.address);
      return wire.readByte(function(err, data) {
        return tick(function() {
          return callback(err, data);
        });
      });
    };

    i2c.prototype.readBytes = function(cmd, len, callback) {
      this.setAddress(this.address);
      return wire.readBlock(cmd, len, null, function(err, actualBuffer) {
        return tick(function() {
          return callback(err, actualBuffer);
        });
      });
    };

    i2c.prototype.stream = function(cmd, len, delay) {
      if (delay == null) {
        delay = 100;
      }
      this.setAddress(this.address);
      return wire.readBlock(cmd, len, delay, (function(_this) {
        return function(err, data) {
          if (err) {
            return _this.emit('error', err);
          } else {
            return _this.emit('data', {
              address: _this.address,
              data: data,
              cmd: cmd,
              length: len,
              timestamp: Date.now()
            });
          }
        };
      })(this));
    };

    return i2c;

  })(EventEmitter);

  module.exports = i2c;

}).call(this);
