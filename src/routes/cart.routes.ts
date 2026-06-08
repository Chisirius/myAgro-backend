import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";

import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem,
} from "../controllers/cart.controller";

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/",  authMiddleware, getCart);

/**
 * @swagger
 * /cart/add:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
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
 *         description: Item added to cart
 *       401:
 *         description: Unauthorized
 */
router.post("/add", authMiddleware, addToCart);

/**
 * @swagger
 * /cart/{itemId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
 *     responses:
 *       200:
 *         description: Item removed successfully
 *       404:
 *         description: Item not found
 */
router.delete("/:itemId", authMiddleware, removeFromCart);



router.put("/:itemId",  authMiddleware, updateCartItem);

export default router;