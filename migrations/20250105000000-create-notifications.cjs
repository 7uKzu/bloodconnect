'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notifications', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      type: { type: Sequelize.ENUM('urgent', 'info'), allowNull: false },
      title: { type: Sequelize.STRING(180), allowNull: false },
      message: { type: Sequelize.TEXT, allowNull: false },
      blood_group: { type: Sequelize.STRING(3) },
      location: { type: Sequelize.STRING(120) },
      read: { type: Sequelize.BOOLEAN, defaultValue: false },
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: 'users', key: 'id' },
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('notifications');
  }
};