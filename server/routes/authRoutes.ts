import { Router } from "express";
import { forgotPassword, loginUser, registerUser, resetPassword } from "../controllers/authController.js";

const authRouter = Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);

export default authRouter;