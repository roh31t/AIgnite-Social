import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { ActivityLog } from "../models/ActivityLog.js";

// Get all activity
// GET /api/activity
export const getActivity = async (req:AuthRequest, res: Response): Promise<void> => {
    try {
       const activity = await ActivityLog.find({user: req.user._id})
           .sort({createdAt: -1 })
           .limit(20)
           .populate("relatedPost", "content mediaUrl mediaType platforms scheduledFor status createdAt updatedAt");
       res.json(activity);
    } catch (error: any) {
        res.status(500).json({ message: error?.message || "Server error" });
    }    
}