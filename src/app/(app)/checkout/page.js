"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import { Package, CreditCard, Truck, ArrowLeft } from "lucide-react";

// Utility to load Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const [placingOrder, setPlacingOrder] = useState(false);

  const [formData, setFormData] = useState({
    shippingAddress: "",
  });

  const getPrice = (item) => Number(item.discountPrice || item.price || 0);

  const subtotal = cart.reduce(
    (sum, item) => sum + getPrice(item) * (item.quantity || 1),
    0
  );

  const tax = subtotal * 0.05;
  const calculatedTotal = subtotal + tax;

  const MAX_TEST_AMOUNT = 49999;
  const isTestMode = process.env.NODE_ENV !== "production";

  let total = calculatedTotal;
  let isAmountCapped = false;

  if (isTestMode && calculatedTotal > MAX_TEST_AMOUNT) {
    total = MAX_TEST_AMOUNT;
    isAmountCapped = true;
  }

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://ecom-backend-new-5v6o.onrender.com";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.shippingAddress) {
      return toast.error("Please select shipping address");
    }

    if (total <= 0) {
      return toast.error("Invalid order amount");
    }

    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      return toast.error("Failed to load payment gateway. Check connection.");
    }

    setPlacingOrder(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login again");
        router.push("/login");
        return;
      }

      const shippingAddr = user.addresses?.find((addr) => {
        const addrStr = `${addr.address}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
        return addrStr === formData.shippingAddress;
      });

      if (!shippingAddr) {
        toast.error("Invalid address selected");
        return;
      }

      // 1. CREATE ORDER (Backend creates both DB Order AND Razorpay Order)
      const payload = {
        items: cart.map((item) => ({
          productId: item._id || item.id,
          name: item.productName || item.name || "Product",
          price: getPrice(item),
          quantity: Number(item.quantity) || 1,
          subtotal: getPrice(item) * (item.quantity || 1),
        })),
        totalAmount: total,
        shippingAddress: {
          address: shippingAddr.address,
          city: shippingAddr.city,
          state: shippingAddr.state,
          pincode: shippingAddr.pincode,
          country: shippingAddr.country || "India",
        },
      };

      const dbOrderRes = await fetch(
        `${API_BASE}/api/orders/createOrderByCustomer`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!dbOrderRes.ok) {
        const errorText = await dbOrderRes.text();
        throw new Error("Failed to create order. Server error.");
      }

      const responseJson = await dbOrderRes.json();

      const orderData = responseJson.data;

      if (!orderData || !orderData.order || !orderData.razorpayOrder) {
        console.error("Invalid structure:", responseJson);
        throw new Error("Order created, but payment details are missing.");
      }

      const internalOrderId = orderData.order._id;
      const razorpayOrderId = orderData.razorpayOrder.id;
      const razorpayAmount = orderData.razorpayOrder.amount;
      const razorpayCurrency = orderData.razorpayOrder.currency;

      // 2. OPEN RAZORPAY MODAL (Using data from step 1)
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayAmount,
        currency: razorpayCurrency,
        name: "Tanariry",
        description: "Purchase Payment",
        order_id: razorpayOrderId, // Use the ID returned by your backend
        handler: async function (response) {
          // 3. VERIFY PAYMENT
          const verifyPayload = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId: internalOrderId,
          };

          try {
            const verifyRes = await fetch(`${API_BASE}/api/razorpay/verify`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(verifyPayload),
            });

            if (!verifyRes.ok) {
              throw new Error("Payment verification failed");
            }

            toast.success("Order placed successfully!");
            clearCart();
            localStorage.removeItem("cart");
            router.push("/orders");
          } catch (verifyErr) {
            toast.error("Payment success but verification failed.");
            console.error(verifyErr);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || "",
        },
        theme: {
          color: "#172554",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function (response) {
        toast.error("Payment Failed: " + response.error.description);
      });
      paymentObject.open();
    } catch (err) {
      console.error("Checkout Error:", err);
      toast.error(err.message || "Failed to place order");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (authLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl">
        Loading...
      </div>
    );
  if (!user)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-2xl font-bold">Login Required</h3>
          <Link href="/login" className="text-blue-600 underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  if (cart.length === 0)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col">
        <Package className="w-32 h-32 text-gray-300 mb-8" />
        <h1 className="text-4xl font-bold">Cart Empty</h1>
        <Link href="/cart" className="mt-4 text-blue-600">
          Go to Cart
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <Link
          href="/cart"
          className="flex items-center gap-2 text-[#172554] mb-8"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Cart
        </Link>

        <h1 className="text-5xl font-bold text-[#172554] mb-10">Checkout</h1>

        {isAmountCapped && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
            <p className="font-bold">Test Mode Active</p>
            <p>
              Amount capped at ₹{MAX_TEST_AMOUNT.toLocaleString()} (Razorpay
              test limit: ₹50,000)
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                <Truck className="w-7 h-7" /> Shipping Address
              </h2>
              <select
                value={formData.shippingAddress}
                onChange={(e) =>
                  setFormData({ ...formData, shippingAddress: e.target.value })
                }
                className="w-full p-4 border-2 rounded-xl text-lg"
                required
              >
                <option value="">Select Address</option>
                {user.addresses?.map((addr, i) => {
                  const str = `${addr.address}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
                  return (
                    <option key={i} value={str}>
                      {str}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-2xl shadow sticky top-6">
              <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item._id} className="flex justify-between">
                    <span>{item.productName || item.name}</span>
                    <span>
                      × {item.quantity} = ₹
                      {(getPrice(item) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-lg">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>Tax</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-[#172554] pt-4 border-t">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={placingOrder || !formData.shippingAddress}
                className="w-full mt-8 bg-[#172554] text-white py-5 rounded-xl text-xl font-semibold hover:bg-[#0f1e3d] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                <CreditCard className="w-6 h-6" />
                {placingOrder ? "Processing..." : "Pay Now"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
