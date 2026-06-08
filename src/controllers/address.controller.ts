import { Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";


// =======================
// GET ALL ADDRESSES
// =======================
export const getAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(addresses);

  } catch (error) {
    res.status(500).json({ message: "Error fetching addresses" });
  }
};


// =======================
// ADD ADDRESS
// =======================
export const addAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;

    const {
      firstName,
      lastName,
      phoneNumber,
      additionalPhone,
      street,
      town,
      state,
      isDefault,
    } = req.body;

    // if new default → reset old defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        firstName,
        lastName,
        phoneNumber,
        additionalPhone: additionalPhone?.trim() || null,
        street,
        town,
        state,
        isDefault: isDefault || false,
      },
    });

    res.status(201).json(address);

  } catch (error) {
    res.status(500).json({ message: "Error adding address" });
  }
};


// =======================
// UPDATE ADDRESS
// =======================
export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const id = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;

    const existing = await prisma.address.findUnique({ where: { id } });

    if (!existing || existing.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: req.body,
    });

    res.json(updated);

  } catch (error) {
    res.status(500).json({ message: "Error updating address" });
  }
};


// =======================
// DELETE ADDRESS
// =======================
export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const id = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;

    const existing = await prisma.address.findUnique({ where: { id } });

    if (!existing || existing.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await prisma.address.delete({ where: { id } });

    res.json({ message: "Address deleted" });

  } catch (error) {
    res.status(500).json({ message: "Error deleting address" });
  }
};


// =======================
// SET DEFAULT ADDRESS
// =======================
export const setDefaultAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const id = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;

    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    const updated = await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });

    res.json(updated);

  } catch (error) {
    res.status(500).json({ message: "Error setting default address" });
  }
};