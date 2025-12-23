import {DataTypes, Op } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Role = sequelize.define('Role', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(50), unique: true, allowNull: false },
}, { tableName: 'roles', underscored: true });

export const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  email: { type: DataTypes.STRING(120), unique: true, allowNull: false },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  full_name: { type: DataTypes.STRING(120), allowNull: false },
  avatar_url: { type: DataTypes.STRING(255) },
  blood_group: { type: DataTypes.STRING(3) },
  location: { type: DataTypes.STRING(120) },
  status: { type: DataTypes.STRING(16), defaultValue: 'pending' },
}, { tableName: 'users', underscored: true });

User.belongsTo(Role, { foreignKey: { allowNull: false }, onDelete: 'RESTRICT' });
Role.hasMany(User);

export const Request = sequelize.define('Request', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  blood_group: { type: DataTypes.STRING(3), allowNull: false, index: true },
  urgency: { type: DataTypes.ENUM('normal','high','critical'), allowNull: false },
  status: { type: DataTypes.ENUM('open','assigned','fulfilled','cancelled'), defaultValue: 'open' },
  notes: { type: DataTypes.TEXT },
  location: { type: DataTypes.STRING(120) },
}, { tableName: 'requests', underscored: true });

Request.belongsTo(User, { as: 'requester', foreignKey: { name: 'requester_id', allowNull: false } });
User.hasMany(Request, { foreignKey: 'requester_id' });

export const Appointment = sequelize.define('Appointment', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  scheduled_at: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM('scheduled','completed','cancelled'), defaultValue: 'scheduled' },
  notes: { type: DataTypes.TEXT },
}, { tableName: 'appointments', underscored: true });

Appointment.belongsTo(User, { as: 'user', foreignKey: { name: 'user_id', allowNull: false } });
Appointment.belongsTo(User, { as: 'staff', foreignKey: { name: 'staff_id', allowNull: true } });

export const Donation = sequelize.define('Donation', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  blood_group: { type: DataTypes.STRING(3), allowNull: false },
  donated_at: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM('pending','confirmed','rejected'), defaultValue: 'pending' },
}, { tableName: 'donations', underscored: true });
Donation.belongsTo(User, { as: 'donor', foreignKey: { name: 'donor_id', allowNull: false } });

export const InventoryUnit = sequelize.define('InventoryUnit', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  blood_group: { type: DataTypes.STRING(3), allowNull: false },
  location: { type: DataTypes.STRING(120) },
  status: { type: DataTypes.ENUM('available','reserved','used','expired'), defaultValue: 'available' },
}, { tableName: 'inventory_units', underscored: true });

export const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  type: { type: DataTypes.ENUM('urgent','info'), allowNull: false },
  title: { type: DataTypes.STRING(180), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  blood_group: { type: DataTypes.STRING(3) },
  location: { type: DataTypes.STRING(120) },
  units: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, // ← FIX
  read: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'notifications', underscored: true });

Notification.belongsTo(User, { as: 'user', foreignKey: { name: 'user_id', allowNull: true } });

export const Feedback = sequelize.define('Feedback', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  rating: { type: DataTypes.INTEGER, allowNull: false },
  comments: { type: DataTypes.TEXT },
}, { tableName: 'feedback', underscored: true });
Feedback.belongsTo(User, { as: 'author', foreignKey: { name: 'author_id', allowNull: false } });

export const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  action: { type: DataTypes.STRING(120), allowNull: false },
  details: { type: DataTypes.TEXT },
}, { tableName: 'audit_logs', underscored: true });
AuditLog.belongsTo(User, { as: 'actor', foreignKey: { name: 'actor_id', allowNull: true } });

export const Report = sequelize.define('Report', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(180), allowNull: false },
  payload: { type: DataTypes.JSON },
}, { tableName: 'reports', underscored: true });

export async function applyIndexes() {
  await Request.addIndex(['blood_group']);
  await InventoryUnit.addIndex(['blood_group']);
  await InventoryUnit.addIndex(['location']);
}
export { Op };
