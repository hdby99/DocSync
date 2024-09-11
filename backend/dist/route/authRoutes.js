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
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
// Sign Up Route
router.post("/signup", [
    (0, express_validator_1.check)("name", "Name is required").not().isEmpty(),
    (0, express_validator_1.check)("email", "Please include a valid email").isEmail(),
    (0, express_validator_1.check)("password", "Please enter a password with 6 or more characters").isLength({ min: 6 }),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
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
        const payload = { user: { id: user._id } }; // Include user._id in the payload
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || "your_jwt_secret", { expiresIn: 3600 });
        // Send token and userId as response
        res.json({ token, userId: user._id });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
}));
// Login Route
router.post("/login", [
    (0, express_validator_1.check)("email", "Please include a valid email").isEmail(),
    (0, express_validator_1.check)("password", "Password is required").exists(),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
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
        const payload = { user: { id: user._id } }; // Include user._id in the payload
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || "your_jwt_secret", { expiresIn: 3600 });
        // Send token and userId as response
        res.json({ token, userId: user._id });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
}));
exports.default = router;
