const {
  CreateMatch,
  GetAllMatchesByAuth0Id,
  GetMatchById,
  UpdateMovesList,
  UpdateTurnToPlay,
  UpdateMatchStatus,
  DeleteMatch,
} = require("../models/Match");

const {
  CreateChessBoard,
  GetAllPositions,
  GetChessBoards,
  CreateUpdatedChessBoard,
} = require("../models/ChessBoard");

const {
  CreateStat,
  GetDirection,
} = require("../models/Stat");

const {
  CreatePiece,
  GetPieceStatIdForCandidateMoves,
  UpdatePiecePosition,
  ChangeStatusToCapturedPiece
} = require("../models/Piece");

const {
  JoinMatch,
  GetUserMatch,
  UpdateCastlingDirection,
  GetOpponent,
  SetPromotionBox,
  GetUserMatchByAuthAndMatchId,
} = require("../models/UserMatch");

const { 
  GetMoves 
} = require("../services/GetMoves");

const { 
  IsNotACandidateMove 
} = require("../services/IsNotACandidateMove");
const { IsKingSafe } = require("../services/IsKingSafe");
const { GenerateMoveNotation } = require("../services/GenerateMoveNotation");
const { GetCastlingState } = require("../services/GetCastlingState");
const { StatusUpdate } = require("../services/StatusUpdate");

const CreateMatchController = async (req, res) => {
  try{

    const {auth0_id} = req.params;
    if (!auth0_id){
      return res.status(400).json({error: "Missing auth0_id route parameter"});
    }

    const [match, userMatch] = await CreateMatch(auth0_id);
    if (!match){
      throw new Error(`Couldnt create match, please try again; Error ocurred at creating match`);
    }

    const chessboard = await CreateChessBoard(match.id);
    if (!chessboard){
      throw new Error(`Couldnt create match, please try again; Error ocurred at creating chessboard`);
    }

    let pieces = [];
    let stats = [];
    const color = "w";

    for (let i=0; i<chessboard.board.length; i++){
      for (let j=0; j<chessboard.board[i].length; j++){
        //if (chessboard.board[i][j][0] === color)
        if (chessboard.board[i][j]){

          const stat = await CreateStat(chessboard.board[i][j]);
          if (!stat){ 
            throw new Error(`Couldnt create match, please try again; Error ocurred at creating stat`);
          }

          const piece = await CreatePiece(stat.id, chessboard.id, chessboard.board[i][j], i, j);
          if (!piece){ 
            throw new Error(`Couldnt create match, please try again; Error ocurred at creating piece`);
          }

          pieces = [...pieces, piece];
          stats = [...stats, stat];
        }
      }
    }
    
    res.status(201).json({
      userMatch,
      match,
      chessboard,
      pieces,
      stats,
    });

  }catch(error){
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
};

const JoinMatchController = async (req, res) => {
  try{
    const {auth0_id} = req.params;

    if (!auth0_id){
      return res.status(400).json({error: "Missing auth0_id route parameter"});
    }

    const userMatchJoined = await JoinMatch(auth0_id);
    if (!userMatchJoined){
      return res.status(404).json({error: "Couldnt find a match which needed a player, please try creating one or wait and try later"});
    }
    
    const matchId = userMatchJoined.matchId;

    const alreadyJoined = await GetUserMatchByAuthAndMatchId(auth0_id, matchId);

    if (alreadyJoined) {
      // Puedes retornar el match y el userMatch como en el caso exitoso
      const matchJoined = await GetMatchById(matchId);
      return res.status(200).json({
        userMatchJoined: alreadyJoined,
        matchJoined,
      });
    }

    const matchJoined = await GetMatchById(matchId);

    //si quisieramos agregar lo de que el tablero se de vuelta acorde a tu color, entonces habria que crear uno nuevo y que chessboard tenga el user auth 0  id como llave

    res.status(200).json({
      userMatchJoined,
      matchJoined,
    });

  }catch(error){
    console.error("JoinMatchController error:", error);
    res.status(500).json({
      error: error.message,
      details: error.errors,
      stack: error.stack
    });
  }
};

const GetAllMatchesByAuth0IdController = async (req, res) => {
  try{
    const {auth0_id} = req.params;

    if (!auth0_id){
      return res.status(400).json({error: "Missing auth0_id route parameter"});
    }

    const enrichedMatches = await GetAllMatchesByAuth0Id(auth0_id);

    if (!enrichedMatches){
      return res.status(404).json({message: "User has no matches"});
    }

    res.status(200).json(enrichedMatches);

  }catch(error){
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
};

const GetContextOfMatch = async (req, res) => {
  try{
    const { match_id, auth0_id } = req.query;

    if (!match_id){
      return res.status(400).json({error: "Missing match_id body parameter"});
    }

    if (!auth0_id){
      return res.status(400).json({error: "Missing auth0_id body parameter"});
    }

    const match = await GetMatchById(match_id);
    if (!match){
      return res.status(404).json({error: "Couldnt find match for context info"});
    }

    const userMatch = await GetUserMatch(match_id, auth0_id);
    if (!userMatch){
      throw new Error("Server proccessed wrong the context info for user match");
    }

    const positions = await GetAllPositions(match_id);
    if (!positions){
      return res.status(404).json({error: "Couldnt find chessboard for context info"});
    }

    return res.status(200).json({
      result:{
        positions: positions,
        turn: match.turn_to_play,
        status: match.status,
        color_assigned: userMatch.color_assigned,
        movesList: match.moves_list,
        promotionSquare: userMatch.promotion_square
      }
    });
    /*{
    positions: [GetInitialBoardPosition()], //backend
    turn: 'w', //backend
    assign_color: 'bw'
    status : 'ongoing', //backend
    movesList: [],//backend
  }*/

  }catch(error){
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
};

const GetCandidateMoves = async (req, res) => {

  try{

    let { match_id, auth0_id, rank, tile } = req.query;
    rank = Number(rank);
    tile = Number(tile);

    if (!match_id) {
      return res.status(400).json({ error: "Missing match_id" });
    }

    if (!auth0_id) {
      return res.status(400).json({ error: "Missing auth0_id" });
    }

    if (rank === undefined || rank === null || isNaN(rank)) {
      return res.status(400).json({ error: "Missing or invalid rank" });
    }

    if (tile === undefined || tile === null || isNaN(tile)) {
      return res.status(400).json({ error: "Missing or invalid tile" });
    }
    if (rank < 0 || rank > 7 || tile < 0 || tile > 7) {
      return res.status(400).json({ error: `Invalid board position: (${rank},${tile})`});
    }

    const userMatch = await GetUserMatch(match_id, auth0_id);
    if(!userMatch) return res.status(404).json({error:"Couldnt find userMatch"});

    const castleDirection = userMatch.castlingDirection;

    const chessBoardList = await GetChessBoards(2, match_id);
    const chessBoard = chessBoardList[0];
    const chessBoardId = chessBoard.id;

    const prevChessBoard = chessBoardList[1];

    const piece = chessBoard.board[rank][tile];

    const statId = await GetPieceStatIdForCandidateMoves(chessBoardId, rank, tile, piece);

    const directions = await GetDirection(statId);

    const candidate_moves = GetMoves(piece, rank, tile, chessBoard.board, prevChessBoard?.board, castleDirection, directions);

    res.status(200).json({
      candidate_moves
    });

  }catch(error){
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
};

const CheckIfIsMyTurn = async (req, res) => {
  try{

    const {auth0_id, match_id, piece} = req.query;

    if (!auth0_id){
      return res.status(400).json({error: "Missing auth0_id body parameter"});
    }
    if(!match_id){
      return res.status(400).json({error: `Missing match_id body parameter`});
    }
    if (!piece){
      return res.status(400).json({error: "Missing `piece` body parameter"});
    }

    const match = await GetMatchById(match_id);
    if(!match){
      return res.status(400).json({error: "Couldnt find the match"});
    }

    const userMatch = await GetUserMatch(match_id, auth0_id);
    if(!userMatch){
      return res.status(400).json({error: "Couldnt find the userMatch"});
    }

    const turn = match.turn_to_play;
    const color_assigned = userMatch.color_assigned;

    console.log(`turn es igual a piece: ${turn}===${piece[0]}`, turn === piece[0]);
    console.log(`color_assigned es igual a piece ${color_assigned}===${piece[0]}`, color_assigned === piece[0]);

    const isMyTurn = turn === piece[0] && color_assigned === piece[0];

    return res.status(200).json({
      result : isMyTurn,
    });

  }catch(error){
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
};

const CheckIfMoveIsInValid = async (req, res) => {
  try{
    let {auth0_id, match_id, origin_x, origin_y, destiny_x, destiny_y, candidate_moves} = req.body;

    origin_x = Number(origin_x);
    origin_y = Number(origin_y);
    destiny_x = Number(destiny_x);
    destiny_y = Number(destiny_y);


    if (!auth0_id) {
      return res.status(400).json({ error: "Missing auth0_id" });
    }

    if (!match_id) {
      return res.status(400).json({ error: "Missing match_id" });
    }

    // Para coordenadas, chequea si son números y no NaN
    if (origin_x === undefined || origin_x === null || isNaN(origin_x)) {
      return res.status(400).json({ error: "Missing or invalid origin_x" });
    }

    if (origin_y === undefined || origin_y === null || isNaN(origin_y)) {
      return res.status(400).json({ error: "Missing or invalid origin_y" });
    }

    if (destiny_x === undefined || destiny_x === null || isNaN(destiny_x)) {
      return res.status(400).json({ error: "Missing or invalid destiny_x" });
    }

    if (destiny_y === undefined || destiny_y === null || isNaN(destiny_y)) {
      return res.status(400).json({ error: "Missing or invalid destiny_y" });
    }

    if (!candidate_moves) {
      return res.status(400).json({ error: "Missing candidate_moves" });
    }

    const match = await GetMatchById(match_id);
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    const userMatch = await GetUserMatch(match_id, auth0_id);
    if (!userMatch) {
      return res.status(404).json({ error: "Couldnt get UserMatch" });
    }

    const lastChessBoards = await GetChessBoards(2, match_id);
    if (!lastChessBoards) {
      return res.status(400).json({ error: "Couldnt get the last 2 boards of the match" });
    }

    const actualChessBoard = lastChessBoards[0];
    if (!actualChessBoard || !actualChessBoard.board) {
      return res.status(400).json({ error: "Couldnt find actual board" });
    }

    let previousChessBoard;
    if (lastChessBoards.length > 1){
      previousChessBoard = lastChessBoards[1];
    }

    const piece = actualChessBoard.board[origin_x][origin_y];
    if (!piece) {
      return res.status(400).json({ error: "Couldnt find piece" });
    }

    const castleDirection = userMatch.castling_direction;
    const status = match.status;

    const myTurn = piece[0] === match.turn_to_play && piece[0] === userMatch.color_assigned;

    const isInvalidMove = IsNotACandidateMove(candidate_moves, destiny_x, destiny_y) 
    || !myTurn
    || ! await IsKingSafe(previousChessBoard?.board, actualChessBoard.board, piece, origin_x, origin_y, destiny_x, destiny_y, castleDirection, actualChessBoard.id)
    || !["ongoing", "promotion", "", "check"].includes(status);

    return res.status(200).json({
      result: isInvalidMove,
    });

  }catch(error){
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
};

const CheckEnPassant = async (req, res) => {
  try{
    let {piece, match_id, destiny_x, destiny_y} = req.query;

    destiny_x = Number(destiny_x);
    destiny_y = Number(destiny_y);

    if (!piece) {
      return res.status(400).json({ error: "Missing piece" });
    }

    if (!match_id) {
      return res.status(400).json({ error: "Missing match_id" });
    }

    if (destiny_x === undefined || destiny_x === null || isNaN(destiny_x)) {
      return res.status(400).json({ error: "Missing or invalid destiny_x" });
    }

    if (destiny_y === undefined || destiny_y === null || isNaN(destiny_y)) {
      return res.status(400).json({ error: "Missing or invalid destiny_y" });
    }

    const chessboards = await GetChessBoards(1, match_id);
    const chessboard = chessboards[0];
    if (!chessboard){
      return res.status(400).json({error: "Couldnt find chessboard"});
    }

    const board = chessboard.board;

    const EnPassant = piece.endsWith("p") && !board[destiny_x][destiny_y];

    return res.status(200).json({result: EnPassant});

  }catch(error){
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
};

const UpdateMoveList = async (req, res) => {
  try{
    let {matchId, origin_x, origin_y, destiny_x, destiny_y} = req.body;

    origin_x = Number(origin_x);
    origin_y = Number(origin_y);
    destiny_x = Number(destiny_x);
    destiny_y = Number(destiny_y);

    if (!matchId) {
      return res.status(400).json({ error: "Missing matchId" });
    }

    if (origin_x === undefined || origin_x === null || isNaN(origin_x)) {
      return res.status(400).json({ error: "Missing or invalid origin_x" });
    }

    if (origin_y === undefined || origin_y === null || isNaN(origin_y)) {
      return res.status(400).json({ error: "Missing or invalid origin_y" });
    }

    if (destiny_x === undefined || destiny_x === null || isNaN(destiny_x)) {
      return res.status(400).json({ error: "Missing or invalid destiny_x" });
    }

    if (destiny_y === undefined || destiny_y === null || isNaN(destiny_y)) {
      return res.status(400).json({ error: "Missing or invalid destiny_y" });
    }

    const chessBoards = await GetChessBoards(1, matchId);
    const chessBoard = chessBoards[0];
    if (!chessBoard) return res.status(400).json({error: "Couldnt find chessBoard"});

    const board = chessBoard.board;
    const piece = board[origin_x][origin_y];

    const notation = GenerateMoveNotation(board, piece, origin_x, origin_y, destiny_x, destiny_y);
    const moveList = await UpdateMovesList(matchId, notation);
    console.log("moveList actualizado:", JSON.stringify(moveList, null, 2));

    return res.status(200).json({result: notation});

  }catch(error){
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
};

const UpdateBoard = async (req, res) => {
  try{
    let {matchId, auth0_id, origin_x, origin_y, destiny_x, destiny_y, en_passant} = req.body;

    origin_x = Number(origin_x);
    origin_y = Number(origin_y);
    destiny_x = Number(destiny_x);
    destiny_y = Number(destiny_y);

    if (!matchId) {
      return res.status(400).json({ error: "Missing matchId" });
    }

    if (!auth0_id) {
      return res.status(400).json({ error: "Missing auth0_id" });
    }

    if (origin_x === undefined || origin_x === null || isNaN(origin_x)) {
      return res.status(400).json({ error: "Missing or invalid origin_x" });
    }

    if (origin_y === undefined || origin_y === null || isNaN(origin_y)) {
      return res.status(400).json({ error: "Missing or invalid origin_y" });
    }

    if (destiny_x === undefined || destiny_x === null || isNaN(destiny_x)) {
      return res.status(400).json({ error: "Missing or invalid destiny_x" });
    }

    if (destiny_y === undefined || destiny_y === null || isNaN(destiny_y)) {
      return res.status(400).json({ error: "Missing or invalid destiny_y" });
    }

    if (en_passant === null || en_passant === undefined)return res.status(400).json({error: "Missing en_passant"});
    
    const userMatch = await GetUserMatch(matchId, auth0_id);
    if (!userMatch)return res.status(400).json({error: "Couldnt find userMatch"});

    const chessBoards = await GetChessBoards(1, matchId);
    const chessBoard = chessBoards[0];
    if (!chessBoard) return res.status(400).json({error: "Couldnt find chessBoard"});

    const board = chessBoard.board;
    const pieceString = board[origin_x][origin_y];

    //si ocurrio en passant, hacemos el cambio
    if (en_passant && origin_y != destiny_y){
      await ChangeStatusToCapturedPiece(chessBoard.id, origin_x, destiny_y, board[origin_x][destiny_y]);
      board[origin_x][destiny_y] = "";
    }

    //perform castling
    if (pieceString[1] === "k" && Math.abs(origin_y-destiny_y) >= 2){

      if (destiny_y===2){
        await UpdatePiecePosition(chessBoard.id, destiny_x, 0, destiny_x, 3, board[destiny_x][0]);
        board[destiny_x][3] = board[destiny_x][0];
        board[destiny_x][0] = "";
      }

      else if (destiny_y === 6){
        await UpdatePiecePosition(chessBoard.id, destiny_x, 7, destiny_x, 5, board[destiny_x][7]);
        board[destiny_x][5] = board[destiny_x][7];
        board[destiny_x][7] = "";
      }
    }

    //update castling status
    if (pieceString[1] === "k" || pieceString[1] === "r"){
      const castlingState = GetCastlingState(pieceString, destiny_x, destiny_y, userMatch.castling_direction);
      console.log("Este es el castlingState", castlingState);
      await UpdateCastlingDirection(matchId, auth0_id, castlingState);
    }

    //se actualiza status de la pieza capturada
    if (board[destiny_x][destiny_y]){
      await ChangeStatusToCapturedPiece(chessBoard.id, destiny_x, destiny_y, board[destiny_x][destiny_y]);
    }

    //se actualiza todo lo de la pieza que se movio
    await UpdatePiecePosition(chessBoard.id, origin_x, origin_y, destiny_x, destiny_y, board[origin_x][origin_y]);
    board[origin_x][origin_y] = "";
    board[destiny_x][destiny_y] = pieceString;

    //se crea un nuevo tablero
    const newChessBoard = await CreateUpdatedChessBoard(matchId, board);
    if (!newChessBoard) return res.status(400).json({error: "Couldt create new board at ChessBoard"});
    const newBoard = newChessBoard.board;

    //creamos las piezas acordes con las stats
    let pieces = [];
    let stats = [];

    for (let i=0; i<newChessBoard.board.length; i++){
      for (let j=0; j<newChessBoard.board[i].length; j++){
        if (newChessBoard.board[i][j]){

          const stat = await CreateStat(newChessBoard.board[i][j]);
          if (!stat){ 
            throw new Error(`Couldnt create match, please try again; Error ocurred at creating stat`);
          }

          const piece = await CreatePiece(stat.id, newChessBoard.id, newChessBoard.board[i][j], i, j);
          if (!piece){ 
            throw new Error(`Couldnt create match, please try again; Error ocurred at creating piece`);
          }

          pieces = [...pieces, piece];
          stats = [...stats, stat];
        }
      }
    }

    //se actualiza el turn_to_play
    await UpdateTurnToPlay(matchId);

    // Enviamos el nuevo tablero a todos los clientes Websocket conectados a la partida 
    const matchClients = req.app.locals.matchClients;
    if (matchClients && matchClients.has(matchId)) {
      for (const client of matchClients.get(matchId)) {
        if (client.readyState === 1) { 
          client.send(JSON.stringify({ type: "boardUpdated", board: newBoard }));
          // Agrega este log:
          console.log(`[WebSocket] Enviado boardUpdated a cliente para matchId=${matchId}`);
        }
      }
    }


    return res.status(200).json({result: newBoard});

  }catch(error){
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
};

const UpdateStatus = async (req, res) => {
  try{
    let {auth0_id, match_id, destiny_x, destiny_y} = req.body;

    destiny_x = Number(destiny_x);
    destiny_y = Number(destiny_y);

    if (!auth0_id) {
      return res.status(400).json({ error: "Missing auth0_id" });
    }

    if (!match_id) {
      return res.status(400).json({ error: "Missing match_id" });
    }

    if (destiny_x === undefined || destiny_x === null || isNaN(destiny_x)) {
      return res.status(400).json({ error: "Missing or invalid destiny_x" });
    }

    if (destiny_y === undefined || destiny_y === null || isNaN(destiny_y)) {
      return res.status(400).json({ error: "Missing or invalid destiny_y" });
    }

    const userMatch = await GetUserMatch(match_id, auth0_id);
    if (!userMatch) return res.status(400).json({error: "Couldnt find userMatch"});

    const chessBoardList = await GetChessBoards(2, match_id);
    if (!chessBoardList) return res.status(400).json({error: "Couldnt find chessBoardList"});

    const opponentUserMatch = await GetOpponent(auth0_id, match_id);
    if (!opponentUserMatch) {
      //return res.status(400).json({error: 'Couldnt find opponent'})
      console.log("No se unio el rival todavia");
    };
    //Si no hay opponent, es pq todavia no se unio nadie para jugar


    const prevChessBoard = chessBoardList[1];
    const chessBoard = chessBoardList[0];

    const prevBoard = prevChessBoard.board;
    const board = chessBoard.board;
    
    const pieceString = board[destiny_x][destiny_y]; 
    const castling_enemy_direction = opponentUserMatch?.castling_direction || "both";

    const status = await StatusUpdate(prevBoard, board, pieceString, destiny_x, castling_enemy_direction, chessBoard.id);

    await UpdateMatchStatus(match_id, status);

    return res.status(200).json({result: status});

  }catch(error){
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
};

const UpdateStatusDirectly = async (req, res) => {
  try{
    const {status, match_id} = req.body;

    if (!match_id || !status) return res.status(400).json({error: "Missing body parameters"});

    await UpdateMatchStatus(match_id, status);

    return res.status(200).json({message:"OK"});

  }catch(error){
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
};

const UpdateBoardDirectly = async (req, res) => {
  try{
    const {newPosition, match_id} = req.body;

    if (!newPosition || !match_id) return res.status(400).json({error: "Missing body parameters"});

    const newChessBoard = await CreateUpdatedChessBoard(match_id, newPosition);
    if (!newChessBoard) return res.status(400).json({error: "Couldt create new board at ChessBoard"});
    const newBoard = newChessBoard.board;

    //creamos las piezas acordes con las stats
    let pieces = [];
    let stats = [];

    for (let i=0; i<newChessBoard.board.length; i++){
      for (let j=0; j<newChessBoard.board[i].length; j++){
        if (newChessBoard.board[i][j]){

          const stat = await CreateStat(newChessBoard.board[i][j]);
          if (!stat){ 
            throw new Error(`Couldnt create match, please try again; Error ocurred at creating stat`);
          }

          const piece = await CreatePiece(stat.id, newChessBoard.id, newChessBoard.board[i][j], i, j);
          if (!piece){ 
            throw new Error(`Couldnt create match, please try again; Error ocurred at creating piece`);
          }

          pieces = [...pieces, piece];
          stats = [...stats, stat];
        }
      }
    }

    return res.status(200).json({message:"OK"});

  }catch(error){
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
};

const SetPromotionBoxController = async(req, res) => {
  try{
    let {match_id, auth0_id, x, y} = req.body;

    x = Number(x);
    y = Number(y);

    if (!match_id) {
      return res.status(400).json({ error: "match_id is required" });
    }

    if (!auth0_id) {
      return res.status(400).json({ error: "auth0_id is required" });
    }

    if (isNaN(x)) {
      return res.status(400).json({ error: "x must be a valid number" });
    }

    if (isNaN(y)) {
      return res.status(400).json({ error: "y must be a valid number" });
    }

    await SetPromotionBox(match_id, auth0_id, x, y);

    res.status(200).json({ message: "OK" });

  }catch(error){
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
};

const GetPromotionBox = async (req, res) => {
  try{
    const {match_id, auth0_id} = req.query;

    if (!match_id) {
      return res.status(400).json({ error: "Missing match_id" });
    }

    if (!auth0_id) {
      return res.status(400).json({ error: "Missing auth0_id" });
    }

    const userMatch = await GetUserMatch(match_id, auth0_id);
    if(!userMatch){
      return res.status(400).json({error: "Couldnt find the userMatch"});
    }

    res.status(200).json({
      result: userMatch.promotion_square,
    });

  }catch(error){
    return res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
};

const DeleteMatchController = async (req, res) => {
  try{
    const {match_id} = req.params;

    if (!match_id) {
      return res.status(400).json({ error: "Missing match_id" });
    }

    const result = await DeleteMatch(match_id);
    if (!result) {
      return res.status(404).json({ error: "Match not found or could not be deleted" });
    }

    res.status(200).json({ message: "Match deleted successfully" });

  }catch(error){
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
};

module.exports = {
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
  DeleteMatchController,
};
