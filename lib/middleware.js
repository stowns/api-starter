var _ = require('lodash'),
    conf = app.locals.conf,
    middleware = {};

// cross-site support
middleware.cors = function(req, res, next) {
  if (_.contains(conf.server.allowDomains, req.headers.origin)) {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Credentials", "true");
  }

  next();
};

// precedence = ?id -> { "id" : "id"}
middleware.mergeParams = function(req, res, next) {
  req.body = _.assign(req.body, req.query);

  next();
};


exports = module.exports = middleware;