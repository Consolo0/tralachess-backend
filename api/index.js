const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");
const UserRouter = require("./routes/UserRoutes.js");
const sequelize = require("../db/index.js");
const MatchRouter = require("./routes/MatchRoutes.js");
const checkJwt = require("./middleware/auth.js");

const app = express();
const port = 60000;

app.use(cors());
app.use(express.json());
app.use("/users", checkJwt, UserRouter);
app.use("/matches", checkJwt, MatchRouter);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const matchClients = new Map();

wss.on("connection", (ws) => {
  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.type === "join" && data.matchId && data.userAuth0Id) {
        ws.matchId = data.matchId;
        ws.userAuth0Id = data.userAuth0Id;
        if (!matchClients.has(data.matchId)) matchClients.set(data.matchId, new Set());
        matchClients.get(data.matchId).add(ws);

        // Notifica a todos los clientes de la partida la lista actualizada de jugadores
        const players = Array.from(matchClients.get(data.matchId))
          .map(client => client.userAuth0Id)
          .filter(Boolean);
        for (const client of matchClients.get(data.matchId)) {
          if (client.readyState === 1) {
            client.send(JSON.stringify({ type: "playersUpdate", players }));
          }
        }
      }
    } catch (e) {
      console.error("Error parsing message:", e);
      ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
    }
  });

  ws.on("close", () => {
    if (ws.matchId && matchClients.has(ws.matchId)) {
      matchClients.get(ws.matchId).delete(ws);

      // Notifica a los clientes restantes la lista actualizada de jugadores
      const players = Array.from(matchClients.get(ws.matchId))
        .map(client => client.userAuth0Id)
        .filter(Boolean);
      for (const client of matchClients.get(ws.matchId)) {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: "playersUpdate", players }));
        }
      }
    }
  });
});

app.locals.wss = wss;
app.locals.matchClients = matchClients;


sequelize.sync().then(() => {
  server.listen(port, () => {
    console.log(`Succesfull Database Connection`);
    console.log(`Listening on port ${port}`);
  });
}).catch(error => {
  console.error("Error conectandose a la base de datos", error);
});