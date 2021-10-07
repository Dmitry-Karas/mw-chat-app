// require("dotenv").config();
// const cors = require("cors");
// const mongoose = require("mongoose");
// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const jwt = require("jsonwebtoken");

// const authRouter = require("./router/authRouter");
// const { Message } = require("./models");
// const { User } = require("./models");

import "dotenv/config";
import cors from "cors";
import mongoose, { Document, ObjectId } from "mongoose";
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";

import { authRouter } from "./router/authRouter";
import { Message, User } from "./models";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.FRONTEND_URL } });
const liveSockets = io.sockets.sockets;
const PORT = process.env.PORT || 3333;

interface IUser {
  _id: string;
  name: string;
  role: string;
  isBanned: boolean;
  isMuted: boolean;
  color?: string;
}

interface ISocket extends Socket {
  user?: IUser;
  lastMessage?: number;
}

app.use(cors());
app.use(express.json());
app.use("/", authRouter);

io.use((socket: ISocket, next) => {
  const token = String(socket.handshake.query.token);
  const secret = String(process.env.JWT_SECRET_KEY);

  if (token) {
    jwt.verify(token, secret, async (err, connectedUser) => {
      if (err) {
        return next(new Error("Auth error"));
      }

      const user = await User.findById(connectedUser?._id);

      if (!user) {
        return next(new Error(`User ${connectedUser?.name} not found`));
      }

      if (user.isBanned) {
        return next(new Error(`User ${connectedUser?.name} is banned`));
      }

      const userObj: IUser = user.toObject();

      userObj.color = `#${Math.random().toString(14).substr(-6)}`;
      socket.user = userObj;

      const lastMessage = await Message.findOne({
        userId: socket.user._id,
      }).sort({ _id: -1 });

      socket.lastMessage = lastMessage?.createdAt?.getTime();

      liveSockets.forEach((liveSocket: ISocket) => {
        if (liveSocket?.user?._id.toString() === socket?.user?._id.toString()) {
          liveSocket.disconnect();
        }
      });
      next();
    });
  }
}).on("connection", async (socket: ISocket) => {
  console.log(`user ${socket?.user?.name} connected. SocketID: ${socket.id}`);

  socket.emit("connection", {
    _id: socket?.user?._id,
    name: socket?.user?.name,
    role: socket?.user?.role,
    isBanned: socket?.user?.isBanned,
    isMuted: socket?.user?.isMuted,
    color: socket?.user?.color,
  });

  io.emit(
    "onlineUsers",
    [...liveSockets].map((s) => s[1].user)
  );

  socket.emit(
    "messages",
    (await Message.find().limit(20).sort({ _id: -1 })).reverse()
  );

  socket.on("message", async (message) => {
    if (socket?.user?.isMuted) {
      return;
    }

    const currentTime = Date.now();
    const diff = Math.round((currentTime - socket.lastMessage) / 1000);

    if (diff < 15 || message.body.length > 200) {
      return;
    }

    const newMessage = new Message(message);

    socket.lastMessage = currentTime;

    io.emit("message", await newMessage.save());
  });

  socket.on("disconnect", () => {
    console.log(
      `user ${socket?.user?.name} disconnected". SocketID: ${socket.id}`
    );

    io.emit(
      "onlineUsers",
      [...liveSockets].map((s) => s[1].user)
    );
  });

  if (socket?.user?.role !== "admin") {
    return;
  }

  socket.emit("allUsers", await User.find());

  socket.on("mute", async (userId) => {
    // liveSockets.forEach(async (socket) => {
    //   if (socket.user._id.toString() === userId) {
    //     socket.user.isMuted = !socket.user.isMuted;
    //   }

    //   io.to(socket.id).emit("mute", socket.user);

    // await User.findByIdAndUpdate(
    //   userId,
    //   { isMuted: !socket.user.isMuted },
    //   { new: true }
    // );
    // });

    const user = await User.findById(userId);

    io.emit(
      "mute",
      await User.findByIdAndUpdate(
        userId,
        { isMuted: !user?.isMuted },
        { new: true }
      )
    );
  });

  socket.on("ban", async (userId) => {
    const user = await User.findById(userId);

    io.emit(
      "ban",
      User.findByIdAndUpdate(
        userId,
        { isBanned: !user?.isBanned },
        { new: true }
      )
    );
  });
});

(async () => {
  const DB_URL = String(process.env.DB_URL);

  try {
    await mongoose.connect(DB_URL);

    console.log("Database connection successful");

    server.listen(PORT, () => console.log(`Listen on *: ${PORT}`));
  } catch (error: any) {
    console.log(error.message);
  }
})();
