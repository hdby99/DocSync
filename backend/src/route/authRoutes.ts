import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

const router = express.Router();

const validateSignup = (req: Request) => {
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
router.post("/signup", async (req: Request, res: Response) => {
  // Validate manually
  const errors = validateSignup(req);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Create new user instance
    user = new User({ name, email, password });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user
    await user.save();

    // Create JWT token with userId
    const payload = { user: { id: user._id } };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "your_jwt_secret",
      {
        expiresIn: 3600,
      }
    );

    // Send token and userId as response
    res.json({ token, userId: user._id });
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send("Server error");
  }
});

// Helper function to validate login
const validateLogin = (req: Request) => {
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
router.post("/login", async (req: Request, res: Response) => {
  // Validate manually
  const errors = validateLogin(req);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const { email, password } = req.body;

  try {
    // Find user by email
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    // Create JWT token with userId
    const payload = { user: { id: user._id } };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "your_jwt_secret",
      {
        expiresIn: 3600,
      }
    );

    // Send token and userId as response
    res.json({ token, userId: user._id });
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send("Server error");
  }
});

export default router;
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
