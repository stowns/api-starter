module.exports = function(sequelize, DataTypes) {
  return sequelize.define("user", {
    username: DataTypes.STRING,
    age     : DataTypes.INTEGER
  })
}