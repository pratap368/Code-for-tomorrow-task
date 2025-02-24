import {Router,RequestHandler} from "express";
const router=Router();
import { registeruser,login,logout} from "./controller";
import { validateRegister, validateLogin} from "./validator";

router.post("/register",validateRegister,registeruser as RequestHandler);
router.post("/login",validateLogin,login as  RequestHandler);
router.post("/logout",logout)

export default router;

