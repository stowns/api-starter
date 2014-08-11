/**
* Route definitions for v1
**/

var express    = require('express'),
    router     = express.Router(),
    v1Ctrls    = app.locals.appPath + '/v1/controllers',
    users      = require(v1Ctrls + '/users'),
    Resource   = require('express-resource-plus')(router), // jshint ignore:line
    Batch      = require('sonofabatch'),
    batch      = new Batch(app.locals.conf.server.port.http);

module.exports.build = function(rootRoute) {
  // resource() provides an array of routes.  To see them all check out https://github.com/stowns/express-resource-new
  router.resource('users', { controller : users });
  router.get(rootRoute + '/arbitrary_action', users.arbitraryAction);

  // adds support for calling all defined routes via batch https://github.com/stowns/sonofabatch
  router.post('/batch', batch.call);

  return router;
};