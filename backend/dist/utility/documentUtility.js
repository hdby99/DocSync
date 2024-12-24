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
exports.updateDocumentTitle = exports.getCollaborators = exports.saveDocument = exports.updateCollaboratorStatus = exports.removeCollaborator = exports.addCollaborator = exports.findOrCreateDocument = void 0;
const document_1 = __importDefault(require("../models/document"));
const mongoose_1 = __importDefault(require("mongoose"));
// Find or create a document in MongoDB
const findOrCreateDocument = (documentId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const document = yield document_1.default.findById(documentId);
        console.log("Document fetched/created:", document);
        if (document)
            return document;
        // Create a new document if it doesn't exist
        return yield document_1.default.create({
            _id: documentId,
            data: { ops: [] }, // Empty Quill Delta content by default
            collaborators: [],
        });
    }
    catch (error) {
        throw new Error("Error finding or creating the document");
    }
});
exports.findOrCreateDocument = findOrCreateDocument;
// Add a collaborator to a document
const addCollaborator = (documentId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Ensure userId is a valid ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            throw new Error(`Invalid userId: ${userId}`);
        }
        // Log the input
        console.log(` Adding collaborator. documentId: ${documentId}, userId: ${userId}`);
        // Fetch the document first to check if the collaborator already exists
        const document = yield document_1.default.findById(documentId);
        if (!document) {
            throw new Error(`Document with id ${documentId} not found`);
        }
        // Check if the collaborator is already part of the document
        const existingCollaborator = document.collaborators.find((collaborator) => collaborator.userId.toString() === userId);
        if (existingCollaborator) {
            console.log(`      User ${userId} is already a collaborator on document ${documentId}`);
            // Optionally update the connection status
            existingCollaborator.connected = true;
        }
        else {
            // Add new collaborator
            document.collaborators.push({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                connected: true,
            });
        }
        // Save the updated document
        yield document.save();
        // Log success
        console.log(`Collaborator added successfully to document ${documentId}`);
    }
    catch (error) {
        console.error("Error adding collaborator to the document:", error.message);
        throw new Error("Error adding collaborator to the document");
    }
});
exports.addCollaborator = addCollaborator;
// Remove a collaborator from a document
const removeCollaborator = (documentId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield document_1.default.findByIdAndUpdate(documentId, {
            $pull: {
                collaborators: { userId: new mongoose_1.default.Types.ObjectId(userId) },
            },
        }, { new: true });
    }
    catch (error) {
        throw new Error("Error removing collaborator from the document");
    }
});
exports.removeCollaborator = removeCollaborator;
// Update a collaborator's connection status (connected/disconnected)
const updateCollaboratorStatus = (documentId, userId, connected) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield document_1.default.updateOne({
            _id: documentId,
            "collaborators.userId": new mongoose_1.default.Types.ObjectId(userId),
        }, { $set: { "collaborators.$.connected": connected } });
    }
    catch (error) {
        throw new Error("Error updating collaborator status");
    }
});
exports.updateCollaboratorStatus = updateCollaboratorStatus;
// Save document data to MongoDB
const saveDocument = (documentId, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield document_1.default.findByIdAndUpdate(documentId, { data }, { new: true });
    }
    catch (error) {
        throw new Error("Error saving document data");
    }
});
exports.saveDocument = saveDocument;
// Get the collaborators of a document
const getCollaborators = (documentId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const document = yield document_1.default.findById(documentId)
            .populate({
            path: "collaborators.userId", // The path to the field to populate
            select: "name email", // Select fields to return from the User model
        })
            .select("collaborators"); // Select only the collaborators field
        if (!document) {
            throw new Error("Document not found");
        }
        console.log("document before get collab is returned", document);
        return document.collaborators;
    }
    catch (error) {
        throw new Error("Error fetching collaborators for the document");
    }
});
exports.getCollaborators = getCollaborators;
// Update the title of a document
const updateDocumentTitle = (documentId, newTitle) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find and update the document's title
        const updatedDocument = yield document_1.default.findByIdAndUpdate(documentId, { title: newTitle || "Untitled Document" }, // Fallback to "Untitled Document" if no title is provided
        { new: true } // Return the updated document
        );
        if (!updatedDocument) {
            throw new Error(`Document with id ${documentId} not found`);
        }
        console.log(`Document ${documentId} title updated to: ${newTitle}`);
        return updatedDocument;
    }
    catch (error) {
        console.error("Error updating document title:", error.message);
        throw new Error("Error updating document title");
    }
});
exports.updateDocumentTitle = updateDocumentTitle;
