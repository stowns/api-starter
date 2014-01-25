/*
* v1 Users Controller
*/
var ResourceController = require(app.locals.appPath + '/lib/sequelizeResourceController'),
    middleware = require(app.locals.appPath + '/lib/middleware'),
    controller,
    log,
    opts;


/* beforeAction definitions */
var before = {
  logParams : function(req, res, next) {
    log.info('PARAMS:');
    log.info(req.params);

    next();
  }
};

opts = {
  before: { // Middleware support
    //all: before.logParams,
    index: [middleware.authRole('admin')],
    destroy: [middleware.authRole('admin')],
    query: [middleware.authRole('admin')]
  }
};

/* instantiation. */
controller = new ResourceController('user', opts);
log = controller.getLogger();

/* custom actions */
// you can add any action you like to the controller
controller.arbitraryAction = function (req, res) {
  res.send('arbitrary action!');
};

// you can also override actions established by the ResourceController
// controller.new = function (req, res) {
//  res.send('custom new action!');
// };

exports = module.exports = controller;