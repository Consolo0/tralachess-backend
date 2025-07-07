const GetCastlingMoves = (positions, castleDirection, piece, rank, tile) => {
  const moves = [];
  if (tile !== 4 || rank%7!==0 || castleDirection === "none") return [];

  if (piece[0] === "w"){
    if (["left", "both"].includes(castleDirection) &&
      positions[7][3] === "" && 
      positions[7][2] === "" && 
      positions[7][1] === "" && 
      positions[7][0] === "wr"
    ){
      moves.push([7, 2]);
    }

    if (["right", "both"].includes(castleDirection) &&
      positions[7][5] === "" && 
      positions[7][6] === "" && 
      positions[7][7] === "wr"
    ){
      moves.push([7, 6]);
    }
  }

  if (piece[0] === "b"){
    if (["left", "both"].includes(castleDirection) &&
      positions[0][3] === "" && 
      positions[0][2] === "" && 
      positions[0][1] === "" && 
      positions[0][0] === "br"
    ){
      moves.push([0, 2]);
    }

    if (["right", "both"].includes(castleDirection) &&
      positions[0][5] === "" && 
      positions[0][6] === "" && 
      positions[0][7] === "br"
    ){
      moves.push([0, 6]);
    }
  }

  return moves;
};

module.exports = {
  GetCastlingMoves,
};