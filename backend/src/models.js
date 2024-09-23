const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('postgres://user:password@localhost:5432/mydb');

// Пользователь
const User = sequelize.define('User', {
  telegram_id: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING }
});

// Курс
const Course = sequelize.define('Course', {
  title: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  video_url: { type: DataTypes.STRING },
  content: { type: DataTypes.TEXT }
});

// Задача
const Task = sequelize.define('Task', {
  course_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING },
  required_per_day: { type: DataTypes.INTEGER },
  available_until: { type: DataTypes.DATE }
});

// Прогресс пользователя
const UserTask = sequelize.define('UserTask', {
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  task_id: { type: DataTypes.INTEGER, allowNull: false },
  completed_today: { type: DataTypes.INTEGER },
  last_completed_at: { type: DataTypes.DATE },
  progress: { type: DataTypes.INTEGER }
});

User.hasMany(UserTask, { foreignKey: 'user_id' });
Course.hasMany(Task, { foreignKey: 'course_id' });
Task.hasMany(UserTask, { foreignKey: 'task_id' });

module.exports = { sequelize, User, Course, Task, UserTask };
