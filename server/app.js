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

// todo: need this? | NO :)

// const onlineUsers = new Set();
const liveSockets = io.sockets.sockets;

io.use((socket, next) => {
  // const liveSockets = io.sockets.sockets;
  const token = socket.handshake.query.token;

  if (token) {
    jwt.verify(
      token,
      process.env.JWT_SECRET_KEY,
      async (err, connectedUser) => {
        if (err) {
          return next(new Error("Auth error"));
        }

        const user = await User.findById(connectedUser._id);
        // todo: check user in db, check ban status

        if (!user) {
          return next(new Error(`User ${connectedUser.name} not found`));
        }

        if (user.isBanned) {
          return next(new Error(`User ${connectedUser.name} is banned`));
        }

        const userObj = user.toObject();

        userObj.color = `#${Math.random().toString(14).substr(-6)}`;
        socket.user = userObj; // <-- user from db
        socket.token = token;

        const { createdAt } = await Message.findOne({
          userId: message.userId,
        }).sort({ _id: -1 });

        socket.lastMessage = createdAt;

        liveSockets.forEach((liveSocket) => {
          if (
            liveSocket &&
            //liveSocket.id !== socket.id &&
            liveSocket.user._id.toString() === socket.user._id.toString()
          ) {
            liveSocket.disconnect();
          }
        });
        next();
      }
    );
  }
}).on("connection", async (socket) => {
  console.log(`user ${socket.user.name} connected. SocketID: ${socket.id}`);

  // todo: remove

  socket.emit("connection", {
    user: {
      name: socket.user.name,
      id: socket.user.id,
    },
  });

  socket.emit(
    "messages",
    (await Message.find().limit(20).sort({ _id: -1 })).reverse()
  );

  socket.emit(
    "onlineUsers",
    [...liveSockets].map((s) => s[1].user)
  );

  if (socket.user.role === "admin") {
    socket.emit("allUsers", await User.find());
  }

  // todo: do not send user raw data from db to front
  socket.on("message", async (message) => {
    // todo: get user data from socket.user

    if (socket.user.isMuted) {
      return;
    }

    // todo: check length, 15 sec timeout

    // const { createdAt } = await Message.findOne({
    //   userId: message.userId,
    // }).sort({ _id: -1 });

    const createdAt = socket.lastMessage;
    const currentTime = Date.now();

    const lastMessageTime = createdAt.getTime();
    const diff = Math.round((currentTime - lastMessageTime) / 1000);

    if (diff < 15) {
      return;
    }

    const newMessage = new Message(message);
    const savedMessage = await newMessage.save();

    socket.lastMessage = currentTime;

    io.emit("message", savedMessage);
  });

  // todo: send on client connect
  socket.on("messages", async () => {
    // todo: get last 20 messages from db (limit)

    const messages = await (
      await Message.find().limit(20).sort({ _id: -1 })
    ).reverse();

    socket.emit("messages", messages);
  });

  // todo: send on client connect
  socket.on("onlineUsers", async () => {
    io.emit(
      "onlineUsers",
      [...liveSockets].map((s) => s[1].user)
    );
  });

  // todo: send on client connect if user admin
  socket.on("allUsers", async () => {
    if (socket.user.role !== "admin") {
      return;
    }

    const allUsers = await User.find();

    socket.emit("allUsers", allUsers);
  });

  if (socket.user.role !== "admin") {
    return;
  }
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

    io.emit(
      "onlineUsers",
      [...liveSockets].map((s) => s[1].user)
    );
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
