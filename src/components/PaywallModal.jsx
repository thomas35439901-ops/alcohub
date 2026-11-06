import React from 'react';

export default function PaywallModal({ isOpen, onClose, auth }) {
  if (!isOpen) return null;

  const { user, loginWithGoogle, startCheckout } = auth;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-zinc-900 border border-amber-500/30 p-6 text-white shadow-2xl">
        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white text-xl font-bold"
        >
          ✕
        </button>

        {/* 標題與說明 */}
        <div className="text-center mb-6">
          <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 rounded-full mb-2">
            PRO 派對無限解鎖
          </span>
          <h2 className="text-2xl font-black tracking-tight text-white">解鎖《大醉翁》完整模式</h2>
          <p className="text-sm text-zinc-400 mt-1">
            解鎖 8 人大亂鬥、60 分鐘長局、全體乾杯殘酷格及 13 款進階派對小遊戲
          </p>
        </div>

        {/* 登入提示（若未登入） */}
        {!user && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
            <p className="text-xs text-amber-200 mb-3">購買前請先登入 Google 帳號以綁定購買資格</p>
            <button
              onClick={loginWithGoogle}
              className="w-full py-2.5 px-4 rounded-xl bg-white text-zinc-900 font-bold text-sm shadow hover:bg-zinc-100 transition"
            >
              使用 Google 一鍵登入
            </button>
          </div>
        )}

        {/* 兩種收費卡片 */}
        <div className="space-y-4">
          {/* 方案 A：24 小時通行證 */}
          <div className="border border-zinc-700 hover:border-amber-500 rounded-xl p-4 bg-zinc-800/60 transition flex items-center justify-between">
            <div>
              <div className="text-xs text-amber-400 font-semibold">派對必備・單次收費</div>
              <div className="text-lg font-bold">24 小時暢玩通行證</div>
              <div className="text-xs text-zinc-400">絕不自動續訂・嗨翻一整晚</div>
            </div>
            <button
              onClick={() => startCheckout('24h')}
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-2.5 rounded-lg text-sm transition"
            >
              HK$28
            </button>
          </div>

          {/* 方案 B：永久解鎖 */}
          <div className="border-2 border-amber-500/80 rounded-xl p-4 bg-gradient-to-r from-amber-500/10 to-amber-600/10 transition flex items-center justify-between">
            <div>
              <div className="text-xs text-amber-300 font-bold">限時優惠・終身無限</div>
              <div className="text-lg font-bold text-white">永久尊享版 PRO</div>
              <div className="text-xs text-zinc-400">一次購買，未來新遊戲全免費</div>
            </div>
            <button
              onClick={() => startCheckout('lifetime')}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-zinc-950 font-black px-4 py-2.5 rounded-lg text-sm shadow-lg transition"
            >
              HK$88
            </button>
          </div>
        </div>

        <div className="mt-5 text-center">
          <p className="text-[11px] text-zinc-500">支援 Apple Pay / Google Pay / 信用卡安全即時開通</p>
        </div>
      </div>
    </div>
  );
}