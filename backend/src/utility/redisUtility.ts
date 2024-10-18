import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_TEMPORARY_URL,
  socket: {
    tls: false,
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
  },
});

// ... rest of your code

// Connecting with event listeners
redisClient
  .connect()
  .then(() => console.log("Redis connected"))
  .catch((err) => console.error("Redis Connection Error:", err));

// Event listeners for better visibility
redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});
redisClient.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});
redisClient.on("end", () => {
  console.log("Redis connection closed.");
});

export const addUserToRedis = async (
  documentId: string,
  userId: string,
  socketId: string
) => {
  try {
    await redisClient.hSet(documentId, userId, socketId);
  } catch (err) {
    console.error("Error adding user to Redis:", err);
  }
};

export const removeUserFromRedis = async (
  documentId: string,
  userId: string
) => {
  try {
    await redisClient.hDel(documentId, userId);
    console.log("User removed from Redis");
  } catch (err) {
    console.error("Error removing user from Redis:", err);
  }
};

// Utility: Get all users for a document
export const getDocumentUsersFromRedis = async (documentId: string) => {
  try {
    const users = await redisClient.hGetAll(documentId); // Get all users associated with the document
    return users; // Users will be in format { userId: socketId }
  } catch (err) {
    console.error("Error getting document users from Redis:", err);
  }
};

// Utility: Clear Redis data on document close
export const clearDocumentFromRedis = async (documentId: string) => {
  try {
    await redisClient.del(documentId); // Remove all users and data for a document
    console.log("Document data cleared from Redis");
  } catch (err) {
    console.error("Error clearing document data from Redis:", err);
  }
};
