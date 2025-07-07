const GetCastlingState = (pieceString, rank, tile, castlingDirection) => {
  if (pieceString[1] === "k"){
    return "none";
  }

  if (tile === 0 && rank === 7){
    if (castlingDirection === "both"){
      return "right";
    }
    else if (castlingDirection === "left"){
      return "none";
    }
  }

  if (tile === 7 && rank === 7){
    if (castlingDirection === "both"){
      return "left";
    }
    else if (castlingDirection === "right"){
      return "none";
    }
  }

  if (tile === 0 && rank === 0){
    if (castlingDirection === "both"){
      return "right";
    }
    else if (castlingDirection === "left"){
      return "none";
    }
  }

  if (tile === 7 && rank === 0){
    if (castlingDirection === "both"){
      return "left";
    }
    else if (castlingDirection === "right"){
      return "none";
    }
  }

  return castlingDirection;
};

module.exports = {
  GetCastlingState,
};