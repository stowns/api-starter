var User  = app.locals.models.v1.User,
    async = require('async');

exports.clean = function(cb) {
   var collections = [User],
      fns;

  fns = _.map(collections, function(C) {
    return function(callback) {
      C.collection.drop(function (err, results) {
        callback(err, results);
      });
    };
  });

  async.parallel(fns, function(err, results) {
    cb(err);
  });
};