import { Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

// -------------------------
// ADD TO CART
// -------------------------
export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity} = req.body;

    // 1. Find or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    // 2. Check if item exists
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    // 3. Update or create item
    if (existingItem) {
      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + (quantity || 1),
        },
      });

      return res.json(updated);
    }

    const item = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity: quantity || 1,
      },
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: "Error adding to cart", error });
  }
};



export const getCart = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.userId;
  
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
  
      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: "Error fetching cart" });
    }
  };


  export const removeFromCart = async (req: AuthRequest, res: Response) => {

    try {
      const itemId = req.params.itemId as string;
  
      await prisma.cartItem.delete({
        where: { id: itemId },
      });
  
      res.json({ message: "Item removed" });
    } catch (error) {
      res.status(500).json({ message: "Error removing item" });
    }
  };

  // -------------------------
// UPDATE CART QUANTITY
// -------------------------
export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const itemId = req.params.itemId as string;
    const { quantity } = req.body;

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({
      message: "Error updating cart item",
      error,
    });
  }
};