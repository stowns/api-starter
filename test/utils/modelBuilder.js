var _    = require('lodash'),
    inflection = require('inflection');

_.str = require('underscore.string');

function ModelBuilder(db) {
  this.db = db;

  _.bindAll(this);
}

ModelBuilder.prototype.build = function(modelName) {
  var _this = this,
      ModelClass = this.db[_.str.capitalize(modelName)],
      keys = ModelClass.rawAttributes,
      mock;

  this.digitsRegex = /\((.*?)\)/
  keys = _.omit(keys, ['createdAt', 'updatedAt', 'id']);
  mock = _.mapValues(keys, function(v) { return  _this.getType(v.toString()); });
  
  return mock;
}

ModelBuilder.prototype.getType = function(type) {
  var types = {
    'VAR' : this.getVarChar,
    'TEX' : this.getText,
    'INT' : this.getInt,
    'BIG' : this.getBigInt,
    'FLO' : this.getFloat,
    'DEC' : this.getDecimal,
    'DAT' : this.getDateTime,
    'ENU' : this.getEnum,
    'BLO' : this.getBlob,
    'TIN' : this.getTinyInt,
    'TINY' : this.getTinyBlob
  };

  if (_.str.startsWith(type, 'TINYB')) {
    return types['TINY'](type);
  } else {
    return types[type.substring(0,3)](type);
  }

}
ModelBuilder.prototype.randomString = function (length) {
    var result = '',
      chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\'"!@#$%^&*()-_+=.,;:></?[]{}\\`~|'
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    
    console.log('RANDOM STRING GENERATED');
    console.log(result);
    return result;
}

ModelBuilder.prototype.randomNumber = function (precision, scale) {
  var result;

  result = String(Math.floor(Math.random() * Math.pow(10, precision)));
  if (scale) {
    result += '.' + String(Math.floor(Math.random() * Math.pow(10, scale)));
  }
  
  return parseFloat(result);
}

ModelBuilder.prototype.getVarChar = function(type) {
  var digits;

  if (_.str.include(type, 'BINARY')) {

  } 
  else {
    digits = parseInt(type.match(this.digitsRegex)[1]);
  }

  return this.randomString(digits);
}

ModelBuilder.prototype.getText = function() {
  
}

ModelBuilder.prototype.getInt = function(type) {
  return Math.random() * 100|0;
}

ModelBuilder.prototype.getBigInt = function() {
  
}

ModelBuilder.prototype.getFloat = function(type) {
  return Math.random() * 100;
}

ModelBuilder.prototype.getDecimal = function(type) {
  var digits, result;

  digits = type.match(this.digitsRegex)[1];
  if (digits) {
    digits = digits[1].split(',');
    result = this.randomNumber(parseInt(digits[0]), parseInt(digits[1]));
  } else {
    result = this.randomNumber(4,2);
  }

  return result;
}

ModelBuilder.prototype.getDateTime = function() {
  
}

ModelBuilder.prototype.getTinyInt = function() {
  
}

ModelBuilder.prototype.getEnum = function() {
  
}

ModelBuilder.prototype.getBlob = function() {
  
}

ModelBuilder.prototype.getTinyBlob = function() {
  
}

exports = module.exports = ModelBuilder;