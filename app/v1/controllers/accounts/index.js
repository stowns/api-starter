/*
* v1 Accounts Controller
*/

var ResourceController = require(app.locals.appPath + '/lib/sequelizeResourceController'),
    controller,
    opts;

/* beforeAction definitions */
var before = {
  
};

opts = {
};

/* instantiate the controller. */
controller = new ResourceController('account', opts);

// if the model is called via a nested route 
// req.scope will be populated with an instance of the scope
// allowing you to retrieve the account or accounts in context of the call
// ie) /users/:user_id/accounts/new -> req.scope = userSequelizeInstance -> scope.getAccounts()
// controller.new = function(req, res) {
//   res.send('overwritten new ' + req.scope);
// };

exports = module.exports = controller;