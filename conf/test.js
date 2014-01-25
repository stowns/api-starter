var conf = {};

conf.app = {
  name : 'my-api'
};

conf.server = {
  port : {
    http: 8080,
    https: 443
  }
};

conf.redis = {
  host : 'localhost',
  port : 6379,
  pass : null
};

conf.postgres = {
  database : 'api_test',
  port     : 5432,
  uname    : 'uname',
  pass     : 'pass',
  logging  : true
};

conf.session = {
  secret : 'supersecret'
};

conf.logger = {
  web : {
    immediate : true,
    format    : 'dev'
  },
  app : {
    index : false
  },
  sequelize : console.log
};

module.exports = conf;