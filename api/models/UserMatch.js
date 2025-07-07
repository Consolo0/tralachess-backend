const { DataTypes, literal, Op} = require("sequelize");
const sequelize = require("../../db/index.js");

const UserMatch = sequelize.define("UserMatch", {
  userAuth0Id: {
    type: DataTypes.STRING,
    references: {
      model: "Users",
      key: "auth0_id",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    allowNull: false,
  },
  matchId: {
    type: DataTypes.INTEGER,
    references: {
      model: "Matches",
      key: "id",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    allowNull: false,
  },
  color_assigned: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  castling_direction: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "both",
  },
  promotion_square: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: false,
    defaultValue: [],
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
}, {
  tableName: "UserMatch",
  timestamps: true,
  primaryKey: false,
});
UserMatch.removeAttribute("id"); // <-- Esto es importante para claves compuestas
UserMatch.primaryKeyAttributes = ["userAuth0Id", "matchId"];

const CreateUserMatch = async (auth0_id, match_id, color) => {
  const userMatch = await UserMatch.create({
    userAuth0Id: auth0_id,
    matchId: match_id,
    color_assigned: color,
  });

  return userMatch;
};

const JoinMatch = async (auth0_id) => {
  // Buscar partidas con solo un jugador distinto al actual
  const matchesWithOnePlayer = await UserMatch.findAll({
    attributes: ["matchId"],
    where: {
      userAuth0Id: {
        [Op.ne]: auth0_id
      }
    },
    group: ["matchId"],
    having: sequelize.literal("COUNT(*) = 1"),
    limit: 1,
  });

  if (!matchesWithOnePlayer || matchesWithOnePlayer.length === 0) return null;

  const matchId = matchesWithOnePlayer[0].get("matchId");

  if (!matchId) return null;

  // Verifica si este usuario ya está unido a esta partida
  const alreadyJoined = await UserMatch.findOne({
    where: {
      userAuth0Id: auth0_id,
      matchId: matchId
    }
  });

  if (alreadyJoined) {
    return alreadyJoined;
  }

  // Si no está unido, lo crea
  const matchJoined = await CreateUserMatch(auth0_id, matchId, "b");
  return matchJoined;
};

const GetAllUserMatchByAuth0Id = async (auth0_id) => {
  const matches = await UserMatch.findAll({
    where: {
      userAuth0Id : auth0_id
    }
  });

  return matches;
};

const GetOpponent = async (auth0_id, match_id) => {
  const opponentUserMatch = await UserMatch.findOne({
    where: {
      matchId: match_id,
      userAuth0Id : {
        [Op.ne]: auth0_id
      }
    }
  });

  return opponentUserMatch || null;
};

const GetUserMatch = async (match_id, user_auth0id) => {
  const userMatch = await UserMatch.findOne({
    where: {
      matchId: match_id,
      userAuth0Id: user_auth0id,
    }
  });

  return userMatch;
};

const UpdateCastlingDirection = async (match_id, auth0_id, newCastlingDirection) => {
  await UserMatch.update(
    { castling_direction: newCastlingDirection },
    {
      where: {
        matchId: match_id,
        userAuth0Id: auth0_id
      }
    }
  );
};

const SetPromotionBox = async (match_id, auth0_id, x, y) => {
  await UserMatch.update(
    {promotion_square: [x, y]},
    {
      where: {
        matchId : match_id,
        userAuth0Id : auth0_id,
      }
    }
  );
};

const GetUserMatchByAuthAndMatchId = async (auth0_id, matchId) => {
  return await UserMatch.findOne({
    where: {
      userAuth0Id: auth0_id,
      matchId: matchId
    }
  });
};

module.exports = {
  CreateUserMatch,
  JoinMatch,
  GetAllUserMatchByAuth0Id,
  GetOpponent,
  GetUserMatch,
  UpdateCastlingDirection,
  SetPromotionBox,
  GetUserMatchByAuthAndMatchId,
};
