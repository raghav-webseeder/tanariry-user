'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Heart, ShoppingCart, Share2, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import StayInspired from '@/components/home/StayInspired';

// YE LINE ADD KAR DI (sabse important)
const BACKEND_URL = process.env.NEXT_PUBLIC_IMAGE_URL?.replace(/\/+$/, "");

export default function ProductDetailPage({ product }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  // FIXED FUNCTION - double slash + double uploads ko permanently hata diya
  const getSafeImageUrl = (path) => {
    if (!path || typeof path !== 'string') return "/fallback.jpg";
    if (path.startsWith("http")) return path;

    let cleanPath = path.trim();
    if (!cleanPath.startsWith("/")) cleanPath = "/" + cleanPath;
    
    // Yeh line sabse powerful hai → /uploads/uploads → /uploads
    cleanPath = cleanPath.replace(/\/uploads\/uploads/g, "/uploads");

    return `${BACKEND_URL}${cleanPath}`;
  };

  // Safe images array
  const rawImages = product?.productImages || [];
  const images = rawImages.length > 0 
    ? rawImages.map(getSafeImageUrl)
    : ["/fallback.jpg"];

  const name = product?.productName || "Tea Set";
  const desc = product?.description || "Elegant tea set crafted from fine bone china.";
  const discountPrice = Number(product?.discountPrice || product?.originalPrice || 0);
  const originalPrice = Number(product?.originalPrice || discountPrice);
  const hasDiscount = originalPrice > discountPrice;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100) : 0;

  useEffect(() => {
    setIsWishlisted(wishlist.some(item => item._id === product?._id));
  }, [wishlist, product?._id]);

  const handleWishlist = async () => {
    setLoading(true);
    try {
      if (isWishlisted) {
        await removeFromWishlist(product._id);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(product);
        toast.success('Added to wishlist');
      }
    } catch {
      toast.error('Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart({ ...product, quantity, selectedPrice: discountPrice });
    toast.success(`${quantity} × ${name} added to cart!`, {
      style: { background: '#1E3A8A', color: '#fff' }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-[#1E3A8A]">Home</Link>
          <span className="mx-2">›</span>
          <Link href="/products" className="hover:text-[#1E3A8A]">Products</Link>
          <span className="mx-2">›</span>
          <span className="font-medium text-gray-900">{name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* LEFT - IMAGE GALLERY */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100">
              <div className="relative h-80 sm:h-96 lg:h-[500px] w-full">
                <Image
                  src={images[selectedImage]}
                  alt={name}
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  onError={(e) => {
                    e.currentTarget.src = "/fallback.jpg";
                  }}
                />
              </div>

              {/* Fixed: absolute862 → absolute */}
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold shadow-md border">
                {selectedImage + 1} / {images.length}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 justify-center flex-wrap">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-3 transition-all duration-200 ${
                      selectedImage === i
                        ? 'border-[#1E3A8A] shadow-xl ring-2 ring-[#1E3A8A]/30 scale-105'
                        : 'border-gray-300 hover:border-gray-500 shadow-md'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${i + 1}`}
                      fill
                      className="object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/fallback.jpg";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT - CONTENT (bilkul same rakha) */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                {name}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(124 reviews)</span>
                <span className="text-green-600 font-medium text-sm">In Stock</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-[#1E3A8A]">
                ₹{discountPrice.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-2xl text-gray-500 line-through">
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="bg-white border border-red-600 text-red-600 px-3 py-1.5 rounded-full text-sm font-bold">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-700 leading-relaxed">{desc}</p>

            <div className="flex items-center gap-5">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 hover:bg-gray-100">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="w-16 text-center font-bold text-lg">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="p-3 hover:bg-gray-100">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[#1E3A8A] hover:bg-[#172554] text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>

              <button
                onClick={() => {
                  const shareUrl = window.location.href;
                  const shareTitle = `${name} - TANARIRI`;

                  if (navigator.share) {
                    navigator.share({
                      title: shareTitle,
                      text: `Check out this beautiful ${name} on TANARIRI!`,
                      url: shareUrl,
                    }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(shareUrl).then(() => {
                      toast.success('Link copied!', { duration: 2000 });
                    });
                  }
                }}
                className="p-3.5 rounded-xl border-2 border-gray-300 hover:border-[#1E3A8A] transition-all hover:shadow-md"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            <div className="text-sm text-gray-600 space-y-1 pt-4 border-t">
              <div>• Free Delivery Across India</div>
              <div>• 7 Days Easy Return</div>
              <div>• 100% Original Product</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <StayInspired />
      </div>
    </div>
  );
}