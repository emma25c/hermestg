import { UserPass, ReceiptData, UserProfileData } from '../types';

const STORAGE_KEY_PASS = 'djantahub_user_pass';
const STORAGE_KEY_PROFILE = 'djantahub_user_profile';
const STORAGE_KEY_RECEIPTS = 'djantahub_recent_receipts';

export function getStoredUserPass(): UserPass {
  const raw = localStorage.getItem(STORAGE_KEY_PASS);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fallback
    }
  }

  // Initialisation par défaut
  const defaultPass: UserPass = {
    status: 'free',
    expiresAt: null,
    referralCode: 'DJANTA' + Math.floor(1000 + Math.random() * 9000),
    affiliateBalance: 0,
    referralCount: 0
  };
  localStorage.setItem(STORAGE_KEY_PASS, JSON.stringify(defaultPass));
  return defaultPass;
}

export function saveUserPass(pass: UserPass): void {
  localStorage.setItem(STORAGE_KEY_PASS, JSON.stringify(pass));
  // Synchronise aussi le profil local si présent
  const rawProf = localStorage.getItem(STORAGE_KEY_PROFILE);
  if (rawProf) {
    try {
      const p = JSON.parse(rawProf);
      p.passStatus = pass.status;
      p.passExpiresAt = pass.expiresAt;
      p.referralCode = pass.referralCode;
      p.affiliateBalance = pass.affiliateBalance;
      p.referralCount = pass.referralCount;
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(p));
    } catch {
      // ignore
    }
  }
}

export function getStoredUserProfile(): UserProfileData {
  const currentPass = getStoredUserPass();
  const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        passStatus: currentPass.status,
        passExpiresAt: currentPass.expiresAt,
        referralCode: parsed.referralCode || currentPass.referralCode,
        affiliateBalance: currentPass.affiliateBalance,
        referralCount: currentPass.referralCount,
      };
    } catch {
      // fallback
    }
  }

  const defaultProfile: UserProfileData = {
    fullName: '',
    phone: '',
    phoneProvider: 'T-Money',
    cityOrUniversity: 'Université de Lomé',
    referralCode: currentPass.referralCode,
    passStatus: currentPass.status,
    passExpiresAt: currentPass.expiresAt,
    affiliateBalance: currentPass.affiliateBalance,
    referralCount: currentPass.referralCount,
  };
  localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(defaultProfile));
  return defaultProfile;
}

export function saveStoredUserProfile(profile: UserProfileData): void {
  localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  const pass: UserPass = {
    status: profile.passStatus,
    expiresAt: profile.passExpiresAt,
    referralCode: profile.referralCode,
    affiliateBalance: profile.affiliateBalance,
    referralCount: profile.referralCount,
  };
  localStorage.setItem(STORAGE_KEY_PASS, JSON.stringify(pass));
}

export function isPassActive(pass: UserPass): boolean {
  if (pass.status === 'free') return false;
  if (!pass.expiresAt) return false;
  return new Date(pass.expiresAt).getTime() > Date.now();
}

export function saveReceiptDraft(receipt: ReceiptData): void {
  const raw = localStorage.getItem(STORAGE_KEY_RECEIPTS);
  const list: ReceiptData[] = raw ? JSON.parse(raw) : [];
  list.unshift(receipt);
  localStorage.setItem(STORAGE_KEY_RECEIPTS, JSON.stringify(list.slice(0, 10)));
}
