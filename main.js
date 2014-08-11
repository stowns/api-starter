/**
 * api
 *
 * @author Simon Townsend <stownsend@unifiedsocial.com>
 */

var conf           = require('./conf'),
    express        = require('express'),
    main           = express(),
    async          = require('async'),
    http           = require('http'),
    Cluster        = require('./lib/cluster'),
    Logger         = require('./lib/logger'),
    bodyParser     = require('body-parser')(),
    methodOverride = require('method-override')(),
    favicon        = require('static-favicon')(),
    compress       = require('compression')(),
    expressLogger  = require('morgan'),
    mongoose       = require('mongoose'),
    versions;

versions = {'Version 1': '/v1'};

// connect the database
mongoose.connect(conf.mongoUrl);

/* Globals */
// all globals exposed via the express.locals api
global.app          = main;
app.locals.conf     = conf;
app.locals.rootPath = __dirname;
app.locals.appPath  = app.locals.rootPath + '/app';
app.locals.servers  = [];
app.locals.models   = {};
app.locals.mongoose = mongoose;


// attach models
for (var k in versions) {
  var versionDir = app.locals.appPath + versions[k] + '/models',
      version    = versions[k].substring(1);

  app.locals.models[version] = require(versionDir);
}

/* misc */
function isProduction() {
  return 'production' == conf.app.env;
}

function isTest() {
  return 'test' == conf.app.env;
}

function isDevelopment() {
  return 'development' == conf.app.env;
}

function isStaging() {
  return 'staging' == conf.app.env;
}

function handleErrors() {
  process.on('uncaughtException', function ( err ) {
    console.log(err);
     // console.error('An uncaughtException was found, the program will end.');
      //app.locals.logger.error({ err : { message : err.message, stack : console.trace() }},
      //                        { collection : 'uncaught_error'});
      //process.exit(1);
  });
}

function startServer() {
  handleErrors();

  app.locals.servers.push(http.createServer(app).listen(conf.server.port.http, function(){
    console.log('Express server listening on port ' + conf.server.port.http);
  }));
}

function startCluster() {
  new Cluster()
      .worker(function () {
        startServer();
      });
}

function StartupException(message) {
   this.message = message;
   this.name = "Startup";
}

function initServer() {
  /* Configuration */
  if (isTest()) {
  }
  if (isDevelopment()) {
  }
  if (isStaging()) {
  }
  if (isProduction()) {
  }

  /* Dependencies */
  var middleware = require('./lib/middleware');
  app.locals.middleware = middleware;

  /* Middleware */
  app.use(favicon);
  app.use(expressLogger({ immediate : conf.logger.web.immediate, 
                          format    : conf.logger.web.format }));
  app.use(bodyParser);
  app.use(methodOverride);
  app.use(middleware.mergeParams);
  app.use(compress);
  app.use(middleware.cors);

  /* Routes */
  // route to display versions
  app.get('/', function(req, res) {
      res.json(versions);
  });

  // import and apply the routes
  for (var k in versions) {
    var routes;

    routes = require('./app' + versions[k] + '/routes');
    app.use(versions[k], routes.build());
  }

  if (isProduction()) {  // only run clustered in prod
    startCluster();
  }
  else {
    startServer();
  }
}

/* Initialization */
// waterfall used in preparation for future initializers.
// currently not necessary
async.waterfall([
    function (callback) {
      new Logger(conf, function(logger) {
        app.locals.logger = logger;
        callback(null);
      });
    }
  ],
  function(err, results) {
    if (err) { throw new StartupException('Error initializing the server'); }
    initServer();
  }
);

exports = module.exports = app;