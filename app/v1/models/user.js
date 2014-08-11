var mongoose    = require('mongoose'),
    ContactInfo = require('./definitions/contactInfo'),
    Schema      = mongoose.Schema;

exports = module.exports = new Schema({
  createdAt    : { type : Date, default: Date.now },
  nameFirst    : { type: String, required : true},
  nameLast     : { type: String },
  secret       : { type: String, index : true }
});

exports.pre('save', function (next) {
  var secret = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 16; i++ )
      secret += possible.charAt(Math.floor(Math.random() * possible.length));

  this.secret = secret;

  next();
});

exports.virtual('name')
  .get(function() {
    return this.nameFirst + ' ' + this.nameLast;
  });