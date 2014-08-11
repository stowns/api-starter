/*
* v1 Users Controller
*/
var User       = app.locals.models.v1.User,
    log        = app.locals.logger,
    controller = {},
    opts,
    before;


/* beforeAction definitions */
before = {
  logParams : function(req, res, next) {
    if (process.env.NODE_ENV !== 'test') {
      log.info('PARAMS:');
      log.info(req.params);
    }

    next();
  }, 
  exampleMiddleware : function(req, res, next) {
    if (process.env.NODE_ENV !== 'test') {
      log.info('example middleware!');
    }

    next();
  }
};

opts = {
  before: { // Middleware support
    all: before.logParams,
    index: [before.exampleMiddleware],
    destroy: [before.exampleMiddleware]
  }
};

/* instantiation. */
controller.options = opts;

controller.index = function(req, res) {
  User.find(function(err, users) {
    res.send(err || users);
  });
};
controller.new = function(req, res) {
  res.send('new');
};
controller.create = function(req, res) {
  var user;

  user = new User(req.body.user);

  user.save(function(err, user) {
    console.log(err || user);
    res.send(err || user);
  });
};
controller.show = function(req, res) {
  res.send('show');
};
controller.edit = function(req, res) {
  res.send('edit');
};
controller.update = function(req, res) {
  res.send('udpate');
};
controller.destroy = function(req, res) {
  res.send('destroy');
};
controller.query = function(req, res) {
  res.send('query');
};
controller.arbitraryAction = function(req, res) {
  res.send('ararbitraryAction');
};

exports = module.exports = controller;