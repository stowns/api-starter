module.exports = function(conf) {
  var Sequelize = require('sequelize'),
      _         = require('lodash'),
      fs        = require('fs'),
      sequelize = null,
      describe,
      getScope,
      db;
  
  _.str = require('underscore.string');

  sequelize = new Sequelize(conf.postgres.database, conf.postgres.uname, conf.postgres.pass, {
    dialect  : 'postgres',
    protocol : 'postgres',
    port     : conf.postgres.port,
    host     : conf.postgres.host,
    logging  : conf.logger.sequelize
  });
  
  /**
   * Retrieves an object that describes the Schema of the model.
   *
   * @param {String} ModelClass A capitalized string representing the Class of the model.
   * @return {Object} an object including the keys of the requested model w/
   *   values describing their datatypes. ie) { 'username' : 'VARCHAR(255)' }
   */
  describe = function (ModelClass) {
    var keys = ModelClass.rawAttributes;
    keys = _.omit(keys, ['createdAt', 'updatedAt', 'id']);
    return _.mapValues(keys, function(v) { return  v.toString(); });
  };

  /**
   * Retrieves an object representing an empty model.  Used with the 'new' action
   *
   * @param {String} ModelClass A capitalized string representing the Class of the model.
   * @return {Object} an object including the keys of the requested model w/ empty values.
   */
  fresh = function (ModelClass) {
    var keys = ModelClass.rawAttributes;
    keys = _.omit(keys, ['createdAt', 'updatedAt', 'id']);
    return _.mapValues(keys, function(v) { return  ''; });
  };

  /**
   * Determines if the current query is for a nested model
   *
   * @param {String} modelName name of the model in question
   * @param {Object} params the req.params object as supplied by Connect Middleware
   * @param {Function} (err, instance) calling cb(null, null) is equivalent to saying 'this is not
   *  a nested query'
   */
  getScope = function (modelName, params, cb) {
    var ScopeClass, scopeName, models, paramKeys;

    // build an array of all the model names available - the model name in question
    possibleScopes = _.reject(db.modelNames, function(m) { return m === modelName});
    // parse the passed param names (keys)
    paramKeys = _.keys(params);
    // find the scopeName ie) GET /users/:user/accounts : scopeName=user
    scopeName = _.intersection(paramKeys, possibleScopes)[0];

    // return if there was no scope name found
    if (!scopeName) return cb(null, null);

    // get the ScopeClass from the db object
    ScopeClass = app.locals.db[_.str.capitalize(scopeName)];

    // find by the scopes id ie) params = { user : 123 }
    ScopeClass.find(params[scopeName]) 
      .error(function(err) {
        cb(err, null);
      })
      .success(function(scopeInstance) {
        cb(null, scopeInstance);
      });
  };

  db = {
    Sequelize: Sequelize,
    sequelize: sequelize,
    modelNames: [],

    describe: describe,
    getScope: getScope,
    fresh:    fresh,
  };

  // include all the models and keep a record of what models are available
  // THIS IS WHERE modeNames is populated.  modelNames is used for autoloading
  // req.scope in controllers.
  fs.readdirSync(__dirname).forEach(function (filename) {
    if (filename === 'index.js') return;
    var modelName = filename.replace(/\.js$/, '');
    var modelNameCap = _.str.capitalize(modelName);
    db[modelNameCap] =  sequelize.import(__dirname + '/' + modelName);
    db.modelNames.push(modelName);
  });

  /*
    Associations can be defined here. E.g. like this:
    global.db.User.hasMany(global.db.SomethingElse)
  */
  db.User.hasMany(db.Account);
  db.Account.hasMany(db.User);

  return db;
}