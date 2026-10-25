import { Request, Response } from "express";
import { User } from "../models/User.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const generateToken = (id: string)=>{
    // 1-day expiration for automatic logout after 24h
    return jwt.sign({id}, process.env.JWT_SECRET || "fallback_secret", {expiresIn: '1d'} );
}

// Register user
// POST /api/auth/register
export const registerUser = async (req:Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ message: "Please provide all required fields" });
            return;
        }
        const userExists = await User.findOne({email})
        if(userExists){
            res.status(400).json({message: "User already exists"})
            return;
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({name, email, password: hashedPassword});

        if(user){
            res.status(201).json({_id: user._id, name: user.name, email: user.email, token: generateToken(user._id.toString()) })
        }else{
            res.status(400).json({message: "Invalid user data"})
        }
    } catch (error: any) {
        res.status(500).json({message: error?.message || "Server error"})
    }
}

// Login user
// POST /api/auth/login
export const loginUser = async (req:Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: "Please provide email and password" });
            return;
        }

        const user = await User.findOne({email})

        if(user && (await bcrypt.compare(password, user.password))){
            res.json({_id: user._id, name: user.name, email: user.email, token: generateToken(user._id.toString()) })
        }else{
            res.status(401).json({message: "Invalid email or password"})
        }
        
    } catch (error: any) {
        res.status(500).json({message: error?.message || "Server error"})
    }
}

// Forgot Password - Generate 6-digit Reset Code
// POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: "Please provide your email address" });
            return;
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            res.status(404).json({ message: "No account found with this email address" });
            return;
        }

        // Generate 6-digit OTP code
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        user.resetPasswordOtp = otp;
        user.resetPasswordOtpExpires = expiresAt;
        await user.save();

        // Return confirmation and OTP for immediate verification
        res.json({
            message: "Password reset verification code generated.",
            otp,
            email: user.email,
        });
    } catch (error: any) {
        res.status(500).json({ message: error?.message || "Server error" });
    }
};

// Reset Password - Verify OTP & Set New Password
// POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            res.status(400).json({ message: "Please provide email, verification code, and new password" });
            return;
        }

        if (newPassword.length < 6) {
            res.status(400).json({ message: "Password must be at least 6 characters long" });
            return;
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp.trim()) {
            res.status(400).json({ message: "Invalid verification code" });
            return;
        }

        if (!user.resetPasswordOtpExpires || new Date() > user.resetPasswordOtpExpires) {
            res.status(400).json({ message: "Verification code has expired. Please request a new one." });
            return;
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordOtp = undefined;
        user.resetPasswordOtpExpires = undefined;
        await user.save();

        res.json({ message: "Password reset successfully! You can now log in with your new password." });
    } catch (error: any) {
        res.status(500).json({ message: error?.message || "Server error" });
    }
};