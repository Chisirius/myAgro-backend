import axios from "axios";

export const initializePaystack = async (email: string, amount: number) => {
  // Move the check INSIDE the function so it executes only when a user triggers checkout
  if (!process.env.PAYSTACK_SECRET_KEY) {
    console.error("Critical Production Error: PAYSTACK_SECRET_KEY environment variable is empty.");
    throw new Error("Payment gateway is temporarily unavailable.");
  }

  try {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5174";
    const response = await axios.post(
      "https://paystack.co",
      {
        email,
        amount: Math.round(amount * 100),
        callback_url: `${clientUrl}/checkout`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error("Paystack initialization failed");
  }
};
