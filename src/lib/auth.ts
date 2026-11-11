import { supabase, isSupabaseConfigured } from './supabase';
import { UserProfileData } from '../types';

export async function signInWithGoogle() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase n'est pas encore configuré.");
  }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase n'est pas configuré.");
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(
  email: string, 
  password: string, 
  fullName: string, 
  phone: string, 
  city: string,
  referredBy?: string
) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase n'est pas configuré.");
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin,
      data: {
        full_name: fullName,
        phone: phone,
        city_or_university: city,
        referred_by: referredBy || null
      }
    }
  });
  if (error) throw error;
  return data;
}

export async function signOutUser() {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function fetchRemoteProfile(userId: string): Promise<Partial<UserProfileData> | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      fullName: data.full_name || '',
      phone: data.phone || '',
      cityOrUniversity: data.city_or_university || '',
      referralCode: data.referral_code,
      referredBy: data.referred_by,
      passStatus: data.pass_status || 'free',
      passExpiresAt: data.pass_expires_at,
      affiliateBalance: data.affiliate_balance || 0,
      referralCount: data.referral_count || 0
    };
  } catch {
    return null;
  }
}

export async function upsertRemoteProfile(userId: string, profile: Partial<UserProfileData>) {
  if (!isSupabaseConfigured()) return null;
  const updatePayload: Record<string, any> = {
    id: userId,
    updated_at: new Date().toISOString()
  };
  if (profile.fullName !== undefined) updatePayload.full_name = profile.fullName;
  if (profile.phone !== undefined) updatePayload.phone = profile.phone;
  if (profile.cityOrUniversity !== undefined) updatePayload.city_or_university = profile.cityOrUniversity;
  if (profile.referredBy !== undefined) updatePayload.referred_by = profile.referredBy;

  const { data, error } = await supabase
    .from('profiles')
    .upsert(updatePayload)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}
