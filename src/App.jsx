import React, { useState, useEffect } from 'react';
import GameBoard from './GameBoard';
import PaywallModal from './components/PaywallModal';
import { useProAuth } from './hooks/useProAuth';
import {
  saveGameSnapshot,
  loadGameSnapshot,
  consumeUpgradeBonus,
  clearGameSnapshot,
} from './utils/gameStorage';

const AVATAR_OPTIONS = ['🍷', '🍺', '🍸', '🍹', '🥃', '🍾', '🥂', '🍻'];
const COLOR_OPTIONS = [
  '#ef4444', // 紅
  '#3b82f6', // 藍
  '#10b981', // 綠
  '#f59e0b', // 黃
  '#a855f7', // 紫
  '#f97316', // 橘
  '#06b6d4', // 青
  '#ec4899', // 粉
];

const DEFAULT_PLAYERS = [
  { id: 1, name: '玩家一', avatar: '🍷', color: '#ef4444' },
  { id: 2, name: '玩家二', avatar: '🍺', color: '#3b82f6' },
  { id: 3, name: '玩家三', avatar: '🍸', color: '#10b981' },
  { id: 4, name: '玩家四', avatar: '🍹', color: '#f59e0b' },
];

export default function App() {
  const { user, isPro, loginWithGoogle, logout, refreshProfile } = useProAuth();
  const [showPaywall, setShowPaywall] = useState(false);

  // 初始化時優先從 localStorage 恢復牌局
  const [players, setPlayers] = useState(() => {
    const saved = loadGameSnapshot();
    return saved?.players?.length ? saved.players : DEFAULT_PLAYERS;
  });

  const [duration, setDuration] = useState(() => {
    const saved = loadGameSnapshot();
    return saved?.duration || 10;
  });

  const [isGameStarted, setIsGameStarted] = useState(() => {
    const saved = loadGameSnapshot();
    return Boolean(saved?.isGameStarted);
  });

  // 每次玩家設定、時長或開局狀態改變時，自動寫入 localStorage
  useEffect(() => {
    saveGameSnapshot({
      players,
      duration,
      isGameStarted,
    });
  }, [players, duration, isGameStarted]);

  // 檢測從 Stripe 結帳成功返回 (?payment=success)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      const upgraded = consumeUpgradeBonus();
      const latestSnapshot = loadGameSnapshot();

      if (upgraded && latestSnapshot) {
        setDuration(latestSnapshot.duration || 30);
        if (latestSnapshot.isGameStarted) {
          setIsGameStarted(true);
        }
      }
      refreshProfile();
      // 清除網址上的 ?payment=success 參數，避免重整時重複加時
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [refreshProfile]);

  const maxPlayers = isPro ? 8 : 4;

  const handleAddPlayer = () => {
    if (players.length >= maxPlayers) {
      if (!isPro) {
        setShowPaywall(true);
      }
      return;
    }
    const nextIndex = players.length;
    const newPlayer = {
      id: Date.now(),
      name: `玩家${['一', '二', '三', '四', '五', '六', '七', '八'][nextIndex] || nextIndex + 1}`,
      avatar: AVATAR_OPTIONS[nextIndex % AVATAR_OPTIONS.length],
      color: COLOR_OPTIONS[nextIndex % COLOR_OPTIONS.length],
    };
    setPlayers([...players, newPlayer]);
  };

  const handleRemovePlayer = (id) => {
    if (players.length <= 2) {
      alert('最少需要 2 位玩家才能開始酒局！');
      return;
    }
    setPlayers(players.filter((p) => p.id !== id));
  };

  const handleUpdatePlayer = (id, field, value) => {
    setPlayers(
      players.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleCycleAvatar = (id, currentAvatar) => {
    const idx = AVATAR_OPTIONS.indexOf(currentAvatar);
    const nextAvatar = AVATAR_OPTIONS[(idx + 1) % AVATAR_OPTIONS.length];
    handleUpdatePlayer(id, 'avatar', nextAvatar);
  };

  const handleSelectDuration = (mins) => {
    if (mins > 10 && !isPro) {
      setShowPaywall(true);
      return;
    }
    setDuration(mins);
  };

  const handleStartNewGame = () => {
    // 開始新局時清除上一局殘留的棋盤座標與舊時間，但保留當前玩家與時長
    clearGameSnapshot();
    saveGameSnapshot({
      players,
      duration,
      isGameStarted: true,
      timeLeft: duration * 60,
    });
    setIsGameStarted(true);
  };

  const handleExitGame = () => {
    clearGameSnapshot();
    setIsGameStarted(false);
  };

  // 若遊戲已開始，直接渲染棋盤組件
  if (isGameStarted) {
    return (
      <>
        <GameBoard
          players={players}
          duration={duration}
          isPro={isPro}
          onOpenPaywall={() => setShowPaywall(true)}
          onExit={handleExitGame}
          onBack={handleExitGame}
        />
        <PaywallModal
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          user={user}
          onLogin={loginWithGoogle}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0713] text-white px-4 py-6 pb-16">
      {/* 右上角會員與登入狀態列 */}
      <div className="mx-auto max-w-4xl flex justify-end mb-2">
        <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs">
          {user ? (
            <>
              <span className="text-gray-300">{user.email}</span>
              {isPro ? (
                <span className="rounded-full bg-yellow-500/20 border border-yellow-500/50 px-2.5 py-0.5 font-bold text-yellow-400">
                  👑 PRO
                </span>
              ) : (
                <button
                  onClick={() => setShowPaywall(true)}
                  className="font-bold text-yellow-400 underline hover:text-yellow-300"
                >
                  升級 PRO
                </button>
              )}
              <button
                onClick={logout}
                className="text-gray-400 hover:text-white transition"
              >
                登出
              </button>
            </>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="font-semibold text-yellow-400 hover:text-yellow-300"
            >
              🔑 Google 登入
            </button>
          )}
        </div>
      </div>

      {/* 標題區 */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-extrabold tracking-wider bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent mb-2">
          大醉翁
        </h1>
        <p className="text-xs tracking-[0.25em] text-gray-400">
          ALCOHUB | 酒精版地產爭奪戰
        </p>
      </div>

      <div className="mx-auto max-w-4xl space-y-6">
        {/* 玩家設定區塊 */}
        <div className="rounded-2xl border border-purple-500/20 bg-[#120d1d] p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="text-lg">👥</span>
              <h2 className="text-lg font-bold">玩家設定</h2>
              <span className="text-xs text-gray-400">
                ({players.length}/{maxPlayers} 人)
              </span>
            </div>
            <button
              onClick={handleAddPlayer}
              className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500 transition"
            >
              + 新增玩家 {!isPro && players.length >= 4 ? '(PRO 解鎖 8 人)' : ''}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {players.map((player, index) => (
              <div
                key={player.id}
                style={{
                  borderColor: player.color,
                  backgroundColor: `${player.color}15`,
                }}
                className="rounded-xl border-2 p-4 transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-sm">玩家 {index + 1}</span>
                  {players.length > 2 && (
                    <button
                      onClick={() => handleRemovePlayer(player.id)}
                      className="rounded bg-red-950/60 px-2 py-0.5 text-[11px] text-red-300 hover:bg-red-900"
                    >
                      刪除
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div>
                    <div className="text-[11px] text-gray-400 mb-1">頭像</div>
                    <button
                      type="button"
                      onClick={() => handleCycleAvatar(player.id, player.avatar)}
                      className="flex h-10 w-16 items-center justify-center rounded-lg border border-white/10 bg-black/50 text-xl hover:border-white/30"
                      title="點擊切換頭像"
                    >
                      {player.avatar}
                    </button>
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] text-gray-400 mb-1">暱稱</div>
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) =>
                        handleUpdatePlayer(player.id, 'name', e.target.value)
                      }
                      className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 顏色選擇 */}
                <div className="flex items-center gap-2 pt-1">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleUpdatePlayer(player.id, 'color', c)}
                      style={{ backgroundColor: c }}
                      className={`h-6 w-6 rounded-full transition ${
                        player.color === c
                          ? 'ring-2 ring-white scale-110'
                          : 'opacity-40 hover:opacity-80'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 遊戲時長設定 */}
        <div className="rounded-2xl border border-purple-500/20 bg-[#120d1d] p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <span>⏱️</span>
            <h2 className="text-lg font-bold">遊戲時長設定</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { mins: 10, badge: '免費試玩', free: true },
              { mins: 30, badge: 'PRO', free: false },
              { mins: 45, badge: 'PRO', free: false },
              { mins: 60, badge: 'PRO', free: false },
            ].map((item) => {
              const isSelected = duration === item.mins;
              return (
                <button
                  key={item.mins}
                  type="button"
                  onClick={() => handleSelectDuration(item.mins)}
                  className={`relative rounded-xl border p-3.5 text-center font-bold transition ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/40 text-white shadow-[0_0_15px_rgba(34,211,238,0.25)]'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/25'
                  }`}
                >
                  <span
                    className={`absolute -top-2 right-2 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      item.free
                        ? 'bg-emerald-500 text-black'
                        : 'bg-white/10 text-gray-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                  {item.mins} 分鐘
                </button>
              );
            })}
          </div>
        </div>

        {/* PRO 完整版宣傳區塊（未開通時顯示） */}
        {!isPro && (
          <div className="rounded-2xl border border-yellow-500/40 bg-gradient-to-b from-[#1f170b] to-[#120e07] p-6 shadow-2xl">
            <div className="text-center mb-5">
              <h3 className="text-xl font-extrabold text-yellow-400 mb-1">
                👑 升級大醉翁 PRO 完整版
              </h3>
              <p className="text-xs text-gray-300">
                告別 10 分鐘試玩斷點，一次解鎖所有血流成河的邪惡機制！
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
              <div className="rounded-xl border border-yellow-600/20 bg-black/30 p-3.5 flex gap-3">
                <span className="text-xl">⚔️</span>
                <div>
                  <div className="text-sm font-bold text-yellow-400">
                    自由搶奪對決
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    踩中他人領地可主動發起 PK 搶奪，勝者奪地、敗者喝雙倍！
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-yellow-600/20 bg-black/30 p-3.5 flex gap-3">
                <span className="text-xl">⏳</span>
                <div>
                  <div className="text-sm font-bold text-yellow-400">
                    長局模式 (最高 60 分鐘)
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    解鎖 30 / 45 / 60 分鐘超長對局，支援最多 8 人同時狂歡。
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-yellow-600/20 bg-black/30 p-3.5 flex gap-3">
                <span className="text-xl">🎮</span>
                <div>
                  <div className="text-sm font-bold text-yellow-400">
                    13 款派對小遊戲全解鎖
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    追加真心話大冒險、射龍門、倒楣A 等高恥度玩法。
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-yellow-600/20 bg-black/30 p-3.5 flex gap-3">
                <span className="text-xl">💥</span>
                <div>
                  <div className="text-sm font-bold text-yellow-400">
                    暗黑破壞卡庫
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    解鎖摧毀卡（炸毀地產）、國王卡（絕對命令）、全域災難。
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowPaywall(true)}
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 px-8 py-3 text-sm font-extrabold text-black shadow-lg hover:brightness-110 transition"
              >
                🔥 立即解鎖 PRO 版 ( HK$28 起 )
              </button>
            </div>
          </div>
        )}

        {/* 開始遊戲按鈕 */}
        <button
          onClick={handleStartNewGame}
          className="w-full rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 py-4 text-lg font-extrabold tracking-wider text-white shadow-xl hover:brightness-110 transition"
        >
          🎲 立即開局（{duration} 分鐘）
        </button>
      </div>

      {/* 付費彈窗 */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        user={user}
        onLogin={loginWithGoogle}
      />
    </div>
  );
}