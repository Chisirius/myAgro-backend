import axios from "axios";

export const initializePaystack = async (
  email: string,
  amount: number
) => {
  try {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error("PAYSTACK_SECRET_KEY is missing");
    }

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: Math.round(amount * 100),
        callback_url: "http://localhost:5174/checkout",
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