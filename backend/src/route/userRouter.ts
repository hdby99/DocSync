import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import authMiddleware from "../middlewares/authMiddleware";

const userRouter = express.Router();

// Helper function to manually validate password change
const validatePasswordChange = (req: Request) => {
  const { newPassword } = req.body;
  const errors = [];

  if (
    !newPassword ||
    typeof newPassword !== "string" ||
    newPassword.length < 8
  ) {
    errors.push({ msg: "Password must be 8 or more characters" });
  }

  return errors;
};

// Route to get user by id
userRouter.get("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

// Route to change user password
userRouter.put(
  "/:id/change-password",
  authMiddleware,
  async (req: Request, res: Response) => {
    // Manually validate new password
    const errors = validatePasswordChange(req);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const { id } = req.params;
    const { newPassword } = req.body;

    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);

      await user.save();

      return res.status(200).json({ msg: "Password updated successfully" });
    } catch (err) {
      console.error((err as Error).message);
      return res.status(500).send("Server error");
    }
  }
);

export default userRouter;
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
