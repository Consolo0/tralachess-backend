const express = require("express");
const { 
  CreateMatchController,
  JoinMatchController,
  GetAllMatchesByAuth0IdController,
  GetContextOfMatch,
  GetCandidateMoves,
  CheckIfIsMyTurn,
  CheckIfMoveIsInValid,
  CheckEnPassant,
  UpdateMoveList,
  UpdateBoard,
  UpdateStatus,
  UpdateStatusDirectly,
  UpdateBoardDirectly,
  SetPromotionBoxController,
  GetPromotionBox,
  DeleteMatchController
} = require("../controllers/MatchController");

const MatchRouter = express.Router();
//voy a querer crear una partida para jugar
MatchRouter.post("/create/:auth0_id", CreateMatchController);
//voy a querer buscar una partida para jugar (agregar a un usuario a una partida existente que le falte uno)
MatchRouter.post("/join/:auth0_id", JoinMatchController);
//voy a querer buscar todas las partidas de un usuario
MatchRouter.get("/all/:auth0_id", GetAllMatchesByAuth0IdController);
//voy a querer obtener el context
MatchRouter.get("/context", GetContextOfMatch);
//voy a querer chequear si es que es mi turno de jugar
MatchRouter.get("/is-my-turn", CheckIfIsMyTurn);
//voy a querer obtener los candidate moves
MatchRouter.get("/get-candidate-moves", GetCandidateMoves);
//voy a querer ver si un movimiento es valido
MatchRouter.post("/invalid-move", CheckIfMoveIsInValid);
//voy a querer ver si puedo ejecutar En-Passant
MatchRouter.get("/en-passant", CheckEnPassant);
//voy a querer actualizar la lista de movimientos
MatchRouter.patch("/update-moves-list", UpdateMoveList);
//voy a querer actualizar el tablero
MatchRouter.patch("/update-board", UpdateBoard);
//voy a querer actualizar el estado
MatchRouter.patch("/update-status", UpdateStatus);
//voy a querer cambiar el status directamente después de promover una pieza
MatchRouter.patch("/update-status-directly", UpdateStatusDirectly);
//voy a querer actualizar el tablero después de una promoción
MatchRouter.patch("/update-board-directly", UpdateBoardDirectly);
//voy a querer poner una promotion-box
MatchRouter.patch("/set-promotion-box", SetPromotionBoxController);
//voy a querer obtener el promotion box
MatchRouter.get("/get-promotion-box", GetPromotionBox);

//nueva ruta
MatchRouter.delete("/:match_id", DeleteMatchController);

module.exports=MatchRouter;
