import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "./db";
import { User } from "./entities";


interface AuthenticatedRequest extends Request {
    user?: User;
}

const sessionMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.cookies?.token;  
        if (!token) {
            res.status(401).json({ message: "Unauthorized. No session token provided." });
            return;
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        } catch (error) {
            res.status(401).json({ message: "Session expired. Please log in again." });
            return;
        }

        const userId = parseInt(decoded.id, 10); 
        if (isNaN(userId)) {
            res.status(400).json({ message: "Invalid token payload" });
            return;
        }

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: userId } });

        if (!user || !user.sessionToken || user.sessionToken !== token) {
            res.status(401).json({ message: "Session expired. Please log in again." });
            return;
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("Session validation error:", err);
        res.status(401).json({ message: "Invalid token" });
    }
};

export default sessionMiddleware;
