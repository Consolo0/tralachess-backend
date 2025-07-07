const { DataTypes, literal } = require("sequelize");
const sequelize = require("../../db/index.js");

const ChessBoard = sequelize.define("ChessBoard", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  
  matchId: {
    type: DataTypes.INTEGER,
    references: {
      model: "Matches",
      key: "id",
    },
    onDelete: "CASCADE",
    allowNull: false,
  },

  movement_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

  board: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [
      ["br", "bn", "bb", "bq", "bk", "bb", "bn", "br"],
      ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
      ["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"]
    ]
  },

  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    defaultValue: literal("CURRENT_TIMESTAMP"),
  },
  updatedAt: {
    allowNull: false,
    type: DataTypes.DATE,
    defaultValue: literal("CURRENT_TIMESTAMP"),
  },
});

const CreateChessBoard = async (match_id) => {
  const chessboard = await ChessBoard.create({
    matchId: match_id,
  });

  return chessboard;
};

const GetChessBoard = async (match_id) => {
  const chessboard = await ChessBoard.findOne({
    where: {
      matchId: match_id,
    }
  });

  return chessboard;
};

const GetAllPositions = async (match_id) => {

  const chessBoards = await ChessBoard.findAll({
    where: {
      matchId: match_id,
    },

    order: [["movement_number", "asc"]]
  });

  return chessBoards.map(chessBoard => chessBoard.board);
};

const GetChessBoards = async (limit, match_id)=>{
  const lastChessBoards = await ChessBoard.findAll({
    where: {
      matchId: match_id,
    },
    order: [["movement_number", "desc"]],
    limit,
  });

  //me devuelve las <limit> más recientes
  return lastChessBoards;
};

const CreateUpdatedChessBoard = async (match_id, newBoard) => {
  const chessBoardList = await GetChessBoards(1, match_id);
  const chessBoard = chessBoardList[0];

  const newChessboard = await ChessBoard.create({
    matchId: match_id,
    board: newBoard,
    movement_number : chessBoard.movement_number + 1,
  });

  return newChessboard;
};

module.exports = {
  CreateChessBoard,
  GetChessBoard,
  GetAllPositions,
  GetChessBoards,
  CreateUpdatedChessBoard
};