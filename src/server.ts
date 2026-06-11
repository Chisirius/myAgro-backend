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



const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://chisirius-nithub-ecommerce-project-pqejy4jc0.vercel.app/",
  "https://chisirius-nithub-ecommerce-project.vercel.app/"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const isAllowedProduction = allowedOrigins.includes(origin);

      // allow all vercel preview deployments
      const isAllowedPreview =
      /^https:\/\/nithub-ecommerce-project.*\.vercel\.app$/.test(origin);
      
      if (isAllowedProduction || isAllowedPreview) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },

    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],

    credentials: true,
  })
);




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
