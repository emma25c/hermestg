export type TabType = 'outils' | 'formations' | 'services' | 'affiliation' | 'profil';

export type ActiveToolType = 'compressor' | 'receipt' | 'simulator' | 'apc_generator';

export * from './apc';

export interface UserPass {
  status: 'free' | 'pass_7d' | 'pass_30d' | 'pass_90d';
  expiresAt: string | null;
  referralCode: string;
  affiliateBalance: number;
  referralCount: number;
}

export interface UserProfileData {
  id?: string;
  email?: string;
  fullName: string;
  phone: string;
  phoneProvider: 'T-Money' | 'Flooz' | 'Autre';
  cityOrUniversity: string;
  referredBy?: string;
  referralCode: string;
  passStatus: 'free' | 'pass_7d' | 'pass_30d' | 'pass_90d';
  passExpiresAt: string | null;
  affiliateBalance: number;
  referralCount: number;
  avatarUrl?: string;
}

export interface ReceiptItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface ReceiptData {
  businessName: string;
  businessPhone: string;
  customerName: string;
  customerPhone?: string;
  receiptNumber: string;
  date: string;
  paymentMode: 'T-Money' | 'Flooz' | 'Espèces' | 'Virement';
  items: ReceiptItem[];
  discount: number;
  notes?: string;
}

export interface TipItem {
  id: string;
  title: string;
  category: 'concours' | 'data' | 'finance' | 'securite' | 'ia';
  badge: string;
  readTime: string;
  summary: string;
  content: string[];
  isPremium: boolean;
}

export interface CourseItem {
  id: string;
  title: string;
  category: string;
  duration: string;
  description: string;
  modules?: string[];
  videoUrl?: string;
  isPremium: boolean;
}
