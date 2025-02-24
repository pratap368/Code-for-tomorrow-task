import {Request,Response} from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "./db";
import { Product, User } from "./entities";
import NodeCache from "node-cache";
const cache = new NodeCache({ stdTTL: 300 });

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const userRepository = AppDataSource.getRepository(User);

        const existingUser = await userRepository.findOne({ where: { email } });

        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = userRepository.create({ email, passwordHash: hashedPassword });
        await userRepository.save(user);

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
}
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { email } });

        if (!user) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }

       
        user.sessionToken = null;
        await userRepository.save(user);

      
        const sessionToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: "2m" });

      
        user.sessionToken = sessionToken;
        await userRepository.save(user);

       
        res.cookie("token", sessionToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        });

        res.status(200).json({ message: "Login successful" });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        });

        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};

export const addProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, price, description } = req.body;
        const productRepository = AppDataSource.getRepository(Product);

        const existingProduct = await productRepository.findOne({ where: { name } });

        if (existingProduct) {
            res.status(400).json({ message: "Product already exists" });
            return;
        }

        const product = productRepository.create({ name, price, description });
        await productRepository.save(product);

        res.status(201).json({ message: "Product added successfully", data: product });
    } catch (err) {
        console.error("Error adding product:", err);
        res.status(500).json({ message: "Internal server error", error: err });
    }
};
export const getAllproducts = async (req: Request, res: Response): Promise<void> => {
    try {

        const cachedData = cache.get("products");
        if (cachedData){
            res.status(200).json({ data: cachedData, cached: true });
            return;
        }
       
        const productRepository = AppDataSource.getRepository(Product);
        const products = await productRepository.find(); 

        if (products.length === 0) {
            res.status(404).json({ message: "No products available" });
            return;
        }
        cache.set("products", products);

        res.status(200).json({ data: products });
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ message: "Internal server error", error: err });
    }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
        const productRepository = AppDataSource.getRepository(Product);
        const productId = parseInt(req.params.id);

        if (isNaN(productId)) {
            res.status(400).json({ message: "Invalid product ID" });
            return;
        }

        const product = await productRepository.findOne({ where: { id: productId } });

        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }

        res.status(200).json({ data: product });
    } catch (err) {
        console.error("Error fetching product:", err);
        res.status(500).json({ message: "Internal server error", error: err });
    }
};