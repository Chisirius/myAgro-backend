# MyAgro Backend API

A scalable RESTful API for the MyAgro e-commerce platform built with Node.js, Express, TypeScript, Prisma ORM, and PostgreSQL.

This backend powers authentication, product management, cart system, orders, payments (Paystack + COD), and seller inventory management.

---

# 🚀 Features

## Authentication
- JWT-based authentication
- Secure password hashing
- Protected routes middleware

---

## Products (Seller System)
- Create products
- Update products
- Delete products
- Manage stock levels
- Product image support
- Sales tracking
- Out-of-stock auto handling

---

## Cart System
- Add to cart
- Update quantity
- Remove items
- Cart persistence per user

---

## Order System
- Order creation after checkout
- Order history per user
- Order status tracking (PENDING, PAID, SHIPPED, DELIVERED)
- Order item snapshot (name, price, image)

---

## Payment Integration
- Paystack payment initialization
- Paystack payment verification
- Cash on Delivery (COD) support
- Secure transaction validation

---

## Address Management
- User shipping addresses
- Default address support
- Address selection during checkout

---

## Inventory System
- Automatic stock deduction after purchase
- Sales increment tracking
- Out-of-stock status updates

---

# 🛠 Tech Stack

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Paystack API
- Axios

---

