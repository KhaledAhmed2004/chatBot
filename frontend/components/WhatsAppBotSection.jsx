"use client";

import { MessageCircle, Bot, Globe, ShoppingCart } from "lucide-react";
import { Features5 } from "@/components/ui/features-5";
import { useEffect, useRef, useState } from "react";

const botItems = [
  { icon: MessageCircle, label: '"products" likhlei product list' },
  { icon: ShoppingCart, label: '"add 1" likhlei cart e add' },
  { icon: Bot, label: "Je kono question - AI answer dey" },
  { icon: Globe, label: "Bangla + English + Banglish support" },
];

const chatMessages = [
  { type: "sent", text: "Hi, ki ki product ache?" },
  {
    type: "received",
    text: (
      <>
        <strong>Our Products:</strong>
        <br />1. Wireless Earbuds - ৳850
        <br />2. Smart Watch - ৳1500
        <br />3. Graphic T-Shirt - ৳450
      </>
    ),
  },
  { type: "sent", text: "add 1" },
  { type: "received", text: "Wireless Earbuds added to cart! (1x)" },
  { type: "sent", text: "cart" },
  {
    type: "received",
    text: (
      <>
        🛒 <strong>Your Cart:</strong>
        <br />1. Wireless Earbuds x1 — ৳850
        <br />
        <br />Total: <strong>৳850</strong>
      </>
    ),
  },
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2.5">
      <span className="wa-typing-dot" />
      <span className="wa-typing-dot" style={{ animationDelay: "0.15s" }} />
      <span className="wa-typing-dot" style={{ animationDelay: "0.3s" }} />
    </div>
  );
}

function PhoneMockup() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [showTyping, setShowTyping] = useState(false);
  const chatContainerRef = useRef(null);
  const hasAnimated = useRef(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    if (hasAnimated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          observer.disconnect();
          animateMessages();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  function animateMessages() {
    let i = 0;
    function showNext() {
      if (i >= chatMessages.length) return;
      const msg = chatMessages[i];
      if (msg.type === "received") {
        setShowTyping(true);
        setTimeout(() => {
          setShowTyping(false);
          i++;
          setVisibleCount(i);
          setTimeout(showNext, 600);
        }, 900);
      } else {
        i++;
        setVisibleCount(i);
        setTimeout(showNext, 600);
      }
    }
    setTimeout(showNext, 400);
  }

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [visibleCount, showTyping]);

  return (
    <div ref={sectionRef} className="wa-phone">
      {/* Phone notch */}
      <div className="wa-phone-notch">
        <div className="wa-phone-notch-inner" />
      </div>

      {/* Header */}
      <div className="wa-phone-header">
        <div className="wa-phone-avatar">
          <Bot className="size-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white">ShopBot</div>
          <div className="text-[10px] text-green-100">online</div>
        </div>
      </div>

      {/* Chat area */}
      <div ref={chatContainerRef} className="wa-phone-chat">
        {/* Wallpaper pattern */}
        <div className="wa-phone-wallpaper" />

        <div className="wa-phone-messages">
          {chatMessages.slice(0, visibleCount).map((msg, i) => (
            <div
              key={i}
              className={`wa-msg wa-msg-animate ${
                msg.type === "sent" ? "wa-msg-sent" : "wa-msg-received"
              }`}
            >
              <span className="text-sm leading-relaxed">{msg.text}</span>
              <span className="wa-msg-time">
                {msg.type === "sent" ? "12:0" + i : "12:0" + i}
              </span>
            </div>
          ))}

          {showTyping && (
            <div className="wa-msg wa-msg-received wa-msg-animate">
              <TypingIndicator />
            </div>
          )}

          <div />
        </div>
      </div>

      {/* Input bar */}
      <div className="wa-phone-input">
        <div className="wa-phone-input-field">Message</div>
        <div className="wa-phone-input-mic">
          <MessageCircle className="size-4 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function WhatsAppBotSection() {
  return (
    <Features5
      title="WhatsApp Bot Built-in"
      description="Shudhu web store na - WhatsApp e o shob kicchu kora jay! Customer WhatsApp e message dile bot auto reply dey."
      items={botItems}
    >
      <PhoneMockup />
    </Features5>
  );
}
