/*
*
* Route definitions for v2
*
*/
module.exports.init = function(rootRoute) {
  app.get(rootRoute + '/', function(req, res) {
    res.send('hello from v2');
  });
};