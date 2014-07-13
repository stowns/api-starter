var should    = require('chai').should(),
    supertest = require('supertest'),
    app       = require('../main'),
    api       = supertest(app),
    db        = app.locals.db,
    User      = db.User,
    _         = require('lodash'),
    ModelBuilder = require('./utils/modelBuilder'),
    mb = new ModelBuilder(db),
    TestUtil = require('./utils/testUtil'),
    testUtil = new TestUtil(db);

describe('Users', function() {
  before(function (done) {
    testUtil.clean(function(err, results) {
      if (err) throw err;
      done();
    });
  });

  it('Saves A User', function (done) {
    var user = mb.build('user'),
     keys = _.keys(user);
    console.log('USER');
    console.log(user);
    api.post('/v1/users')
      .send({ user : user })
      .end(function (err, res) {
        if (err) throw err;
          console.log('RESPONSE');
          console.log(res);
        _.each(keys, function(k) {
          res.body[k].should.equal(user[k]);
        });
        done();
      });
  });

  it('Saves Another User', function (done) {
    var user = mb.build('user'),
     keys = _.keys(user);
    api.post('/v1/users')
      .send({ user : user })
      .end(function (err, res) {
        if (err) throw err;
        _.each(keys, function(k) {
          res.body[k].should.equal(user[k]);
        });
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

  it('users#show', function(done) {
    api.get('/v1/users')
      .end(function (err, res) {
        if (err) throw err;
        var user = res.body[0];
        api.get('/v1/users/' + user.id)
          .end(function (err, res) {
            res.body.username.should.equal(user.username);
            done();
          });
      });
  });

  it('users#update', function(done) {
    api.get('/v1/users')
      .end(function (err, res) {
        if (err) throw err;
        var user = res.body[0];
        api.put('/v1/users/' + user.id)
          .send({ update : { username : 'Socrates' }})
          .end(function (err, res) {
            if (err) throw err;
            res.body.status.should.equal('success');
            api.get('/v1/users/' + user.id)
              .end(function (err, res) {
                res.body.username.should.equal('Socrates');
                done();
              });
          });
      });
  });

  it('users#destroy', function(done) {
    api.get('/v1/users')
      .end(function (err, res) {
        if (err) throw err;
        var user = res.body[0];
        var length = res.body.length;
        api.del('/v1/users/' + user.id)
          .end(function (err, res) {
            if (err) throw err;
            res.body.status.should.equal('success');
            api.get('/v1/users')
              .end(function (err, res) {
                if (err) throw err;
                res.body.should.be.a('object');
                done();
              });
          });
      });
  });

  it('users#query', function (done) {
    var user = mb.build('user');
    api.post('/v1/users')
      .send({ user : user })
      .end(function (err, res) {
        if (err) throw err;
        api.post('/v1/users')
          .send({ user : user })
          .end(function (err, res) {
            if (err) throw err;
            api.post('/v1/users/query')
              .send({ where : { username : user.username } })
              .end(function (err, res) {
                if (err) throw err;
                console.log('LENGTH');
                console.log(res.body);
                res.body.length.should.equal(2);
                res.body[1].username.should.equal(user.username);
                done();
              });
          });
      });
  });

});


describe('User Associations', function() {
  before(function (done) {
    db.sequelize.sync().complete(function(err) {
      if (err) { 
        throw err 
      }
      else {
        db.sequelize.query("DELETE FROM users")
          .error(function (err) { throw err; })
          .success(function(data) {
            db.sequelize.query("DELETE FROM accounts")
              .error(function (err) { throw err; })
              .success(function (data) {
                db.sequelize.query("DELETE FROM accountsusers")
                  .error(function (err) { throw err; })
                  .success(function (data) {
                    done();
                  });
              });
          });
      }
    });
  });

  it('hasMany accounts#index', function (done) {
    api.post('/v1/users')
      .send({ user : { username : 'Ted'} })
      .end(function (err, res) {
        if (err) throw err;
        res.body.should.be.a('object');
        res.body.username.should.equal('Ted');
        var userId = res.body.id;

        api.post('/v1/accounts')
          .send({ account : { name : 'account that belongs to no one' } })
          .end(function (err, res) {
            if (err) throw err;
            api.post('/v1/users/' + userId + '/accounts')
              .send({ account : { name : 'account that belongs to Ted' }})
              .end(function (err, res) {
                if (err) throw err;
                api.post('/v1/users/' + userId + '/accounts')
                  .send({ account : { name : 'account that belongs to Ted' }})
                  .end(function (err, res) {
                    if (err) throw err;
                    api.get('/v1/users/' + userId + '/accounts')
                      .end(function (err, res) {
                        if (err) throw err;
                        res.body.should.be.a('array');
                        res.body.length.should.equal(2);
                        done();
                      });
                  });
              });
          });
      });
    });

  it('hashMany accounts#update', function (done) {
    api.post('/v1/users/query')
      .send({ where : { username : 'Ted' } })
      .end(function (err, res) {
        if (err) throw err;
        var ted = res.body;
        ted.should.be.a('object');
        ted.username.should.equal('Ted');
        api.put('/v1/users/' + ted.id + '/accounts')
          .send({ where : {
                    name : 'account that belongs to Ted'
                  },
                  update : {
                    name : 'updated account that belongs to Ted'
                  }
          })
          .end(function (err, res) {
            if (err) throw err;
            api.post('/v1/users/' + ted.id + '/accounts/query')
              .send({ where : { name : 'updated account that belongs to Ted' }})
              .end(function (err, res) {
                if (err) throw err;
                res.body.length.should.equal(2);
                res.body[0].name.should.equal('updated account that belongs to Ted');
                res.body[1].name.should.equal('updated account that belongs to Ted');
                done();
              });
          });
      });
  });
  
});