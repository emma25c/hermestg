import { UserPass, ReceiptData } from '../types';

const STORAGE_KEY_PASS = 'hermestg_user_pass';
const STORAGE_KEY_RECEIPTS = 'hermestg_recent_receipts';

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
    referralCode: 'HTG' + Math.floor(1000 + Math.random() * 9000),
    affiliateBalance: 0,
    referralCount: 0
  };
  localStorage.setItem(STORAGE_KEY_PASS, JSON.stringify(defaultPass));
  return defaultPass;
}

export function saveUserPass(pass: UserPass): void {
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
