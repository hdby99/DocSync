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
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const userRouter = express_1.default.Router();
// Helper function to manually validate password change
const validatePasswordChange = (req) => {
    const { newPassword } = req.body;
    const errors = [];
    if (!newPassword ||
        typeof newPassword !== "string" ||
        newPassword.length < 8) {
        errors.push({ msg: "Password must be 8 or more characters" });
    }
    return errors;
};
// Route to get user by id
userRouter.get("/:id", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.json(user);
    }
    catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}));
// Route to change user password
userRouter.put("/:id/change-password", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Manually validate new password
    const errors = validatePasswordChange(req);
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    const { id } = req.params;
    const { newPassword } = req.body;
    try {
        const user = yield User_1.default.findById(id);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        user.password = yield bcryptjs_1.default.hash(newPassword, salt);
        yield user.save();
        return res.status(200).json({ msg: "Password updated successfully" });
    }
    catch (err) {
        console.error(err.message);
        return res.status(500).send("Server error");
    }
}));
exports.default = userRouter;
// import express, { Request, Response } from "express";
// import User from "../models/User";
// import authMiddleware from "../middlewares/authMiddleware";
// import { check, validationResult } from "express-validator";
// import bcrypt from "bcryptjs";
// const userRouter = express.Router();
// userRouter.get("/:id", authMiddleware, async (req: Request, res: Response) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     return res.json(user);
//   } catch (error) {
//     return res.status(500).json({ message: "Server error" });
//   }
// });
// userRouter.put(
//   "/:id/change-password",
//   [
//     authMiddleware,
//     check("newPassword", "Password must be 8 or more characters").isLength({
//       min: 8,
//     }),
//   ],
//   async (req: Request, res: Response) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     const { id } = req.params;
//     const { newPassword } = req.body;
//     try {
//       const user = await User.findById(id);
//       if (!user) {
//         return res.status(404).json({ msg: "User not found" });
//       }
//       const salt = await bcrypt.genSalt(10);
//       user.password = await bcrypt.hash(newPassword, salt);
//       await user.save();
//       return res.status(200).json({ msg: "Password updated successfully" });
//     } catch (err) {
//       console.error((err as Error).message);
//       return res.status(500).send("Server error");
//     }
//   }
// );
// export default userRouter;
