"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import StayInspired from "@/components/home/StayInspired";
import toast from "react-hot-toast";
import { useAuth } from '@/context/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const IMG_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL

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

  // Fetch all orders for the logged-in user
  const fetchOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token missing");

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
      console.error("Failed to load orders:", err);
      toast.error("Unable to load orders");
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

  // Download invoice as PDF
  const downloadInvoice = async (order) => {
    const orderId = order._id?.toString() || order.id;
    if (!orderId) {
      toast.error("Order ID not found");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/api/orders/${orderId}/invoice`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

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
      console.error("Invoice download failed:", error);
      toast.error("Failed to download invoice");
    }
  };

  // Cancel order
  const cancelOrder = async () => {
    if (!cancelReason) return toast.error("Please select a cancellation reason");

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/orders/${selectedOrder._id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderStatus: "Cancelled",
          cancellationReason: cancelReason,
        }),
      });

      if (res.ok) {
        toast.success("Order cancelled successfully");
        setOrders((prev) =>
          prev.map((o) =>
            o._id === selectedOrder._id ? { ...o, orderStatus: "Cancelled" } : o
          )
        );
        closeModal();
      } else {
        toast.error("Failed to cancel order");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  // Copy invoice number to clipboard
  const copyInvoiceNo = () => {
    const invoiceNo =
      selectedOrder?.invoiceDetails?.[0]?.invoiceNo ||
      selectedOrder?.invoiceNo ||
      `#${selectedOrder?._id?.slice(-6).toUpperCase()}` ||
      "N/A";

    navigator.clipboard.writeText(invoiceNo);
    toast.success("Invoice number copied!");
  };

  // Find current status index for tracking bar
  const currentIndex = selectedOrder?.orderStatus
    ? statusSteps.findIndex((s) => s.status === selectedOrder.orderStatus)
    : -1;

  // Skeleton loader
  const SkeletonRow = () => (
    <div className="animate-pulse space-y-4 pb-6 border-b border-gray-200">
      <div className="grid grid-cols-3 gap-4 md:gap-8">
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-28"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="flex justify-end">
          <div className="h-8 w-16 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );

  // Empty state UI
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
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-[#1E3A8A] text-white hover:bg-[#172554] px-8 py-3 rounded-md font-medium"
        >
          Start Shopping
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <div className="w-full bg-background flex justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full space-y-6">
          {/* Page Title */}
          <div className="relative inline-block pb-6">
            <h1 className="text-5xl text-[#172554]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
              My Orders
            </h1>
            <div className="absolute left-0 bottom-0 h-1 bg-[#172554] rounded-full w-full overflow-hidden">
              <div className="absolute inset-0 bg-pink-500 animate-shimmer"></div>
            </div>
          </div>

          {/* Orders List */}
          <div className="bg-white p-6 lg:p-12 rounded-lg shadow-sm border border-gray-200">
            {authLoading || loading ? (
              <div className="space-y-8">
                <SkeletonRow />
                <SkeletonRow />
              </div>
            ) : !user ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-6">Please log in to view your orders.</p>
                <Link href="/auth/login" className="bg-black text-white hover:bg-gray-800 px-6 py-3 rounded-md">
                  Login
                </Link>
              </div>
            ) : orders.length === 0 ? (
              <EmptyOrdersUI />
            ) : (
              <div className="space-y-8">
                {orders.map((order) => (
                  <div key={order._id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                    <div className="grid grid-cols-3 gap-4 md:gap-8 text-md">
                      <div className="space-y-4">
                        <div>
                          <span className="text-gray-600">Order: </span>
                          <span className="font-medium text-[#172554]">
                            {order.invoiceDetails?.[0]?.invoiceNo || `#${order._id?.slice(-6).toUpperCase()}`}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Status: </span>
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded-full border-2 ${
                              order.orderStatus === "Delivered"
                                ? "border-green-600 text-green-600"
                                : order.orderStatus === "Cancelled"
                                ? "border-red-600 text-red-600"
                                : order.orderStatus === "Shipped"
                                ? "border-blue-600 text-blue-600"
                                : "border-[#172554] text-[#172554]"
                            }`}
                          >
                            {order.orderStatus || "Pending"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <span className="text-gray-600">Date: </span>
                          {new Date(order.createdAt).toLocaleDateString("en-IN")}
                        </div>
                        <div>
                          <span className="text-gray-600">Total: </span>
                          <span className="font-medium">
                            ₹{Number(order.paymentTotal || order.totalAmount || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-end items-center">
                        <button
                          onClick={() => openModal(order)}
                          className="h-8 px-4 text-sm border-2 border-[#172554] rounded-lg bg-white hover:bg-[#172554] hover:text-white transition font-medium"
                        >
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

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-[#172554]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Order Details
                </h2>
                <p className="text-sm text-gray-500">
                  Invoice:{' '}
                  {selectedOrder?.invoiceDetails?.[0]?.invoiceNo ||
                    selectedOrder?.invoiceNo ||
                    `#${selectedOrder?._id?.slice(-6).toUpperCase()}` ||
                    "N/A"}
                </p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="font-medium text-[#172554]">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-[#172554]">{user?.email}</p>
              </div>
            </div>

            {/* Products List - FULLY FIXED */}
            <div className="border-t pt-6 mb-6">
              <h4 className="font-semibold text-lg mb-4 text-[#172554]">Products</h4>

              {(() => {
                // Try multiple possible field names used by backends
                const items =
                  selectedOrder?.items ||
                  selectedOrder?.orderItems ||
                  selectedOrder?.products ||
                  selectedOrder?.cartItems ||
                  [];

                if (!items || items.length === 0) {
                  return <p className="text-gray-500 italic text-sm">No products found in this order.</p>;
                }

                return (
                  <div className="space-y-4">
                    {items.map((item, index) => {
                      const product = item.productId || item.product || item;
                      const name = product?.productName || product?.title || "Product Name";
                      
                      const rawImage = product?.productImages?.[0] || product?.images?.[0];
                      const cleanImage = rawImage?.replace(/^uploads\//, "").replace(/^\/+/, "");
                      
                      const imageUrl = cleanImage 
                        ? `${IMG_URL}/${cleanImage}` 
                        : "/fallback.jpg";

                      const price = Number(item.price || product?.discountPrice || product?.price || 0);
                      const qty = Number(item.quantity || item.qty || 1);

                      return (
                        <div
                          key={item._id || index}
                          className="flex gap-4 pb-4 border-b border-gray-100 last:border-0"
                        >
                          {/* <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 border border-gray-200 flex-shrink-0">
                            <img
                              src={imageUrl}
                              alt={name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                if (!e.target.src.includes("placeholder.com")) {
                                  e.target.src = "https://via.placeholder.com/80x80/f3f4f6/9ca3af?text=TANARIRI";
                                }
                              }}
                            />
                          </div> */}

                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{name}</h5>
                            {item.size && <p className="text-xs text-gray-500 mt-1">Size: {item.size}</p>}
                            {item.color && <p className="text-xs text-gray-500">Color: {item.color}</p>}
                            <p className="text-sm text-gray-600 mt-1">
                              {qty} × ₹{price.toFixed(2)}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold text-[#172554]">
                              ₹{(price * qty).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Pricing Summary */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{(selectedOrder?.paymentTotal || selectedOrder?.totalAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Discount</span>
                <span className="text-green-600">-₹{(selectedOrder?.discount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-3 border-t border-gray-300 text-[#172554]">
                <span>Total Paid</span>
                <span>₹{(selectedOrder?.paymentTotal || selectedOrder?.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Order Tracking */}
            <div className="mb-8">
              <h4 className="font-medium mb-4 text-[#172554]">Order Tracking</h4>
              <div className="relative">
                <div className="flex justify-between">
                  {statusSteps.map((step, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
                          i <= currentIndex
                            ? "bg-[#172554] border-[#172554] text-white"
                            : "bg-white border-gray-300 text-gray-500"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <p className={`text-xs mt-2 font-medium ${i <= currentIndex ? "text-[#172554]" : "text-gray-500"}`}>
                        {step.label}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="absolute top-6 left-0 right-0 h-1 -z-10">
                  <div className="h-full bg-gray-300 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#172554] transition-all duration-500"
                      style={{
                        width: currentIndex >= 0 ? `${(currentIndex / (statusSteps.length - 1)) * 100}%` : "0%",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cancel Order Option */}
            {selectedOrder.orderStatus === "Pending" && (
              <div className="mb-6 p-5 border border-red-200 rounded-xl bg-red-50">
                <button
                  onClick={() => setShowCancel(!showCancel)}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 6L6 18M6 6l12 12" />
                  </svg>
                  Cancel Order
                </button>

                {showCancel && (
                  <div className="mt-4 space-y-4">
                    <select
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Select Reason</option>
                      <option>Changed my mind</option>
                      <option>Found cheaper elsewhere</option>
                      <option>Wrong size/color</option>
                      <option>Other</option>
                    </select>
                    <div className="flex gap-3">
                      <button
                        onClick={cancelOrder}
                        className="flex-1 bg-white border border-red-500 text-red-500 py-2.5 rounded-lg hover:bg-red-50 font-medium"
                      >
                        Confirm Cancel
                      </button>
                      <button
                        onClick={() => setShowCancel(false)}
                        className="px-6 py-2.5 border rounded-lg hover:bg-gray-50"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Review Section */}
            {selectedOrder.orderStatus === "Delivered" && (
              <div className="mb-6 p-5 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="font-medium mb-3 text-[#172554]">Rate Your Experience</h4>
                <div className="flex gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-colors ${star <= rating ? "text-yellow-500" : "text-gray-300"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172554]"
                  rows="3"
                />
                <button
                  onClick={submitReview}
                  className="w-full mt-3 bg-[#172554] text-white py-2.5 rounded-lg hover:bg-[#1e3a8a] font-medium transition"
                >
                  Submit Review
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button
                onClick={() => downloadInvoice(selectedOrder)}
                className="flex-1 bg-white border-2 border-[#172554] text-[#172554] py-3 rounded-lg hover:bg-[#172554] hover:text-white font-medium transition"
              >
                Download Invoice
              </button>
              <button
                onClick={copyInvoiceNo}
                className="flex-1 bg-white border-2 border-[#172554] text-[#172554] py-3 rounded-lg hover:bg-[#172554] hover:text-white font-medium transition"
              >
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