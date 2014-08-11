var conf = {};

conf.app = {
  name : 'api-starter',
  env  : process.env.NODE_ENV || 'development'
};

conf.server = {
  port : {
    http: 8080,
    https: 443
  }
};

conf.mongoUrl = 'mongodb://localhost/api-starter-dev';

conf.logger = {
  web : {
    immediate : true,
    format    : 'dev'
  },
  app : {
    persist : { enabled : 'false',
                level   : 'info'}, // mongo required
    level   : 'debug'
  }
};

module.exports = conf;