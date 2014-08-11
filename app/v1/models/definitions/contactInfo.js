var MailingAddress = require('./mailingAddress');

exports = module.exports = {
  mailingAddress   : MailingAddress,
  phone            : { type : String },
  email            : { type : String }
};