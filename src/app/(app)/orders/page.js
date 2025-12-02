"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import StayInspired from "@/components/home/StayInspired";
import toast from "react-hot-toast";
import { useAuth } from '@/context/AuthContext';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const statusSteps = [
    { status: "Pending", label: "Order Placed" },
    { status: "Processing", label: "Preparing" },
    { status: "Shipped", label: "On the Way" },
    { status: "Delivered", label: "Delivered" },
  ];

  const fetchOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      const res = await fetch(`${API_BASE}/api/orders/customer`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch orders");

      const result = await res.json();
      const finalOrders = result?.data?.orders || result?.orders || result?.data || [];

      setOrders(finalOrders);

      if (finalOrders.length === 0) {
        toast.success("No orders found yet");
      } else {
        toast.success(`${finalOrders.length} order${finalOrders.length > 1 ? 's' : ''} loaded!`);
      }
    } catch (err) {
      console.error("Orders fetch failed:", err);
      toast.error("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetchOrders();
  }, [authLoading, user]);

  const openModal = (order) => {
    if (!order) return toast.error("Order data missing");
    setSelectedOrder(order);
    setIsModalOpen(true);
    setShowCancel(false);
    setCancelReason("");
    setRating(0);
    setReview("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

// const LocalInvoiceGenerator = async (order, user = {}) => {
//   try {
//     // SABSE PEHLE DEBUG KARTE HAIN (temporary - baad mein hata dena)
//     console.log("Order:", order);
//     console.log("User passed:", user);

//     // CUSTOMER DETAILS - AB KABHI BHI FAIL NAHI HOGA
//   const customerName = 
//       order.shippingAddress?.name ||
//       order.billingAddress?.name ||
//       order.customerName ||
//       "Valued Customer";

//     const customerEmail = 
//       order.shippingAddress?.email ||
//       order.billingAddress?.email ||
//       order.email ||
//       "N/A";

//     const customerPhone = 
//       order.shippingAddress?.phone ||
//       order.billingAddress?.phone ||
//       "N/A";

//     // Products
//     const items = (order.products || order.cartItems || order.items || []).map(item => ({
//       name: item.product?.name || item.name || "Item",
//       quantity: Number(item.quantity || 1),
//       price: Number(item.price || item.product?.price || 0)
//     }));

//     const invoiceNo = order.invoiceDetails?.[0]?.invoiceNo || `TNR-${order._id.slice(-8).toUpperCase()}`;
//     const totalAmount = Number(order.paymentTotal || order.totalAmount || 0);

//     const html = `
//       <div style="padding:70px 60px; font-family:Georgia,serif; background:white; color:#000; max-width:850px; margin:auto;">
        
//         <h1 style="text-align:center; color:#172554; font-size:46px; margin:0; letter-spacing:3px;">TANARIRI</h1>
//         <p style="text-align:center; color:#666; font-size:20px; margin:10px 0 40px;">Premium Crockery Collection</p>
//         <h2 style="text-align:center; color:#172554; font-size:34px; border-bottom:5px double #172554; padding-bottom:15px; margin:50px 0;">TAX INVOICE</h2>

//         <div style="display:flex; justify-content:space-between; margin:50px 0; font-size:17px; line-height:2;">
//           <div>
//             <p><strong>Invoice No:</strong> ${invoiceNo}</p>
//             <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
//             <p><strong>Order ID:</strong> <span style="font-family:monospace; font-size:15px;">${order._id}</span></p>
//           </div>
//           <div style="text-align:right;">
//             <p style="font-weight:bold; color:#172554; margin-bottom:12px; font-size:19px;">Bill To:</p>
//             <p style="margin:4px 0; font-weight:600; font-size:18px; color:#000;">${customerName}</p>
//             <p style="margin:4px 0; color:#333;">${customerEmail}</p>
//             <p style="margin:4px 0; color:#333;">${customerPhone}</p>
//           </div>
//         </div>

//         <table style="width:100%; border-collapse:collapse; margin:50px 0; font-size:16px;">
//           <thead>
//             <tr style="background:#172554; color:white;">
//               <th style="padding:16px; text-align:left;">Item Description</th>
//               <th style="padding:16px; text-align:center;">Qty</th>
//               <th style="padding:16px; text-align:right;">Price</th>
//               <th style="padding:16px; text-align:right;">Total</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${items.length > 0 ? items.map(item => `
//               <tr style="border-bottom:1px solid #eee;">
//                 <td style="padding:16px;">${item.name}</td>
//                 <td style="padding:16px; text-align:center; font-weight:600;">${item.quantity}</td>
//                 <td style="padding:16px; text-align:right;">₹${item.price.toFixed(2)}</td>
//                 <td style="padding:16px; text-align:right; font-weight:600;">₹${(item.price * item.quantity).toFixed(2)}</td>
//               </tr>
//             `).join('') : `
//               <tr><td colspan="4" style="padding:60px; text-align:center; color:#999; font-size:18px;">No items</td></tr>
//             `}
//           </tbody>
//         </table>

//         <div style="text-align:right; margin:60px 0;">
//           <div style="display:inline-block; background:#f0f9ff; padding:22px 50px; border-radius:16px; border:4px solid #172554;">
//             <p style="margin:0; font-size:30px; color:#172554;">
//               <strong>Grand Total: ₹${totalAmount.toLocaleString('en-IN')}</strong>
//             </p>
//           </div>
//         </div>

//         <div style="text-align:center; margin-top:100px; color:#666;">
//           <p style="font-size:21px; color:#172554; margin:15px 0;"><strong>Thank you for choosing Tanariri Hasvi!</strong></p>
//           <p style="margin:10px 0; font-weight:bold; color:#172554;">
//             www.tanaririhasvi.com | support@tanaririhasvi.com
//           </p>
//         </div>
//       </div>
//     `;

//     const div = document.createElement("div");
//     div.style.position = "absolute";
//     div.style.left = "-9999px";
//     div.style.top = "0";
//     div.style.width = "210mm";
//     div.style.background = "white";
//     div.innerHTML = html;
//     document.body.appendChild(div);

//     // Thoda wait - critical for rendering
//     await new Promise(r => setTimeout(r, 500));

//     const canvas = await html2canvas(div, {
//       scale: 3,
//       useCORS: true,
//       backgroundColor: "#ffffff",
//       logging: false,
//       width: 850
//     });

//     const pdf = new jsPDF("p", "mm", "a4");
//     const imgWidth = 190;
//     const imgHeight = (canvas.height * imgWidth) / canvas.width;

//     pdf.addImage(canvas.toDataURL("image/png"), "PNG", 10, 10, imgWidth, imgHeight);
//     pdf.save(`Tanariri_Invoice_${invoiceNo}.pdf`);

//     document.body.removeChild(div);
//     toast.success("Invoice downloaded with customer details!");

//   } catch (err) {
//     console.error("Invoice Error:", err);
//     toast.error("Failed to generate invoice");
//   }
// };

// // YE FUNCTION AB HAR JAGAH SE CALL KAR SAKTE HO
// const downloadInvoice = async (order, user = null) => {
//   if (!order) {
//     toast.error("Order not found!");
//     return;
//   }

//   // Agar user nahi pass kiya toh order se hi nikal lenge
//   const finalUser = user || order.user || {};
  
//   await LocalInvoiceGenerator(order, finalUser);
// };

// YE FUNCTION API SE DATA LEKE PDF BANAYEGA
const downloadInvoice = async (order) => {
  const orderId = order._id?.toString() || order.id;
  if (!orderId) {
    toast.error("Order ID not found");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_BASE}/api/orders/${orderId}/invoice`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Server Error: ${response.status}`);
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Tanariri_Invoice_${orderId.slice(-8).toUpperCase()}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    toast.success("Invoice downloaded successfully!");

  } catch (error) {
    console.error("Download failed:", error);
    toast.error("Failed to download invoice");
  }
};

  const cancelOrder = async () => {
    if (!cancelReason) return toast.error("Please select a reason");
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/api/orders/${selectedOrder._id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus: "Cancelled", cancellationReason: cancelReason }),
    });
    if (res.ok) {
      toast.success("Order cancelled");
      setOrders(prev => prev.map(o => o._id === selectedOrder._id ? { ...o, orderStatus: "Cancelled" } : o));
      closeModal();
    } else toast.error("Failed to cancel");
  };

  const reOrder = async () => {
    const token = localStorage.getItem("token");
    const product = selectedOrder.products?.[0];
    if (!product) return toast.error("Product not found");
    const res = await fetch("/api/cart/add", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ product: product.product, quantity: product.quantity }),
    });
    res.ok ? toast.success("Added to cart!") : toast.error("Failed");
  };

  const submitReview = async () => {
    if (rating === 0 || !review.trim()) return toast.error("Rating & review required");
    const token = localStorage.getItem("token");
    const product = selectedOrder.products?.[0];
    if (!product) return toast.error("Product not found");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ product: product.product, rating, review, order: selectedOrder._id }),
    });
    res.ok ? toast.success("Review submitted!") : toast.error("Failed");
    res.ok && closeModal();
  };

  const copyInvoiceNo = () => {
    const no = selectedOrder?.invoiceDetails?.[0]?.invoiceNo || selectedOrder?._id?.slice(-6).toUpperCase() || "N/A";
    navigator.clipboard.writeText(no);
    toast.success("Copied!");
  };

  // 100% SAFE INDEX
  const currentIndex = selectedOrder?.orderStatus
    ? statusSteps.findIndex(s => s.status === selectedOrder.orderStatus)
    : -1;

  const SkeletonRow = () => (
    <div className="animate-pulse space-y-4 pb-6 border-b border-gray-200">
      <div className="grid grid-cols-3 gap-4 md:gap-8">
        <div className="space-y-3"><div className="h-4 bg-gray-200 rounded w-32"></div><div className="h-6 bg-gray-200 rounded-full w-20"></div></div>
        <div className="space-y-3"><div className="h-4 bg-gray-200 rounded w-28"></div><div className="h-4 bg-gray-200 rounded w-24"></div></div>
        <div className="flex justify-end"><div className="h-8 w-16 bg-gray-200 rounded-lg"></div></div>
      </div>
    </div>
  );

  const EmptyOrdersUI = () => (
    <div className="text-center py-16 px-6">
      <div className="max-w-md mx-auto">
        <div className="mx-auto w-24 h-24 mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          No Orders Yet
        </h3>
        <p className="text-gray-500 mb-8">Looks like you haven't placed any orders yet.</p>
        <Link href="/products" className="inline-flex items-center gap-2 bg-[#1E3A8A] text-white hover:bg-[#172554] px-8 py-3 rounded-md font-medium">
          Start Shopping
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <div className="w-full bg-background flex justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full space-y-6">
          <div className="relative inline-block pb-6">
            <h1 className="text-5xl text-[#172554]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
              My Orders
            </h1>
            <div className="absolute left-0 bottom-0 h-1 bg-[#172554] rounded-full w-full overflow-hidden">
              <div className="absolute inset-0 bg-pink-500 animate-shimmer"></div>
            </div>
          </div>

          <div className="bg-white p-6 lg:p-12 rounded-lg shadow-sm border border-gray-200">
            {authLoading || loading ? (
              <div className="space-y-8"><SkeletonRow /><SkeletonRow /></div>
            ) : !user ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-6">Please log in to view your orders.</p>
                <Link href="/auth/login" className="bg-black text-white hover:bg-gray-800 px-6 py-3 rounded-md">Login</Link>
              </div>
            ) : orders.length === 0 ? (
              <EmptyOrdersUI />
            ) : (
              <div className="space-y-8">
                {orders.map((order) => (
                  <div key={order._id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                    <div className="grid grid-cols-3 gap-4 md:gap-8 text-md">
                      <div className="space-y-4">
                        <div><span className="text-gray-600">Order: </span><span className="font-medium text-[#172554]">
                          {order.invoiceDetails?.[0]?.invoiceNo || `#${order._id?.slice(-6).toUpperCase()}`}
                        </span></div>
                        <div><span className="text-gray-600">Status: </span>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border-2 ${
                            order.orderStatus === "Delivered" ? "border-green-600 text-green-600" :
                            order.orderStatus === "Cancelled" ? "border-red-600 text-red-600" :
                            order.orderStatus === "Shipped" ? "border-blue-600 text-blue-600" :
                            "border-[#172554] text-[#172554]"
                          }`}>{order.orderStatus || "Pending"}</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div><span className="text-gray-600">Date: </span>{new Date(order.createdAt).toLocaleDateString("en-IN")}</div>
                        <div><span className="text-gray-600">Total: </span><span className="font-medium">₹{Number(order.paymentTotal || order.totalAmount || 0).toFixed(2)}</span></div>
                      </div>
                      <div className="flex justify-end items-center">
                        <button onClick={() => openModal(order)} className="h-8 w-16 text-sm border-2 border-[#172554] rounded-lg bg-white hover:bg-[#172554] hover:text-white transition font-medium">
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL — 100% CRASH PROOF */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-[#172554]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Order Details
                </h2>
                <p className="text-sm text-gray-500">
                  Invoice: {selectedOrder?.invoiceDetails?.[0]?.invoiceNo || selectedOrder?.invoiceNo || `#${selectedOrder?._id?.slice(-6).toUpperCase()}` || "N/A"}
                </p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="font-medium text-[#172554]">{user?.firstName} {user?.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-[#172554]">{user?.email}</p>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">Products</p>
              {selectedOrder?.products && selectedOrder.products.length > 0 ? (
                selectedOrder.products.map((item, i) => (
                  <div key={i} className="flex justify-between py-2 text-sm border-b last:border-b-0">
                    <span className="font-medium text-[#172554]">
                      {item.product?.name || item.name || "Product"}
                    </span>
                    <span>₹{item.price || 0} × {item.quantity || 1}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No products found</p>
              )}
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{(selectedOrder?.paymentTotal || selectedOrder?.totalAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Discount</span>
                <span className="text-green-600">-₹{(selectedOrder?.discount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t text-[#172554]">
                <span>Total Paid</span>
                <span>₹{(selectedOrder?.paymentTotal || selectedOrder?.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium mb-3 text-[#172554]">Order Tracking</h4>
              <div className="relative">
                <div className="flex items-center justify-between">
                  {statusSteps.map((step, i) => (
                    <div key={i} className="flex flex-col items-center z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all ${
                        i <= currentIndex ? "bg-[#172554] border-[#172554] text-white" : "bg-white border-gray-300 text-gray-500"
                      }`}>
                        {i + 1}
                      </div>
                      <p className={`text-xs mt-2 font-medium ${i <= currentIndex ? "text-[#172554]" : "text-gray-500"}`}>
                        {step.label}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="absolute top-5 left-0 right-0 h-1 -z-10">
                  <div className="h-full bg-gray-300 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#172554] transition-all duration-500 rounded-full"
                      style={{ width: currentIndex >= 0 ? `${(currentIndex / (statusSteps.length - 1)) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {selectedOrder.orderStatus === "Pending" && (
              <div className="mb-6 p-5 border border-red-200 rounded-xl bg-red-50">
                <button onClick={() => setShowCancel(!showCancel)} className="group flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm">
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 6L6 18M6 6l12 12" />
                  </svg>
                  Cancel Order
                </button>
                {showCancel && (
                  <div className="mt-4 space-y-4">
                    <select value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="w-full p-3 border rounded-lg">
                      <option value="">Select Reason</option>
                      <option>Changed my mind</option>
                      <option>Found cheaper elsewhere</option>
                      <option>Wrong size/color</option>
                      <option>Other</option>
                    </select>
                    <div className="flex gap-3">
                      <button onClick={cancelOrder} className="flex-1 bg-white border border-red-500 text-red-500 py-2.5 rounded-lg hover:bg-red-50 font-medium">
                        Confirm Cancel
                      </button>
                      <button onClick={() => setShowCancel(false)} className="px-4 py-2.5 border rounded-lg">
                        Back
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedOrder.orderStatus === "Delivered" && (
              <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="font-medium mb-2 text-[#172554]">Rate Your Experience</h4>
                <div className="flex gap-1 mb-2">
                  {[1,2,3,4,5].map((star) => (
                    <button key={star} onClick={() => setRating(star)} className={`text-2xl ${star <= rating ? "text-yellow-500" : "text-gray-300"}`}>
                      ★
                    </button>
                  ))}
                </div>
                <textarea value={review} onChange={(e) => setReview(e.target.value)} placeholder="Share your experience..." className="w-full p-2 border rounded mb-2" rows="3" />
                <button onClick={submitReview} className="w-full bg-[#172554] text-white py-2 rounded hover:bg-[#1e3a8a] font-medium">
                  Submit Review
                </button>
              </div>
            )}

            <div className="flex gap-2 flex-wrap mt-6">
              <button onClick={() => downloadInvoice(selectedOrder)} className="flex-1 bg-white border-2 border-[#172554] text-[#172554] py-2.5 rounded-lg hover:bg-[#172554] hover:text-white font-medium transition text-sm">
                Download Invoice
              </button>
              {/* <button onClick={reOrder} className="flex-1 bg-white border-2 border-[#172554] text-[#172554] py-2.5 rounded-lg hover:bg-[#172554] hover:text-white font-medium transition text-sm">
                Re-order
              </button> */}
              <button onClick={copyInvoiceNo} className="flex-1 bg-white border-2 border-[#172554] text-[#172554] py-2.5 rounded-lg hover:bg-[#172554] hover:text-white font-medium transition text-sm">
                Copy Invoice No
              </button>
            </div>
          </div>
        </div>
      )}

      <StayInspired />
    </>
  );
}