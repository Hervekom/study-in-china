import {
  TOTAL_PRICE_USD,
  TOTAL_PRICE_XAF,
  INITIAL_DEPOSIT_USD,
  INITIAL_DEPOSIT_XAF,
  ADMISSION_PAYMENT_USD,
  ADMISSION_PAYMENT_XAF,
  FINAL_PAYMENT_USD,
  FINAL_PAYMENT_XAF,
  CURRENCY,
  pricing,
} from '../config/siteConfig';

export interface PaymentStatusInfo {
  totalUSD: number;
  totalXAF: number;
  depositUSD: number;
  depositXAF: number;
  admissionPaymentUSD: number;
  admissionPaymentXAF: number;
  finalPaymentUSD: number;
  finalPaymentXAF: number;
  depositStatus: 'not_paid' | 'deposit_pending' | 'deposit_paid';
  admissionPaymentStatus: 'locked' | 'pending' | 'paid';
  finalPaymentStatus: 'locked' | 'pending' | 'paid';
  currency: string;
}

export const OFFICIAL_PRICING = {
  total: TOTAL_PRICE_USD,
  totalXaf: TOTAL_PRICE_XAF,
  deposit: INITIAL_DEPOSIT_USD,
  depositXaf: INITIAL_DEPOSIT_XAF,
  admission: ADMISSION_PAYMENT_USD,
  admissionXaf: ADMISSION_PAYMENT_XAF,
  final: FINAL_PAYMENT_USD,
  finalXaf: FINAL_PAYMENT_XAF,
  currency: CURRENCY,
  plan: pricing,
};

export const paymentService = {
  getPricing() {
    return {
      totalUSD: TOTAL_PRICE_USD,
      totalXAF: TOTAL_PRICE_XAF,
      depositUSD: INITIAL_DEPOSIT_USD,
      depositXAF: INITIAL_DEPOSIT_XAF,
      admissionPaymentUSD: ADMISSION_PAYMENT_USD,
      admissionPaymentXAF: ADMISSION_PAYMENT_XAF,
      finalPaymentUSD: FINAL_PAYMENT_USD,
      finalPaymentXAF: FINAL_PAYMENT_XAF,
      currency: CURRENCY,
    };
  },

  /**
   * Status provider for applications
   */
  getPaymentStatus(
    depositPaid: boolean,
    admissionPaid: boolean = false,
    finalPaid: boolean = false,
    hasAdmission: boolean = false,
    hasJW: boolean = false
  ): PaymentStatusInfo {
    return {
      totalUSD: TOTAL_PRICE_USD,
      totalXAF: TOTAL_PRICE_XAF,
      depositUSD: INITIAL_DEPOSIT_USD,
      depositXAF: INITIAL_DEPOSIT_XAF,
      admissionPaymentUSD: ADMISSION_PAYMENT_USD,
      admissionPaymentXAF: ADMISSION_PAYMENT_XAF,
      finalPaymentUSD: FINAL_PAYMENT_USD,
      finalPaymentXAF: FINAL_PAYMENT_XAF,
      currency: CURRENCY,
      depositStatus: depositPaid ? 'deposit_paid' : 'deposit_pending',
      admissionPaymentStatus: admissionPaid
        ? 'paid'
        : hasAdmission
        ? 'pending'
        : 'locked',
      finalPaymentStatus: finalPaid
        ? 'paid'
        : hasJW
        ? 'pending'
        : 'locked',
    };
  },

  /**
   * Explicit notice as mandated: Real payments are connected via Trae backend integration.
   */
  requestPayment(type: 'deposit' | 'admission_payment' | 'final_payment'): { success: boolean; message: string } {
    return {
      success: false,
      message: 'Payment integration will be connected soon via Trae. No live card charges are executed in this prototype.',
    };
  },
};
