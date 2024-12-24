"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const mongoose_1 = __importDefault(require("mongoose"));
const authRoutes_1 = __importDefault(require("./route/authRoutes"));
const cors_1 = __importDefault(require("cors"));
const documentUtility_1 = require("./utility/documentUtility");
const redisUtility_1 = require("./utility/redisUtility");
const getDocumentRoutes_1 = __importDefault(require("./route/getDocumentRoutes"));
const chat_1 = __importDefault(require("./models/chat"));
const User_1 = __importDefault(require("./models/User"));
const userRouter_1 = __importDefault(require("./route/userRouter"));
const redis_adapter_1 = require("@socket.io/redis-adapter");
const redis_1 = require("redis");
require("dotenv").config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// const allowedOrigins = process.env.FRONTEND_URL || "http://localhost:3000";
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL,
    },
});
const pubClient = (0, redis_1.createClient)({ url: process.env.REDIS_URL }); // Redis URL from Render
const subClient = pubClient.duplicate();
pubClient.on("error", (err) => console.error("Redis Client Error", err));
Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    io.adapter((0, redis_adapter_1.createAdapter)(pubClient, subClient));
    console.log("Redis adapter initialized for Socket.IO");
});
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "*", // Allow both the Vercel frontend and localhost in development
    allowedHeaders: "Content-Type, Authorization",
    credentials: true, // Allow cookies/authentication headers to be passed
    optionsSuccessStatus: 204,
}));
app.use((req, res, next) => {
    console.log("Request Origin:", req.headers.origin);
    next();
});
app.options("*", (0, cors_1.default)());
app.use("/auth", authRoutes_1.default);
app.use("/getDocuments", getDocumentRoutes_1.default);
app.use("/user", userRouter_1.default);
// MongoDB connection
// mongoose
//   .connect("mongodb://127.0.0.1:27017/yourDB")
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("MongoDB connection error:", err));
mongoose_1.default
    .connect(`${process.env.MONGO_URI}`)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));
// Socket.IO connection
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.on("get-document", (documentId, userId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const document = yield (0, documentUtility_1.findOrCreateDocument)(documentId);
            yield socket.join(documentId);
            socket.data.documentId = documentId;
            socket.data.userId = userId;
            // Add user to Redis (real-time tracking)
            yield (0, redisUtility_1.addUserToRedis)(documentId, userId, socket.id);
            // Add user to document collaborators
            console.log("userId is ", userId);
            console.log("rooms in socket", socket.rooms);
            console.log("document created is", document);
            yield (0, documentUtility_1.addCollaborator)(documentId, userId);
            // Fetch all users currently connected to the document from Redis
            const documentUsers = yield (0, redisUtility_1.getDocumentUsersFromRedis)(documentId);
            // Broadcast the updated user list to all clients in the room
            io.to(documentId).emit("update-users", documentUsers);
            // Send the document content to the user who joined
            socket.emit("load-document", document.data, document.title);
            console.log("Document title is", document.title);
            console.log("document data is", document.data);
            console.log("collaborators are", yield (0, documentUtility_1.getCollaborators)(documentId));
            // const chats = await Chat.find({ documentId }).sort({ createdAt: 1 });
            // socket.emit("load-chats", chats);
        }
        catch (err) {
            console.error("Error in get-document:", err);
            socket.emit("error", { msg: "Failed to load the document." });
        }
    }));
    socket.on("update-title", (documentId, newTitle) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const updatedDocument = yield (0, documentUtility_1.updateDocumentTitle)(documentId, newTitle);
            io.to(documentId).emit("title-updated", updatedDocument.title);
        }
        catch (err) {
            console.error("Error updating title:", err);
            socket.emit("error", { msg: "Failed to update the document title." });
        }
    }));
    socket.on("send-change", (delta, documentId) => {
        // const documentId = socket.data.documentId; // Get the documentId from socket.data
        console.log("Emitting changes to room", documentId, "with delta", delta); // Debugging logs
        if (documentId) {
            // Emit the changes to all users in the room except the sender
            socket.broadcast.to(documentId).emit("receive-change", delta);
        }
    });
    socket.on("load-chat", (documentId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const chats = yield chat_1.default.find({ documentId }).sort({ createdAt: 1 });
            socket.emit("load-chats", chats);
        }
        catch (err) {
            console.error("Error loading chats:", err);
            socket.emit("error", { msg: "Failed to load chat messages." });
        }
    }));
    socket.on("send-chat", (_a) => __awaiter(void 0, [_a], void 0, function* ({ documentId, userId, message, }) {
        try {
            const user = yield User_1.default.findById(userId).select("name");
            const chat = yield chat_1.default.create({
                documentId,
                userId,
                userName: user === null || user === void 0 ? void 0 : user.name,
                message,
            });
            console.log(`${message} sent from ${userId} to all users in ${documentId}`);
            io.to(documentId).emit("receive-chat", chat);
        }
        catch (err) {
            console.error("Error sending chat:", err);
            socket.emit("error", { msg: "Failed to send the message." });
        }
    }));
    socket.on("send-cursor", (_b) => __awaiter(void 0, [_b], void 0, function* ({ userId, range, documentId, }) {
        if (documentId) {
            console.log("sending cursor details to", documentId);
            socket.broadcast
                .to(documentId)
                .emit("receive-cursor", { userId, range });
        }
    }));
    socket.on("save-document", (documentId, data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield (0, documentUtility_1.saveDocument)(documentId, data);
        }
        catch (err) {
            console.error("Error saving document:", err);
            socket.emit("error", { msg: "Failed to save the document." });
        }
    }));
    socket.on("disconnect", () => __awaiter(void 0, void 0, void 0, function* () {
        const documentId = socket.data.documentId;
        const userId = socket.data.userId;
        console.log(`User disconnected: ${socket.id}`);
        console.log(`Room while disconnecting is ${documentId}`);
        if (documentId && userId) {
            // Update the collaborator's connection status to 'false' instead of removing them
            yield (0, documentUtility_1.updateCollaboratorStatus)(documentId, userId, false);
            yield (0, redisUtility_1.removeUserFromRedis)(documentId, userId);
            // Fetch the updated list of users after the disconnection
            const updatedUsers = yield (0, redisUtility_1.getDocumentUsersFromRedis)(documentId);
            console.log("collaborators are", yield (0, documentUtility_1.getCollaborators)(documentId));
            // Notify other users in the room of the disconnection
            io.to(documentId).emit("update-users", updatedUsers);
            io.to(documentId).emit("user-disconnect", userId);
        }
    }));
});
// Start the server
const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
