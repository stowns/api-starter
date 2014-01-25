process.env.NODE_ENV = 'test'

var should    = require('chai').should(),
    supertest = require('supertest'),
    app       = require('../main'),
    api       = supertest(app),
    db        = app.locals.db,
    User      = db.User,
    _         = require('lodash'),
    ModelBuilder = require('./utils/modelBuilder'),
    mb = new ModelBuilder(db);

// tests fields for the safety of all character
var randomString = function () {
    var result = '',
      length = 5,
      chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\'"!@#$%^&*()-_+=.,;:></?[]{}\\`~|'
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result + chars;
}

describe('The AccountsController works', function() {
  before(function (done) {
    db.sequelize.sync().complete(function(err) {
      if (err) {
        throw err
      } else {
        db.sequelize.query("DELETE FROM accounts")
          .error(function (err) {
            throw err;
          })
          .success(function(data) {
            done();
          });
      }
    });
  });

  it('accounts#create account that belongs to no one', function (done) {
    var account = mb.build('account'),
     keys = _.keys(account);
    api.post('/v1/accounts')
      .send({ account : account })
      .end(function (err, res) {
        if (err) throw err;
        _.each(keys, function(k) {
          res.body[k].should.equal(account[k]);
        });
        done();
      });
  });


});