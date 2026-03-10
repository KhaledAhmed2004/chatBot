"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "../context/CartContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";

export default function ClientProviders({ children }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const isDashboard = pathname.startsWith("/dashboard");
  const isAuth = pathname.startsWith("/auth");

  // Dashboard and auth pages have their own layouts
  if (isDashboard || isAuth) {
    return <>{children}</>;
  }

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar isLanding={isLanding} />
        <main className={isLanding ? "" : "flex-1 pt-[80px]"}>{children}</main>
        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}
