import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useProAuth() {
  const [user, setUser] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [tier, setTier] = useState('free');
  const [expiresAt, setExpiresAt] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkProStatus = useCallback(async (currentUser) => {
    if (!currentUser) {
      setIsPro(false);
      setTier('free');
      setExpiresAt(null);
      setLoading(false);
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_pro, tier, expires_at')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (error || !data) {
        setIsPro(false);
        setLoading(false);
        return false;
      }

      const now = new Date();
      let activePro = false;

      if (data.tier === 'lifetime' && data.is_pro) {
        activePro = true;
      } else if (data.is_pro && data.expires_at) {
        activePro = new Date(data.expires_at) > now;
      } else if (data.is_pro && !data.expires_at) {
        activePro = true;
      }

      setIsPro(activePro);
      setTier(activePro ? data.tier : 'free');
      setExpiresAt(data.expires_at || null);
      setLoading(false);
      return activePro;
    } catch (err) {
      console.error('檢查 PRO 狀態失敗:', err);
      setIsPro(false);
      setLoading(false);
      return false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      checkProStatus(currentUser);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        checkProStatus(currentUser);
      }
    );

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [checkProStatus]);

  // 當從 Stripe 付款成功跳回 (?payment=success) 時，自動重試確認 Webhook 已寫入完成
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success' && user && !isPro) {
      let attempts = 0;
      const timer = setInterval(async () => {
        attempts += 1;
        const unlocked = await checkProStatus(user);
        if (unlocked || attempts >= 6) {
          clearInterval(timer);
        }
      }, 1500);
      return () => clearInterval(timer);
    }
  }, [user, isPro, checkProStatus]);

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsPro(false);
    setTier('free');
  };

  return {
    user,
    isPro,
    tier,
    expiresAt,
    loading,
    loginWithGoogle,
    logout,
    refreshProfile: () => checkProStatus(user),
  };
}