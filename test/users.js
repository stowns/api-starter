var should    = require('chai').should(),
    supertest = require('supertest'),
    app       = require('../main'),
    api       = supertest(app),
    User      = app.locals.models.v1.User,
    _         = require('lodash'),
    TestUtil  = require('./utils/testUtil');

describe('Users', function() {
  after(function (done) {
    TestUtil.clean(function(err, results) {
      if (err) throw err;
      done();
    });
  });

  it('Saves A User', function (done) {
    var body = { user : { nameFirst : 'Ben'} };

    api.post('/v1/users')
      .send(body)
      .end(function (err, res) {
        if (err) throw err;

        res.body.nameFirst.should.equal('Ben');

        done();
      });
  });

  it('Saves Another User', function (done) {
    var body = { user : { nameFirst : 'Jerry'} };

    api.post('/v1/users')
      .send(body)
      .end(function (err, res) {
        if (err) throw err;
        
        res.body.nameFirst.should.equal('Jerry');

        done();
      });
  });

  it('users#index', function(done) {
    api.get('/v1/users')
      .end(function (err, res) {
        if (err) throw err;
        res.body.should.be.a('array');
        res.body.should.have.length(2);
        done();
      });
  });

});