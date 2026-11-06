import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useProAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  // 檢查 PRO 狀態是否在有效期限內
  const checkProStatus = (profileData) => {
    if (!profileData) return false;
    if (profileData.tier === 'lifetime') return true;
    if (profileData.tier === 'pass_24h' && profileData.expires_at) {
      return new Date(profileData.expires_at) > new Date();
    }
    return Boolean(profileData.is_pro);
  };

  // 讀取 Supabase 裡的 profiles 資料表
  const fetchProfile = useCallback(async (currentUserId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUserId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('讀取用戶設定檔出錯:', error);
        return;
      }

      if (data) {
        setProfile(data);
        setIsPro(checkProStatus(data));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 檢查初始登入狀態
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setLoading(false);
      }
    });

    // 監聽登入/登出變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          fetchProfile(currentUser.id);
        } else {
          setProfile(null);
          setIsPro(false);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Google 一鍵登入
  const loginWithGoogle = async () => {
    const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: siteUrl,
      },
    });
    if (error) alert('登入失敗: ' + error.message);
  };

  // 登出
  const logout = async () => {
    await supabase.auth.signOut();
  };

  // 發起 Stripe 結帳跳轉
  const startCheckout = async (planType = '24h') => {
    if (!user) {
      alert('請先使用 Google 帳號登入，以綁定購買權限！');
      await loginWithGoogle();
      return;
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // 跳轉至 Stripe 官方收銀台
      } else {
        alert('建立結帳連結失敗：' + (data.error || '未知錯誤'));
      }
    } catch (err) {
      console.error(err);
      alert('無法連接結帳服務，請檢查網路連線。');
    }
  };

  return {
    user,
    profile,
    isPro,
    loading,
    loginWithGoogle,
    logout,
    startCheckout,
    refreshProfile: () => user && fetchProfile(user.id),
  };
}