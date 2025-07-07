"use strict";
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("ChessBoards", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      
      matchId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Matches",
          key: "id",
        },
        onDelete: "CASCADE",
        allowNull: false,
      },

      movement_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      board: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: JSON.stringify([
          ["br", "bn", "bb", "bq", "bk", "bb", "bn", "br"],
          ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
          ["", "", "", "", "", "", "", ""],
          ["", "", "", "", "", "", "", ""],
          ["", "", "", "", "", "", "", ""],
          ["", "", "", "", "", "", "", ""],
          ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
          ["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"]
        ])
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
    await queryInterface.dropTable("ChessBoards");
  }
};
