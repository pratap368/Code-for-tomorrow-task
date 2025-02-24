import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "./db";
import { User } from "./entities";

const sessionMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.cookies?.token;  
        if (!token) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }; 
        const userId = parseInt(decoded.id, 10); 
        if (isNaN(userId)) {
            res.status(400).json({ message: "Invalid token payload" });
            return;
        }

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: userId } }); 
        if (!user || user.sessionToken !== token) {
            res.status(401).json({ message: "Session expired, please login again" });
            return;
        }

        next(); 
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};

export default sessionMiddleware;
