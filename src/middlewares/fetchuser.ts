import { Request, Response } from "express";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET!;

export const fetchuser = (req: any, res: any, next: any) => {
  const token = req.header("auth-token");
  if (!token) {
    return res.status(401).send("Please authenticate using a valid token");
  }
  try {
    const data: any = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    return res.status(401).send("Please authenticate using a valid token");
  }
};
