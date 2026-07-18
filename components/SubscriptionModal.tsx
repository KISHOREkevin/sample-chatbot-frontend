"use client";

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { changeSubscriptionPlan } from '@/redux/slices/authSlice';
import { X, Check, Zap, Sparkles, Loader2, ShieldCheck } from 'lucide-react';
import { createRazorpayOrder, verifyRazorpayPayment, cancelSubscription, fetchPlans, Plan } from '@/api/billing';

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const STATIC_PLAN_FEATURES: Record<string, string[]> = {
  free: ['chat'],
  pro: ['chat', 'image_generation']
};

export const hasPlanFeature = (planId: string, featureKey: string): boolean => {
  const features = STATIC_PLAN_FEATURES[planId] || STATIC_PLAN_FEATURES['free'];
  return features.includes(featureKey);
};

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { planId, user } = useAppSelector((state) => state.auth);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isPlansLoading, setIsPlansLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<string>('');
  const [showDowngradeConfirm, setShowDowngradeConfirm] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPlans();
    }
  }, [isOpen]);

  const loadPlans = async () => {
    setIsPlansLoading(true);
    try {
      const data = await fetchPlans();
      setPlans(data);
    } catch (err) {
      console.error("Failed to load subscription plans:", err);
    } finally {
      setIsPlansLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSelectPlan = async (targetPlan: Plan) => {
    // If selecting current plan, do nothing
    if (planId === targetPlan.id) return;

    // Check if it is a downgrade (e.g. going back to free plan)
    const isDowngrade = targetPlan.id === 'free';

    if (isDowngrade) {
      setPendingPlan(targetPlan);
      setShowDowngradeConfirm(true);
      return;
    }

    setLoadingAction(targetPlan.id);
    setPaymentStep('Connecting to billing server...');

    try {
      // 1. Create order on backend
      const order = await createRazorpayOrder(targetPlan.id);

      if (order.is_mock) {
        // Mock Checkout Flow Simulation
        const steps = [
          'Initializing secure mock handshake...',
          'Bypassing Razorpay sandbox check...',
          'Authorizing mock payment token...',
          `Activating ${targetPlan.name} credentials...`
        ];

        let currentStep = 0;
        setPaymentStep(steps[0]);

        const interval = setInterval(async () => {
          currentStep++;
          if (currentStep < steps.length) {
            setPaymentStep(steps[currentStep]);
          } else {
            clearInterval(interval);
            try {
              // Verify mock payment to save in DB
              const dummyPayId = 'mock_pay_' + Math.random().toString(36).substring(2, 12);
              const verification = await verifyRazorpayPayment({
                razorpay_order_id: order.order_id,
                razorpay_payment_id: dummyPayId,
                razorpay_signature: 'mock_signature',
                plan_id: targetPlan.id
              });
              dispatch(changeSubscriptionPlan(verification.plan_id));
              setLoadingAction(null);
              setPaymentStep('');
            } catch (err: any) {
              alert("Payment verification failed: " + (err.response?.data?.detail || err.message || err));
              setLoadingAction(null);
              setPaymentStep('');
            }
          }
        }, 600);
      } else {
        // Real Razorpay Checkout Flow
        setPaymentStep('Loading payment gateway...');
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          alert("Failed to load Razorpay SDK. Please check your network connection.");
          setLoadingAction(null);
          setPaymentStep('');
          return;
        }

        const options = {
          key: order.key_id,
          amount: order.amount,
          currency: order.currency,
          name: "Chatty AI",
          description: `Subscribe to ${targetPlan.name}`,
          order_id: order.order_id,
          prefill: {
            name: user?.full_name || "",
            email: user?.email || "",
          },
          theme: {
            color: "#6366F1", // Indigo 500
          },
          handler: async (response: any) => {
            setPaymentStep('Verifying payment signature...');
            try {
              const verification = await verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan_id: targetPlan.id
              });
              dispatch(changeSubscriptionPlan(verification.plan_id));
            } catch (err: any) {
              alert("Payment verification failed: " + (err.response?.data?.detail || err.message || err));
            } finally {
              setLoadingAction(null);
              setPaymentStep('');
            }
          },
          modal: {
            ondismiss: () => {
              setLoadingAction(null);
              setPaymentStep('');
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      console.error(err);
      alert("Error initializing payment: " + (err.response?.data?.detail || err.message || err));
      setLoadingAction(null);
      setPaymentStep('');
    }
  };

  const executeDowngrade = async () => {
    if (!pendingPlan) return;
    setShowDowngradeConfirm(false);
    setLoadingAction(pendingPlan.id);
    setPaymentStep('Cancelling subscription...');
    try {
      const response = await cancelSubscription();
      dispatch(changeSubscriptionPlan(response.plan_id));
    } catch (err: any) {
      alert("Failed to cancel subscription: " + (err.response?.data?.detail || err.message || err));
    } finally {
      setLoadingAction(null);
      setPendingPlan(null);
      setPaymentStep('');
    }
  };

  const getPlanTheme = (id: string) => {
    if (id === 'free') {
      return {
        borderActive: 'border-indigo-500/30 shadow-indigo-500/5',
        borderHover: 'hover:border-indigo-500/20',
        badgeBg: 'bg-indigo-600',
        badgeText: 'text-white',
        glowBg: 'from-indigo-500/5 to-transparent',
        badge: undefined as string | undefined,
        isRecommended: false
      };
    } else if (id === 'pro') {
      return {
        borderActive: 'border-cyan-500/30 shadow-cyan-500/5',
        borderHover: 'hover:border-cyan-500/20',
        badgeBg: 'bg-gradient-to-r from-indigo-500 to-cyan-500',
        badgeText: 'text-white',
        glowBg: 'from-indigo-500/5 to-cyan-500/5',
        badge: 'Recommended',
        isRecommended: true
      };
    } else {
      // Default theme for any custom database-added plans
      return {
        borderActive: 'border-purple-500/30 shadow-purple-500/5',
        borderHover: 'hover:border-purple-500/20',
        badgeBg: 'bg-purple-600',
        badgeText: 'text-white',
        glowBg: 'from-purple-500/5 to-transparent',
        badge: undefined,
        isRecommended: false
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop blur */}
      <div 
        onClick={loadingAction ? undefined : onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Subscription Card Container */}
      <div className="relative w-full max-w-4xl bg-slate-950/75 border border-white/10 backdrop-blur-2xl rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden z-10 transition-all duration-300 hover:border-white/15">
        
        {/* Glow Spheres */}
        <div className="absolute -top-1/4 -right-1/4 w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-[300px] h-[300px] rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none"></div>

        {/* Close Button */}
        {!loadingAction && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8 md:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold tracking-widest text-indigo-400 uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
            Pricing Plans
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight">
            Elevate Your AI Capabilities
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-2">
            Unlock advanced content tools, low-latency node routing, and high-fidelity image rendering engines.
          </p>
        </div>

        {/* Dynamic content rendering based on loading states */}
        {loadingAction && loadingAction !== 'free' ? (
          <div className="flex flex-col items-center justify-center py-16 animate-fadeIn">
            <div className="relative w-16 h-16 mb-6">
              <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
              <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-white tracking-wide text-center">{paymentStep}</p>
            <p className="text-xs text-zinc-500 mt-2">SSL Secure Encryption Sandbox</p>
          </div>
        ) : isPlansLoading ? (
          <div className="flex flex-col items-center justify-center py-16 animate-fadeIn">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <p className="text-sm text-zinc-400">Loading subscription plans...</p>
          </div>
        ) : (
          /* Cards Grid - Dynamically supports any number of plans */
          <div className={`grid grid-cols-1 gap-6 overflow-y-auto pt-4 pb-2 px-1 scrollbar-none max-h-[60vh] md:max-h-none ${
            plans.length === 1 
              ? 'justify-center max-w-md mx-auto' 
              : plans.length === 2 
                ? 'md:grid-cols-2 max-w-3xl mx-auto' 
                : 'md:grid-cols-3'
          }`}>
            {plans.map((plan) => {
              const isActive = planId === plan.id;
              const theme = getPlanTheme(plan.id);

              return (
                <div 
                  key={plan.id}
                  className={`relative flex flex-col justify-between p-6 rounded-2xl border transition-all duration-300 ${
                    isActive 
                      ? `bg-slate-900/40 ${theme.borderActive}` 
                      : `bg-slate-950/40 border-white/10 ${theme.borderHover} hover:-translate-y-0.5`
                  }`}
                >
                  {/* Subtle Gradient Glow inside the card */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${theme.glowBg} rounded-2xl pointer-events-none`}></div>

                  {/* Plan Badge */}
                  {isActive && (
                    <span className={`absolute -top-3 right-4 ${theme.badgeBg} ${theme.badgeText} text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md`}>
                      Active
                    </span>
                  )}
                  {!isActive && theme.badge && (
                    <span className={`absolute -top-3 right-4 ${theme.badgeBg} ${theme.badgeText} text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md shadow-indigo-500/10`}>
                      <Zap className="w-2.5 h-2.5 fill-white text-white animate-bounce" /> {theme.badge}
                    </span>
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                      {theme.isRecommended && <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />}
                    </div>
                    <p className="text-xs text-zinc-500 mb-4">{plan.description}</p>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                      <span className="text-xs text-zinc-500">/ month</span>
                    </div>

                    <hr className="border-white/5 mb-6" />

                    <ul className="space-y-3.5 mb-8">
                      {plan.features.map((feat, index) => (
                        <li 
                          key={index}
                          className={`flex items-center gap-3 text-xs ${
                            feat.included 
                              ? feat.highlight ? 'text-cyan-300 font-medium' : 'text-zinc-300' 
                              : 'text-zinc-600 line-through'
                          }`}
                        >
                          {feat.included ? (
                            <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                          )}
                          <span>{feat.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {isActive ? (
                    <button 
                      disabled
                      className="w-full py-2.5 bg-zinc-800 text-zinc-400 text-xs font-semibold rounded-xl text-center cursor-not-allowed border border-white/5"
                    >
                      Active Plan
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleSelectPlan(plan)}
                      disabled={loadingAction !== null}
                      className={`w-full py-2.5 text-xs font-semibold rounded-xl text-center cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
                        theme.isRecommended 
                          ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-lg shadow-indigo-600/15'
                          : 'bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 hover:text-white'
                      }`}
                    >
                      {loadingAction === plan.id ? 'Processing...' : `Switch to ${plan.name}`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer info details */}
        <div className="mt-8 text-center text-[10px] text-zinc-500 border-t border-white/5 pt-4">
          Safe transactions. Payments are mock-processed under validation settings.
        </div>

        {/* Downgrade Confirmation Overlay */}
        {showDowngradeConfirm && pendingPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setShowDowngradeConfirm(false)} />
            <div className="relative w-full max-w-md bg-slate-950/85 border border-white/10 backdrop-blur-2xl rounded-2xl p-6 shadow-2xl z-10 text-center transition-all duration-300 hover:border-white/15">
              
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/20 mb-4">
                <svg className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2">Cancel subscription?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                Are you sure you want to change to {pendingPlan.name}? You will lose access to high-resolution AI Image Generation features immediately.
              </p>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowDowngradeConfirm(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 hover:text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  No, Keep Pro
                </button>
                <button
                  type="button"
                  onClick={executeDowngrade}
                  className="flex-1 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Yes, Downgrade
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
