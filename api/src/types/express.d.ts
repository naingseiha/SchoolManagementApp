import { User } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | { userId: string; role: string };
      userId?: string;
      userEmail?: string;
      userRole?: string;
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
}

export {};
