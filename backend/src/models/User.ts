import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface IUser extends MongooseDocument {
  name: string;
  email: string;
  password: string;
  documents: mongoose.Types.ObjectId[]; // Array of document IDs the user has worked on
  createdAt: Date;
}

// Define the User schema
const UserSchema: Schema = new mongoose.Schema({
  name: { type: String, required: true }, // User name
  email: { type: String, required: true, unique: true }, // User email (unique)
  password: { type: String, required: true }, // User password (hashed)
  documents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document", // Reference to the Document model
    },
  ], // Documents the user has worked on
  createdAt: { type: Date, default: Date.now }, // Timestamp when the user was created
});

// Create the User model
const User = mongoose.model<IUser>("User", UserSchema);

export default User;
