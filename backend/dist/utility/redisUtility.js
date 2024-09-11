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
const redisClient = (0, redis_1.createClient)();
redisClient
    .connect()
    .catch((err) => console.error("Redis Connection Error:", err));
// Utility: Add user to Redis
const addUserToRedis = (documentId, userId, socketId) => __awaiter(void 0, void 0, void 0, function* () {
    yield redisClient.hSet(documentId, userId, socketId); // Store userId and corresponding socketId
});
exports.addUserToRedis = addUserToRedis;
// Utility: Remove user from Redis
const removeUserFromRedis = (documentId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    yield redisClient.hDel(documentId, userId); // Remove user from Redis when they disconnect
    console.log("user removed");
});
exports.removeUserFromRedis = removeUserFromRedis;
// Utility: Get all users for a document
const getDocumentUsersFromRedis = (documentId) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield redisClient.hGetAll(documentId); // Get all users associated with the document
    return users; // Users will be in format { userId: socketId }
});
exports.getDocumentUsersFromRedis = getDocumentUsersFromRedis;
// Utility: Clear Redis data on document close
const clearDocumentFromRedis = (documentId) => __awaiter(void 0, void 0, void 0, function* () {
    yield redisClient.del(documentId); // Remove all users and data for a document
});
exports.clearDocumentFromRedis = clearDocumentFromRedis;
