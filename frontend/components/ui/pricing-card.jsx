"use client"

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";

const FeatureItem = ({ feature }) => {
  const Icon = feature.isIncluded ? Check : X;
  const iconColor = feature.isIncluded ? "text-primary" : "text-muted-foreground";

  return (
    <li className="flex items-start space-x-3 py-2">
      <Icon className={cn("h-4 w-4 flex-shrink-0 mt-0.5", iconColor)} aria-hidden="true" />
      <span className={cn("text-sm", feature.isIncluded ? "text-foreground" : "text-muted-foreground")}>
        {feature.name}
      </span>
    </li>
  );
};

const PricingComponent = ({
  plans,
  billingCycle,
  onCycleChange,
  onPlanSelect,
  className,
  ...props
}) => {
  if (plans.length !== 3) {
    console.error("PricingComponent requires exactly 3 pricing tiers.");
    return null;
  }

  const annualDiscountPercent = 20;

  const CycleToggle = (
    <div className="flex justify-center mb-10 mt-2">
      <ToggleGroup
        type="single"
        value={billingCycle}
        onValueChange={(value) => {
          if (value && (value === "monthly" || value === "annually")) {
            onCycleChange(value);
          }
        }}
        aria-label="Select billing cycle"
        className="border rounded-lg p-1 bg-muted/50"
      >
        <ToggleGroupItem
          value="monthly"
          aria-label="Monthly Billing"
          className="px-6 py-1.5 text-sm font-medium data-[state=on]:bg-background data-[state=on]:shadow-sm data-[state=on]:border data-[state=on]:ring-1 data-[state=on]:ring-ring/20 rounded-md transition-colors"
        >
          Monthly
        </ToggleGroupItem>
        <ToggleGroupItem
          value="annually"
          aria-label="Annual Billing"
          className="px-6 py-1.5 text-sm font-medium data-[state=on]:bg-background data-[state=on]:shadow-sm data-[state=on]:border data-[state=on]:ring-1 data-[state=on]:ring-ring/20 rounded-md transition-colors relative"
        >
          Annually
          <span className="absolute -top-3 right-0 text-xs font-semibold text-primary/80 bg-primary/10 px-1.5 rounded-full whitespace-nowrap">
            Save {annualDiscountPercent}%
          </span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );

  const allFeatures = Array.from(new Set(plans.flatMap((p) => p.features.map((f) => f.name))));

  const PricingCards = (
    <div className="grid gap-8 md:grid-cols-3 md:gap-6 lg:gap-8">
      {plans.map((plan) => {
        const isFeatured = plan.isPopular;
        const currentPrice = billingCycle === "monthly" ? plan.priceMonthly : plan.priceAnnually;
        const originalMonthlyPrice = plan.priceMonthly;
        const priceSuffix = billingCycle === "monthly" ? "/mo" : "/yr";

        return (
          <Card
            key={plan.id}
            className={cn(
              "flex flex-col transition-all duration-300 shadow-md hover:shadow-lg",
              isFeatured && "ring-2 ring-primary shadow-xl transform md:scale-[1.02] hover:scale-[1.04]"
            )}
          >
            <CardHeader className="p-6 pb-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                {isFeatured && (
                  <span className="text-xs font-semibold px-3 py-1 bg-primary text-primary-foreground rounded-full">
                    Most Popular
                  </span>
                )}
              </div>
              <CardDescription className="text-sm mt-1">{plan.description}</CardDescription>
              <div className="mt-4">
                <p className="text-4xl font-extrabold text-foreground">
                  ${currentPrice}
                  <span className="text-base font-normal text-muted-foreground ml-1">{priceSuffix}</span>
                </p>
                {billingCycle === "annually" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Billed annually (${plan.priceAnnually})
                  </p>
                )}
                {billingCycle === "annually" && (
                  <p className="text-xs text-muted-foreground line-through opacity-70 mt-1">
                    ${originalMonthlyPrice}/mo
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-grow p-6 pt-0">
              <h4 className="text-sm font-semibold mb-2 mt-4 text-foreground/80">Key Features:</h4>
              <ul className="list-none space-y-0">
                {plan.features.slice(0, 5).map((feature) => (
                  <FeatureItem key={feature.name} feature={feature} />
                ))}
                {plan.features.length > 5 && (
                  <li className="text-sm text-muted-foreground mt-2">
                    + {plan.features.length - 5} more features
                  </li>
                )}
              </ul>
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <Button
                onClick={() => onPlanSelect(plan.id, billingCycle)}
                className={cn(
                  "w-full transition-all duration-200",
                  isFeatured
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-muted text-foreground hover:bg-muted/80 border border-input"
                )}
                size="lg"
                aria-label={`Select ${plan.name} plan for ${currentPrice} ${priceSuffix}`}
              >
                {plan.buttonLabel}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );

  const ComparisonTable = (
    <div className="mt-16 hidden md:block border rounded-lg overflow-x-auto shadow-sm">
      <table className="min-w-full divide-y divide-border/80">
        <thead>
          <tr className="bg-muted/30">
            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 w-[200px] whitespace-nowrap">
              Feature
            </th>
            {plans.map((plan) => (
              <th
                key={`th-${plan.id}`}
                scope="col"
                className={cn(
                  "px-6 py-4 text-center text-sm font-semibold text-foreground/80 whitespace-nowrap",
                  plan.isPopular && "bg-primary/10"
                )}
              >
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/80 bg-background/90">
          {allFeatures.map((featureName, index) => (
            <tr key={featureName} className={cn("transition-colors hover:bg-accent/20", index % 2 === 0 ? "bg-background" : "bg-muted/10")}>
              <td className="px-6 py-3 text-left text-sm font-medium text-foreground/90 whitespace-nowrap">
                {featureName}
              </td>
              {plans.map((plan) => {
                const feature = plan.features.find((f) => f.name === featureName);
                const isIncluded = feature?.isIncluded ?? false;
                const Icon = isIncluded ? Check : X;
                const iconColor = isIncluded ? "text-primary" : "text-muted-foreground/70";

                return (
                  <td
                    key={`${plan.id}-${featureName}`}
                    className={cn(
                      "px-6 py-3 text-center transition-all duration-150",
                      plan.isPopular && "bg-primary/5"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 mx-auto", iconColor)} aria-hidden="true" />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className={cn("w-full py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", className)} {...props}>
      <header className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Choose the right plan for your business.
        </h2>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          Scale effortlessly with features designed for growth, from startups to enterprise.
        </p>
      </header>

      {CycleToggle}

      <section aria-labelledby="pricing-plans">
        {PricingCards}
      </section>

      <section aria-label="Feature Comparison Table" className="mt-16">
        <h3 className="text-2xl font-bold mb-6 hidden md:block text-center text-foreground">
          Detailed Feature Comparison
        </h3>
        {ComparisonTable}
      </section>
    </div>
  );
};

const examplePlans = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for new teams and small projects.",
    priceMonthly: 19,
    priceAnnually: 182,
    isPopular: false,
    buttonLabel: "Start Free Trial",
    features: [
      { name: "1 Project", isIncluded: true },
      { name: "Basic Analytics", isIncluded: true },
      { name: "Email Support", isIncluded: true },
      { name: "10,000 API Calls", isIncluded: true },
      { name: "Custom Domains", isIncluded: false },
      { name: "Dedicated Account Manager", isIncluded: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Everything a growing business needs to succeed.",
    priceMonthly: 49,
    priceAnnually: 470,
    isPopular: true,
    buttonLabel: "Choose Pro",
    features: [
      { name: "Unlimited Projects", isIncluded: true },
      { name: "Advanced Analytics", isIncluded: true },
      { name: "Priority Chat Support", isIncluded: true },
      { name: "500,000 API Calls", isIncluded: true },
      { name: "Custom Domains", isIncluded: true },
      { name: "SLAs and Uptime Guarantees", isIncluded: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Advanced features and dedicated support for large organizations.",
    priceMonthly: 199,
    priceAnnually: 1910,
    isPopular: false,
    buttonLabel: "Contact Sales",
    features: [
      { name: "Unlimited Projects", isIncluded: true },
      { name: "Advanced Analytics", isIncluded: true },
      { name: "Priority Chat Support", isIncluded: true },
      { name: "5,000,000 API Calls", isIncluded: true },
      { name: "Custom Domains", isIncluded: true },
      { name: "Dedicated Account Manager", isIncluded: true },
      { name: "SLAs and Uptime Guarantees", isIncluded: true },
      { name: "Single Sign-On (SSO)", isIncluded: true },
    ],
  },
];

export default function PricingSection() {
  const [cycle, setCycle] = React.useState("annually");

  const handleCycleChange = (newCycle) => {
    setCycle(newCycle);
  };

  const handlePlanSelect = (planId, currentCycle) => {
    console.log(`User selected plan: ${planId} with cycle: ${currentCycle}`);
  };

  return (
    <PricingComponent
      plans={examplePlans}
      billingCycle={cycle}
      onCycleChange={handleCycleChange}
      onPlanSelect={handlePlanSelect}
    />
  );
}

export { PricingComponent };