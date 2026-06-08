import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import prisma from "../config/prisma";


export async function becomeSeller(
    req: AuthRequest,
    res: Response
){
    try{
        const userId = req.user.userId

        if (!userId) {
            return res.status(401).json({
              message: "Unauthorized"
            });
          }

        const updatedUser = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                role : "SELLER"
            }
        })

        res.json({
            message: "You are now a seller",
            user: updatedUser,
          });
      
        
    }catch(error){
        res.status(500).json({
            message: "Error upgrading account",
          });
    }
}


export async function getUserProfile(
    req: AuthRequest,
    res: Response
  ) {
    try {
      const userId = req.user?.userId;
  
      if (!userId) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }
  
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          // exclude password for security
        },
      });
  
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
  
      return res.json(user);
  
    } catch (error) {
      console.error(error);
  
      return res.status(500).json({
        message: "Error fetching user profile",
      });
    }
  }