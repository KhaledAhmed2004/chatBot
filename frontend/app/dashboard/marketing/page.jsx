"use client";

import { useState, useRef, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { QRCodeCanvas } from "qrcode.react";
import {
  Copy,
  Check,
  ChevronDown,
  Link as LinkIcon,
  Download,
  QrCode,
  Megaphone,
  MessageCircle,
  Instagram,
  Facebook,
  Youtube,
  Info,
} from "lucide-react";

function TikTokIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.74a8.18 8.18 0 004.76 1.52V6.8a4.83 4.83 0 01-1-.11z" />
    </svg>
  );
}

const socialLinks = [
  { name: "WhatsApp", color: "#25D366", icon: MessageCircle },
  { name: "Instagram", color: "#E4405F", icon: Instagram },
  { name: "Facebook", color: "#1877F2", icon: Facebook },
  { name: "Youtube", color: "#FF0000", icon: Youtube },
  { name: "TikTok", color: "#000000", iconComponent: TikTokIcon },
];

export default function MarketingPage() {
  const { store } = useAuth();
  const [copied, setCopied] = useState(false);
  const plainQrRef = useRef(null);
  const posterQrRef = useRef(null);

  const storeUrl = typeof window !== "undefined"
    ? `${window.location.origin}/store/${store?.slug}`
    : `shopbot.store/${store?.slug}`;

  const displayUrl = `shopbot.store/${store?.slug || "your-store"}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(storeUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadPlainQR = useCallback(() => {
    const canvas = plainQrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${store?.slug || "store"}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [store]);

  const downloadPosterQR = useCallback(() => {
    const srcCanvas = posterQrRef.current?.querySelector("canvas");
    if (!srcCanvas) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 400;
    canvas.height = 520;

    // Dark background
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.roundRect(0, 0, 400, 520, 16);
    ctx.fill();

    // "SCAN ME" text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SCAN ME", 200, 50);

    // "TO VISIT OUR WEBSITE" subtitle
    ctx.font = "bold 14px sans-serif";
    ctx.fillStyle = "#22c55e";
    ctx.fillText("TO VISIT OUR WEBSITE", 200, 72);

    // White QR background
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(60, 90, 280, 280, 12);
    ctx.fill();

    // Draw QR
    ctx.drawImage(srcCanvas, 80, 110, 240, 240);

    // Store name
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText(store?.name || "My Store", 200, 410);

    // Store URL
    ctx.font = "13px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText(storeUrl, 200, 440);

    // Globe icon + URL at bottom
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText(`🌐 ${displayUrl}`, 200, 490);

    const link = document.createElement("a");
    link.download = `${store?.slug || "store"}-qr-poster.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [store, storeUrl, displayUrl]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Marketing</h1>
        <p className="text-sm text-muted-foreground">
          Share your store and grow your business
        </p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Link in Bio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LinkIcon className="size-5" />
              Link in bio
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Put your store link on Instagram, Facebook, TikTok, or any social
              profile. Makes it easy for customers to order in just one tap.
            </p>
          </CardHeader>
          <CardContent className="space-y-1">
            {/* Store URL + Copy */}
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={displayUrl}
                className="flex-1 bg-muted text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="size-4 text-emerald-500" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>

            <Separator className="my-4" />

            {/* Social Media Rows */}
            {socialLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Collapsible key={item.name} className="group/collapsible">
                  <CollapsibleTrigger className="flex w-full items-center gap-3 rounded-md px-2 py-2.5 hover:bg-accent transition-colors">
                    <span
                      className="flex size-8 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.iconComponent ? (
                        <item.iconComponent className="size-4" />
                      ) : (
                        <Icon className="size-4" />
                      )}
                    </span>
                    <span className="text-sm font-medium">{item.name}</span>
                    <ChevronDown className="ml-auto size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:-rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="pb-2 pl-13 pr-2">
                      <Input
                        placeholder={`Enter your ${item.name} link`}
                        className="text-sm"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </CardContent>
        </Card>

        {/* Run Ads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Megaphone className="size-5" />
              Run ads
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Bring traffic, get orders. Start with Facebook, Instagram, or
              TikTok ads. These channels are proven effective worldwide for
              small businesses.
            </p>
            <Separator />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="size-4 shrink-0" />
              <span>Add Meta/Tiktok Pixel and Google Analytics</span>
            </div>
          </CardContent>
        </Card>

        {/* QR Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode className="size-5" />
              Download & print QR code
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Download your store&apos;s QR code, print it, and display it in
              your shop. Customers will scan, open your store and place orders.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Plain QR */}
              <div className="relative rounded-lg border p-6">
                <div className="flex items-center justify-center" ref={plainQrRef}>
                  <QRCodeCanvas value={storeUrl} size={180} level="M" />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-3 top-3"
                  onClick={downloadPlainQR}
                >
                  <Download className="size-4" />
                </Button>
              </div>

              {/* Poster QR */}
              <div className="relative rounded-lg border p-6">
                <div className="mx-auto max-w-[220px] space-y-2 rounded-xl bg-foreground p-5 text-center text-background">
                  <p className="text-sm font-bold tracking-widest uppercase">
                    SCAN ME
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    TO VISIT OUR WEBSITE
                  </p>
                  <div
                    className="mx-auto flex items-center justify-center rounded-lg bg-white p-2"
                    ref={posterQrRef}
                  >
                    <QRCodeCanvas value={storeUrl} size={140} level="M" />
                  </div>
                  <p className="truncate pt-1 text-xs font-semibold">
                    {store?.name || "My Store"}
                  </p>
                  <p className="flex items-center justify-center gap-1 text-[10px] opacity-60">
                    🌐 {displayUrl}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-3 top-3"
                  onClick={downloadPosterQR}
                >
                  <Download className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
