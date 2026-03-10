"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RocketIcon, ArrowRightIcon, ShoppingCart, Wifi, Battery, Signal } from "lucide-react";
import { LogoCloud } from "@/components/ui/logo-cloud-3";
import { motion } from "framer-motion";

const logos = [
  { src: "https://storage.efferd.com/logo/vercel-wordmark.svg", alt: "Vercel" },
  { src: "https://storage.efferd.com/logo/supabase-wordmark.svg", alt: "Supabase" },
  { src: "https://storage.efferd.com/logo/openai-wordmark.svg", alt: "OpenAI" },
  { src: "https://storage.efferd.com/logo/github-wordmark.svg", alt: "GitHub" },
  { src: "https://storage.efferd.com/logo/claude-wordmark.svg", alt: "Claude AI" },
  { src: "https://storage.efferd.com/logo/clerk-wordmark.svg", alt: "Clerk" },
  { src: "https://storage.efferd.com/logo/nvidia-wordmark.svg", alt: "Nvidia" },
  { src: "https://storage.efferd.com/logo/turso-wordmark.svg", alt: "Turso" },
];

export function HeroSection() {
  return (
    <section className="mx-auto w-full max-w-5xl">
      {/* Top Shades */}
      <div
        aria-hidden="true"
        className="absolute inset-0 isolate hidden overflow-hidden contain-strict lg:block"
      >
        <div className="absolute inset-0 -top-14 isolate -z-10 bg-[radial-gradient(35%_80%_at_49%_0%,--theme(--color-foreground/.08),transparent)] contain-strict" />
      </div>

      {/* Main content */}
      <div className="relative flex flex-col items-center justify-center gap-5 pt-32 pb-30">
        <a
          className={cn(
            "group mx-auto flex w-fit items-center gap-3 rounded-full border bg-card px-3 py-1 shadow",
            "fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards transition-all delay-500 duration-500 ease-out"
          )}
          href="#features"
        >
          <RocketIcon className="size-3 text-muted-foreground" />
          <span className="text-xs">WhatsApp + Web Store</span>
          <span className="block h-5 border-l" />
          <ArrowRightIcon className="size-3 duration-150 ease-out group-hover:translate-x-1" />
        </a>

        <h1
          className={cn(
            "fade-in slide-in-from-bottom-10 animate-in text-balance fill-mode-backwards text-center text-4xl tracking-tight delay-100 duration-500 ease-out md:text-5xl lg:text-6xl"
          )}
        >
          Your Online Store, <br /> Powered by{" "}
          <span className="text-primary">WhatsApp</span>
        </h1>

        <p className="fade-in slide-in-from-bottom-10 mx-auto max-w-md animate-in fill-mode-backwards text-center text-base text-foreground/80 tracking-wider delay-200 duration-500 ease-out sm:text-lg md:text-xl">
          Product browse koro, cart e add koro, <br /> order dile admin WhatsApp
          e notification pay
        </p>

        <div className="fade-in slide-in-from-bottom-10 flex animate-in flex-row flex-wrap items-center justify-center gap-3 fill-mode-backwards pt-2 delay-300 duration-500 ease-out">
          <Button className="rounded-full" size="lg" variant="secondary" asChild>
            <a href="#how-it-works">
              <ShoppingCart className="size-4 mr-2" />
              How It Works
            </a>
          </Button>
          <Button className="rounded-full" size="lg" asChild>
            <Link href="/store">
              Visit Store
              <ArrowRightIcon className="size-4 ms-2" />
            </Link>
          </Button>
        </div>

        {/* Mobile Phone Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
          className="relative w-full max-w-sm mx-auto mt-10"
        >
          <div className="w-full rounded-3xl border-2 border-border bg-card p-2 shadow-2xl">
            {/* Phone frame */}
            <div className="rounded-2xl border border-border bg-background overflow-hidden">
              {/* Status bar */}
              <div className="flex items-center justify-between px-5 py-2 bg-background">
                <span className="text-[10px] font-semibold text-foreground">9:41</span>
                <div className="absolute left-1/2 -translate-x-1/2 w-20 h-5 bg-foreground rounded-full" />
                <div className="flex items-center gap-1">
                  <Signal className="size-3 text-foreground" />
                  <Wifi className="size-3 text-foreground" />
                  <Battery className="size-3 text-foreground" />
                </div>
              </div>

              {/* Screen content - store preview */}
              <div className="px-4 pb-6 pt-2 space-y-4">
                {/* Mini nav */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center">
                      <span className="text-[8px] font-bold text-primary-foreground">S</span>
                    </div>
                    <span className="text-[10px] font-bold">ShopBot</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-md bg-muted" />
                    <div className="w-4 h-4 rounded-md bg-muted" />
                  </div>
                </div>

                {/* Search bar */}
                <div className="h-6 rounded-lg bg-muted/60 border border-border flex items-center px-2">
                  <span className="text-[8px] text-muted-foreground">Search products...</span>
                </div>

                {/* Category pills */}
                <div className="flex gap-1.5 overflow-hidden">
                  <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[7px] font-medium whitespace-nowrap">All</span>
                  <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[7px] font-medium whitespace-nowrap">Electronics</span>
                  <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[7px] font-medium whitespace-nowrap">Fashion</span>
                  <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[7px] font-medium whitespace-nowrap">Home</span>
                </div>

                {/* Product grid */}
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                      <div className={cn(
                        "h-16 w-full",
                        i === 1 && "bg-emerald-100 dark:bg-emerald-900/30",
                        i === 2 && "bg-blue-100 dark:bg-blue-900/30",
                        i === 3 && "bg-amber-100 dark:bg-amber-900/30",
                        i === 4 && "bg-purple-100 dark:bg-purple-900/30",
                      )} />
                      <div className="p-1.5 space-y-1">
                        <div className="h-1.5 w-3/4 rounded-full bg-foreground/20" />
                        <div className="h-1.5 w-1/2 rounded-full bg-primary/40" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Home indicator */}
              <div className="flex justify-center pb-2">
                <div className="w-24 h-1 rounded-full bg-foreground/20" />
              </div>
            </div>
          </div>

          {/* Gradient fade at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-background to-transparent pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
}

export function LogosSection() {
  return (
    <section className="relative space-y-4 border-t pt-6 pb-10">
      <h2 className="text-center font-medium text-lg text-muted-foreground tracking-tight md:text-xl">
        Trusted by <span className="text-foreground">industry leaders</span>
      </h2>
      <div className="relative z-10 mx-auto max-w-4xl">
        <LogoCloud logos={logos} />
      </div>
    </section>
  );
}
