import { Router } from "express";

import {
  initiateCheckout,
  verifyPayment,
  getUserOrders,
  getSellerDashboard,
  getSellerOrders,
  getSellerWallet
} from "../controllers/order.controller";

import { authMiddleware }
from "../middleware/auth.middleware";

const router = Router();

// INITIATE PAYMENT
router.post(
  "/checkout",
  authMiddleware,
  initiateCheckout
);

// VERIFY PAYMENT
router.post(
  "/verify",
  authMiddleware,
  verifyPayment
);

// GET USER ORDERS
router.get(
  "/",
  authMiddleware,
  getUserOrders
);

// SELLER DASHBOARD
router.get(
  "/seller/dashboard",
  authMiddleware,
  getSellerDashboard
);

// SELLER ORDERS
router.get(
  "/seller/orders",
  authMiddleware,
  getSellerOrders
);
export default router;

// SELLER WALLET
router.get(
  "/seller/wallet",
  authMiddleware,
  getSellerWallet
);