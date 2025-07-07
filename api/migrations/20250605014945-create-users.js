"use strict";

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      auth0_id:{
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
      },
      username: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
      },
      description: {
        defaultValue: "Si pienso, juego mal",
        type: Sequelize.STRING,
      },
      wins: {
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      draws: {
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      loss: {
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      profileImage: {
        type: Sequelize.BLOB("long"),
        allowNull: true,
      },
      isAdmin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
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
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
  }
};
