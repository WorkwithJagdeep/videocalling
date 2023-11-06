const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

app.use(cors());
app.options("*", cors());

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, user) => {
    console.log(userId);
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId, user);
    socket.on("create-message", (msg, user) => {
      io.to(roomId).emit("get-msg", msg, user);
    });
    socket.on("messagesended", (sended) => {
      socket.to(roomId).emit("got-msg", sended);
    });
    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
    });
    socket.on("mic-off", (micoff) => {
      socket.to(roomId).emit("micoff", micoff);
    });
  });
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log("server running on", port);
});
