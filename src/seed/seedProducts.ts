import dotenv from "dotenv";
dotenv.config();

import prisma from "../config/prisma";
import { products } from "./products.seed";

async function seedProducts() {
  try {
    console.log("DB URL:", process.env.DATABASE_URL);
    console.log("🌱 Seeding products...");
    console.log("Products count:", products.length);

   
    // USERS FIRST (MUST EXIST BEFORE PRODUCTS)
    

    await prisma.user.createMany({
      data: [
        {
          id: "cm1",
          name: "Seller 1",
          email: "a@test.com",
          password: "123456",
          role: "SELLER",
        },
        {
          id: "cm12",
          name: "Seller 2",
          email: "b@test.com",
          password: "123456",
          role: "SELLER",
        },
        {
          id: "cm123",
          name: "Seller 3",
          email: "c@test.com",
          password: "123456",
          role: "SELLER",
        },
        {
          id: "cm1234",
          name: "Seller 4",
          email: "d@test.com",
          password: "123456",
          role: "SELLER",
        },
      ],
      skipDuplicates: true,
    });

    // PRODUCTS SECOND
    await prisma.product.createMany({
      data: products,
    });

    console.log("✅ Products seeded successfully");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedProducts();