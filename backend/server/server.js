// server.js
import http from "http";
import { Server } from "socket.io";
import cluster from "cluster";
import os from "os";
import app from "./app.js";
import connectToDatabase from "./connections/connection.js";

const PORT = process.env.PORT || 8000;
const USE_CLUSTER = process.env.USE_CLUSTER === "true";

const startServer = async () => {
  try {
    await connectToDatabase();
    console.log(`Process ${process.pid} connected to MongoDB`);

    const httpServer = http.createServer(app);

    const io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      }
    });
    const onlineUsers = new Map();
    let onUsers = []
    const activeRooms = new Map();
    io.on("connection", (socket) => {

      socket.on("joinUser", (userId) => {
        socket.join(userId);      // personal room
        console.log("joinUser", userId)
      });
      //join room
      socket.on("joinRoom", ({ roomId, userId }) => {
        socket.join(roomId);

        if (!activeRooms.has(roomId)) {
          activeRooms.set(roomId, new Set());
        }

        activeRooms.get(roomId).add(userId);

        io.to(roomId).emit("roomUsers", {
          roomId,
          users: [...activeRooms.get(roomId)]
        });
      });
      //join room

      //leave room
      socket.on("leaveRoom", ({ roomId, userId }) => {
        activeRooms.get(roomId)?.delete(userId);

        if (activeRooms.get(roomId)?.size === 0) {
          activeRooms.delete(roomId);
        }

        io.to(roomId).emit("roomUsers", {
          roomId,
          users: [...(activeRooms.get(roomId) || [])]
        });

        socket.leave(roomId);
      });
      //leave room


      //Online shows//
      socket.on("online", (userId) => {
        onlineUsers.set(userId, socket.id);
        socket.userId = userId;
        onUsers.push(socket.userId)
        onUsers = [...new Set(onUsers)];
        io.emit("updateStatus", { userId, status: "online", onUsers });
      });
      //Online shows//


      //Typing Case///

      socket.on("typing", ({ roomId, userId }) => {
        socket.to(roomId).emit("typing", { userId });
      });

      socket.on("stopTyping", ({ roomId, userId }) => {
        socket.to(roomId).emit("stopTyping", { userId });
      });
      //Typing Case///
      // Send message
      socket.on("sendMessage", (data) => {
        console.log("Message →", data);
        io.to(data.roomId).emit("receiveMessage", data);
        io.emit("lastMessageUpdate", {
          senderId: data.senderId,
          receiverId: data.receiverId,
          message: data.messageType === "image" ? "📷 Image" : data.message,
          name: data.recieverName,
          seen: false,
          timestamp: new Date(),
          unread:data.unread
        });
        io.emit("newMessageUpdate", {
          senderId: data.senderId,
          receiverId: data.receiverId,
          message: data.message,
          name: data.recieverName,
          timestamp: new Date()
        });
      });

      socket.on("checkPresents", (check) => {
        console.log("comming checkPresents", check)
        socket.to(check.roomId).emit("presents", check)
      })

      socket.on("disconnect", () => {
        for (const [roomId, users] of activeRooms.entries()) {
          if (users.has(socket.userId)) {
            users.delete(socket.userId);
            io.to(roomId).emit("roomUsers", {
              roomId,
              users: [...users]
            });
          }
        }
      });
    });

    // Start server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} (PID: ${process.pid})`);
    });

  } catch (error) {
    console.error("Server start failed", error);
    process.exit(1);
  }
};

if (USE_CLUSTER && cluster.isPrimary) {
  const numCPUs = os.cpus().length;

  console.log(`Primary ${process.pid} running. Forking ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) cluster.fork();

  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  startServer();
}
