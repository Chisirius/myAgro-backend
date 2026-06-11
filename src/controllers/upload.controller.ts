import { Request, Response } from "express";

// =========================
// UPLOAD IMAGE
// =========================
export const uploadImages = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({
        message: "No files uploaded",
      });
    }

    const imageUrls = req.files.map((file: any) => file.path);

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