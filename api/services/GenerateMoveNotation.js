const { GetCharacter } = require("./GetCharacter");

const GenerateMoveNotation = (positions, piece, rank, tile, x, y, promotesTo) => {
  let note = "";

  rank = Number(rank);
  tile = Number(tile);

  if (piece[1] === "k" && Math.abs(tile-y) === 2){
    if (tile > y)
      return "0-0-0";
    else
      return "0-0";
  }

  if (piece[1] !== "p") {
    note += piece[1].toUpperCase();
    if (positions[x][y]){
      note += "x";
    }
  }

  else if (rank !== x && tile !== y){
    note += GetCharacter(tile+1)+"x";
  }

  note += GetCharacter(y+1) + (8-x);

  if (promotesTo)
    note += "=" + promotesTo.toUpperCase();

  return note;
};

module.exports = {
  GenerateMoveNotation,
};