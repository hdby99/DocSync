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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
// Helper function to manually validate input
const validateSignup = (req) => {
    const { name, email, password } = req.body;
    const errors = [];
    if (!name || typeof name !== "string") {
        errors.push({ msg: "Name is required" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push({ msg: "Please include a valid email" });
    }
    if (!password || password.length < 6) {
        errors.push({ msg: "Please enter a password with 6 or more characters" });
    }
    return errors;
};
// Sign Up Route
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate manually
    const errors = validateSignup(req);
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    const { name, email, password } = req.body;
    try {
        // Check if user already exists
        let user = yield User_1.default.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: "User already exists" });
        }
        // Create new user instance
        user = new User_1.default({ name, email, password });
        // Hash password
        const salt = yield bcryptjs_1.default.genSalt(10);
        user.password = yield bcryptjs_1.default.hash(password, salt);
        // Save user
        yield user.save();
        // Create JWT token with userId
        const payload = { user: { id: user._id } };
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || "your_jwt_secret", {
            expiresIn: 3600,
        });
        // Send token and userId as response
        res.json({ token, userId: user._id });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
}));
// Helper function to validate login
const validateLogin = (req) => {
    const { email, password } = req.body;
    const errors = [];
    if (!email || typeof email !== "string") {
        errors.push({ msg: "Please include a valid email" });
    }
    if (!password || typeof password !== "string") {
        errors.push({ msg: "Password is required" });
    }
    return errors;
};
// Login Route
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate manually
    const errors = validateLogin(req);
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    const { email, password } = req.body;
    try {
        // Find user by email
        let user = yield User_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "Invalid Credentials" });
        }
        // Check password
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid Credentials" });
        }
        // Create JWT token with userId
        const payload = { user: { id: user._id } };
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || "your_jwt_secret", {
            expiresIn: 3600,
        });
        // Send token and userId as response
        res.json({ token, userId: user._id });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
}));
exports.default = router;
// import express, { Request, Response } from "express";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import { check, validationResult } from "express-validator";
// // import expressValidator = require("express-validator");
// // const { check, validationResult } = expressValidator;
// import User from "../models/User";
// const router = express.Router();
// // Sign Up Route
// router.post(
//   "/signup",
//   [
//     check("name", "Name is required").not().isEmpty(),
//     check("email", "Please include a valid email").isEmail(),
//     check(
//       "password",
//       "Please enter a password with 6 or more characters"
//     ).isLength({ min: 6 }),
//   ],
//   async (req: Request, res: Response) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     const { name, email, password } = req.body;
//     try {
//       // Check if user already exists
//       let user = await User.findOne({ email });
//       if (user) {
//         return res.status(400).json({ msg: "User already exists" });
//       }
//       // Create new user instance
//       user = new User({ name, email, password });
//       // Hash password
//       const salt = await bcrypt.genSalt(10);
//       user.password = await bcrypt.hash(password, salt);
//       // Save user
//       await user.save();
//       // Create JWT token with userId
//       const payload = { user: { id: user._id } }; // Include user._id in the payload
//       const token = jwt.sign(
//         payload,
//         process.env.JWT_SECRET || "your_jwt_secret",
//         { expiresIn: 3600 }
//       );
//       // Send token and userId as response
//       res.json({ token, userId: user._id });
//     } catch (err) {
//       console.error((err as Error).message);
//       res.status(500).send("Server error");
//     }
//   }
// );
// // Login Route
// router.post(
//   "/login",
//   [
//     check("email", "Please include a valid email").isEmail(),
//     check("password", "Password is required").exists(),
//   ],
//   async (req: Request, res: Response) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     const { email, password } = req.body;
//     try {
//       // Find user by email
//       let user = await User.findOne({ email });
//       if (!user) {
//         return res.status(400).json({ msg: "Invalid Credentials" });
//       }
//       // Check password
//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) {
//         return res.status(400).json({ msg: "Invalid Credentials" });
//       }
//       // Create JWT token with userId
//       const payload = { user: { id: user._id } }; // Include user._id in the payload
//       const token = jwt.sign(
//         payload,
//         process.env.JWT_SECRET || "your_jwt_secret",
//         { expiresIn: 3600 }
//       );
//       // Send token and userId as response
//       res.json({ token, userId: user._id });
//     } catch (err) {
//       console.error((err as Error).message);
//       res.status(500).send("Server error");
//     }
//   }
// );
// export default router;
