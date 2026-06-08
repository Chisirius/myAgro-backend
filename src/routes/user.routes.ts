import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { becomeSeller, getUserProfile } from "../controllers/user.controller";

const userRoutes = Router();

// Protected route
/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       401:
 *         description: Unauthorized
 */
userRoutes.get("/profile", authMiddleware, getUserProfile);





/**
 * @swagger
 * /user/become-seller:
 *   patch:
 *     summary: Upgrade user to seller
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User successfully upgraded to seller
 *       401:
 *         description: Unauthorized
 */
userRoutes.patch("/become-seller", authMiddleware, becomeSeller);

export default userRoutes;