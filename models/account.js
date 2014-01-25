module.exports = function(sequelize, DataTypes) {
  return sequelize.define("account", {
    name: DataTypes.STRING,
    description: DataTypes.STRING
  })
}