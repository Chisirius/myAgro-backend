import express from "express";
import prisma from "./config/prisma";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import productRoutes from "./routes/product.routes";
import path from "path";
import uploadRoutes from "./routes/upload.routes";
import cartRoutes from "./routes/cart.routes";
import wishlistRoutes from "./routes/wishlist.routes";
import orderRoutes from "./routes/order.routes";
import addressRoutes from "./routes/address.route";
import cors from "cors";
import { setupSwagger } from "./swagger";





const app = express()
const port = 5000;
setupSwagger(app);;

const corsOptions = {
  origin: 'https://nithub-ecommerce-project-6n2b.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Allow cookies or auth headers if your app uses them
};

app.use(cors(corsOptions));




app.use(express.json());

app.get("/", (req, res)=>{
    res.send("App is currently running...")
})

app.get("/users", async (req, res) => {
    try {
      const users = await prisma.user.findMany();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Something went wrong" });
    }
  });

  app.post("/test", (req, res) => {
    console.log(req.body);

    res.json({
        message: "POST works",
        body: req.body
    });
});


//   --------------
//   AUTHENTICATION
//   ---------------

app.use("/api/auth", authRoutes)

app.use("/api/users", userRoutes);

app.use ("/api/products", productRoutes)

app.use("/api/upload", uploadRoutes);

app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);

app.use("/api/orders", orderRoutes);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/upload", uploadRoutes);
app.use("/api/addresses", addressRoutes);

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
})
