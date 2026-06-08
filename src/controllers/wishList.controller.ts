import { Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

// -------------------------
// ADD TO WISHLIST
// -------------------------
export const addToWish = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity} = req.body;

    // 1. Find or create wish
    let wishlist = await prisma.wishList.findUnique({
      where: { userId },
    });

    if (!wishlist) {
      wishlist = await prisma.wishList.create({
        data: { userId },
      });
    }

    // 2. Check if item exists
    const existingItem = await prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    // 3. Update or create item
    if (existingItem) {
      const updated = await prisma.wishlistItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + (quantity || 1),
        },
      });

      return res.json(updated);
    }

    const item = await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
        quantity: quantity || 1,
      },
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: "Error adding to wishlist", error });
  }
};



export const getWishlist = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.userId;
  
      const wishList = await prisma.wishList.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
  
      res.json(wishList);
    } catch (error: any) {
      error: error.message,
      res.status(500).json({ 
        message: "Error fetching wishlist",
        error: error.message, });
    }
  };


  export const removeFromWishlist = async (req: AuthRequest, res: Response) => {

    try {
      const itemId = req.params.itemId as string;
  
      await prisma.wishlistItem.delete({
        where: { id: itemId },
      });
  
       res.json({ message: "Item removed" });
    } catch (error) {
      res.status(500).json({ message: "Error removing item" });
    }
  };