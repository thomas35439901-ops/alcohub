import React, { useState } from 'react';
import { markPendingUpgrade } from '../utils/gameStorage';

export default function PaywallModal({ isOpen, onClose, user, onLogin }) {
  const [loadingPlan, setLoadingPlan] = useState(null);

  if (!isOpen) return null;

  const handleCheckout = async (planType) => {
    if (!user) {
      alert('請先點擊 Google 登入以綁定您的 PRO 會員權限！');
      if (onLogin) onLogin();
      return;
    }

    try {
      setLoadingPlan(planType);
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '建立結帳連結失敗');
      }

      if (data.url) {
        // 跳轉去 Stripe 前標記正在升級，讓返回時自動觸發無縫續局與補時
        markPendingUpgrade();
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert(`建立結帳連結失敗：${err.message}`);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-yellow-600/40 bg-[#14110b] p-6 text-white shadow-2xl">
        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition"
          aria-label="Close"
        >
          ✕
        </button>

        {/* 頂部標籤與標題 */}
        <div className="text-center mb-6">
          <span className="inline-block rounded-full border border-yellow-600/50 bg-yellow-900/30 px-3 py-1 text-xs font-semibold text-yellow-400 mb-3">
            PRO 派對無限解鎖
          </span>
          <h2 className="text-2xl font-bold text-white mb-2">
            解鎖《大醉翁》完整模式
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            解鎖 8 人大亂鬥、60 分鐘長局、全體乾杯殘酷格及 13 款進階派對小遊戲
          </p>
        </div>

        {/* 未登入提示 */}
        {!user && (
          <div className="mb-4 rounded-xl border border-purple-500/40 bg-purple-950/30 p-3 text-center">
            <p className="text-xs text-purple-200 mb-2">
              購買前請先登入 Google 帳號，以便自動綁定開通權限
            </p>
            <button
              onClick={onLogin}
              className="rounded-lg bg-white px-4 py-1.5 text-xs font-bold text-gray-900 hover:bg-gray-200 transition"
            >
              🔑 使用 Google 帳號登入
            </button>
          </div>
        )}

        {/* 方案選項 */}
        <div className="space-y-4">
          {/* 24 小時暢玩通行證 */}
          <div className="flex items-center justify-between rounded-xl border border-yellow-600/40 bg-[#1c170e] p-4 hover:border-yellow-500 transition">
            <div>
              <div className="text-xs font-semibold text-yellow-500 mb-0.5">
                派對必備・單次收費
              </div>
              <div className="text-lg font-bold text-white">
                24 小時暢玩通行證
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                絕不自動續訂・嗨翻一整晚
              </div>
            </div>
            <button
              onClick={() => handleCheckout('24h')}
              disabled={loadingPlan !== null}
              className="rounded-lg bg-yellow-600 px-4 py-2.5 text-sm font-bold text-black hover:bg-yellow-500 disabled:opacity-50 transition shrink-0"
            >
              {loadingPlan === '24h' ? '跳轉中...' : 'HK$28'}
            </button>
          </div>

          {/* 永久尊享版 PRO */}
          <div className="flex items-center justify-between rounded-xl border border-yellow-600/40 bg-[#1c170e] p-4 hover:border-yellow-500 transition">
            <div>
              <div className="text-xs font-semibold text-yellow-500 mb-0.5">
                限時優惠・終身無限
              </div>
              <div className="text-lg font-bold text-white">
                永久尊享版 PRO
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                一次購買，未來新遊戲全免費
              </div>
            </div>
            <button
              onClick={() => handleCheckout('lifetime')}
              disabled={loadingPlan !== null}
              className="rounded-lg bg-yellow-600 px-4 py-2.5 text-sm font-bold text-black hover:bg-yellow-500 disabled:opacity-50 transition shrink-0"
            >
              {loadingPlan === 'lifetime' ? '跳轉中...' : 'HK$88'}
            </button>
          </div>
        </div>

        {/* 底部說明 */}
        <p className="mt-5 text-center text-[11px] text-gray-500">
          支援 Apple Pay / Google Pay / 信用卡安全即時開通
        </p>
      </div>
    </div>
  );
}