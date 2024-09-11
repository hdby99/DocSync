import express, { Request, Response } from "express";
import Document from "../models/document";
import authMiddleware from "../middlewares/authMiddleware";
import { updateDocumentTitle } from "../utility/documentUtility";

const documentRouter = express.Router();

documentRouter.post(
  "/",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ msg: "User ID is required" });
    }

    try {
      const documents = await Document.find({
        "collaborators.userId": userId,
      }).sort({ updatedAt: -1 });

      if (documents.length === 0) {
        return res
          .status(404)
          .json({ msg: "No documents found for this user" });
      }
      res.json({ documents });
    } catch (err) {
      console.error("Error fetching documents:", err);
      res.status(500).send("Server Error");
    }
  }
);

export default documentRouter;
