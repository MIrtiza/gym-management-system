"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/auth-context";
import {
  updateSubscription,
  getGymSubscription,
  SUBSCRIPTION_PLANS,
} from "@/lib/payment-service";

type BillingCycle = "monthly" | "annual";
type Plan = "basic" | "premium" | "elite";
type PaymentMethod = "credit_card" | "debit_card" | "bank_transfer";

const PLAN_FEATURES = {
  basic: [
    "Member Management",
    "Basic Analytics",
    "Email Support",
    "Up to 500 Members",
  ],
  premium: [
    "Everything in Basic",
    "Advanced Analytics",
    "Priority Support",
    "Unlimited Members",
    "Check-in System",
  ],
  elite: [
    "Everything in Premium",
    "Custom Reports",
    "24/7 Phone Support",
    "API Access",
    "Multi-Location",
    "White Label Options",
  ],
};

export default function BillingPage() {
  const { user, gymName } = useAuth();
  const gymId = user?.user_metadata?.gym_id;
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("annual");
  const [selectedPlan, setSelectedPlan] = useState<Plan>("premium");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("credit_card");
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(0);
  const [cardData, setCardData] = useState({
    name: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  useEffect(() => {
    if (gymId) {
      fetchSubscription();
    }
  }, [gymId]);

  const fetchSubscription = async () => {
    if (!gymId) return;

    try {
      const result = await getGymSubscription(gymId);
      if (
        result.subscription &&
        (result.subscription.plan === "basic" ||
          result.subscription.plan === "premium" ||
          result.subscription.plan === "elite")
      ) {
        setCurrentSubscription(result.subscription);
        setSelectedPlan(result.subscription.plan);
        setBillingCycle(result.subscription.billing_cycle);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const calculateTotal = () => {
    const amount = SUBSCRIPTION_PLANS[selectedPlan][billingCycle];
    const tax = amount * 0.08;
    return {
      subtotal: amount,
      tax,
      total: amount + tax,
    };
  };

  const handleSubscriptionUpgrade = async () => {
    if (!gymId) {
      toast.error("User information not found");
      return;
    }

    if (!cardData.name || !cardData.cardNumber) {
      toast.error("Please fill in payment details");
      return;
    }

    setLoading(true);
    try {
      const result = await updateSubscription(
        gymId,
        selectedPlan,
        billingCycle,
      );

      if (result.success) {
        toast.success(`Subscription upgraded to ${selectedPlan}! 🎉`);
        setCurrentSubscription(result.subscription);
        setCardData({ name: "", cardNumber: "", expiry: "", cvv: "" });
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to upgrade subscription");
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotal();
  const planNames: Record<Plan, string> = {
    basic: "Titan Basic",
    premium: "Titan Premium",
    elite: "Titan Elite",
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, "")
      .replace(/(.{4})/g, "$1 ")
      .trim();
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardData({ ...cardData, cardNumber: formatted });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 2) {
      value = value.slice(0, 2) + " / " + value.slice(2, 4);
    }
    setCardData({ ...cardData, expiry: value });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Content Area */}
        <div className="lg:col-span-8 space-y-12">
          {/* Page Header */}
          <section>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
              {gymName || "Your Gym"} - Get Your Premium Plan
            </h1>
            <p className="text-gray-400 text-lg">
              Power your performance with our elite management tools.
            </p>
          </section>

          {/* Billing Cycle Section */}
          <section className="bg-gray-900 rounded-xl p-8 shadow-lg border border-gray-800">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xs font-bold tracking-widest uppercase text-blue-400">
                Confirm Your Billing Cycle
              </h2>
              <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase border border-blue-500/20">
                Save 29% when you select annual billing
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Monthly Card */}
              <div
                onClick={() => setBillingCycle("monthly")}
                className={`group cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 ${
                  billingCycle === "monthly"
                    ? "border-blue-500 bg-blue-500/5"
                    : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">Monthly</h3>
                    <p className="text-sm text-gray-400">
                      Flexible, cancel anytime
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      billingCycle === "monthly"
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-600"
                    }`}
                  >
                    {billingCycle === "monthly" && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black">
                    ${SUBSCRIPTION_PLANS[selectedPlan].monthly}
                  </span>
                  <span className="text-gray-400 text-sm font-medium">
                    /month
                  </span>
                </div>
              </div>

              {/* Annual Card */}
              <div
                onClick={() => setBillingCycle("annual")}
                className={`group cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 relative overflow-hidden ${
                  billingCycle === "annual"
                    ? "border-blue-500 bg-blue-500/5"
                    : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                }`}
              >
                {billingCycle === "annual" && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-xs px-3 py-1 font-black text-white uppercase tracking-widest">
                    Best Value
                  </div>
                )}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">Annually</h3>
                    <p className="text-sm text-gray-400">
                      Billed as ${SUBSCRIPTION_PLANS[selectedPlan].annual} per
                      year
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      billingCycle === "annual"
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-600"
                    }`}
                  >
                    {billingCycle === "annual" && (
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black">
                    ${Math.round(SUBSCRIPTION_PLANS[selectedPlan].annual / 12)}
                  </span>
                  <span className="text-gray-400 text-sm font-medium">
                    /month equivalent
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Plan Selection Section */}
          <section className="bg-gray-900 rounded-xl p-8 shadow-lg border border-gray-800">
            <h2 className="text-xs font-bold tracking-widest uppercase text-blue-400 mb-8">
              Select Your Plan
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["basic", "premium", "elite"] as const).map((plan) => (
                <div
                  key={plan}
                  onClick={() => setSelectedPlan(plan)}
                  className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 ${
                    selectedPlan === plan
                      ? "border-blue-500 bg-blue-500/5"
                      : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg capitalize">{plan}</h3>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === plan
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-600"
                      }`}
                    >
                      {selectedPlan === plan && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {PLAN_FEATURES[plan].map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-blue-400 mt-0.5">✓</span>
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Payment Method Section */}
          <section className="bg-gray-900 rounded-xl p-8 shadow-lg border border-gray-800">
            <h2 className="text-xs font-bold tracking-widest uppercase text-blue-400 mb-8">
              Select Your Payment Method
            </h2>

            <div className="flex gap-4 mb-8">
              <div
                onClick={() => setPaymentMethod("credit_card")}
                className={`h-12 w-20 rounded-lg flex items-center justify-center border-2 cursor-pointer transition-all ${
                  paymentMethod === "credit_card"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-700 bg-gray-800/50"
                }`}
              >
                <span className="text-2xl">💳</span>
              </div>
              <div
                onClick={() => setPaymentMethod("bank_transfer")}
                className={`h-12 w-20 rounded-lg flex items-center justify-center border-2 cursor-pointer transition-all opacity-50 hover:opacity-100 ${
                  paymentMethod === "bank_transfer"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-700 bg-gray-800/50"
                }`}
              >
                <span className="text-2xl">🏦</span>
              </div>
              <div
                onClick={() => setPaymentMethod("debit_card")}
                className={`h-12 w-20 rounded-lg flex items-center justify-center border-2 cursor-pointer transition-all opacity-50 hover:opacity-100 ${
                  paymentMethod === "debit_card"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-700 bg-gray-800/50"
                }`}
              >
                <span className="text-2xl">💰</span>
              </div>
            </div>

            <form className="space-y-6">
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">
                  Name on Card
                </label>
                <input
                  type="text"
                  value={cardData.name}
                  onChange={(e) =>
                    setCardData({ ...cardData, name: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-600 text-sm font-medium"
                  placeholder="JONATHAN DOE"
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardData.cardNumber}
                  onChange={handleCardNumberChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-600 text-sm font-medium"
                  placeholder="XXXX XXXX XXXX XXXX"
                  maxLength={19}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={cardData.expiry}
                    onChange={handleExpiryChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-600 text-sm font-medium"
                    placeholder="MM / YY"
                    maxLength={7}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">
                    CVV
                  </label>
                  <input
                    type="password"
                    value={cardData.cvv}
                    onChange={(e) =>
                      setCardData({ ...cardData, cvv: e.target.value })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-600 text-sm font-medium"
                    placeholder="***"
                    maxLength={3}
                  />
                </div>
              </div>
            </form>
          </section>

          {/* FAQ Section */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold tracking-widest uppercase text-blue-400 mb-6">
              Frequently Asked Questions
            </h2>

            {[
              {
                question: "Can I switch plans mid-cycle?",
                answer:
                  "Yes, you can upgrade or downgrade your plan at any time. Changes to higher tiers are applied immediately, while downgrades take effect at the start of your next billing cycle.",
              },
              {
                question: "What is your refund policy?",
                answer:
                  "We offer a 7-day money-back guarantee for new subscriptions. After that, cancellations are processed at the end of your billing period with no refunds for unused time.",
              },
              {
                question: "Do you offer discounts for multi-gym owners?",
                answer:
                  "Yes! Contact our sales team for volume discounts if you manage multiple gyms. We offer special pricing for enterprise customers.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-800"
              >
                <button
                  onClick={() =>
                    setExpandedFAQ(expandedFAQ === idx ? null : idx)
                  }
                  className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-gray-800/50 transition-colors"
                >
                  <span className="font-bold">{faq.question}</span>
                  <span
                    className={`text-blue-400 transition-transform ${
                      expandedFAQ === idx ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>
                {expandedFAQ === idx && (
                  <div className="px-6 py-4 bg-gray-800/30 text-gray-300 text-sm border-t border-gray-800">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </section>
        </div>

        {/* Right Sidebar: Order Summary */}
        <aside className="lg:col-span-4 h-fit sticky top-24">
          <div className="bg-gray-900 rounded-xl p-8 shadow-xl border border-blue-500/10">
            <h2 className="text-xs font-bold tracking-widest uppercase text-blue-400 mb-8">
              Order Summary
            </h2>

            <div className="space-y-6 mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold capitalize">
                    {planNames[selectedPlan]} Plan
                  </p>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">
                    {billingCycle === "annual" ? "Annual" : "Monthly"}{" "}
                    Subscription
                  </p>
                </div>
                <span className="font-black">
                  $
                  {billingCycle === "annual"
                    ? SUBSCRIPTION_PLANS[selectedPlan].annual
                    : SUBSCRIPTION_PLANS[selectedPlan].monthly}
                  .00
                </span>
              </div>

              <div className="space-y-3 pt-6 border-t border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="font-medium">
                    ${totals.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Estimated Tax (8%)</span>
                  <span className="font-medium">${totals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Setup Fee</span>
                  <span className="text-blue-400 font-bold">WAIVED</span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-700 flex justify-between items-end">
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-gray-400">
                    Total Due Today
                  </p>
                  <p className="text-3xl font-black text-white">
                    ${totals.total.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubscriptionUpgrade}
              disabled={loading}
              className="w-full bg-blue-600 py-4 rounded-xl font-bold uppercase tracking-widest text-sm text-white shadow-lg hover:bg-blue-700 transition-all duration-200 transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>🔒</span>
              {loading ? "Processing..." : "Start Premium Subscription"}
            </button>

            <p className="text-center text-xs text-gray-400 mt-6 uppercase tracking-wider px-4">
              By confirming your subscription, you allow IRONCORE to charge your
              card for this and future payments in accordance with our terms.
            </p>
          </div>

          {/* Social Proof Card */}
          <div className="mt-6 bg-gray-900 rounded-xl p-6 border border-blue-500/10 overflow-hidden relative group">
            <div className="relative z-10">
              <h4 className="text-sm font-bold mb-2">Join 2,500+ Elite Gyms</h4>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                "IRONCORE transformed our facility management. The performance
                metrics are unparalleled."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                  <span>💪</span>
                </div>
                <div>
                  <p className="text-xs font-bold">MARCUS REED</p>
                  <p className="text-xs text-blue-400">CEO, TITAN ELITE</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl group-hover:bg-blue-600/10 transition-all"></div>
          </div>
        </aside>
      </main>
    </div>
  );
}
