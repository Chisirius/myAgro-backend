import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";

import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/address.controller";

const router = Router();

router.get("/", authMiddleware, getAddresses);
router.post("/", authMiddleware, addAddress);
router.put("/:id", authMiddleware, updateAddress);
router.delete("/:id", authMiddleware, deleteAddress);
router.patch("/:id/default", authMiddleware, setDefaultAddress);

export default router;