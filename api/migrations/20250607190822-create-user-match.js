"use strict";

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("UserMatch", {
      userAuth0Id: {
        type: Sequelize.STRING,
        primaryKey: true,
        references: {
          model: "Users",
          key: "auth0_id",
        },
        onDelete: "CASCADE",
        allowNull: false,
      },
      
      matchId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: "Matches",
          key: "id",
        },
        onDelete: "CASCADE",
        allowNull: false,
      },
      castling_direction: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "both",
      },
      color_assigned: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      promotion_square: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: false,
        defaultValue: [],
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
    await queryInterface.dropTable("UserMatch");
  }
};
