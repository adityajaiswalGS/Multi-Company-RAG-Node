const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const companyId = uuidv4();
    
    // 1. Create a Default Company
    await queryInterface.bulkInsert('Companies', [{
      id: companyId,
      name: 'System Admin Group',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    // 2. Create the Super Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10);
    return queryInterface.bulkInsert('Users', [{
      id: uuidv4(),
      email: 'admin@bot.com',
      password: hashedPassword,
      full_name: 'Super Admin',
      role: 'superadmin',
      company_id: companyId,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('Companies', null, {});
  }
};