var EventEmitter = require('events').EventEmitter;
var App = require('strong-runner').App;
var assert = require('assert');
var bl = require('bl');
var debug = require('debug')('strong-pm:run');
var util = require('util');
var _ = require('lodash');

module.exports = exports = function App() {
  var app = new App(...);

  //this.restartCount = 0; // XXX(sam) do this here?
  app.appLog = bl();
  app._logGcTimer = setInterval(
    app._gcLogs.bind(app),
    exports.LOG_GC_INTERVAL_MS
  );
  app._logGcTimer.unref();

  app.stdout.pipe(app.appLog, {end: false});
  app.stderr.pipe(app.appLog, {end: false});

  app._gcLogs = _gcLogs;
}


// this is a soft limit that is only checked/enforced once per LOG_GC interval
exports.MAX_LOG_RETENTION_BYTES = 1 * 1024 * 1024;
exports.LOG_GC_INTERVAL_MS = 30 * 1000;

function _gcLogs() {
  var overflow = this.appLog.length - exports.MAX_LOG_RETENTION_BYTES;
  if (overflow > 0) {
    this.appLog.consume(overflow);
  }
  /* FIXME
  if (this !== current) {
    // we've been orphaned, so let's "GC" ourself
    this.appLog.destroy();
    clearInterval(this._logGcTimer);
  }
  */
};

Runner.prototype.readableLogSnapshot = function() {
  return this.appLog.duplicate();
};

Runner.prototype.flushLogs = function() {
  this.appLog.consume(this.appLog.length);
};
