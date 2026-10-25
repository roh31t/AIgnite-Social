import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { GoogleGenAI } from "@google/genai";
import { cloudinary } from "../config/cloudinary.js";
import { Generation } from "../models/Generation.js";
import { Post } from "../models/Post.js";
import { Account } from "../models/Account.js";
import { ActivityLog } from "../models/ActivityLog.js";

// Generate post
// POST /api/posts/generate
export const generatePost = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { prompt, tone, generateImage } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res
        .status(400)
        .json({
          message:
            "Gemini API Key is missing. Please add it to your server/.env file.",
        });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    // Generate Text
    const textResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: `Generate a social media post based on this prompt: "${prompt}". 
            Tone: ${tone}. 
            Include relevant hashtags.
            Format the response as JSON with "content" and "imagePrompt" fields. 
            The "imagePrompt" should be a highly descriptive prompt for an image generator that complements the post.`,
    });

    let content = "";
    let imagePrompt = prompt;

    try {
      const rawText = textResponse.text || "";
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      const data = jsonMatch
        ? JSON.parse(jsonMatch[0])
        : { content: rawText, imagePrompt: prompt };
      content = data.content || rawText;
      imagePrompt = data.imagePrompt || prompt;
    } catch (e) {
      content = textResponse.text || "";
    }

    let mediaUrl = "";
    if (generateImage) {
      // 1. Try Google Gemini's native image model (gemini-3.1-flash-image)
      try {
        const imageResponse = await ai.models.generateContent({
          model: "gemini-3.1-flash-image",
          contents: imagePrompt,
          config: {
            responseModalities: ["IMAGE"],
          },
        });

        for (const candidate of imageResponse.candidates || []) {
          for (const part of candidate.content?.parts || []) {
            if (part.inlineData?.data) {
              const mime = part.inlineData.mimeType || "image/png";
              const tempUrl = `data:${mime};base64,${part.inlineData.data}`;
              const uploadResult = await cloudinary.uploader.upload(tempUrl, {
                folder: "ai-generations",
              });
              mediaUrl = uploadResult.secure_url;
              break;
            }
          }
          if (mediaUrl) break;
        }
      } catch (geminiImgErr: any) {
        console.warn("Gemini native image generation unavailable (requires billing on Google Cloud), using FLUX Ultra-HD:", geminiImgErr?.message || geminiImgErr);
      }

      // 2. High-resolution FLUX.1 model (magazine-quality, cinematic 8k)
      if (!mediaUrl) {
        try {
          const enhancedPrompt = `${imagePrompt}, ultra-realistic photorealistic 8k, professional commercial photography, cinematic warm lighting, sharp focus, magazine quality`;
          const fluxUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?model=flux&width=1280&height=720&enhance=true&nologo=true`;
          const uploadResult = await cloudinary.uploader.upload(fluxUrl, {
            folder: "ai-generations",
          });
          mediaUrl = uploadResult.secure_url;
        } catch (fluxErr: any) {
          console.error("FLUX image generation fallback failed:", fluxErr);
        }
      }
    }

    // Save generation to DB
    const generation = await Generation.create({
      user: req.user._id,
      prompt,
      content,
      mediaUrl,
      mediaType: mediaUrl ? "image" : undefined,
      tone,
    });

    res.json(generation);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || "Server error" });
  }
};

// Get generations
// GET /api/posts/generations
export const getGenerations = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const generations = await Generation.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(generations);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || "Server error" });
  }
};

// Get posts
// GET /api/posts
export const getPosts = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const posts = await Post.find({ user: req.user._id }).sort({ scheduledFor: -1, createdAt: -1 });
    res.json(posts);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || "Server error" });
  }
};

// Schedule post
// POST /api/posts
export const schedulePost = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { content, platforms, scheduledFor, status } = req.body;

    // Parse platforms if it comes as a stringified array from FormData
    let parsedPlatforms: string[] = [];
    if (typeof platforms === "string") {
      try {
        parsedPlatforms = JSON.parse(platforms);
      } catch (e) {
        parsedPlatforms = platforms.split(",");
      }
    } else if (Array.isArray(platforms)) {
      parsedPlatforms = platforms;
    }

    if (!parsedPlatforms || parsedPlatforms.length === 0) {
      res.status(400).json({ message: "Please select at least one platform" });
      return;
    }

    // Verify user has connected account for each selected platform
    const connectedAccounts = await Account.find({
      user: req.user._id,
      platform: { $in: parsedPlatforms as any },
      status: "connected",
    });

    const connectedPlatforms = connectedAccounts.map((a) => a.platform);
    const missingPlatforms = parsedPlatforms.filter(
      (p) => !connectedPlatforms.includes(p as any),
    );

    if (missingPlatforms.length > 0) {
      const platformLabels = missingPlatforms.map((p) => p.toUpperCase()).join(", ");
      res.status(400).json({
        message: `Account not connected for ${platformLabels}. Please add/connect your account in the Accounts tab before scheduling.`,
      });
      return;
    }

    let mediaUrl: string | undefined = req.body.mediaUrl;
    let mediaType: "image" | "video" | undefined = req.body.mediaType;

    if (req.file) {
      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder: "social-scheduler" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        stream.end(req.file!.buffer);
      });
      mediaUrl = result.secure_url;
      mediaType = result.resource_type === "video" ? "video" : "image";
    }

    const post: any = await Post.create({
      user: req.user._id,
      content,
      platforms: parsedPlatforms as any,
      mediaUrl,
      mediaType,
      scheduledFor,
      status: status || "scheduled",
    });

    // Record activity log for scheduled post
    try {
      await ActivityLog.create({
        user: req.user._id,
        actionType: "POST_SCHEDULED",
        description: `Scheduled post for ${parsedPlatforms.join(", ")}`,
        relatedPost: post._id,
      });
    } catch (logErr) {
      console.warn("Could not create activity log:", logErr);
    }

    res.status(201).json(post);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || "Server error" });
  }
};
