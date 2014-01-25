/**
* Route definitions for v1
**/

var v1Ctrls = app.locals.appPath + '/app/v1/controllers',
    users   = require(v1Ctrls + '/users');

module.exports.init = function(rootRoute) {
  // resource() provides an array of routes.  To see them all check out https://github.com/stowns/express-resource-new
  app.resource('accounts', {version : 'v1'});

  app.resource('users', { version : 'v1' }, function(){
    this.resource('accounts', {version : 'v1'});
  });

  app.get(rootRoute + '/arbitrary_action', users.arbitraryAction);
};