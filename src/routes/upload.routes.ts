import { Router } from "express";
import  upload  from "../middleware/upload.middleware";

import { uploadImages } from "../controllers/upload.controller";

const router = Router();

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a single image
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageUrl:
 *                   type: string
 *                   example: http://localhost:5000/uploads/file.jpg
 *       400:
 *         description: No file uploaded
 */
router.post(
  "/",
  upload.array("images", 10),
  uploadImages
);

export default router;