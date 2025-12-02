// src/context/WishlistContext.js
'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();
const GUEST_KEY = 'guest_wishlist';
const BASE_URL = '/api/customercartwishlist';

export function WishlistProvider({ children }) {
  const { user, token } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (!user) {
      const data = localStorage.getItem(GUEST_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        setWishlist(parsed.map(p => ({ _id: p._id || p.id }))); 
      }
    }
  }, [user]);

  const syncWithBackend = useCallback(async () => {
  if (!user || !token) return;

  setLoading(true);
  try {
    const res = await fetch(`${BASE_URL}/getItemwishlist/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.log("Wishlist API failed:", res.status);
      setWishlist([]);
      setLoading(false);
      return;
    }

    const productIds = await res.json(); 
    console.log("Backend wishlist IDs:", productIds);  

    setWishlist(productIds.map(id => ({ _id: id })));

  } catch (err) {
    setWishlist([]);
  } finally {
    setLoading(false);
  }
}, [user, token]);

  useEffect(() => {
    if (user && token) syncWithBackend();
  }, [user, token, syncWithBackend]);

  const normalizeId = (product) =>
    typeof product === "string" ? product : product?._id || product?.id;

  // Add
  const addToWishlist = async (product) => {
    const productId = normalizeId(product);
    if (!productId) return;

    // Already Exists
    if (wishlist.some(p => p._id === productId)) return toast.success("Already in wishlist");

    // Guest
    if (!user) {
      const updated = [...wishlist, { _id: productId }];
      localStorage.setItem(GUEST_KEY, JSON.stringify(updated));
      setWishlist(updated);
      return toast.success("Added to wishlist");
    }

    // Logged In
    try {
      const res = await fetch(`${BASE_URL}/addItemwishlist/${user.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error();
      toast.success("Added to wishlist");
      await syncWithBackend();
    } catch {
      toast.error("Failed to add");
    }
  };

  // Remove
  const removeFromWishlist = async (productId) => {
    productId = String(productId);

    // Guest
    if (!user) {
      const updated = wishlist.filter(p => p._id !== productId);
      localStorage.setItem(GUEST_KEY, JSON.stringify(updated));
      setWishlist(updated);
      return toast.success("Removed from wishlist");
    }

    // Logged In
    try {
      const res = await fetch(`${BASE_URL}/removeItemwishlist/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error();
      toast.success("Removed from wishlist");
      await syncWithBackend();
    } catch {
      toast.error("Failed to remove");
    }
  };

  // Toggle
  const toggleWishlist = async (product) => {
    const productId = normalizeId(product);
    if (!productId) return;

    const exists = wishlist.some(p => p._id === productId);

    if (exists) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  // Check
  const isInWishlist = useCallback((id) => {
    if (!id) return false;
    const target = String(id);
    return wishlist.some(item => {
      const itemId = item?._id ?? item?.id ?? item;
      return String(itemId) === target;
    });
  }, [wishlist]);

  return (
    <WishlistContext.Provider value={{
      wishlist,
      toggleWishlist,
      isInWishlist,
      loading,
      itemCount: wishlist.length,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
