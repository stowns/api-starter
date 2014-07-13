API Starter
=======

A seed project for building out a new api.  Supports resource-based routing, Sequel Models, Redis caching, TESTING, and clustering out of the box.

* [Getting Started](#getting-started)
  * [Dependencies](#dependencies)
  * [Signals](#signals)
  * [Migrations](#migrations)
  * [Docs](#docs)


## Getting Started
  - nvm install 0.10.26
  - npm install -g mocha grunt-cli
  - npm install
  - edit /conf/development.js && /conf/test.js database information appropriately
  - createdb api_dev ; createdb api_test
  - nvm use
  - npm test
  - npm start
  - optionally, run 'grunt watch' for [JSHint][jshint] results on saves

### Dependencies
- [Node.js ≥ 0.10.22][node]
- [Postgres][postgres]
- [Redis][redis] (production only)

### Signals

- SIGINT - graceful shutdown
```
kill -s SIGINT (process_id)
```

- SIGUSR2 - Rolling restart.  Useful for reloading configuration without downtime.
```
kill -s SIGUSR2 (process_id)
```

### Migrations

Api Starter uses [Sequelize's][sequelize] built in migration support.  [Docs here](http://sequelizejs.com/docs/latest/migrations)

#### Running

`node_modules/sequelize/bin/sequelize -m --url postgres://uname:pass@localhost:5432/api_dev`

**IMPORTANT** do *NOT* use the global sequelize binary ie) `sequelize -m`.  Use the binary installed locally to the node_modules folder.

### Docs
The default grunt task generates documentation using [APIDoc][apidoc].

[node]: http://nodejs.org/ "Node.js"
[cluster]: http://nodejs.org/docs/v0.10.22/api/cluster.html "Cluster - Node v0.10.22"
[redis]: http://redis.io/download "Redis"
[postgres]: http://www.postgresql.org/ "Postgres"
[sequelize]: http://http://sequelizejs.com/ "Sequelize"
[jshint]: http://www.jshint.com/docs/ "JSHint"
[apidoc]: http://apidocjs.com/ "APIDocJS"