"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Define the User schema
const UserSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true }, // User name
    email: { type: String, required: true, unique: true }, // User email (unique)
    password: { type: String, required: true }, // User password (hashed)
    documents: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Document", // Reference to the Document model
        },
    ], // Documents the user has worked on
    createdAt: { type: Date, default: Date.now }, // Timestamp when the user was created
});
// Create the User model
const User = mongoose_1.default.model("User", UserSchema);
exports.default = User;
