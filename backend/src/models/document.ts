import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

// Define the Document interface
export interface IDocument extends MongooseDocument {
  _id: string; // Document ID
  title: string;
  data: any; // Quill Delta data
  collaborators: {
    userId: mongoose.Types.ObjectId; // Reference to the User
    connected: boolean; // Whether the user is currently connected
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Define the Document schema
const DocumentSchema: Schema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Document ID
    title: { type: String, default: "Untitled Document" },
    data: { type: Schema.Types.Mixed, required: true, default: {} }, // Quill Delta content
    collaborators: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        }, // Reference to User model
        connected: { type: Boolean, default: false }, // Tracks connection status
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create the Document model
const Document = mongoose.model<IDocument>("Document", DocumentSchema);

export default Document;
