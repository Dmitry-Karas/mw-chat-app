import "dotenv/config";
import "reflect-metadata";
import cors from "cors";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";
import { Server, Socket } from "socket.io";
import { createConnection } from "typeorm";

// import { authRouter } from "./router/authRouter";
import { Message, User } from "./models";

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

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.FRONTEND_URL } });
const PORT = process.env.PORT || 3333;
const liveSockets: Map<string, ISocket> = io.sockets.sockets;

(async () => {
  try {
    const connection = await createConnection({
      type: "mysql",
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      username: process.env.MYSQL_USER,
      database: process.env.MYSQL_DB,
      password: process.env.MYSQL_PASSWORD,
      entities: [User, Message],
      synchronize: true,
    });

    const { authRouter } = await import("./router/authRouter");
    const userRepo = connection.getRepository(User);
    const messageRepo = connection.getRepository(Message);

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
          const user: IUser = await userRepo.findOne({
            _id: connectedUser?._id,
          });

          if (!user) {
            return next(new Error(`User ${connectedUser?.name} not found`));
          }

          if (user.isBanned) {
            return next(new Error(`User ${connectedUser?.name} is banned`));
          }

          user.color = `#${Math.random().toString(14).substr(-6)}`;
          socket.user = user;

          const lastMessage = await messageRepo.findOne(
            {
              userId: socket.user._id,
            },
            { order: { createdAt: "DESC" } }
          );

          socket.lastMessage = lastMessage?.createdAt?.getTime();

          liveSockets.forEach((liveSocket) => {
            if (
              liveSocket?.user?._id.toString() === socket?.user?._id.toString()
            ) {
              liveSocket.disconnect();
            }
          });
          next();
        });
      }
    }).on("connection", async (socket: ISocket) => {
      console.log(
        `user ${socket?.user?.name} connected. SocketID: ${socket.id}`
      );

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

      const messages = await messageRepo.find({
        order: {
          createdAt: "DESC",
        },
        take: 10,
      });

      socket.emit("messages", messages.reverse());

      socket.on("message", async (message) => {
        if (socket?.user?.isMuted) {
          return;
        }

        const currentTime = Date.now();
        const diff = Math.round(
          (currentTime - (socket?.lastMessage || 0)) / 1000
        );

        if (diff < 15 || message.body.length > 200) {
          return;
        }

        const newMessage = new Message(message);

        socket.lastMessage = currentTime;

        io.emit("message", await messageRepo.save(newMessage));
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

      socket.emit("allUsers", await userRepo.find());

      socket.on("mute", async (userId) => {
        const user = await userRepo.findOne({ _id: userId });

        liveSockets.forEach(async (socket) => {
          if (!socket.user) {
            return;
          }

          if (socket.user._id.toString() === userId) {
            socket.user.isMuted = !user?.isMuted;

            io.to(socket.id).emit("mute", !user?.isMuted);
            io.emit(
              "onlineUsers",
              [...liveSockets].map((s) => s[1].user)
            );
          }
        });

        await userRepo.update({ _id: userId }, { isMuted: !user?.isMuted });
      });

      socket.on("ban", async (userId) => {
        const user = await userRepo.findOne({ _id: userId });

        liveSockets.forEach(async (socket) => {
          if (!socket.user) {
            return;
          }

          if (socket.user._id.toString() === userId) {
            io.to(socket.id).emit("ban", !user?.isBanned);
          }
        });

        await userRepo.update({ _id: userId }, { isBanned: !user?.isBanned });
      });
    });

    console.log("Database connection successful");

    server.listen(PORT, () => console.log(`Listen on *: ${PORT}`));
  } catch (error: any) {
    console.log(error.message);
  }
})();
