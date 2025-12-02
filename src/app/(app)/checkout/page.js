// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/context/AuthContext";
// import { useCart } from "@/context/CartContext";
// import toast from "react-hot-toast";
// import { Package, CreditCard, Truck, ArrowLeft } from "lucide-react";

// // Utility to load Razorpay script dynamically
// const loadRazorpayScript = () => {
//   return new Promise((resolve) => {
//     const script = document.createElement("script");
//     script.src = "https://checkout.razorpay.com/v1/checkout.js";
//     script.onload = () => resolve(true);
//     script.onerror = () => resolve(false);
//     document.body.appendChild(script);
//   });
// };

// export default function CheckoutPage() {
//   const { user, loading: authLoading } = useAuth();
//   const { cart, clearCart } = useCart();
//   const router = useRouter();
//   const [placingOrder, setPlacingOrder] = useState(false);

//   const [formData, setFormData] = useState({
//     shippingAddress: "",
//   });

//   const getPrice = (item) => Number(item.discountPrice || item.price || 0);

//   const subtotal = cart.reduce(
//     (sum, item) => sum + getPrice(item) * (item.quantity || 1),
//     0
//   );

//   const tax = subtotal * 0.05;
//   const calculatedTotal = subtotal + tax;

//   const MAX_TEST_AMOUNT = 49999;
//   const isTestMode = process.env.NODE_ENV !== "production";

//   let total = calculatedTotal;
//   let isAmountCapped = false;

//   if (isTestMode && calculatedTotal > MAX_TEST_AMOUNT) {
//     total = MAX_TEST_AMOUNT;
//     isAmountCapped = true;
//   }

//   const API_BASE =
//     process.env.NEXT_PUBLIC_API_BASE_URL ||
//     "https://ecom-backend-new-5v6o.onrender.com";

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.shippingAddress) {
//       return toast.error("Please select shipping address");
//     }

//     if (total <= 0) {
//       return toast.error("Invalid order amount");
//     }

//     const isScriptLoaded = await loadRazorpayScript();
//     if (!isScriptLoaded) {
//       return toast.error("Failed to load payment gateway. Check connection.");
//     }

//     setPlacingOrder(true);

//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         toast.error("Please login again");
//         router.push("/login");
//         return;
//       }

//       const shippingAddr = user.addresses?.find((addr) => {
//         const addrStr = `${addr.address}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
//         return addrStr === formData.shippingAddress;
//       });

//       if (!shippingAddr) {
//         toast.error("Invalid address selected");
//         return;
//       }

//       // 1. CREATE ORDER (Backend creates both DB Order AND Razorpay Order)
//       const payload = {
//         items: cart.map((item) => ({
//           productId: item._id || item.id,
//           name: item.productName || item.name || "Product",
//           price: getPrice(item),
//           quantity: Number(item.quantity) || 1,
//           subtotal: getPrice(item) * (item.quantity || 1),
//         })),
//         totalAmount: total,
//         shippingAddress: {
//           address: shippingAddr.address,
//           city: shippingAddr.city,
//           state: shippingAddr.state,
//           pincode: shippingAddr.pincode,
//           country: shippingAddr.country || "India",
//         },
//       };

//       const dbOrderRes = await fetch(
//         `${API_BASE}/api/orders/createOrderByCustomer`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(payload),
//         }
//       );

//       if (!dbOrderRes.ok) {
//         const errorText = await dbOrderRes.text();
//         throw new Error("Failed to create order. Server error.");
//       }

//       const responseJson = await dbOrderRes.json();

//       const orderData = responseJson.data;

//       if (!orderData || !orderData.order || !orderData.razorpayOrder) {
//         console.error("Invalid structure:", responseJson);
//         throw new Error("Order created, but payment details are missing.");
//       }

//       const internalOrderId = orderData.order._id;
//       const razorpayOrderId = orderData.razorpayOrder.id;
//       const razorpayAmount = orderData.razorpayOrder.amount;
//       const razorpayCurrency = orderData.razorpayOrder.currency;

//       // 2. OPEN RAZORPAY MODAL (Using data from step 1)
//       const options = {
//         key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
//         amount: razorpayAmount,
//         currency: razorpayCurrency,
//         name: "Tanariry",
//         description: "Purchase Payment",
//         order_id: razorpayOrderId, // Use the ID returned by your backend
//         handler: async function (response) {
//           // 3. VERIFY PAYMENT
//           const verifyPayload = {
//             razorpay_order_id: response.razorpay_order_id,
//             razorpay_payment_id: response.razorpay_payment_id,
//             razorpay_signature: response.razorpay_signature,
//             orderId: internalOrderId,
//           };

//           try {
//             const verifyRes = await fetch(`${API_BASE}/api/razorpay/verify`, {
//               method: "POST",
//               headers: {
//                 Authorization: `Bearer ${token}`,
//                 "Content-Type": "application/json",
//               },
//               body: JSON.stringify(verifyPayload),
//             });

//             if (!verifyRes.ok) {
//               throw new Error("Payment verification failed");
//             }

//             toast.success("Order placed successfully!");
//             clearCart();
//             localStorage.removeItem("cart");
//             router.push("/orders");
//           } catch (verifyErr) {
//             toast.error("Payment success but verification failed.");
//             console.error(verifyErr);
//           }
//         },
//         prefill: {
//           name: user.name,
//           email: user.email,
//           contact: user.phone || "",
//         },
//         theme: {
//           color: "#172554",
//         },
//       };

//       const paymentObject = new window.Razorpay(options);
//       paymentObject.on("payment.failed", function (response) {
//         toast.error("Payment Failed: " + response.error.description);
//       });
//       paymentObject.open();
//     } catch (err) {
//       console.error("Checkout Error:", err);
//       toast.error(err.message || "Failed to place order");
//     } finally {
//       setPlacingOrder(false);
//     }
//   };

//   if (authLoading)
//     return (
//       <div className="min-h-screen flex items-center justify-center text-2xl">
//         Loading...
//       </div>
//     );
//   if (!user)
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 flex items-center justify-center px-4">
//   <div className="max-w-md w-full text-center">
//     {/* Decorative Icon */}
//     <div className="mx-auto w-24 h-24 mb-8 relative">
//       <div className="absolute inset-0 bg-[#1E3A8A]/10 rounded-full blur-3xl animate-pulse"></div>
//       <div className="relative bg-[#1E3A8A] w-full h-full rounded-full flex items-center justify-center shadow-2xl">
//         <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
//             d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//         </svg>
//       </div>
//     </div>

//     {/* Main Text */}
//     <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
//       Welcome Back!
//     </h1>
    
//     <p className="text-lg text-gray-600 mb-8 leading-relaxed">
//       You need to <span className="text-[#1E3A8A] font-semibold">sign in</span> to continue shopping and access your wishlist & cart.
//     </p>

//     {/* Login Button */}
//     <Link 
//       href="/auth/login"
//       className="inline-flex items-center gap-3 bg-[#1E3A8A] hover:bg-[#172554] text-white font-semibold text-lg px-10 py-4 rounded-xl shadow-lg transform transition-all duration-200 hover:shadow-2xl"
//     >
//       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
//           d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
//       </svg>
//       Sign In Now
//     </Link>

//     {/* Subtle note */}
//     <p className="mt-8 text-sm text-gray-500">
//       New here?{" "}
//       <Link href="/auth/signup" className="text-[#1E3A8A] font-medium hover:underline">
//         Create an account
//       </Link>
//     </p>

//     {/* Decorative bottom */}
//     <div className="mt-12 text-gray-400 text-xs">
//       Secure • Fast • One-click access
//     </div>
//   </div>
// </div>
//     );
//   if (cart.length === 0)
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col">
//         <Package className="w-32 h-32 text-gray-300 mb-8" />
//         <h1 className="text-4xl font-bold">Cart Empty</h1>
//         <Link href="/cart" className="mt-4 text-blue-600">
//           Go to Cart
//         </Link>
//       </div>
//     );

//   return (
//     <div className="min-h-screen bg-gray-50 py-12">
//       <div className="max-w-7xl mx-auto px-4">
//         <Link
//           href="/cart"
//           className="flex items-center gap-2 text-[#172554] mb-8"
//         >
//           <ArrowLeft className="w-5 h-5" /> Back to Cart
//         </Link>

//         <h1 className="text-5xl font-bold text-[#172554] mb-10">Checkout</h1>

//         {isAmountCapped && (
//           <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
//             <p className="font-bold">Test Mode Active</p>
//             <p>
//               Amount capped at ₹{MAX_TEST_AMOUNT.toLocaleString()} (Razorpay
//               test limit: ₹50,000)
//             </p>
//           </div>
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
//           <div className="lg:col-span-2 space-y-8">
//             <div className="bg-white p-8 rounded-2xl shadow">
//               <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
//                 <Truck className="w-7 h-7" /> Shipping Address
//               </h2>
//               <select
//                 value={formData.shippingAddress}
//                 onChange={(e) =>
//                   setFormData({ ...formData, shippingAddress: e.target.value })
//                 }
//                 className="w-full p-4 border-2 rounded-xl text-lg"
//                 required
//               >
//                 <option value="">Select Address</option>
//                 {user.addresses?.map((addr, i) => {
//                   const str = `${addr.address}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
//                   return (
//                     <option key={i} value={str}>
//                       {str}
//                     </option>
//                   );
//                 })}
//               </select>
//             </div>
//           </div>

//           <div className="lg:col-span-1">
//             <div className="bg-white p-8 rounded-2xl shadow sticky top-6">
//               <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
//               <div className="space-y-4 mb-6">
//                 {cart.map((item) => (
//                   <div key={item._id} className="flex justify-between">
//                     <span>{item.productName || item.name}</span>
//                     <span>
//                       × {item.quantity} = ₹
//                       {(getPrice(item) * item.quantity).toFixed(2)}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//               <div className="border-t pt-4 space-y-3">
//                 <div className="flex justify-between text-lg">
//                   <span>Subtotal</span>
//                   <span>₹{subtotal.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between text-lg">
//                   <span>Tax</span>
//                   <span>₹{tax.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between text-2xl font-bold text-[#172554] pt-4 border-t">
//                   <span>Total</span>
//                   <span>₹{total.toFixed(2)}</span>
//                 </div>
//               </div>

//               <button
//                 onClick={handleSubmit}
//                 disabled={placingOrder || !formData.shippingAddress}
//                 className="w-full mt-8 bg-[#172554] text-white py-5 rounded-xl text-xl font-semibold hover:bg-[#0f1e3d] disabled:opacity-50 flex items-center justify-center gap-3"
//               >
//                 <CreditCard className="w-6 h-6" />
//                 {placingOrder ? "Processing..." : "Pay Now"}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState,useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import { Package, Truck, ArrowLeft, CreditCard } from "lucide-react";
import StayInspired from "@/components/home/StayInspired";

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
  const [paymentMethod, setPaymentMethod] = useState("online"); // 'online' or 'cod'

  const [formData, setFormData] = useState({
    shippingAddress: "",
  });

  const getPrice = (item) => Number(item.discountPrice || item.price || 0);

  const subtotal = cart.reduce(
    (sum, item) => sum + getPrice(item) * (item.quantity || 1),
    0
  );

  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

    useEffect(() => {
  if (authLoading) return; 
  if (!user) {
    toast.error("Please login to checkout");
    router.push("/auth/login");
    return;
  }

  if (cart.length === 0) {
    toast.error("Your cart is empty");
    router.push("/cart");
    return;
  }
}, [authLoading, user, cart, router]);

  // Handle both COD and Online Payment
  const handlePlaceOrder = async () => {
    if (!formData.shippingAddress) {
      toast.error("Please select a shipping address");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setPlacingOrder(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login again");
        router.push("/auth/login");
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

        let payload = {
          items: cart.map((item) => {
            const priceInPaise = Math.round(getPrice(item) * 100); 
            const quantity = Number(item.quantity) || 1;

            return {
              productId: item._id || item.id,
              name: item.productName || item.name || "Product",
              price: priceInPaise,
              quantity: quantity,
              subtotal: priceInPaise * quantity,
            };
          }),
          totalAmount: Math.round(total * 100), 
          shippingAddress: {
            address: shippingAddr.address,
            city: shippingAddr.city,
            state: shippingAddr.state,
            pincode: shippingAddr.pincode,
            country: shippingAddr.country || "India",
          },
        };

        if (paymentMethod === "online") {
          payload.paymentMethod = "online";
        }


    if (paymentMethod === "cod") {
  try {
    const res = await fetch(`${API_BASE}/api/orders/createOrderByCustomer`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("COD Error:", err);
      toast.error(err.message || "COD order failed");
      return;
    }

    toast.success("Order placed! Pay on delivery");
    clearCart();
    localStorage.removeItem("cart");
    router.push("/orders");
    return;

  } catch (err) {
    toast.error("Network error");
    return;
  }
  
}

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error("Failed to load payment gateway");
        setPlacingOrder(false);
        return;
      }

      const orderRes = await fetch(`${API_BASE}/api/orders/createOrderByCustomer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!orderRes.ok) throw new Error("Failed to create order");

      const orderData = (await orderRes.json()).data;

      if (!orderData?.razorpayOrder) {
        throw new Error("Payment details missing");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.razorpayOrder.amount,
        currency: orderData.razorpayOrder.currency,
        name: "Tanariry",
        description: "Order Payment",
        order_id: orderData.razorpayOrder.id,
        handler: async (response) => {
          const verifyPayload = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId: orderData.order._id,
          };

          const verifyRes = await fetch(`${API_BASE}/api/razorpay/verify`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(verifyPayload),
          });

          if (verifyRes.ok) {
            toast.success("Payment successful! Order placed");
            clearCart();
            localStorage.removeItem("cart");
            router.push("/orders");
          } else {
            toast.error("Payment failed. Please try again.");
          }
        },
        prefill: {
          name: user.name || user.firstName + " " + user.lastName,
          email: user.email,
          contact: user.phone || "",
        },
        theme: { color: "#172554" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  

  return (
    <div className=" bg-gray-50">
      <div className=" mx-auto px-8 py-12">

        {/* Back & Title */}
        {/* <Link href="/cart" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link> */}
        <div className="relative inline-block pb-3 mb-6">
            <h1 className="text-5xl text-[#172554]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
             Checkout
            </h1>
            <div className="absolute left-0 bottom-0 h-1 bg-[#172554] rounded-full w-full overflow-hidden">
              <div className="absolute inset-0 bg-pink-500 animate-shimmer"></div>
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Address + Payment Method */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Shipping Address */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <Truck className="w-6 h-6 text-gray-700" />
                <h2 className="text-xl font-semibold">Shipping Address</h2>
              </div>
              <select
                value={formData.shippingAddress}
                onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#172554] focus:border-[#172554] outline-none"
                required
              >
                <option value="">Select address</option>
                {user.addresses?.map((addr, i) => {
                  const str = `${addr.address}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
                  return <option key={i} value={str}>{str}</option>;
                })}
              </select>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-5">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === "online"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-[#172554]"
                  />
                  <div className="flex-1">
                    <div className="font-medium">Online Payment</div>
                    <div className="text-sm text-gray-600">Credit/Debit Card, UPI, Netbanking</div>
                  </div>
                  <CreditCard className="w-6 h-6 text-gray-500" />
                </label>

                <label className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-[#172554]"
                  />
                  <div className="flex-1">
                    <div className="font-medium">Cash on Delivery (COD)</div>
                    <div className="text-sm text-gray-600">Pay when you receive</div>
                  </div>
                  <Package className="w-6 h-6 text-gray-500" />
                </label>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-5 pb-4 border-b">Order Summary</h2>

              <div className="space-y-4 text-sm mb-6">
                {cart.map((item) => (
                  <div key={item._id} className="flex justify-between">
                    <span className="text-gray-600">{item.productName || item.name} × {item.quantity}</span>
                    <span className="font-medium">₹{(getPrice(item) * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-5">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (5%)</span>
                  <span>₹{tax.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-4 border-t">
                  <span>Total</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder || !formData.shippingAddress}
                className="w-full mt-6 bg-[#172554] hover:bg-[#0f1e3d] text-white font-semibold py-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placingOrder
                  ? "Processing..."
                  : paymentMethod === "cod"
                  ? "Place Order (COD)"
                  : `Pay ₹${total.toLocaleString("en-IN")}`}
              </button>

              <p className="text-center text-xs text-gray-500 mt-4">
                Secured by SSL • Trusted by thousands
              </p>
            </div>
          </div>
        </div>
      </div>
      <div>
        <StayInspired />
      </div>
     </div>
    
  );
}