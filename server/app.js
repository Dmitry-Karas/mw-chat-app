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
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());
app.use("/", authRouter);

// todo: need this?
const onlineUsers = new Set();

io.use((socket, next) => {
  const token = socket.handshake.query.token;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, user) => {
      if (err) {
        return next(new Error("Auth error"));
      }
      const userFromDb = await User.findById(user._id);

      // todo: check user in db, check ban status

      if (user.isBanned) {
        return;
      }

      user.color = `#${Math.random().toString(14).substr(-6)}`;
      socket.user = userFromDb; // <-- user from db
      socket.token = token;

      next();
    });
  }
}).on("connection", (socket) => {
  console.log(`user ${socket.user.name} connected. SocketID: ${socket.id}`);

  const liveSockets = io.sockets.sockets;
  // todo: move to middleware

  liveSockets.forEach((liveSocket) => {
    if (
      liveSocket &&
      liveSocket.id !== socket.id &&
      liveSocket.user._id === socket.user._id
    ) {
      liveSocket.disconnect();
    }
  });

  // todo: remove

  io.emit("connection", { userToken: socket.token, user: socket.user });

  // todo: do not send user raw data from db to front

  socket.on("message", async (message) => {
    // todo: get user data from socket.user

    // const sender = await User.findById(message.userId);

    if (socket.user.isMuted) {
      return;
    }

    // todo: check length, 15 sec timeout

    const newMessage = new Message(message);
    const savedMessage = await newMessage.save();

    io.emit("message", savedMessage);
  });

  // todo: send on client connect
  socket.on("messages", async () => {
    // todo: get last 20 messages from db (limit)
    const messages = await Message.find();

    socket.emit("messages", messages);
  });

  // todo: send on client connect
  socket.on("onlineUsers", async () => {
    onlineUsers.add(socket.user);

    io.emit("onlineUsers", [...onlineUsers]);
  });

  // todo: send on client connect if user admin
  socket.on("allUsers", async () => {
    const allUsers = await User.find();

    socket.emit("allUsers", allUsers);
  });

  // todo: check for admin
  socket.on("mute", async (userId) => {
    const { isMuted } = await User.findById(userId);
    const user = await User.findByIdAndUpdate(
      userId,
      { isMuted: !isMuted },
      { new: true }
    );

    io.emit("mute", user);
  });

  // todo: check for admin
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

    onlineUsers.delete(socket.user);

    io.emit("onlineUsers", [...onlineUsers]);
  });
});

(async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Database connection successful");

    server.listen(PORT, () => console.log(`Listen on *: ${PORT}`));
  } catch (error) {
    console.log(error.message);
  }
})();
