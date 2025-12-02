// src/app/AppLayout.js
"use client";

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { usePathname } from 'next/navigation';

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/auth');

  return (
    <>
      {!isAuthPage && <Header />}
      <main className={!isAuthPage ? "min-h-screen" : "min-h-screen"}>
        {children}
      </main>
      {!isAuthPage && <Footer />}
    </>
  );
}