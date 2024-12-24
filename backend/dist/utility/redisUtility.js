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
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearDocumentFromRedis = exports.getDocumentUsersFromRedis = exports.removeUserFromRedis = exports.addUserToRedis = void 0;
const redis_1 = require("redis");
const redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_TEMPORARY_URL,
    // socket: {
    //   reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
    //   tls: true,
    //   rejectUnauthorized: false,
    // },
});
redisClient
    .connect()
    .then(() => console.log("Redis connected"))
    .catch((err) => console.error("Redis Connection Error:", err));
redisClient.on("error", (err) => {
    console.error("Redis Error:", err);
});
redisClient.on("reconnecting", () => {
    console.log("Redis reconnecting...");
});
redisClient.on("end", () => {
    console.log("Redis connection closed.");
});
const addUserToRedis = (documentId, userId, socketId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield redisClient.hSet(documentId, userId, socketId);
    }
    catch (err) {
        console.error("Error adding user to Redis:", err);
    }
});
exports.addUserToRedis = addUserToRedis;
const removeUserFromRedis = (documentId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield redisClient.hDel(documentId, userId);
        console.log("User removed from Redis");
    }
    catch (err) {
        console.error("Error removing user from Redis:", err);
    }
});
exports.removeUserFromRedis = removeUserFromRedis;
// Utility: Get all users for a document
const getDocumentUsersFromRedis = (documentId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield redisClient.hGetAll(documentId); // Get all users associated with the document
        return users; // Users will be in format { userId: socketId }
    }
    catch (err) {
        console.error("Error getting document users from Redis:", err);
    }
});
exports.getDocumentUsersFromRedis = getDocumentUsersFromRedis;
// Utility: Clear Redis data on document close
const clearDocumentFromRedis = (documentId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield redisClient.del(documentId); // Remove all users and data for a document
        console.log("Document data cleared from Redis");
    }
    catch (err) {
        console.error("Error clearing document data from Redis:", err);
    }
});
exports.clearDocumentFromRedis = clearDocumentFromRedis;
