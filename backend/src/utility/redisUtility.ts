import { createClient } from "redis";

const redisClient = createClient();
redisClient
  .connect()
  .catch((err) => console.error("Redis Connection Error:", err));

// Utility: Add user to Redis
export const addUserToRedis = async (
  documentId: string,
  userId: string,
  socketId: string
) => {
  await redisClient.hSet(documentId, userId, socketId); // Store userId and corresponding socketId
};

// Utility: Remove user from Redis
export const removeUserFromRedis = async (
  documentId: string,
  userId: string
) => {
  await redisClient.hDel(documentId, userId); // Remove user from Redis when they disconnect
  console.log("user removed");
};

// Utility: Get all users for a document
export const getDocumentUsersFromRedis = async (documentId: string) => {
  const users = await redisClient.hGetAll(documentId); // Get all users associated with the document
  return users; // Users will be in format { userId: socketId }
};

// Utility: Clear Redis data on document close
export const clearDocumentFromRedis = async (documentId: string) => {
  await redisClient.del(documentId); // Remove all users and data for a document
};
