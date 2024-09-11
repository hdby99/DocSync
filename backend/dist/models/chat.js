"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Define the Chat schema
const ChatSchema = new mongoose_1.default.Schema({
    documentId: { type: String, required: true, ref: "Document" }, // Reference to the Document model
    userId: { type: String, required: true, ref: "User" }, // Reference to the User model
    userName: { type: String },
    message: { type: String, required: true }, // The message text
    timestamp: { type: Date, default: Date.now }, // Automatically set to the current time
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt
});
// Create and export the Chat model
const Chat = mongoose_1.default.model("Chat", ChatSchema);
exports.default = Chat;
