require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: process.env.FRONTEND_URL } });

const authRouter = require("./router/authRouter");
const { Message } = require("./models");
const { User } = require("./models");
const jwt = require("jsonwebtoken");

app.use(cors());
app.use(express.json());
app.use("/", authRouter);

const onlineUsers = new Set();

io.use((socket, next) => {
  const token = socket.handshake.query.token;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err) {
        return next(new Error("Auth error"));
      }

      socket.user = user;

      next();
    });
  }
});

io.on("connection", (socket) => {
  console.log(`user ${socket.user.name} connected. SocketID: ${socket.id}`);

  const userToken = socket.handshake.query.token;

  io.emit("connection", { userToken, user: socket.user });

  socket.on("message", async (message) => {
    io.emit("message", message);

    const newMessage = new Message(message);

    // await newMessage.save();
  });

  socket.on("messages", async () => {
    const messages = await Message.find();

    io.emit("messages", messages);
  });

  socket.on("onlineUsers", async () => {
    onlineUsers.add(socket.user._id);

    io.emit("onlineUsers", [...onlineUsers]);
  });

  socket.on("allUsers", async () => {
    const allUsers = await User.find();

    io.emit("allUsers", allUsers);
  });

  socket.on("mute", async (userId) => {
    const { isMuted } = await User.findById(userId);

    const user = await User.findByIdAndUpdate(
      userId,
      { isMuted: !isMuted },
      { new: true }
    );

    io.emit("mute", user);
  });

  socket.on("ban", async (userId) => {
    const { isBanned } = await User.findById(userId);

    const user = await User.findByIdAndUpdate(
      userId,
      { isBanned: !isBanned },
      { new: true }
    );

    io.emit("ban", user);
  });

  socket.on("disconnect", () => {
    console.log(
      `user ${socket.user.name} disconnected". SocketID: ${socket.id}`
    );

    onlineUsers.delete(socket.user._id);

    io.emit("onlineUsers", [...onlineUsers]);
  });
});

const PORT = process.env.PORT || 3333;

(async () => {
  try {
    await mongoose.connect(process.env.DB_URL);

    server.listen(PORT, () => console.log(`Listen on *: ${PORT}`));
  } catch (error) {
    console.log(error.message);
  }
})();
