const { DataTypes, literal } = require("sequelize");
const sequelize = require("../../db/index.js");
const {
  GetAllUserMatchByAuth0Id,
  GetOpponent,
} = require("./UserMatch.js");

const { 
  CreateUserMatch
} = require("./UserMatch.js");

const Match = sequelize.define("Match", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  turn_to_play: {
    allowNull: false,
    defaultValue: "w",
    type: DataTypes.STRING,
  },
  status: {
    allowNull: false,
    defaultValue: "ongoing",
    type: DataTypes.STRING,
  },
  moves_list: {
    type: DataTypes.ARRAY(DataTypes.STRING),
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
});

const CreateMatch = async (auth0_id) => {

  const match = await Match.create();
  const userMatch= await CreateUserMatch(auth0_id, match.id, "w");
  return [match, userMatch];	
};

const GetAllMatchesByAuth0Id = async (auth0_id) => {
  const userMatches = await GetAllUserMatchByAuth0Id(auth0_id);

  if (!userMatches || userMatches.length === 0) return null;
	
  const matchIds = [...new Set(userMatches.map(um => um.matchId))];
  const matches = await GetMatchesByIds(matchIds);

  const seen = new Set();
  const uniqueUserMatches = userMatches.filter( userMatch => {
    if (seen.has(userMatch.matchId)) return false;

    seen.add(userMatch.matchId);
    return true;
  });

  const enrichedMatches = await Promise.all(uniqueUserMatches.map(async userMatch => {
    const match = matches.find(m => m.id === userMatch.matchId);

    const opponent = await GetOpponent(auth0_id, userMatch.matchId);

    return {
      matchId: userMatch.matchId,
      color: userMatch.color_assigned,
      matchStatus: match?.status,
      turnToPlay: match?.turn_to_play,
      opponent,
      createdAt: match?.createdAt,
      updatedAt: match?.updatedAt,

    };
  }));

  return enrichedMatches;
};

const GetMatchById = async (id) => {
  const match = await Match.findOne({
    where: {
      id
    }
  });
  return match;
};

const UpdateMovesList = async (match_id, notation) => {
  const match = await Match.findOne({
    where: {
      id: match_id,
    }
  });

  match.moves_list = [...match.moves_list, notation];

  await match.save();

  return match.moves_list;
};

const UpdateTurnToPlay = async (match_id) => {
  const match = await GetMatchById(match_id);

  match.turn_to_play = match.turn_to_play === "w" ? "b" : "w";
  await match.save();
};

const UpdateMatchStatus = async (match_id, status) => {
  const match = await GetMatchById(match_id);
  match.status = status;
  await match.save();
};

const DeleteMatch = async(match_id) => {
  const match = await GetMatchById(match_id);
  if (!match) return null;
  await Match.destroy({
    where: {
      id: match_id,
    }
  });
  return true;
}

module.exports = {
  CreateMatch,
  GetAllMatchesByAuth0Id,
  GetMatchById,
  UpdateMovesList,
  UpdateTurnToPlay,
  UpdateMatchStatus,
  DeleteMatch
};

const GetMatchesByIds = async (ids) => {
  const matches = await Match.findAll({
    where: {
      id: ids
    }
  });
  return matches;
};
