import { Request, Response } from "express";
import prisma from "../config/prisma";
import Jwt  from "jsonwebtoken";
import bcrypt from "bcrypt"


if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing");
  }
  
  const JWT_SECRET = process.env.JWT_SECRET;

// --------------
// REGISTER USER
// --------------

export async function Register (req: Request, res: Response){
    const {name, email, password} = req.body

    try {
        const isRegistered = await prisma.user.findUnique({
            where : {email}
        })

        if (isRegistered){
            return res.status(400).json({ message: "User already exists" });
        }

        const hashPassword = await bcrypt.hash(password, 10)

       const user =await prisma.user.create({
            data: {
                name,
                email,
                password : hashPassword
            }
        })
        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email
          })
    }catch (error){
        res.status(500).json({ message: "Error registering user" });
    }
}



// ------------
// LOGIN USER
// ------------


export async function Login(req: Request, res: Response) {
    const { email, password } = req.body;
  
    try {
      // Find user
      const findUser = await prisma.user.findUnique({
        where: { email }
      });
  
      if (!findUser) {
        return res.status(400).json({ message: "Invalid Credentials" });
      }
  
      // Compare password FIRST
      const passwordMatch = await bcrypt.compare(
        password,
        findUser.password
      );
  
      if (!passwordMatch) {
        return res.status(400).json({ message: "Invalid Credentials" });
      }
  
      // Create token
      const token = Jwt.sign(
        { userId: findUser.id, userRole: findUser.role },
        JWT_SECRET,
        { expiresIn: "1d" }
      );
  
      // Remove password AFTER validation
      const { password: _, ...safeUser } = findUser;
  
      return res.json({
        token,
        user: safeUser
      });
  
    } catch (error) {
      return res.status(500).json({ message: "Error logging in" });
    }
  }