const { CheckForEndgame } = require("./CheckForEndgame");

const StatusUpdate = async (positions, newPositions, piece, x, castleDirection, chessBoardId) => {
  const opponentColor = piece[0] === "w" ? "b" : "w";
  //esta puede ser una funcionalidad que me traiga problemas logicamente
  const matchResult = await CheckForEndgame(positions, newPositions, opponentColor, castleDirection, chessBoardId);

  if (piece.endsWith("p") && ((piece[0] === "w" && x === 0) || (piece[0] === "b" && x === 7))){
    return "promotion";
  }
  else if ("" !== matchResult){
    return matchResult;
  }
  else{
    return "ongoing";
  }
};

module.exports = {
  StatusUpdate,
};