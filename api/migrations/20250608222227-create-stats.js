// migration-create-stats.js
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Stats", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      lifes_remaining: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      allowed_movements: {
        type: Sequelize.JSON,
        allowNull: false,
        //es una lista de tuplas
      },
      is_protected: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      limit_of_movement: {
        type: Sequelize.INTEGER,
        defaultValue: 2,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Stats");
  }
};
