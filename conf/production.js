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
  host : process.env.REDIS_HOST,
  port : process.env.REDIS_PORT,
  pass : process.env.REDIS_PASS
};

conf.postgres = {
  database : process.env.POSTGRES_DB,
  port     : process.env.POSTGRES_PORT,
  uname    : process.env.POSTGRES_UNAME,
  pass     : process.env.POSTGRES_PASS,
  logging  : process.env.POSTGRES_LOGGING || false
};

conf.session = {
  secret : process.env.SESSION_SECRET
};

conf.logger = {
  web : {
    immediate : true,
    format    : 'dev'
  },
  app : {
    index : false
  },
  sequelize : false
};

module.exports = conf;