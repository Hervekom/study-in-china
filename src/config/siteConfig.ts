// Centralized Internal Source Values in FCFA (XAF) - for internal accounting reference only
export const INITIAL_DEPOSIT_XAF = 300000;
export const ADMISSION_PAYMENT_XAF = 500000;
export const FINAL_PAYMENT_XAF = 1000000;
export const TOTAL_PRICE_XAF = 1800000;

// Centralized USD Display Values (Public UI is USD ONLY)
export const INITIAL_DEPOSIT_USD = 515;
export const ADMISSION_PAYMENT_USD = 858;
export const FINAL_PAYMENT_USD = 1716;
export const TOTAL_PRICE_USD = 3089;

// Primary constants
export const TOTAL_PRICE = TOTAL_PRICE_USD;
export const INITIAL_DEPOSIT = INITIAL_DEPOSIT_USD;
export const ADMISSION_PAYMENT = ADMISSION_PAYMENT_USD;
export const FINAL_PAYMENT = FINAL_PAYMENT_USD;
export const CURRENCY = 'USD';
export const CURRENCY_SYMBOL = '$';

export const pricing = {
  // Internal business reference values
  initialDepositXAF: INITIAL_DEPOSIT_XAF,
  admissionPaymentXAF: ADMISSION_PAYMENT_XAF,
  finalPaymentXAF: FINAL_PAYMENT_XAF,
  totalXAF: TOTAL_PRICE_XAF,

  // User-facing USD display values
  initialDepositUSD: INITIAL_DEPOSIT_USD,
  depositUSD: INITIAL_DEPOSIT_USD,
  admissionPaymentUSD: ADMISSION_PAYMENT_USD,
  finalPaymentUSD: FINAL_PAYMENT_USD,
  totalUSD: TOTAL_PRICE_USD,

  currency: 'USD',
  currencySymbol: '$',

  initialDeposit: {
    usd: INITIAL_DEPOSIT_USD,
    step: '01',
    label: 'Initial Deposit',
    timelineLabel: '01 — APPLICATION',
    timing: 'Paid before application processing.',
    description: 'Paid before application processing begins.',
  },

  admissionPayment: {
    usd: ADMISSION_PAYMENT_USD,
    step: '02',
    label: 'Admission Payment',
    subLabel: 'After Admission',
    timelineLabel: '02 — ADMISSION',
    timing: 'Paid after admission is confirmed.',
    description: 'Paid after admission is confirmed.',
  },

  finalPayment: {
    usd: FINAL_PAYMENT_USD,
    step: '03',
    label: 'Final Payment',
    subLabel: 'After JW202/JW201',
    timelineLabel: '03 — JW202/JW201',
    timing: 'Paid after the JW202/JW201 is received.',
    description: 'Paid after the JW202/JW201 is received.',
  },

  total: {
    usd: TOTAL_PRICE_USD,
    label: 'Total Service Fees',
  },
};

export const institutionDepositNotice = {
  title: 'Additional Institution Deposit',
  subtitle: 'Some institutions may require a separate deposit after pre-admission or admission to confirm your place.',
  badge: 'Separate from Study In China service fees',
  statement: "Some institutions may require an additional deposit after pre-admission or admission to confirm your intention to secure the available place. This deposit is separate from Study In China's service fees. Depending on the institution and program, it may be deducted from tuition or accommodation costs. The applicable amount and conditions are determined by the institution.",
  deductionNote: 'Where applicable, this deposit may be deducted from tuition or accommodation fees depending on the institution and program.',
  disclaimer: 'Amount, payment deadline, refundability and deduction conditions are determined by the institution.',
  programTypesExplanation: 'Treatment of an institution deposit may vary depending on the program structure, including Self-Support Programs and Partial Scholarship / Partial Support Programs. Do not assume that the same payment rules apply to every program. The final amount, purpose, and deduction conditions must always be presented as subject to the institution’s specific policy.',
};

/**
 * Global Configuration Flag for Trae Backend Integration.
 * Currently set to true so AI Studio runs 100% self-contained with mock/local services.
 * When ready to deploy to production with Supabase in Trae, simply set USE_MOCK_DATA = false.
 */
export const USE_MOCK_DATA = true;

export const siteConfig = {
  brandName: 'Study In China',
  tagline: 'Your Journey to Study in China Starts Here.',
  subtitle: 'Professional guidance from field & program discovery to official admission, JW202 visa documentation, and your arrival in China.',

  pricing: {
    totalUSD: TOTAL_PRICE_USD,
    totalXAF: TOTAL_PRICE_XAF,
    depositUSD: INITIAL_DEPOSIT_USD,
    depositXAF: INITIAL_DEPOSIT_XAF,
    admissionPaymentUSD: ADMISSION_PAYMENT_USD,
    admissionPaymentXAF: ADMISSION_PAYMENT_XAF,
    finalPaymentUSD: FINAL_PAYMENT_USD,
    finalPaymentXAF: FINAL_PAYMENT_XAF,
    currency: CURRENCY,
    currencySymbol: CURRENCY_SYMBOL,
    depositDescription: 'Initial deposit due before credential audit and official application processing begins.',
    admissionDescription: 'Paid once official admission notification is confirmed.',
    finalPaymentDescription: 'Paid after the official JW202/JW201 government visa authorization form is received.',
    refundPolicySummary: 'Transparent conditional refund policy if admission cannot be secured for qualified candidates matching entry criteria.',
    plan: pricing,
    institutionDeposit: institutionDepositNotice,
  },

  contact: {
    email: 'admissions@studyinchina.com',
    supportEmail: 'support@studyinchina.com',
    whatsappNumber: '+86 186 2100 8954',
    whatsappFormatted: '+86 186 2100 8954',
    whatsappDirectUrl: 'https://wa.me/8618621008954?text=Hello%20Study%20In%20China%2C%20I%20am%20interested%20in%20studying%20in%20China',
    officeAddress: 'Zhongguancun International Education Hub, Haidian District, Beijing, China',
    businessHours: 'Monday – Saturday: 09:00 – 19:00 (GMT+8 / Beijing Time)',
  },

  socialLinks: {
    whatsapp: 'https://wa.me/8618621008954',
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    tiktok: 'https://tiktok.com',
    linkedin: 'https://linkedin.com',
  },

  navLinks: [
    { label: 'Home', href: '#home' },
    { label: 'Study in China', href: '#why-china' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'About Us', href: '#about' },
    { label: 'Resources', href: '#resources' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ],
};
