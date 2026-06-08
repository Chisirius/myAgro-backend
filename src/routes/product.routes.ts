import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import roleMiddleware from "../middleware/role.middleware";
import { createProduct, deleteProduct, getProducts, getSellerProducts, updateProduct } from "../controllers/product.controller";

const productRoutes = Router();

/**
 * @swagger
 * /products/create:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 example: Laptop
 *               price:
 *                 type: number
 *                 example: 1200
 *               category:
 *                 type: string
 *                 example: electronics
 *               description:
 *                 type: string
 *                 example: High performance laptop
 *     responses:
 *       201:
 *         description: Product created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not seller/admin)
 */
productRoutes.post(
    "/create",
    authMiddleware,
    roleMiddleware("SELLER", "ADMIN"),
    createProduct
  );

  
  /**
 * @swagger
 * /products/explore:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Products fetched successfully
 */
productRoutes.get("/explore", getProducts);

productRoutes.get(
  "/seller/products",
  authMiddleware,
  getSellerProducts)

productRoutes.put(
  "/:id",
  authMiddleware,
  roleMiddleware("SELLER", "ADMIN"),
  updateProduct
);

productRoutes.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("SELLER", "ADMIN"),
  deleteProduct
);

export default productRoutes