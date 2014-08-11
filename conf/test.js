var conf = {};

conf.app = {
  name : 'api-starter',
  env  : 'test'
};

conf.server = {
  port : {
    http: 8080,
    https: 443
  }
};

conf.mongoUrl = 'mongodb://localhost/api-starter-test';

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