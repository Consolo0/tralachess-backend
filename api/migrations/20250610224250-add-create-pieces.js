// migration-create-pieces.js
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Pieces", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      chessBoardId: {
        type: Sequelize.INTEGER,
        references: {
          model: "ChessBoards",
          key: "id",
        },
        onDelete: "CASCADE",
        allowNull:false,
      },
      statId:{
        type: Sequelize.INTEGER,
        references: {
          model: "Stats",
          key: "id",
        },
        onDelete: "CASCADE",
        allowNull:false,
      },
      type: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      position: {
        allowNull: false,
        type: Sequelize.ARRAY(Sequelize.INTEGER),
      },
      status: {
        defaultValue: "alive",
        allowNull: false,
        type: Sequelize.STRING
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
    await queryInterface.dropTable("Pieces");
  }
};
