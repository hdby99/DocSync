import Chat from "../models/chat";

export const getChatsForDocument = async (documentId: string) => {
  try {
    return await Chat.find({ documentId }).sort({ createdAt: 1 });
  } catch (error) {
    throw new Error("Error fetching chats for the document.");
  }
};

export const saveChat = async (
  documentId: string,
  userId: string,
  message: string
) => {
  try {
    const chat = new Chat({ documentId, userId, message });
    return await chat.save();
  } catch (error) {
    throw new Error("Error saving chat message.");
  }
};
