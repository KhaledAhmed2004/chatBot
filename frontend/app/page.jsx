import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import PricingSection from "@/components/ui/pricing-card";
import { Cta4 } from "@/components/ui/cta-4";
import TestimonialsSection from "@/components/ui/testimonial-v2";
import FeaturesGrid from "@/components/FeaturesGrid";
import WhatsAppBotSection from "@/components/WhatsAppBotSection";
import BentoShowcase from "@/components/BentoShowcase";
import { HeroSection, LogosSection } from "@/components/HeroSection";

const steps = [
  { num: "1", title: "Browse Products", desc: "Store e giye products dekhun. Category filter kore, search kore - pasondo er jinish khujen." },
  { num: "2", title: "Add to Cart", desc: "Pasonder product cart e add korun. Quantity select korun. Cart e review korun." },
  { num: "3", title: "Checkout", desc: "Name, phone, address diyen. Order confirm holey admin WhatsApp e notify paben." },
];

const stats = [
  { value: "6+", label: "Products" },
  { value: "2", label: "AI Models" },
  { value: "24/7", label: "AI Chat" },
  { value: "Free", label: "Forever" },
];


export default function LandingPage() {
  return (
    <div className="pt-[80px]">
      {/* ===== HERO ===== */}
      <HeroSection />
      <LogosSection />

      {/* ===== FEATURES ===== */}
      <FeaturesGrid />

      {/* ===== HOW IT WORKS ===== */}
      <section className="max-w-[1200px] mx-auto px-6 py-16" id="how-it-works">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-2">How It Works</h2>
        <p className="text-center text-muted-foreground text-base mb-10">3 steps e shob hoye jay</p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          {steps.map((s, i) => (
            <div key={s.num} className="contents">
              <Card className="flex-1 max-w-[300px] w-full">
                <CardContent className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-extrabold text-lg mx-auto">
                    {s.num}
                  </div>
                  <h3 className="font-bold">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                </CardContent>
              </Card>
              {i < steps.length - 1 && (
                <ArrowRight className="hidden md:block size-6 text-primary shrink-0" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="bg-primary/10 rounded-2xl py-10 px-6 flex flex-wrap justify-center gap-12 md:gap-16">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <strong className="block text-3xl md:text-4xl font-extrabold text-primary">{s.value}</strong>
              <span className="text-muted-foreground text-sm">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== WHATSAPP BOT ===== */}
      <WhatsAppBotSection />

      {/* ===== BENTO PRODUCT FEATURES ===== */}
      <BentoShowcase />

      {/* ===== PRICING ===== */}
      <section id="pricing">
        <PricingSection />
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <TestimonialsSection />

      {/* ===== CTA ===== */}
      <Cta4
        title="Ready to Shop?"
        description="Browse our products and order now! Product browse koro, cart e add koro, order place koro — shob free."
        buttonText="Open Store"
        buttonUrl="/store"
        items={[
          "Free forever — no hidden fees",
          "WhatsApp instant notifications",
          "AI-powered chatbot support",
          "Real-time stock tracking",
          "Mobile-first responsive design",
        ]}
      />
    </div>
  );
}
