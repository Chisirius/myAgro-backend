import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import prisma from "../config/prisma";


export  const createProduct = async (
    req : AuthRequest, 
    res: Response ) => {
    try { const {
            name,
            description,
            price,    
            oldPrice,   
            stock,   
            images,  
            category,    
        } = req.body

        const sellerId = req.user.userId;

       const product =  await prisma.product.create({
            data :{
            name,
            description,
            price,    
            oldPrice,   
            stock: Number(stock) || 0,   
            images,  
            category,   
            sellerId, 
            status: Number(stock) > 0 ? "ACTIVE" : "OUT_OF_STOCK",
            }
        })

        res.status(201).json(product);

        } catch (error){
            res.status(500).json({
                message: "Error creating product",
              });
        }

    }


    export const getSellerProducts = async (req: AuthRequest, res: Response) => {
      try {
        const sellerId = req.user?.userId;
    
        if (!sellerId) {
          return res.status(401).json({ message: "Unauthorized - no user found" });
        }
    
        const products = await prisma.product.findMany({
          where: { sellerId },
          include: { seller: true },
        });
    
        return res.json(products);
    
      } catch (error) {
        return res.status(500).json({
          message: "Error fetching seller products",
        });
      }
    };
      


      export const updateProduct = async (req: AuthRequest, res: Response) => {
        try {
          const id = String(req.params.id);
          const sellerId = req.user.userId;
      
          const existingProduct = await prisma.product.findUnique({
            where: { id },
          });
      
          if (!existingProduct) {
            return res.status(404).json({
              message: "Product not found",
            });
          }
      
          if (existingProduct.sellerId !== sellerId) {
            return res.status(403).json({
              message: "Unauthorized",
            });
          }
      
          const {
            name,
            description,
            price,
            oldPrice,
            stock,
            images,
            category,
          } = req.body;
      
          const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
              name,
              description,
              price: Number(price),
              oldPrice: Number(oldPrice),
              stock: Number(stock),
              images,
              category,
              status: Number(stock) > 0 ? "ACTIVE" : "OUT_OF_STOCK",
            },
          });
      
          return res.json(updatedProduct);
      
        } catch (error) {
          return res.status(500).json({
            message: "Error updating product",
          });
        }
      };


      export const getProducts = async (
        req: AuthRequest,
        res: Response
      ) => {
        try {
          const products = await prisma.product.findMany({
            where: {
              isDeleted: false,
              status: "ACTIVE",
            },
            include: {
              seller: true,
            },
          });
      
          res.json(products);
      
        } catch (error) {
          res.status(500).json({
            message: "Error fetching products",
          });
        }
      };

      export const deleteProduct = async (req: AuthRequest, res: Response) => {
        try {
          const id = String(req.params.id);
          const sellerId = req.user.userId;
      
          const product = await prisma.product.findUnique({
            where: { id },
          });
      
          if (!product) {
            return res.status(404).json({
              message: "Product not found",
            });
          }
      
          if (product.sellerId !== sellerId) {
            return res.status(403).json({
              message: "Unauthorized",
            });
          }
      
          // SOFT DELETE
          await prisma.product.update({
            where: { id },
            data: {
              isDeleted: true,
              status: "DISABLED",
            },
          });
      
          return res.json({
            message: "Product removed successfully",
          });
      
        } catch (error) {
          return res.status(500).json({
            message: "Error deleting product",
          });
        }
      };