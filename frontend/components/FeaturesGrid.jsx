"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Monitor, MessageCircle, MapPin, ShoppingCart, Tag, FileText } from "lucide-react";
import { FeatureCard } from "@/components/ui/grid-feature-cards";

const features = [
  { icon: Monitor, title: "Web Store", description: "Beautiful product page with images, categories, search. Mobile-first responsive design." },
  { icon: MessageCircle, title: "WhatsApp Notifications", description: "Order place hole admin WhatsApp e instant notification. Customer er sathe shoja contact." },
  { icon: MapPin, title: "AI Chat Bot", description: "Groq + Gemini AI. Bangla, English, Banglish - je bhashay lekho, se bhashay answer dey." },
  { icon: ShoppingCart, title: "Smart Cart", description: "Add to cart, quantity change, clear cart. Server-side stored - browser close korleo thake." },
  { icon: Tag, title: "Stock Management", description: 'Real-time stock tracking. Order dile auto decrease. Out of stock hole "Sold Out" dekhay.' },
  { icon: FileText, title: "Order Tracking", description: "Order ID ba phone number diye track koro. Status: pending, confirmed, shipped, delivered." },
];

function AnimatedContainer({ className, delay = 0.1, children }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return children;
  }

  return (
    <motion.div
      initial={{ filter: "blur(4px)", translateY: -8, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function FeaturesGrid() {
  return (
    <section className="py-16 md:py-32" id="features">
      <div className="mx-auto w-full max-w-5xl space-y-8 px-4">
        <AnimatedContainer className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-wide text-balance md:text-4xl lg:text-5xl xl:font-extrabold">
            Everything You Need
          </h2>
          <p className="text-muted-foreground mt-4 text-sm tracking-wide text-balance md:text-base">
            E-commerce + AI Chat + WhatsApp - shob ek jaygay
          </p>
        </AnimatedContainer>

        <AnimatedContainer
          delay={0.4}
          className="grid grid-cols-1 divide-x divide-y divide-dashed border border-dashed sm:grid-cols-2 md:grid-cols-3"
        >
          {features.map((feature, i) => (
            <FeatureCard key={i} feature={feature} />
          ))}
        </AnimatedContainer>
      </div>
    </section>
  );
}
