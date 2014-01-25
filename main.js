/**
 * api
 *
 * @author Simon Townsend <stownsend@unifiedsocial.com>
 */

var conf       = require('./conf'),
    express    = require('express'),
    app        = express(),
    _          = require('lodash'),
    async      = require('async'),
    RedisStore = require('connect-redis')(express),
    https      = require('https'),
    http       = require('http'),
    Resource   = require('express-resource-plus')(app),
    Cluster    = require('./lib/cluster'),
    versions;

/* Globals */
// all globals exposed via the express.locals api
global.app         = app;
app.locals.conf    = conf;
if (!app.hasOwnProperty('db')) {
  app.locals.db = require('./models')(conf);
}
app.locals.Logger  = require('./lib/logger');
app.locals.appPath = __dirname;


/* Dependencies */
var middleware = require('./lib/middleware');

/* Configuration */
// all environments
app.configure(function(){
  app.set('app_dir', __dirname + '/app');
});
// test only
app.configure('test', function(){
});
// development only
app.configure('development', function(){
});
// production only
app.configure('production', function(){
});

/* Middleware */
app.use(express.favicon());
app.use(express.logger({ immediate : conf.logger.web.immediate, 
                        format : conf.logger.web.format }));
app.use(express.bodyParser());
app.use(express.methodOverride());
//app.use(middleware.mergeParams);
app.use(express.cookieParser(conf.session.secret));
app.use(express.session({ store: new RedisStore({ host : conf.redis.host,
                                                  port : conf.redis.port,
                                                  pass : conf.redis.pass
                                                }), secret: conf.session.secret }));

//app.use(express.compress());
app.use(express.static(__dirname + '/public'));
app.use(middleware.cors);
if(conf.useErrorHandler) app.use(express.errorHandler());


/* Routes */
versions = {'Version 1': '/v1',
            'Version 2': '/v2'};

// route to display versions
app.get('/', function(req, res) {
    res.json(versions);
})

// import and apply the routes
for (var k in versions) { 
  route = require('./app' + versions[k] + '/routes');
  route.init(versions[k], conf);
}

app.locals.db.sequelize.sync().complete(function(err) {
  if (err) {
    throw err
  } else {
    if (isProduction()) {  // only run clustered in prod
      new Cluster()
        .worker(function () {
         startServer();
        });
    }
    else {
      startServer();
    }
  }
});

/* misc */
function isProduction() {
  if ('production' == app.get('env')) {
    return true;
  }
  return false;
}

function isTest() {
  if ('test' == app.get('env')) {
    return true;
  }
  return false;
}

/* Initialization */
function startServer() {
  http.createServer(app).listen(conf.server.port.http, function(){
    console.log('Express server listening on port ' + conf.server.port.http)
  });
}

exports = module.exports = app;