'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('donations', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      blood_group: { type: Sequelize.STRING(3), allowNull: false },
      donated_at: { type: Sequelize.DATE, allowNull: false },
      status: { type: Sequelize.ENUM('pending', 'confirmed', 'rejected'), defaultValue: 'pending' },
      donor_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('donations');
  }
};