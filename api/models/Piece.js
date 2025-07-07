const { DataTypes, literal } = require("sequelize");
const sequelize = require("../../db/index.js");
const { GetStat, UpdateStatsCapturedPiece, GetDirection } = require("./Stat.js");

const Piece = sequelize.define("Piece", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  chessBoardId: {
    type: DataTypes.INTEGER,
    references: {
      model: "ChessBoards",
      key: "id",
    },
    onDelete: "CASCADE",
    allowNull: false,
  },
  statId: {
    type: DataTypes.INTEGER,
    references: {
      model: "Stats",
      key: "id",
    },
    onDelete: "CASCADE",
    allowNull:false,
  },
  type: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  position: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER),
  },
  status: {
    allowNull: false,
    type: DataTypes.STRING,
    defaultValue: "alive",
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

const CreatePiece = async (stat_id, chessboard_id, type, i, j) => {
  const piece = await Piece.create({
    chessBoardId: chessboard_id,
    statId: stat_id,
    type,
    position : [i, j],
  });

  return piece;
};

const GetPieceStatIdForCandidateMoves = async (chessBoardId, rank, tile, piece) => {

  const pieceonDb = await Piece.findOne({
    where: {
      chessBoardId: chessBoardId,
      position: [rank, tile],
      type: piece,
    }
  });

  if (!pieceonDb){
    throw new Error(`Couldnt find piece on the chessboard: ${chessBoardId} and position : (${rank}, ${tile})`);
  }

  return pieceonDb.statId;
};

const GetPieceByPositionAndType = async (chessBoardId, origin_x, origin_y, piece) => {

  const pieceonDb = await Piece.findOne({
    where: {
      chessBoardId: chessBoardId,
      position: [origin_x, origin_y],
      type: piece,
    }
  });

  if (!pieceonDb){
    throw new Error(`Couldnt find piece on the chessboard: ${chessBoardId} and position : (${origin_x}, ${origin_y})`);
  }

  return pieceonDb;
};

const UpdatePiecePosition = async (chessBoardId, origin_x, origin_y, destiny_x, destiny_y, piece) => {
  const pieceInstance = await GetPieceByPositionAndType(chessBoardId, origin_x, origin_y, piece);

  pieceInstance.position = [destiny_x, destiny_y];

  await pieceInstance.save();
};

const ChangeStatusToCapturedPiece = async (chessBoardId, x, y, piece) => {
  const pieceInstance = await GetPieceByPositionAndType(chessBoardId, x, y, piece);
  if (!pieceInstance) return null;

  const stat = await GetStat(pieceInstance.statId);

  if (!stat.is_protected || stat.lifes_remaining == 1){
    pieceInstance.status = "captured";
    await pieceInstance.save();

    await UpdateStatsCapturedPiece(pieceInstance.statId);
  }
};

const GetPieceDirections = async (x, y, pieceString, chessboardId) => {

  const piece = await Piece.findOne({
    where: {
      chessBoardId: chessboardId,
      position: [x, y],
      type: pieceString,
    }
  });
  
  const statId = piece.statId;
  const directions = GetDirection(statId);

  return directions;
};

module.exports = {
  CreatePiece,
  GetPieceStatIdForCandidateMoves,
  GetPieceByPositionAndType,
  UpdatePiecePosition,
  ChangeStatusToCapturedPiece,
  GetPieceDirections,
};