const IsNotACandidateMove = (candidateMoves, x, y) => {
  for (let move of candidateMoves){
    if (move[0]===x && move[1]===y){
      return false;
    }
  }
  return true;
};

module.exports={
  IsNotACandidateMove,
};