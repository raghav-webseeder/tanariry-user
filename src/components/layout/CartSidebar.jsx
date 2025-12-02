"use client";

import { X, Minus, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// 1. Helper Logic from your ProductCard
const getImageUrl = (path) => {
  if (!path) return "/fallback.jpg";
  if (path.startsWith("http")) return path;
  if (path.startsWith("uploads/")) return `${BACKEND_URL}/${path}`;
  return `${BACKEND_URL}/uploads/${path}`;
};

// 2. Sub-component to handle individual Image state safely
function CartItem({ item, removeFromCart, updateQuantity, getTotal }) {
  const rawImage = item.productImages?.[0] || item.image;
  const [imgSrc, setImgSrc] = useState(getImageUrl(rawImage));

  // Sync image if item changes
  useEffect(() => {
    setImgSrc(getImageUrl(rawImage));
  }, [rawImage]);

  const safeName = item.productName || item.name || "Product";
  const itemTotal = getTotal(item);

  return (
    <div className="flex gap-4">
      <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200 flex-shrink-0 relative">
        <Image
          src={imgSrc}
          alt={safeName}
          width={64}
          height={64}
          className="w-full h-full object-cover"
          onError={() => setImgSrc("/fallback.jpg")}
        />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-medium text-sm pr-2 line-clamp-2">
            {safeName}
          </h4>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              ₹{itemTotal}
            </span>
            <button
              onClick={() => removeFromCart(item._id || item.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              updateQuantity(
                item._id || item.id,
                (item.quantity || 1) - 1
              )
            }
            className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center text-sm font-medium">
            {item.quantity || 1}
          </span>
          <button
            onClick={() =>
              updateQuantity(
                item._id || item.id,
                (item.quantity || 1) + 1
              )
            }
            className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CartSidebar({ isOpen, onClose }) {
  const { cart, updateQuantity, removeFromCart, cartCount, justRemoved } = useCart();

  const [mounted, setMounted] = useState(false);
  const [visibleCart, setVisibleCart] = useState([]);

  useEffect(() => {
    setMounted(true);
    setVisibleCart(cart);
  }, [cart]);

  // Sync with localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "cart") {
        const updatedCart = e.newValue ? JSON.parse(e.newValue) : [];
        setVisibleCart(updatedCart);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // SAFE HELPERS
  const getPrice = (item) => Number(item.discountPrice || item.price || 0);
  const getTotal = (item) =>
    (getPrice(item) * (item.quantity || 1)).toFixed(2);

  const subtotal = visibleCart.reduce(
    (sum, item) => sum + getPrice(item) * (item.quantity || 1),
    0
  );
  const isEmpty = visibleCart.length === 0;

  // AUTO-CLOSE
  useEffect(() => {
    if (justRemoved && isEmpty && isOpen) {
      const timer = setTimeout(() => onClose(), 400);
      return () => clearTimeout(timer);
    }
  }, [justRemoved, isEmpty, isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white rounded-l-2xl shadow-2xl z-50 transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">
            Your Cart {mounted && cartCount > 0 && `(${cartCount})`}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-grow overflow-y-auto p-6">
          <div className="space-y-6">
            {mounted ? (
              isEmpty ? (
                // EMPTY CART
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <svg
                    className="w-24 h-24 text-gray-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path
                      d="M1 1h4l2.68 12.09a2 2 0 002 1.91h7.44a2 2 0 002-1.91L23 6H6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="text-gray-500 mb-4">Your cart is currently empty!</p>
                  <p className="text-sm text-gray-500 mb-6">
                    Browse our store, find products, and happy shopping!
                  </p>
                  <Link
                    href="/products"
                    onClick={onClose}
                    className="bg-[#172554] text-white hover:bg-[#1E3A8A] px-6 py-3 rounded-md font-medium transition-colors"
                  >
                    Browse products
                  </Link>
                </div>
              ) : (
                // CART ITEMS
                <>
                  {visibleCart.map((item) => (
                    <CartItem
                      key={item._id || item.id}
                      item={item}
                      removeFromCart={removeFromCart}
                      updateQuantity={updateQuantity}
                      getTotal={getTotal}
                    />
                  ))}
                </>
              )
            ) : (
              // LOADING STATE
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="animate-pulse">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24 mt-2"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        {mounted && !isEmpty && (
          <div className="p-6 border-t bg-gray-50 space-y-4">
            <p className="text-center text-sm text-gray-600">
              Free shipping will be applied at checkout!
            </p>
            <div className="flex justify-between items-center font-medium">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Shipping, taxes, and discounts calculated at checkout.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/cart"
                onClick={onClose}
                className="w-full py-3 border border-black text-black hover:bg-gray-50 rounded-md font-medium text-center transition"
              >
                View cart
              </Link>
              <Link
                href="/checkout"
                onClick={onClose}
                className="w-full py-3 bg-[#172554] text-white hover:bg-[#1E3A8A] rounded-md font-medium text-center transition"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
