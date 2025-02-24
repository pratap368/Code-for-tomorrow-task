import {Request,Response} from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "./db";
import { User } from "./entities";

export const registeruser = async(req:Request,res:Response):Promise<Response|undefined>=>{
    try{
    const { email, password}=req.body;
    const userRepository=AppDataSource.getRepository(User);
    const existingUser=await userRepository.findOne({ where: { email }});
    if(existingUser) return res.status(400).json({messsage:"user already exist"})

    const hashedPassword=await bcrypt.hash(password,10);
    const user=userRepository.create({email,passwordHash:hashedPassword});
    await userRepository.save(user);
    res.status(201).json({message:"User registered successfully"});
} catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error" });
}

}
export const login = async (req: Request, res: Response) => {
    try{
    const { email, password } = req.body;
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) return res.status(400).json({ message: "Invalid credentials" });

    // Invalidate previous session
    user.sessionToken = null;
    await userRepository.save(user);

    // Generate new token
    const sessionToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: "1h" });
    user.sessionToken = sessionToken;
    await userRepository.save(user);

    res.cookie("token", sessionToken, { httpOnly: true, secure: true, sameSite: "strict" });
    res.json({ message: "Login successful" });
} catch (error) {
    console.error("login error:", error);
    return res.status(500).json({ message: "Internal server error" });
}
};

export const logout=async(req:Request,res:Response)=>{
    try{
    res.clearCookie("token");
    res.json({message:"Logged out"})
} catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Internal server error" });
}
}