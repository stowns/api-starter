var bunyan = require('bunyan'),
    _ = require('lodash'),
    url = require('url')
    mongo = require('mongodb'),
    path = require('path'),
    MongoClient = mongo.MongoClient;

/**
 * @constructor
 */
function Logger(conf) {
  if ( !(this instanceof arguments.callee) )
    return new Logger();

  this.conf = conf;
  
  _.bindAll(this);
  
  // enabled middleware
  this.enabled = [];

  // if there is no conf return a vanilla logger
  if (!this.conf.logger) {
    this.createLogger();
    return this;
  }

  // read conf
  if(this.conf.logger.index)
    this.enabled.push('index');

  this.createLogger();

  return this;
}

/**
 * Initializes a bunyan logger
 */
Logger.prototype.createLogger = function () {
  this.log = bunyan.createLogger({ name: this.conf.app.name });
}

Logger.prototype.trace = function (message) {
  this.write('trace', message);
}

Logger.prototype.info = function (message) {
  this.write('info', message);
}

Logger.prototype.warn = function (message) {
  this.write('warn', message);
}

Logger.prototype.error = function (message) {
  this.write('error', message);
}

Logger.prototype.fatal = function (message) {
  this.write('fatal', message);
}

/**
 * Writes to the designated log
 *
 * @param {String} log-level 'info', 'warn', 'error'
 * @param {String} message to be logged
 */
Logger.prototype.write = function (level, message) {
  var _this = this;
  this.log[level](message);
  
  _.each(this.enabled, function(method) {
    _this[method](level, message);
  })
}


/**
 * Indexes a log entry
 *
 * @param {String} log-level 'info', 'warn', 'error'
 * @param {String} message to be logged
 */
Logger.prototype.index = function (level, message) {
  if (! _.contains(this.conf.logger.index.levels, level)) 
    return;

  var indexMethod = 'index' + this.conf.logger.index.type;
  this[indexMethod](level, message);
}

Logger.prototype.indexMongo = function (level, message) {
  var _this = this;

  MongoClient.connect(this.conf.store.mongo, function(err, db) {
    if (err) throw err;

    var doc = { message : message,
                created : new Date() };

    db.collection(level + '_logs').insert(doc, function(err, objects) {
      if (err) {
        _this.log.error({ error: 'failed to index to mongodb', message : message});
      }

       db.close();
    });
  });
}

exports = module.exports = Logger;