import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import mongoose from "mongoose";
import authRoutes from "./route/authRoutes";

import cors from "cors";
import {
  findOrCreateDocument,
  saveDocument,
  getCollaborators,
  addCollaborator,
  removeCollaborator,
  updateCollaboratorStatus,
  updateDocumentTitle,
} from "./utility/documentUtility";
import {
  addUserToRedis,
  removeUserFromRedis,
  getDocumentUsersFromRedis,
} from "./utility/redisUtility";
import documentRouter from "./route/getDocumentRoutes";
import Chat from "./models/chat";
import User from "./models/User";
import userRouter from "./route/userRouter";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

require("dotenv").config();

const app = express();
const httpServer = createServer(app);

const allowedOrigins = process.env.FRONTEND_URL || "http://localhost:3000";

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
  },
});

const pubClient = createClient({ url: process.env.REDIS_URL }); // Redis URL from Render
const subClient = pubClient.duplicate();

pubClient.on("error", (err) => console.error("Redis Client Error", err));

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
  console.log("Redis adapter initialized for Socket.IO");
});

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins, // Allow both the Vercel frontend and localhost in development
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true, // Allow cookies/authentication headers to be passed
    optionsSuccessStatus: 204,
  })
);

app.options("*", cors());

app.use("/auth", authRoutes);
app.use("/getDocuments", documentRouter);
app.use("/user", userRouter);

// MongoDB connection
// mongoose
//   .connect("mongodb://127.0.0.1:27017/yourDB")
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("MongoDB connection error:", err));

mongoose
  .connect(`${process.env.MONGO_URI}`)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Socket.IO connection
io.on("connection", (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("get-document", async (documentId: string, userId: string) => {
    try {
      const document = await findOrCreateDocument(documentId);
      await socket.join(documentId);
      socket.data.documentId = documentId;
      socket.data.userId = userId;

      // Add user to Redis (real-time tracking)
      await addUserToRedis(documentId, userId, socket.id);

      // Add user to document collaborators
      console.log("userId is ", userId);
      console.log("rooms in socket", socket.rooms);
      console.log("document created is", document);

      await addCollaborator(documentId, userId);

      // Fetch all users currently connected to the document from Redis
      const documentUsers = await getDocumentUsersFromRedis(documentId);

      // Broadcast the updated user list to all clients in the room
      io.to(documentId).emit("update-users", documentUsers);

      // Send the document content to the user who joined
      socket.emit("load-document", document.data, document.title);
      console.log("collaborators are", await getCollaborators(documentId));

      // const chats = await Chat.find({ documentId }).sort({ createdAt: 1 });
      // socket.emit("load-chats", chats);
    } catch (err) {
      console.error("Error in get-document:", err);
      socket.emit("error", { msg: "Failed to load the document." });
    }
  });

  socket.on("update-title", async (documentId: string, newTitle: string) => {
    try {
      const updatedDocument = await updateDocumentTitle(documentId, newTitle);
      io.to(documentId).emit("title-updated", updatedDocument.title);
    } catch (err) {
      console.error("Error updating title:", err);
      socket.emit("error", { msg: "Failed to update the document title." });
    }
  });

  socket.on("send-change", (delta: any, documentId: string) => {
    // const documentId = socket.data.documentId; // Get the documentId from socket.data

    console.log("Emitting changes to room", documentId, "with delta", delta); // Debugging logs

    if (documentId) {
      // Emit the changes to all users in the room except the sender
      socket.broadcast.to(documentId).emit("receive-change", delta);
    }
  });

  socket.on("load-chat", async (documentId: string) => {
    try {
      const chats = await Chat.find({ documentId }).sort({ createdAt: 1 });
      socket.emit("load-chats", chats);
    } catch (err) {
      console.error("Error loading chats:", err);
      socket.emit("error", { msg: "Failed to load chat messages." });
    }
  });

  socket.on(
    "send-chat",
    async ({
      documentId,
      userId,
      message,
    }: {
      documentId: string;
      userId: string;
      message: string;
    }) => {
      try {
        const user = await User.findById(userId).select("name");
        const chat = await Chat.create({
          documentId,
          userId,
          userName: user?.name,
          message,
        });
        console.log(
          `${message} sent from ${userId} to all users in ${documentId}`
        );
        io.to(documentId).emit("receive-chat", chat);
      } catch (err) {
        console.error("Error sending chat:", err);
        socket.emit("error", { msg: "Failed to send the message." });
      }
    }
  );

  socket.on(
    "send-cursor",
    async ({
      userId,
      range,
      documentId,
    }: {
      userId: string;
      range: any;
      documentId: string;
    }) => {
      if (documentId) {
        console.log("sending cursor details to", documentId);
        socket.broadcast
          .to(documentId)
          .emit("receive-cursor", { userId, range });
      }
    }
  );

  socket.on("save-document", async (documentId: string, data: any) => {
    try {
      await saveDocument(documentId, data);
    } catch (err) {
      console.error("Error saving document:", err);
      socket.emit("error", { msg: "Failed to save the document." });
    }
  });

  socket.on("disconnect", async () => {
    const documentId = socket.data.documentId;
    const userId = socket.data.userId;

    console.log(`User disconnected: ${socket.id}`);
    console.log(`Room while disconnecting is ${documentId}`);

    if (documentId && userId) {
      // Update the collaborator's connection status to 'false' instead of removing them
      await updateCollaboratorStatus(documentId, userId, false);
      await removeUserFromRedis(documentId, userId);

      // Fetch the updated list of users after the disconnection
      const updatedUsers = await getDocumentUsersFromRedis(documentId);

      console.log("collaborators are", await getCollaborators(documentId));

      // Notify other users in the room of the disconnection
      io.to(documentId).emit("update-users", updatedUsers);
      io.to(documentId).emit("user-disconnect", userId);
    }
  });
});

// Start the server
const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
