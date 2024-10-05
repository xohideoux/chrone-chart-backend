const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const User = sequelize.define('user', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING },
});

const UserRole = sequelize.define('userRole', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  label: { type: DataTypes.STRING, unique: true },
});

const Task = sequelize.define('task', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING },
  description: { type: DataTypes.STRING },
  deadline: { type: DataTypes.DATE },
});

const TaskStatus = sequelize.define('taskStatus', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  label: { type: DataTypes.STRING, unique: true },
});

User.belongsTo(UserRole, { foreignKey: 'role' });
UserRole.hasMany(User, { foreignKey: 'role' });

Task.belongsTo(User, { foreignKey: 'creator' });
User.hasMany(Task, { foreignKey: 'creator', as: 'createdTasks' });

Task.belongsTo(User, { foreignKey: 'assignee' });
User.hasMany(Task, { foreignKey: 'assignee', as: 'assignedTasks' });

Task.belongsTo(TaskStatus, { foreignKey: 'status' });
TaskStatus.hasMany(Task, { foreignKey: 'status' });

module.exports = {
  User,
  Task,
};
