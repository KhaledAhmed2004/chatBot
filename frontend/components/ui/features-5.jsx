import { MessageCircle, Bot, Globe, ShoppingCart } from "lucide-react";

export function Features5({
  title = "Built for Scaling teams",
  description = "Description here",
  items = [],
  children,
}) {
  return (
    <section className="py-16 md:py-32" id="bot">
      <div className="mx-auto max-w-xl md:max-w-6xl px-6">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-12 lg:grid-cols-5 lg:gap-24">
          <div className="lg:col-span-2">
            <div className="md:pr-6 lg:pr-0">
              <h2 className="text-4xl font-semibold lg:text-5xl">{title}</h2>
              <p className="mt-6 text-muted-foreground">{description}</p>
            </div>
            {items.length > 0 && (
              <ul className="mt-8 divide-y border-y *:flex *:items-center *:gap-3 *:py-3">
                {items.map((item, i) => (
                  <li key={i}>
                    {item.icon && <item.icon className="size-5" />}
                    {item.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="relative lg:col-span-3 flex items-center justify-center">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
