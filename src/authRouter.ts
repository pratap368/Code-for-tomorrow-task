import {Router,RequestHandler} from "express";
const router=Router();
import { registerUser,login,logout,addProduct,getAllproducts,getProductById} from "./controller";
import { validateRegister, validateLogin} from "./validator";
import sessionMiddleware from "./sessionMiddleware";
router.post("/register",validateRegister,registerUser);
router.post("/login",validateLogin,login);
router.post("/logout",logout)

//Product Routes
router.post("/addproduct",sessionMiddleware,addProduct);
router.get("/getAllproducts",sessionMiddleware,getAllproducts);
router.get("/getProductById/:id",sessionMiddleware,getProductById);

export default router;

