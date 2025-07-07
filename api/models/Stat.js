const { DataTypes, literal } = require("sequelize");
const sequelize = require("../../db/index.js");

const Stat = sequelize.define("Stat", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  lifes_remaining: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false,
  },
  allowed_movements: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  is_protected: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  limit_of_movement: {
    type: DataTypes.INTEGER,
    defaultValue: 2,
    allowNull: false,
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

const CreateStat = async (piece) => {
  const moves = GetDirectionsByPiece(piece);

  const { limit } = moves;
  delete moves.limit;

  const stat = await Stat.create({
    limit_of_movement: limit,
    allowed_movements: moves,
  });

  return stat;
};

const GetDirection = async (statId) => {
  const stat = await GetStat(statId);
  const moves = stat.allowed_movements;

  const res = {
    ...moves,
    limit: stat.limit_of_movement
  };

  return res;
};

const UpdateStatsCapturedPiece = async (statId) => {
  const stat = await GetStat(statId);

  stat.lifes_remaining -= 1;
  stat.is_protected = false;

  await stat.save();
};

const GetStat = async (statId) => {
  const stat = await Stat.findOne({
    where : {
      id: statId,
    }
  });

  return stat;
};

module.exports = {
  CreateStat,
  GetDirection,
  UpdateStatsCapturedPiece,
  GetStat,
};

const GetDirectionsByPiece = (piece) => {
  //aca aplciariamos la logica de obtener los movimientos permitidos mediante el id, los cuales pueden ser obtenidos mediante la posición
  //ya que cada posición es únicamente ocupada por una pieza en cada partida

  switch (piece[1]){
  case "b": // Bishop
    return {
      moves: [[1, 1], [-1, -1], [-1, 1], [1, -1]],
      limit: 8,
    };

  case "r": // Rook
    return {
      moves: [[1, 0], [-1, 0], [0, 1], [0, -1]],
      limit: 8,
    };

  case "q": // Queen
    return {
      moves: [[1, 1], [-1, -1], [-1, 1], [1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]],
      limit: 8,
    };

  case "k": // King
    return {
      moves: [[1, 1], [-1, -1], [-1, 1], [1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]],
      limit: 2,
    };

  case "n": // Knight
    return {
      moves: [[2, 1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2], [1, -2], [2, -1]],
      limit: 2,
    };

  case "p":

    return {
      OnStart: [[2, 0]],
      DuringMatch: [[1, 0]],
      EnemiesNear: [[1, 1], [1, -1]],
      limit: 2,
    };

  default:
    return {
      moves: [],
      limit: 0,
    };
  }
};
