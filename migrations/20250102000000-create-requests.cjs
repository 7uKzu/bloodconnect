'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('requests', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      blood_group: { type: Sequelize.STRING(3), allowNull: false },
      urgency: { type: Sequelize.ENUM('normal', 'high', 'critical'), allowNull: false },
      status: { type: Sequelize.ENUM('open', 'assigned', 'fulfilled', 'cancelled'), defaultValue: 'open' },
      notes: { type: Sequelize.TEXT },
      location: { type: Sequelize.STRING(120) },
      requester_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('requests');
  }
};