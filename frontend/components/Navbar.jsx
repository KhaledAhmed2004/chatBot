"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "./ui/sheet";
import ThemeToggle from "./ThemeToggle";
import { ShoppingCart, Menu } from "lucide-react";

const landingLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

const storeLinks = [
  { label: "Store", href: "/store" },
  { label: "Track Order", href: "/orders" },
];

export default function Navbar({ isLanding }) {
  const { count, openCart } = useCart();
  const links = isLanding ? landingLinks : storeLinks;

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 px-4">
      <div className="mx-auto max-w-5xl rounded-2xl border bg-background/80 backdrop-blur-lg shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
            <span className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-extrabold text-sm">
              S
            </span>
            <span>ShopBot</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              link.href.startsWith("#") ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground font-medium hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground font-medium hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1">
            <ThemeToggle />

            {!isLanding && (
              <button
                className="relative p-2 rounded-lg text-foreground hover:bg-accent transition-colors"
                onClick={openCart}
              >
                <ShoppingCart className="size-4" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[0.6rem] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>
            )}

            <Separator orientation="vertical" className="hidden md:block h-5 mx-1" />

            {isLanding ? (
              <>
                <Button variant="ghost" size="sm" className="hidden md:inline-flex" asChild>
                  <Link href="/auth/login">Dashboard</Link>
                </Button>
                <Button size="sm" className="hidden md:inline-flex rounded-full" asChild>
                  <Link href="/store">Open Store</Link>
                </Button>
              </>
            ) : null}

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden size-9">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetTitle className="px-4 pt-2">Menu</SheetTitle>
                <div className="flex flex-col gap-1 p-4">
                  {links.map((link) => (
                    link.href.startsWith("#") ? (
                      <a
                        key={link.href}
                        href={link.href}
                        className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                      >
                        {link.label}
                      </Link>
                    )
                  ))}
                  {isLanding && (
                    <>
                      <Separator className="my-2" />
                      <Link
                        href="/auth/login"
                        className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                      >
                        Dashboard
                      </Link>
                      <Button size="sm" className="mt-2 rounded-full" asChild>
                        <Link href="/store">Open Store</Link>
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
