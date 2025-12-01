"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  Package,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import StayInspired from "@/components/home/StayInspired";
import toast from "react-hot-toast";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// 1. Image Helper Logic
const getImageUrl = (path) => {
  if (!path) return "/fallback.jpg";
  if (path.startsWith("http")) return path;
  if (path.startsWith("uploads/")) return `${BACKEND_URL}/${path}`;
  return `${BACKEND_URL}/uploads/${path}`;
};

// 2. Cart Item Sub-component for Safe Image Handling
const CartItem = ({ item, updateQuantity, removeFromCart, getPrice }) => {
  const rawImage = item.productImages?.[0] || item.image;
  const [imgSrc, setImgSrc] = useState(getImageUrl(rawImage));

  const safeName = item.productName || item.name || "Product";
  const qty = item.quantity || 1;
  const price = getPrice(item);

  // Sync image if item changes
  useEffect(() => {
    setImgSrc(getImageUrl(rawImage));
  }, [rawImage]);

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-5 border border-gray-100">
      <div className="flex gap-5">
        {/* Image */}
        <div className="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 relative">
          <Image
            src={imgSrc}
            alt={safeName}
            width={112}
            height={112}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgSrc("/fallback.jpg")}
          />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#172554] text-lg line-clamp-2 group-hover:text-pink-600 transition-colors">
            {safeName}
          </h3>
          {item.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {item.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-3">
            <span className="text-lg font-bold text-[#172554]">₹{price}</span>
            {item.discountPrice && (
              <span className="text-sm text-gray-500 line-through">
                ₹{item.price}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-full p-1">
            <button
              onClick={() => updateQuantity(item._id || item.id, qty - 1)}
              className="w-8 h-8 rounded-full hover:bg-gray-200 transition flex items-center justify-center disabled:opacity-50"
              disabled={qty === 1}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center font-semibold text-sm">
              {qty}
            </span>
            <button
              onClick={() => updateQuantity(item._id || item.id, qty + 1)}
              className="w-8 h-8 rounded-full hover:bg-gray-200 transition flex items-center justify-center"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={() => {
              removeFromCart(item._id || item.id);
              toast.success("Removed from cart");
            }}
            className="text-gray-400 hover:text-red-600 transition"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
        <div className="text-right">
          <p className="font-bold text-[#172554] text-xl">₹{price * qty}</p>
        </div>
      </div>
    </div>
  );
};

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartCount } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getPrice = (item) => Number(item.discountPrice || item.price || 0);

  const subtotal = mounted
    ? cart.reduce((sum, item) => sum + getPrice(item) * (item.quantity || 1), 0)
    : 0;
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  if (!mounted)
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">Loading...</div>
      </div>
    );

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-24">
            <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-3xl font-bold text-[#172554] mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Add some premium crockery to get started!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[#172554] text-white px-8 py-4 rounded-xl hover:bg-[#0f1e3d] font-medium text-lg shadow-lg transition-all transform hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 lg:py-12">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl font-playfair text-[#172554] font-normal">
            Your Cart
          </h1>
          <p className="text-gray-600 mt-2">{cartCount} items</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 pb-4">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <CartItem
                key={item._id || item.id}
                item={item}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
                getPrice={getPrice}
              />
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
              <h2 className="text-xl font-semibold text-[#172554] mb-4">
                Price Details
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax (5%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-[#172554] pt-3 border-t">
                  <span>Total Amount</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="w-full mt-6 bg-[#172554] text-white py-3.5 rounded-xl hover:bg-[#0f1e3d] font-medium text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Package className="w-5 h-5" />
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
      <StayInspired />
    </div>
  );
}