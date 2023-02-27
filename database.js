const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASS,
  {
    host: 'localhost',
    dialect: 'mysql',
    define: {
      underscored: true,
      freezeTableName: true,
    },
  },
);

const DataTraining = sequelize.define('DataTraining', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  data: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  images: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'data_training',
});

module.exports = {
  sequelize,
  DataTraining,
};
