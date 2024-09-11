import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface IChat extends MongooseDocument {
  documentId: string; // ID of the document this chat is linked to
  userId: string; // ID of the user who sent the message
  UserName: string;
  message: string; // The chat message
  timestamp: Date; // When the message was sent
}

// Define the Chat schema
const ChatSchema: Schema = new mongoose.Schema(
  {
    documentId: { type: String, required: true, ref: "Document" }, // Reference to the Document model
    userId: { type: String, required: true, ref: "User" }, // Reference to the User model
    userName: { type: String },
    message: { type: String, required: true }, // The message text
    timestamp: { type: Date, default: Date.now }, // Automatically set to the current time
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Create and export the Chat model
const Chat = mongoose.model<IChat>("Chat", ChatSchema);
export default Chat;
