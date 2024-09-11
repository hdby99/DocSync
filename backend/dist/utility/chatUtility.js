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
exports.saveChat = exports.getChatsForDocument = void 0;
const chat_1 = __importDefault(require("../models/chat"));
const getChatsForDocument = (documentId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield chat_1.default.find({ documentId }).sort({ createdAt: 1 });
    }
    catch (error) {
        throw new Error("Error fetching chats for the document.");
    }
});
exports.getChatsForDocument = getChatsForDocument;
const saveChat = (documentId, userId, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chat = new chat_1.default({ documentId, userId, message });
        return yield chat.save();
    }
    catch (error) {
        throw new Error("Error saving chat message.");
    }
});
exports.saveChat = saveChat;
