import axios from "axios";

export const initializePaystack = async (
  email: string,
  amount: number
) => {
  try {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error("PAYSTACK_SECRET_KEY is missing");
    }

    // Dynamic URL fallback to localhost if production variable is empty
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5174";

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: Math.round(amount * 100),
        callback_url: `${clientUrl}/checkout`, // Dynamic redirect URL
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