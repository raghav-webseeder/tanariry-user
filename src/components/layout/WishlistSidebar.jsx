// components/WishlistSidebar.jsx
"use client";

import { X, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistSidebar({ isOpen, onClose }) {
  const { wishlist, removeFromWishlist, justRemoved } = useWishlist();

  const [mounted, setMounted] = useState(false);
  const [visibleWishlist, setVisibleWishlist] = useState([]);

  useEffect(() => {
    setMounted(true);
    setVisibleWishlist(wishlist);
  }, [wishlist]);

  // Sync with localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "guest_wishlist") {
        const updated = e.newValue ? JSON.parse(e.newValue) : [];
        setVisibleWishlist(updated);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const isEmpty = visibleWishlist.length === 0;

  useEffect(() => {
    if (justRemoved && isEmpty && isOpen) {
      const timer = setTimeout(() => onClose(), 400);
      return () => clearTimeout(timer);
    }
  }, [justRemoved, isEmpty, isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      
      <div
        className={`fixed inset-0 bg-black/50 z-[99] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

  
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white rounded-l-2xl shadow-2xl z-[100] transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            Wishlist {mounted && wishlist.length > 0 && `(${wishlist.length})`}
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
               
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Heart className="w-24 h-24 text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">Your wishlist is empty!</p>
                  <p className="text-sm text-gray-500 mb-6">
                    Save your favorite items for later
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
                // WISHLIST ITEMS
                <>
                  {visibleWishlist.map((item) => {
                    const safeImage = item.productImages?.[0] || item.image || "/placeholder.jpg";
                    const safeName = item.productName || item.name || "Product";
                    const price = Number(item.discountPrice || item.price || 0).toFixed(2);

                    return (
                      <div key={item._id || item.id} className="flex gap-4">
                        <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
                          <Image
                            src={safeImage}
                            alt={safeName}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium text-sm pr-2 line-clamp-2">
                              {safeName}
                            </h4>
                            <button
                              onClick={() => removeFromWishlist(item._id || item.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="font-medium text-sm">${price}</p>
                        </div>
                      </div>
                    );
                  })}
                </>
              )
            ) : (
              // LOADING
              <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-pulse">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {mounted && !isEmpty && (
          <div className="p-6 border-t bg-gray-50">
            <Link
              href="/wishlist"
              onClick={onClose}
              className="w-full py-3 bg-[#172554] text-white hover:bg-[#1E3A8A] rounded-md font-medium text-center transition"
            >
              View Full Wishlist
            </Link>
          </div>
        )}
      </div>
    </>
  );
}