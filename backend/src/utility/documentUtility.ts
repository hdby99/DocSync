import Document, { IDocument } from "../models/document";
import mongoose from "mongoose";

// Find or create a document in MongoDB
export const findOrCreateDocument = async (documentId: string) => {
  try {
    const document = await Document.findById(documentId);

    console.log("Document fetched/created:", document);

    if (document) return document;

    // Create a new document if it doesn't exist
    return await Document.create({
      _id: documentId,
      data: { ops: [] }, // Empty Quill Delta content by default
      collaborators: [],
    });
  } catch (error) {
    throw new Error("Error finding or creating the document");
  }
};

// Add a collaborator to a document
export const addCollaborator = async (documentId: string, userId: string) => {
  try {
    // Ensure userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error(`Invalid userId: ${userId}`);
    }

    // Log the input
    console.log(
      ` Adding collaborator. documentId: ${documentId}, userId: ${userId}`
    );

    // Fetch the document first to check if the collaborator already exists
    const document = await Document.findById(documentId);
    if (!document) {
      throw new Error(`Document with id ${documentId} not found`);
    }

    // Check if the collaborator is already part of the document
    const existingCollaborator = document.collaborators.find(
      (collaborator) => collaborator.userId.toString() === userId
    );

    if (existingCollaborator) {
      console.log(
        `      User ${userId} is already a collaborator on document ${documentId}`
      );
      // Optionally update the connection status
      existingCollaborator.connected = true;
    } else {
      // Add new collaborator

      document.collaborators.push({
        userId: new mongoose.Types.ObjectId(userId),
        connected: true,
      });
    }

    // Save the updated document
    await document.save();

    // Log success
    console.log(`Collaborator added successfully to document ${documentId}`);
  } catch (error) {
    console.error(
      "Error adding collaborator to the document:",
      (error as Error).message
    );
    throw new Error("Error adding collaborator to the document");
  }
};

// Remove a collaborator from a document
export const removeCollaborator = async (
  documentId: string,
  userId: string
) => {
  try {
    await Document.findByIdAndUpdate(
      documentId,
      {
        $pull: {
          collaborators: { userId: new mongoose.Types.ObjectId(userId) },
        },
      },
      { new: true }
    );
  } catch (error) {
    throw new Error("Error removing collaborator from the document");
  }
};

// Update a collaborator's connection status (connected/disconnected)
export const updateCollaboratorStatus = async (
  documentId: string,
  userId: string,
  connected: boolean
) => {
  try {
    await Document.updateOne(
      {
        _id: documentId,
        "collaborators.userId": new mongoose.Types.ObjectId(userId),
      },
      { $set: { "collaborators.$.connected": connected } }
    );
  } catch (error) {
    throw new Error("Error updating collaborator status");
  }
};

// Save document data to MongoDB
export const saveDocument = async (documentId: string, data: any) => {
  try {
    await Document.findByIdAndUpdate(documentId, { data }, { new: true });
  } catch (error) {
    throw new Error("Error saving document data");
  }
};

// Get the collaborators of a document
export const getCollaborators = async (documentId: string) => {
  try {
    const document = await Document.findById(documentId)
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
  } catch (error) {
    throw new Error("Error fetching collaborators for the document");
  }
};

// Update the title of a document
export const updateDocumentTitle = async (
  documentId: string,
  newTitle: string
) => {
  try {
    // Find and update the document's title
    const updatedDocument = await Document.findByIdAndUpdate(
      documentId,
      { title: newTitle || "Untitled Document" }, // Fallback to "Untitled Document" if no title is provided
      { new: true } // Return the updated document
    );

    if (!updatedDocument) {
      throw new Error(`Document with id ${documentId} not found`);
    }

    console.log(`Document ${documentId} title updated to: ${newTitle}`);
    return updatedDocument;
  } catch (error) {
    console.error("Error updating document title:", (error as Error).message);
    throw new Error("Error updating document title");
  }
};
