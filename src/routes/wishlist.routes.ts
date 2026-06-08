import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";

import {
  addToWish,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishList.controller";

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /wishlist:
 *   get:
 *     summary: Get user's wishlist
 *     tags: [wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: wishlist fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/",  authMiddleware,getWishlist);

/**
 * @swagger
 * /wishlist/add:
 *   post:
 *     summary: Add item to wishlist
 *     tags: [wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 123456
 *               quantity:
 *                 type: number
 *                 example: 2
 *     responses:
 *       200:
 *         description: Item added to wishlist
 *       401:
 *         description: Unauthorized
 */
router.post("/add",  authMiddleware,  addToWish);

/**
 * @swagger
 * /wishlist/{itemId}:
 *   delete:
 *     summary: Remove item from wishlist
 *     tags: [wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: wishlist item ID
 *     responses:
 *       200:
 *         description: Item removed successfully
 *       404:
 *         description: Item not found
 */
router.delete("/:itemId", removeFromWishlist);

export default router;