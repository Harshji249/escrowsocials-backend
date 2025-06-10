import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const fetchuser = async (req: any, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    console.log("No token provided in Authorization header");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET!);
    if (!payload.id || !payload.email) {
      console.log("Invalid token payload:", payload);
      return res.status(401).json({ message: "Invalid token payload" });
    }
    req.user = { id: payload.id, email: payload.email };
    console.log("User authenticated:", req.user);
    next();
  } catch (error: any) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};