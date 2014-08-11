var bunyan = require('bunyan'),
    _ = require('lodash'),
    MongoClient = require('mongodb').MongoClient,
    async  = require("async");
/**
 * @constructor
 */

var LEVELS = {
  'info' : 0,
  'warn' : 1,
  'error' : 2,
  'fatal' : 3
};

function Logger(conf, cb) {
  if ( !(this instanceof arguments.callee) ) { return new Logger(conf); }
    
  var _this = this;
  this.conf = conf;
  
  _.bindAll(this);
  
  // enabled middleware
  this.enabled = [];

  this.createLogger(function(err, log) {
    if (err) { console.log('Logger init() failed.  Logger disabled'); }

    return cb(_this);
  });
}

/**
 * Initializes a bunyan logger
 */
Logger.prototype.createLogger = function (callback) {
  var _this = this,
      conf  = this.conf,
      opts = { name : conf.app.name };

  if (!conf.logger.app) {
    this.log = bunyan.createLogger(opts);
    return callback(null, _this.log);
  }

  // app logger options exists, prepare the object and instantiate dependencies
  opts = _.omit(opts, 'persist');

  if (!this.conf.logger.app.persist) {
    bunyan.createLogger(opts);
    callback(null, this.log);
  } else {
    async.series([
      function(cb) {
        if (_this.conf.logger.app.persist.enabled != 'true') { return cb(null); }

        _this.enabled.push('persist');

        // Open Mongo conenction
        MongoClient.connect(_this.conf.mongoUrl, function(err, db) {
          if (err) { return cb(err); }
          _this.db = db;

          cb(null);
        });
      }
    ],
    function(err, results) {
      if (err) {
        console.log('Failed to instantiate logger db.  Db disabled');
        _this.log = bunyan.createLogger(opts);
      } else {
        _.each(results, function(r) {
          opts = _.assign(opts, r);
        });
        _this.log = bunyan.createLogger(opts);
      }

      return callback(null, _this.log);
    });
  }
};

Logger.prototype.trace = function (message, opts) {
  this.write('trace', message, opts);
};

Logger.prototype.info = function (message, opts) {
  this.write('info', message, opts);
};

Logger.prototype.warn = function (message, opts) {
  this.write('warn', message, opts);
};

Logger.prototype.error = function (message, opts) {
  this.write('error', message, opts);
};

Logger.prototype.fatal = function (message, opts) {
  this.write('fatal', message, opts);
};

Logger.prototype.child = function(args) {
  return this.log.child(args);
};

/**
 * Writes to the designated log
 *
 * @param {String} log-level 'info', 'warn', 'error'
 * @param {String} message to be logged
 */
Logger.prototype.write = function (level, message, opts) {
  var _this = this;
  this.log[level](message);
  
  _.each(this.enabled, function(method) {
    _this[method](level, message, opts);
  });
};


/**
 * Indexes a log entry
 *
 * @param {String} log-level 'info', 'warn', 'error'
 * @param {String} message to be logged
 */
Logger.prototype.persist = function (level, message, opts) {
  var collection;
  console.log(LEVELS[level] < LEVELS[this.conf.logger.app.persist.level]);
  if (LEVELS[level] < LEVELS[this.conf.logger.app.persist.level]) { return; }
    

  collection = level;
  if (opts && opts.collection) { collection = opts.collection; }
    
  // commented out support for multiple db drivers in the future
  //var indexMethod = 'index' + this.conf.logger.index.type;
  //this[indexMethod](level, message);
  this.indexMongo(collection, message);
};

Logger.prototype.indexMongo = function (collection, message) {
  var doc = { message : message,
              created : new Date() },
      _this = this;

  this.db.collection(collection + '_logs').insert(doc, function(err, objects) {
    if (err) {
      _this.log.error({ error: 'failed to save to mongodb', message : message});
    }

  });
};

Logger.prototype.db = function() {
  return this.db;
};

exports = module.exports = Logger;