/**
 * ResourceController
 *
 * Provides index, show, new, create, edit, update, destroy, query and describe actions for Sequelize Models.
 *
 */

var _    = require('lodash'),
    inflection = require('inflection'),
    SqlString = require('../node_modules/sequelize/lib/sql-string');

_.str = require('underscore.string');

/**
 * Creates an instance of ResourceController.
 *
 * @constructor
 * @this {ResourceController}
 * @param {string} modelName the model to bind actions to. ie) 'user'
 * @param {Object} options for the controller actions
 */
function ResourceController(modelName, opts) {
  var db = app.locals.db;
  this.db = db;
  this.options = opts;
  this.modelName = modelName; // user
  this.modelNamePlural = inflection.pluralize(this.modelName); // users
  this.ModelClass = db[_.str.capitalize(this.modelName)]; // User
  this.modelGetter = 'get' + _.str.capitalize(this.modelName); // getUser
  this.modelGetterPlural = inflection.pluralize(this.modelGetter); // getUsers
  this.modelSetter = 'set' + _.str.capitalize(this.modelName);
  this.modelSetterPlural = inflection.pluralize(this.modelSetter);
  this.log = new app.locals.Logger(app.locals.conf);
  this.dialect = 'postgres';

  var scopeCheck = function(req, res, next) {
    db.getScope(modelName, req.params, function (err, scope) {
      if (err) return res.send('error retrieving scope');
      req.scope = scope;
      next();
    });
  };
  
  // TODO: revisit this monstrosity
  // Ensures that the scopeCheck is appended to the all before_action in the options object
  if (this.options) {
    if (this.options.before) {
      if (this.options.before && this.options.before.all) { // options.before.all exists
        if (_.isArray(this.options.before.all)) {           // options.before.all is an Array, prepend it
          this.options.before.all.unshift(scopeCheck);
        } 
        else {                                            // options.before.all is an Object, convert to an Array and prepend.
          this.options.before.all = [scopeCheck, this.options.before.all];
        }
      } 
    }
    else {                                                  // there are options just nothing for 'before'
      this.options.before = { all : scopeCheck };
    }
  } 
  else {                                                    // opts weren't passed at all, create them.
    this.options = { before : { all : scopeCheck } };     
  }
  
  // maintains 'this' context throughout the class
  _.bindAll(this);
}

ResourceController.prototype.index = function(req, res) {
  var _this = this,
      params = req.body,
      where;

  where = _.isEmpty(params.where) ? {} : { where : params.where };

  if (req.scope) {
    if (req.scope[_this.modelGetterPlural]) {
      req.scope[_this.modelGetterPlural](where)
        .error(function (err) { _this.sendErr(res, 'index', err); })
        .success(function(result) {
          if (result.length === 1)
            return res.send(result[0]);
          return res.send(result);
        });
    }
    else if (req.scope[_this.modelGetter]) {
      req.scope[_this.modelGetter](where)
        .error(function (err) { _this.sendErr(res, 'index', err); })
        .success(function (result) {
          if (result.length === 1)
            return res.send(result[0]);
          return res.send(result);
        });
    }
    else {
      res.send({ error : 'There is no relationship defined for ' + req.scope.name + ' -> ' + this.modelName});
    }
  } 
  else {
    _this.ModelClass.findAll(where)
      .error(function (err) { _this.sendErr(res, 'index', err); })
      .success(function (result, created) {
        if (result.length === 1)
            return res.send(result[0]);
        res.send(result);
      });
    }
};

ResourceController.prototype.show = function(req, res) {
  var _this = this,
      params = req.body,
      idParam = req.params[_this.modelName];
  if (req.scope) {
    if (req.scope[_this.modelGetterPlural]) {  // if model is a member of a collection on the scope (hasMany)
      req.scope[_this.modelGetterPlural]({ where : { id : idParam }})
        .error(function (err) { _this.sendErr(res, 'show', err); })
        .success(function (result) { // the account requested
          res.send(result);
        }); 
    }
    else if (req.scope[_this.modelGetter]) {
      req.scope[_this.modelGetter](idParam)
        .error(function (err) { _this.sendErr(res, 'show', err); })
        .success(function(result) {
          return res.send(result);
        });
    }
    else {
      _this.sendErr(res, 'show', 'There is no relationship defined for ' + req.scope.name + ' -> ' + _this.modelName);
    }
  } 
  else {
    _this.ModelClass.find(idParam)
      .error(function (err) { _this.sendErr(res, 'show', err); })
      .success(function (result, created) {
        res.send(result);
      });
  }
};

ResourceController.prototype.new = function(req, res) {
  res.send(this.db.fresh(this.ModelClass));
};

ResourceController.prototype.create = function(req, res) {
  var action = 'create',
      params = req.body,
      modelParam = params[this.modelName]; // { theModelName : { attr : value }}
      _this = this;

  if (_.isEmpty(modelParam)) return _this.sendErr(res, action, 'no ' + this.modelName + ' parameter supplied');

  if (req.scope) {
    if (req.scope[this.modelSetterPlural]) { // if model is a member of a collection on the scope (hasMany)
      // retrieve the scope's collection and add to it
      req.scope[_this.modelGetterPlural]()
        .error(function (err) { _this.sendErr(res, action, err); })
        .success(function(collection) {
          // create the new sub document
          _this.ModelClass.create(modelParam)
            .error(function (err) { _this.sendErr(res, action, err); })
            .success(function(result, createdAt) {
              // add it to the parent collection
              collection.push(result);
              req.scope[_this.modelSetterPlural](collection)
                .error(function (err) { _this.sendErr(res, action, err); })
                .success(function() {
                  res.send({ status : 'Success'});
                });
            });
        });
    }
    else if (req.scope[this.modelSetter]) { // if this model belongs to the scope (hasOne)
      req.scope[this.modelSetter](modelParam)
        .error(function (err) { _this.sendErr(res, 'create', err); })
        .success(function(result, created) {
          return res.send(result);
        });
    }
    else {
      res.send({ error : 'There is no relationship defined for ' + req.scope.name + ' -> ' + this.modelName});
    }
  } 
  else {
    _this.ModelClass.create(modelParam)
      .error(function(err) {
        res.send(err);
      })
      .success(function (result, created) {
        res.send(result);
      });
  }
};

ResourceController.prototype.edit = function(req, res) {
  res.send('edit is not supported');
};

ResourceController.prototype.update = function(req, res) {
  var action = 'update',
      _this = this,
      params = req.body,
      idParam = req.params[this.modelName],
      where;

  if (idParam && !isInt(idParam))
    return _this.sendErr(res, 'update', 'A non-integer value was supplied for ' + this.modelName + 'Id');

  where = _.isEmpty(params.where) ? { id : idParam } : params.where;

  if (req.scope) {
    if (req.scope[this.modelGetterPlural]) { // oh no...
      // *DISCLAIMER* my sql is a joke.
      // sequelize doesn't have a great way of updating multiple rows of a hasMany relationship
      // in one shot.  We'll have to roll our own.
      // We will end up w/ a query that potentially looks like:
      // UPDATE accounts SET "name"='demo account',"desc"='a big account'  
      //  WHERE id IN (SELECT "accountId" FROM accountsusers WHERE "userId" = 1) 
      //  AND "name"='chill'
      
      var setKeys =  _.keys(params.update);  // ['key', 'key2', 'key3']
      var setString = '';
      var setArray  = _.map(setKeys, function(key) { // [ '"name"=\'Bob\'','"age=16"', '"desc"=\'A user\'' ]
          var value = params.update[key];
          value = _.isNumber(params.update[key]) ? value : SqlString.escape(value, null, null, _this.dialect);
          return "\"" + key + "\"=" + value;
        });

      if (setArray.length > 1) {
          // "name"='Bob',"age=16"
          setString += setArray.shift();
          _.each(setArray, function(setter) { setString += (',' + setter); });

        } else {
          // "name"='Bob'
          setString = setArray[0];
        }
     

      // :/ this gets us the relational piece of the update query
      var query = 'UPDATE ' + this.modelNamePlural + ' SET ' + setString +
            ' WHERE id IN (SELECT "' + this.modelName + 'Id"' +
            ' FROM ' + this.modelNamePlural + inflection.pluralize(req.scope.daoFactory.name) +
            ' WHERE "' + req.scope.daoFactory.name + 'Id" = ' + req.scope.id + ')';
          
      
      if (_.isEmpty(params.where)) {
        // just match the id of the model requested
        query += " AND id=" + idParam;
      } else {
        // or append any 'where' requirements
        var whereKeys = _.keys(params.where);
        var whereQuery = "";
        _.each(whereKeys, function(key) { 
                            var val = params.where[key];
                            if (_.isNumber(val)) {
                              whereQuery += " AND \"" + key + "\"=" + val + "";
                            } else {
                              whereQuery += " AND \"" + key + "\"=" + SqlString.escape(val, null, null, _this.dialect) + "";
                            }
                          });
        query += whereQuery;
      }
      _this.db.sequelize.query(query)
        .error(function (err) { _this.sendErr(res, action, err); })
        .success(function () {
          res.send({ status : 'success' });
        });
    } else if (req.scope[this.modelGetter]) {              // getModel(where)
      req.scope[this.modelGetter]({ where : where })
        .error(function (err) { _this.sendErr(res, action, err); })
        .success(function (result) {
          result.updateAttributes(params.update)
            .error(function (err) { _this.sendErr(res, action, err); })
            .success(function () {
              res.send({ status : 'success'});             // return success
            });
        });
    } else {
      return _this.sendErr(res, action, 'There is no relationship defined for ' + req.scope.name + ' -> ' + _this.modelName);
    }
  } else {
    this.ModelClass.update(params.update, where)
      .error(function (err) { _this.sendErr(res, action, err); })
      .success(function () {
        res.send({ status : 'success'});
      });
  }
};

ResourceController.prototype.destroy = function(req, res) {
  var _this = this,
      params = req.body,
      idParam = req.params[this.modelName],
      where;
  
  where = _.isEmpty(params.where) ? { id : idParam } : params.where;

  if (req.scope) {
    if (req.scope[_this.modelGetterPlural]) { // hasMany
      req.scope[_this.modelGetterPlural]()
        .error(function (err) { _this.sendErr(res, 'destroy', err); })
        .success(function (data) {
          // reject the objects that meet the where criteria from the returned collection
          var whereKeys = _.values(where);
          var col = _.reject(data, function(entry) { 
              _.each(whereKeys, function(wK) {
                if (entry[wK]) {
                  return entry[wK] == where[wK] ? true : false;
                } 
                else {
                  return false;
                }
              });
            });

          req.scope[_this.modelSetterPlural](col)
            .error(function (err) { _this.sendErr(res, 'destroy', err); })
            .success(function () {
              res.send({ status : 'success' });
            });
        });
    }
  }
  _this.ModelClass.destroy(where)
    .error(function (err) { _this.sendErr(res, 'destroy', err); })
    .success(function () {
      res.send({ status : 'success'} );
    });
};

ResourceController.prototype.query = function(req, res) {
  this.index(req, res);
};

ResourceController.prototype.describe = function(req, res) {
  var data = this.db.describe(this.ModelClass);

  if (data === null) {
    data = { error : 'This model does not exist' };
  }

  res.setHeader('Sequelize-Admin', JSON.stringify(data));
  res.end();
};

ResourceController.prototype.getLogger = function () {
  return this.log;
};

function isInt(arg) {
  var intRegex = /^\d+$/;
  
  return intRegex.test(arg);
}

ResourceController.prototype.sendErr = function (res, action, msg) {
  var err = {
    action : action,
    error : msg
  };

  this.log.error(err);
  res.send(err);
};

exports = module.exports = ResourceController;