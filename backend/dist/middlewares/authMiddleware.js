"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    // Get token from Authorization header
    const authHeader = req.header("Authorization");
    // Check if the Authorization header exists and contains a token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ msg: "No token, authorization denied" });
    }
    // Extract the token from the Authorization header (after "Bearer ")
    const token = authHeader.split(" ")[1];
    // Verify the token
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
        // Attach the user email to the request object
        req.user = decoded.user;
        console.log("req.user from middleware is", req.user);
        next(); // Proceed to the next middleware or route handler
    }
    catch (err) {
        res.status(401).json({ msg: "Token is not valid" });
    }
};
exports.default = authMiddleware;
