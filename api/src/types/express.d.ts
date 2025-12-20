import { User } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | { userId: string; role: string };
      file?: Express.Multer.File;
    }
  }
}

export {};
