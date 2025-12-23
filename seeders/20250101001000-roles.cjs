'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('roles', [
      { id: 1, name: 'Donor', created_at: now, updated_at: now },
      { id: 2, name: 'Recipient', created_at: now, updated_at: now },
      { id: 3, name: 'Technician', created_at: now, updated_at: now },
      { id: 4, name: 'Staff', created_at: now, updated_at: now },
      { id: 5, name: 'Admin', created_at: now, updated_at: now },
      { id: 6, name: 'MedicalStaff', created_at: now, updated_at: now },
    ], { ignoreDuplicates: true });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('roles', null, {});
  }
};
