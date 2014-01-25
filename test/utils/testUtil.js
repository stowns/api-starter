var  _     = require('lodash'),
     async = require('async');

function TestUtil(db) {
  this.db = db;
}

TestUtil.prototype.clean = function(callback) {
  var _this = this;
  _this.db.sequelize.sync().complete(function(err) {
    if (err) {
      throw err
    } else {
      _this.db.sequelize.query("SELECT * FROM pg_catalog.pg_tables")
        .error(function (err) {
          throw err;
        })
        .success(function(data) {
          var tables = _.filter((data), function (t) { return t.schemaname == 'public'; });
          tables = _.reject((tables), function(t) { return t.tablename == 'SequelizeMeta'; });

          var funcs = _.map(tables, function (t) { 
            return function (cb) {
              _this.db.sequelize.query("DELETE FROM " + t.tablename)
                .error(function (err) {
                  cb(err, null);
                })
                .success(function (data) {
                  cb(null, data);
                });
            };
          });

          async.parallel(funcs, function (err, results) {
            callback(err, results);
          });
        });
    }
  });
}

exports = module.exports = TestUtil;