import api from "@/config/axios";

export interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface Plan {
  id: string;
  name: string;
  price: string;
  price_raw: number;
  currency: string;
  description: string;
  features: PlanFeature[];
  unlocked_features: string[];
}

export async function fetchPlans(): Promise<Plan[]> {
  const response = await api.get<Plan[]>("/billing/plans");
  return response.data;
}

export interface CreateOrderResponse {
  order_id: string;
  key_id: string;
  amount: number;
  currency: string;
  is_mock: boolean;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  plan_id: string;
}

export interface VerifyPaymentResponse {
  status: string;
  message: string;
  plan_id: string;
}

export async function createRazorpayOrder(planId: string): Promise<CreateOrderResponse> {
  const response = await api.post<CreateOrderResponse>("/billing/create-order", { plan_id: planId });
  return response.data;
}

export async function verifyRazorpayPayment(payload: VerifyPaymentPayload): Promise<VerifyPaymentResponse> {
  const response = await api.post<VerifyPaymentResponse>("/billing/verify-payment", payload);
  return response.data;
}

export async function cancelSubscription(): Promise<VerifyPaymentResponse> {
  const response = await api.post<VerifyPaymentResponse>("/billing/cancel-subscription");
  return response.data;
}
