'use client';  

import { Suspense } from 'react';
import ProductsContent from './ProductsContent';
import { fetchAllProducts } from '@/lib/api';

async function ProductsData() {
  try {
    const products = await fetchAllProducts();
    return <ProductsContent products={products} />;
  } catch (error) {
    console.error('API Error:', error.message);
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-red-500 font-bold">Failed to load products</p>
        <p className="text-sm text-gray-600">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#172554]"
        >
          Retry
        </button>
      </div>
    );
  }
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A] mb-4"></div>
          <p className="text-lg">Loading products...</p>
        </div>
      }
    >
      <ProductsData />
    </Suspense>
  );
}