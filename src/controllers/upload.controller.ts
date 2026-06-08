import { Request, Response } from "express";

// =========================
// UPLOAD IMAGE
// =========================
export const uploadImages = async (req: Request, res: Response) => {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({
          message: "No files uploaded",
        });
      }
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const imageUrls = req.files.map((file: any) => {
        return `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
      });
  
      return res.status(200).json({
        message: "Upload successful",
        imageUrls,
      });
  
    } catch (error) {
      return res.status(500).json({
        message: "Upload failed",
      });
    }
  };