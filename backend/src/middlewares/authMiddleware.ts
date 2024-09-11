import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: { email: string }; // Attach email to the req.user object
}

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
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
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    ) as { user: { email: string } };

    // Attach the user email to the request object
    req.user = decoded.user;
    console.log("req.user from middleware is", req.user);
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

export default authMiddleware;
