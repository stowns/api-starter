var conf = {};

conf.app = {
  name : 'api-starter',
  env  : 'production'
};

conf.server = {
  port : {
    http: 8080,
    https: 443
  }
};

conf.mongoUrl = process.env.MONGO_URL;

conf.logger = {
  web : {
    immediate : true,
    format    : 'dev'
  },
  app : {
    persist : { enabled : 'false',
                level   : 'info'}, // mongo required
    level   : 'error'
  }
};

module.exports = conf;