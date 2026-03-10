"use client";

import { Footer as AnimatedFooter } from "@/components/ui/modem-animated-footer";
import { MessageCircle, ShoppingCart } from "lucide-react";

const socialLinks = [
  {
    icon: <MessageCircle className="w-6 h-6" />,
    href: "https://wa.me/",
    label: "WhatsApp",
  },
];

const navLinks = [
  { label: "Store", href: "/store" },
  { label: "Track Order", href: "/orders" },
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
];

export default function Footer() {
  return (
    <AnimatedFooter
      brandName="ShopBot"
      brandDescription="Your online store powered by WhatsApp. Browse products, add to cart, and order — all in one place."
      socialLinks={socialLinks}
      navLinks={navLinks}
      brandIcon={
        <ShoppingCart className="w-8 sm:w-10 md:w-14 h-8 sm:h-10 md:h-14 text-background drop-shadow-lg" />
      }
    />
  );
}
