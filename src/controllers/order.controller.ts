import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { initializePaystack } from "../services/paystack.service";
import axios from "axios";

// =========================
// INITIATE CHECKOUT
// =========================
export const initiateCheckout = async (
  req: AuthRequest,
  res: Response
) => {
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


    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    const subtotal =
      cart.items.reduce(
        (sum, item) =>
          sum +
          item.product.price *
            item.quantity,
        0
      );

    const shipping =
      cart.items.length > 0
        ? 1500
        : 0;

    const tax =
      subtotal * 0.02;

    const total =
      subtotal +
      shipping +
      tax;



    const user =
      await prisma.user.findUnique({
        where: { id: userId },
      });

    
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const payment =
      await initializePaystack(
        user.email,
        Number(total)
      );

    

    if (!payment) {
      return res.status(500).json({
        message:
          "No payment response from Paystack",
      });
    }

    return res.status(200).json({
      authorization_url:
        payment.authorization_url,

      access_code:
        payment.access_code,

      reference:
        payment.reference,
    });

  } catch (error: any) {

    console.log(
      "CHECKOUT ERROR FULL:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Checkout initialization failed",
    });
  }
};

// =========================
// VERIFY PAYMENT + CREATE ORDER (COD + PAYSTACK)
// =========================
export const verifyPayment = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user.userId;

    const {
      reference,
      shippingAddressId,
      paymentMethod,
    } = req.body;

    if (!shippingAddressId) {
      return res.status(400).json({
        message:
          "Shipping address is required",
      });
    }

    const isCOD = paymentMethod === "cod";

    // =========================
    // GET USER CART FIRST
    // =========================
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // =========================
    // VALIDATE STOCK
    // =========================
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          message: `${item.product.name} is out of stock`,
        });
      }
    }

    // =========================
    // PAYSTACK VERIFY (ONLY IF NOT COD)
    // =========================
    let paymentData: any = null;

    if (!isCOD) {
      if (!reference) {
        return res.status(400).json({
          message: "Payment reference is required",
        });
      }

      // prevent duplicate order
      const existingOrder = await prisma.order.findFirst({
        where: { paymentReference: reference },
      });

      if (existingOrder) {
        return res.status(400).json({
          message: "Order already exists for this payment",
        });
      }

      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      paymentData = response.data.data;

      if (paymentData.status !== "success") {
        return res.status(400).json({
          message: "Payment not successful",
        });
      }
    }

    // =========================
    // CREATE ORDER
    // =========================
    const order = await prisma.order.create({
      data: {
        
        userId,
        total: isCOD
  ? (() => {

      const subtotal =
        cart.items.reduce(
          (sum, item) =>
            sum +
            item.product.price *
              item.quantity,
          0
        );

      const shipping =
        cart.items.length > 0
          ? 1500
          : 0;

      const tax =
        subtotal * 0.02;

      return (
        subtotal +
        shipping +
        tax
      );

    })()
  : Number(paymentData.amount) / 100,

        paymentReference: isCOD ? null : reference,
        paymentStatus: isCOD ? "PENDING" : "SUCCESS",
        status: isCOD ? "PENDING" : "PAID",
        shippingAddressId,

        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
            productName: item.product.name,
            productImage: item.product.images[0],
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // =========================
    // UPDATE INVENTORY
    // =========================
    for (const item of cart.items) {
      const updatedProduct = await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
          sales: {
            increment: item.quantity,
          },
        },
      });

      if (updatedProduct.stock <= 0) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            status: "OUT_OF_STOCK",
          },
        });
      }
    }

    // =========================
    // CLEAR CART
    // =========================
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Payment verification failed",
    });
  }
};

// =========================
// GET USER ORDERS
// =========================
export const getUserOrders = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user.userId;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(orders);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error fetching orders",
    });
  }
};


// =========================
// SELLER DASHBOARD
// =========================
export const getSellerDashboard = async (
  req: AuthRequest,
  res: Response
) => {

  try {

    const sellerId =
      req.user.userId;

    // =========================
    // GET SELLER PRODUCTS
    // =========================
    const sellerProducts =
      await prisma.product.findMany({
        where: {
          sellerId,
          isDeleted: false,
        },
        select: {
          id: true,
          name: true,
          stock: true,
        },
      });

    const productIds =
      sellerProducts.map(
        (product) => product.id
      );


        


    // =========================
    // GET ORDER ITEMS
    // =========================
    const orderItems =
      await prisma.orderItem.findMany({

        where: {
          productId: {
            in: productIds,
          },
        },

        include: {

          order: {
            include: {
              user: true,
            },
          },

          product: true,
        },

        orderBy: {
          order: {
            createdAt: "desc",
          },
        },
      });

    // =========================
    // TOTAL REVENUE
    // =========================
    const totalRevenue =
      orderItems.reduce(
        (sum, item) => {

          return (
            sum +
            item.price *
              item.quantity
          );

        },
        0
      );

    // =========================
    // TOTAL ORDERS
    // =========================
    const uniqueOrders =
      [
        ...new Set(
          orderItems.map(
            (item) =>
              item.order.id
          )
        ),
      ];

    const totalOrders =
      uniqueOrders.length;

    // =========================
    // ACTIVE PRODUCTS
    // =========================
    const activeProducts =
      sellerProducts.length;

    // =========================
    // PENDING DELIVERIES
    // =========================
    const pendingDeliveries =
      orderItems.filter(
        (item) =>
          item.order.status !==
          "DELIVERED"
      ).length;

    // =========================
    // RECENT ORDERS
    // =========================
    const recentOrders =
      orderItems.slice(0, 5).map(
        (item) => ({

          id:
            item.order.id,

          buyerName:
            item.order.user.name,

          buyerEmail:
            item.order.user.email,

          product:
            item.productName,

          productImage:
            item.productImage,

          amount:
            item.price *
            item.quantity,

          deliveryStatus:
            item.order.status,

          date:
            item.order.createdAt,
        })
      );

    // =========================
    // SALES CHART DATA
    // =========================
    const salesChartData =
      orderItems.map((item) => ({

        date:
          item.order.createdAt,

        revenue:
          item.price *
          item.quantity,
      }));

    // =========================
    // RESPONSE
    // =========================
    return res.status(200).json({

      dashboardStats: {

        totalRevenue,

        totalOrders,

        activeProducts,

        pendingDeliveries,

        monthlySales:
          totalRevenue,

        revenueGrowth: 12,

        ordersGrowth: 8,

        productsGrowth: 5,

        conversionRate: 78,
      },

      recentOrders,

      salesChartData,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message:
        "Failed to fetch seller dashboard",
    });
  }
};

// =========================
// GET SELLER ORDERS
// =========================
export const getSellerOrders = async (
  req: AuthRequest,
  res: Response
) => {

  try {

    const sellerId =
      req.user.userId;

    // =========================
    // GET SELLER PRODUCTS
    // =========================
    const sellerProducts =
      await prisma.product.findMany({

        where: {
          sellerId,
        },

        select: {
          id: true,
        },
      });

    const productIds =
      sellerProducts.map(
        (product) => product.id
      );

    // =========================
    // GET ORDER ITEMS
    // =========================
    const orderItems =
      await prisma.orderItem.findMany({

        where: {
          productId: {
            in: productIds,
          },
        },

        include: {

          order: {
            include: {
              user: true,
            },
          },

          product: true,
        },

        orderBy: {
          order: {
            createdAt: "desc",
          },
        },
      });

    // =========================
    // FORMAT RESPONSE
    // =========================
    const formattedOrders =
      orderItems.map((item) => ({

        id:
          item.order.id,

        buyerName:
          item.order.user.name,

        buyerEmail:
          item.order.user.email,

        product:
          item.productName,

        productImage:
          item.productImage,

        deliveryStatus:
          item.order.status,

        paymentStatus:
          item.order.paymentStatus,

        amount:
          item.price *
          item.quantity,

        quantity:
          item.quantity,

        date:
          item.order.createdAt,
      }));

    return res.status(200).json(
      formattedOrders
    );

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message:
        "Failed to fetch seller orders",
    });
  }
};

// =========================
// SELLER WALLET
// =========================
export const getSellerWallet = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const sellerId =
      req.user.userId;

    // =========================
    // GET SELLER PRODUCTS
    // =========================
    const sellerProducts =
      await prisma.product.findMany({
        where: {
          sellerId,
        },
        select: {
          id: true,
        },
      });

    const productIds =
      sellerProducts.map(
        (product) => product.id
      );

    // =========================
    // GET ORDER ITEMS
    // =========================
    const orderItems =
      await prisma.orderItem.findMany({
        where: {
          productId: {
            in: productIds,
          },
        },
        include: {
          order: {
            include: {
              user: true,
            },
          },
          product: true,
        },
        orderBy: {
          order: {
            createdAt: "desc",
          },
        },
      });

    // =========================
    // CALCULATIONS
    // =========================
    const totalEarnings =
      orderItems.reduce(
        (sum, item) =>
          sum +
          item.price *
            item.quantity,
        0
      );

    const pendingPayouts =
      orderItems
        .filter(
          (item) =>
            item.order.paymentStatus ===
            "PENDING"
        )
        .reduce(
          (sum, item) =>
            sum +
            item.price *
              item.quantity,
          0
        );

    const availableBalance =
      totalEarnings -
      pendingPayouts;

    // =========================
    // THIS MONTH EARNINGS
    // =========================
    const currentMonth =
      new Date().getMonth();

    const currentYear =
      new Date().getFullYear();

    const thisMonthEarnings =
      orderItems
        .filter((item) => {

          const orderDate =
            new Date(
              item.order.createdAt
            );

          return (
            orderDate.getMonth() ===
              currentMonth &&
            orderDate.getFullYear() ===
              currentYear
          );
        })
        .reduce(
          (sum, item) =>
            sum +
            item.price *
              item.quantity,
          0
        );

    // =========================
    // TRANSACTIONS
    // =========================
    const transactions =
      orderItems.map((item) => ({

        id: item.id,

        description:
          `Sale of ${item.productName}`,

        amount:
          item.price *
          item.quantity,

        status:
          item.order.paymentStatus
            .toLowerCase(),

        date:
          item.order.createdAt,

        customerName:
          item.order.user.name,

        type: "sale",

      }));

    return res.status(200).json({

      stats: {
        totalEarnings,
        availableBalance,
        pendingPayouts,
        thisMonthEarnings,
        earningsGrowth: 12,
      },

      transactions,

    });

  } catch (error) {

    return res.status(500).json({
      message:
        "Error fetching wallet data",
    });
  }
};