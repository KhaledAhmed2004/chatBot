"use client";

import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

function PhoneMockup({ children, headerTitle, headerColor = "bg-gray-100" }) {
  return (
    <div className="mx-auto w-full max-w-[260px]">
      <div className="rounded-[2rem] border-[6px] border-gray-800 bg-white overflow-hidden shadow-lg">
        {/* Notch */}
        <div className="mx-auto mt-2 h-5 w-24 rounded-full bg-gray-800" />
        {/* Screen content */}
        <div className="mt-2">
          {/* Header bar */}
          <div className={`flex items-center gap-2 px-3 py-2 ${headerColor}`}>
            <span className="text-xs">←</span>
            <span className="text-xs font-semibold">{headerTitle}</span>
          </div>
          {/* Chat area */}
          <div className="min-h-[240px] bg-gray-50 p-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ text, align = "left", time, icon }) {
  return (
    <div className={`flex flex-col ${align === "right" ? "items-end" : "items-start"} mb-2`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
          align === "right"
            ? "bg-emerald-100 text-gray-800"
            : "bg-white text-gray-800 shadow-sm"
        }`}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {text}
      </div>
      {time && (
        <span className="mt-0.5 text-[10px] text-muted-foreground">{time}</span>
      )}
    </div>
  );
}

function FeatureCard({ title, description, phoneMockup, learnMoreHref }) {
  return (
    <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-xl border bg-card lg:grid-cols-2">
      {/* Phone mockup side */}
      <div className="flex items-center justify-center bg-gray-50 p-8">
        {phoneMockup}
      </div>

      {/* Info side */}
      <div className="flex flex-col justify-center gap-3 p-8">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
        {learnMoreHref && (
          <a href={learnMoreHref} className="text-sm font-medium text-blue-600 hover:underline w-fit">
            Learn more
          </a>
        )}
        <Button className="mt-2 w-fit bg-gray-900 text-white hover:bg-gray-800">
          Subscribe
        </Button>
      </div>
    </div>
  );
}

export default function ChatbotPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Chatbot (Beta)</h1>
        <p className="text-sm text-muted-foreground">
          Send instant replies to answer FAQs, set expectations, and guide customers when you&apos;re away.
        </p>
      </div>

      {/* Upgrade banner */}
      <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-600">Upgrade to Business</span>
        </div>
        <Button variant="outline" size="sm" className="bg-white">
          Upgrade
        </Button>
      </div>

      {/* AI Chatbot */}
      <FeatureCard
        title="AI Chatbot"
        description="AI Chatbot is a conversational shopping assistant that automatically handles product inquiries, orders, delivery, and subscription management."
        phoneMockup={
          <PhoneMockup headerTitle="Bali Dining" headerColor="bg-gray-100">
            <div className="flex items-start gap-2 mb-2">
              <div className="rounded-lg bg-white p-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded bg-gray-200" />
                  <div>
                    <p className="text-[10px] font-semibold">Mushroom Risotto</p>
                    <p className="text-[10px] font-bold">$16.00</p>
                  </div>
                </div>
              </div>
            </div>
            <ChatBubble text="How long does delivery take?" align="right" time="1:25 pm" />
            <ChatBubble
              text="Around 30–40 min downtown, 50–60 min for outer areas 🚗"
              align="left"
              time="1:26 pm"
              icon="🤖"
            />
          </PhoneMockup>
        }
      />

      {/* WhatsApp Chatbot */}
      <FeatureCard
        title="WhatsApp Chatbot"
        description="Automate customer conversations with customizable workflows, auto-replies, and welcome messages."
        learnMoreHref="#"
        phoneMockup={
          <PhoneMockup headerTitle="Bali Dining ✅" headerColor="bg-emerald-700 text-white">
            <div className="mt-8 space-y-2">
              {["View Today's Menu", "Make a Reservation", "Opening Hours"].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5 shadow-sm"
                >
                  <span className="text-xs font-medium">{item}</span>
                  <span className="text-emerald-500 text-sm font-bold">➤</span>
                </div>
              ))}
            </div>
          </PhoneMockup>
        }
      />
    </div>
  );
}
