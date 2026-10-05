import React, { useState, useEffect } from 'react';
import GameBoard from './GameBoard'; 

const NeonGlow = ({ top, left, color, scale = 1 }) => (
  <div className="absolute pointer-events-none opacity-20 blur-[100px] animate-pulse" style={{ top, left, transform: `scale(${scale})` }}>
    <div className={`w-[400px] h-[400px] rounded-full ${color}`}></div>
  </div>
);

const PRESET_COLORS = [
  { name: '紅', hex: '#ef4444', twClass: 'border-red-500 text-red-400 bg-red-950' },
  { name: '藍', hex: '#3b82f6', twClass: 'border-blue-500 text-blue-400 bg-blue-950' },
  { name: '綠', hex: '#22c55e', twClass: 'border-green-500 text-green-400 bg-green-950' },
  { name: '黃', hex: '#eab308', twClass: 'border-yellow-500 text-yellow-400 bg-yellow-950' },
  { name: '紫', hex: '#a855f7', twClass: 'border-purple-500 text-purple-400 bg-purple-950' },
  { name: '橙', hex: '#f97316', twClass: 'border-orange-500 text-orange-400 bg-orange-950' },
  { name: '青', hex: '#06b6d4', twClass: 'border-cyan-500 text-cyan-400 bg-cyan-950' },
  { name: '粉', hex: '#ec4899', twClass: 'border-pink-500 text-pink-400 bg-pink-950' },
];

export default function App() {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [agreed, setAgreed] = useState(false);
  
  // ==========================================
  // 👑 PRO 版解鎖狀態管理 (雙保險機制)
  // ==========================================
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // 保險一：偵測金流平台跳轉回來的 ?vip=success
    if (urlParams.get('vip') === 'success') {
      setIsPremium(true);
      localStorage.setItem('alcohub_premium', 'true');
      
      // 魔法瞬間：擦掉網址上的特殊參數，避免玩家複製
      window.history.replaceState({}, document.title, window.location.pathname);
      
      setTimeout(() => {
        alert("🎉 付款成功！大醉翁 PRO 已為您自動解鎖！\n盡情享受血流成河的派對吧！");
      }, 500);
    } 
    // 保險二：如果沒有參數，檢查瀏覽器是否存有解鎖記憶
    else if (localStorage.getItem('alcohub_premium') === 'true') {
      setIsPremium(true);
    }
  }, []);

  // 手動恢復購買邏輯
  const handleRestorePurchase = () => {
    const code = prompt("請輸入確認信中的恢復購買代碼：");
    if (code && code.trim().toUpperCase() === "ALCO-OCT-26") {
      setIsPremium(true);
      localStorage.setItem('alcohub_premium', 'true');
      alert("✅ 恢復成功！已為您重新解鎖 PRO 版本。");
    } else if (code !== null) {
      alert("❌ 密碼錯誤或已失效，請確認您的贊助確認信。");
    }
  };

  const [timeMinutes, setTimeMinutes] = useState(10); 

  const [players, setPlayers] = useState([
    { id: 1, name: "玩家一", icon: "🍷", hexColor: PRESET_COLORS[0].hex, color: PRESET_COLORS[0].twClass, position: 0, state: 'NORMAL', areas: 0, bottles: 0, inventory: [] },
    { id: 2, name: "玩家二", icon: "🍺", hexColor: PRESET_COLORS[1].hex, color: PRESET_COLORS[1].twClass, position: 0, state: 'NORMAL', areas: 0, bottles: 0, inventory: [] },
    { id: 3, name: "玩家三", icon: "🍸", hexColor: PRESET_COLORS[2].hex, color: PRESET_COLORS[2].twClass, position: 0, state: 'NORMAL', areas: 0, bottles: 0, inventory: [] },
    { id: 4, name: "玩家四", icon: "🍹", hexColor: PRESET_COLORS[3].hex, color: PRESET_COLORS[3].twClass, position: 0, state: 'NORMAL', areas: 0, bottles: 0, inventory: [] }
  ]);

  const handleColorChange = (playerId, newHex) => {
    const isColorUsed = players.some(p => p.id !== playerId && p.hexColor === newHex);
    if (isColorUsed) {
      alert("⚠️ 該顏色已被使用，請選擇其他顏色！");
      return;
    }
    const colorObj = PRESET_COLORS.find(c => c.hex === newHex);
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, hexColor: newHex, color: colorObj.twClass } : p));
  };

  const handlePlayerChange = (id, field, value) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addPlayer = () => {
    if (!isPremium && players.length >= 4) {
      return alert("🔒 試玩版最多支援 4 人！請解鎖 PRO 體驗 8 人大亂鬥！");
    }
    if (players.length >= 8) return alert("最多只能 8 人遊玩！");
    
    const usedHexes = players.map(p => p.hexColor);
    const availableColor = PRESET_COLORS.find(c => !usedHexes.includes(c.hex)) || PRESET_COLORS[0];
    const newId = Math.max(...players.map(p => p.id), 0) + 1;
    setPlayers(prev => [
      ...prev,
      { id: newId, name: `玩家${newId}`, icon: "🍻", hexColor: availableColor.hex, color: availableColor.twClass, position: 0, state: 'NORMAL', areas: 0, bottles: 0, inventory: [] }
    ]);
  };

  const removePlayer = (id) => {
    if (players.length <= 2) return alert("最少需要 2 名玩家！");
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  if (isGameStarted) {
    return <GameBoard initialPlayers={players} initialTime={timeMinutes * 60} isPremium={isPremium} onRestart={() => setIsGameStarted(false)} />;
  }

  return (
    <div className="relative min-h-screen bg-[#07020d] text-white overflow-x-hidden font-sans p-4 md:p-8 flex flex-col items-center">
      <NeonGlow top="5%" left="20%" color="bg-purple-700" scale={1.5} />
      <NeonGlow top="50%" left="70%" color="bg-cyan-700" scale={1.5} />

      <div className="z-10 w-full max-w-4xl flex flex-col items-center relative pb-16">
        
        <h1 className="text-5xl md:text-7xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-2 drop-shadow-lg text-center mt-6">
          大醉翁
        </h1>
        <p className="text-gray-400 tracking-widest mb-4 font-bold text-sm md:text-lg">
          ALCOHUB | 酒精版地產爭奪戰
        </p>

        {/* 👑 PRO 徽章顯示 */}
        {isPremium && (
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black px-6 py-2 rounded-full mb-8 shadow-[0_0_20px_rgba(234,179,8,0.5)] animate-pulse">
            👑 PRO 專業版已解鎖
          </div>
        )}
        {!isPremium && <div className="mb-8"></div>}

        {/* 玩家設定區塊 */}
        <div className="w-full bg-[#12051f]/80 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.15)] mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              👥 玩家設定 <span className="text-sm text-gray-400 font-normal">({players.length}/{isPremium ? '8' : '4'} 人)</span>
            </h2>
            <button onClick={addPlayer} className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg font-bold transition-colors shadow-md">
              + 新增玩家
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {players.map((p, idx) => (
              <div key={p.id} className={`flex flex-col p-4 rounded-xl border-2 transition-all ${p.color}`}>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-lg text-white">玩家 {idx + 1}</span>
                  {players.length > 2 && <button onClick={() => removePlayer(p.id)} className="text-red-400 hover:text-red-300 font-bold text-sm bg-black/40 px-2 py-1 rounded">刪除</button>}
                </div>
                <div className="flex gap-3 mb-3">
                  <div className="flex flex-col w-1/4">
                    <label className="text-xs text-white/70 font-bold mb-1">頭像</label>
                    <input type="text" value={p.icon} onChange={(e) => handlePlayerChange(p.id, 'icon', e.target.value)} className="bg-black/50 border border-white/20 rounded-lg p-2 text-center text-xl focus:outline-none w-full" maxLength={2} />
                  </div>
                  <div className="flex flex-col w-3/4">
                    <label className="text-xs text-white/70 font-bold mb-1">暱稱</label>
                    <input type="text" value={p.name} onChange={(e) => handlePlayerChange(p.id, 'name', e.target.value)} className="bg-black/50 border border-white/20 rounded-lg p-2 text-white font-bold focus:outline-none w-full" placeholder="輸入暱稱" maxLength={10} />
                  </div>
                </div>
                <div className="flex gap-2">
                  {PRESET_COLORS.map(colorOption => {
                    const isUsed = players.some(player => player.hexColor === colorOption.hex);
                    const isMine = p.hexColor === colorOption.hex;
                    return (
                      <button key={colorOption.hex} onClick={() => handleColorChange(p.id, colorOption.hex)} className={`w-6 h-6 rounded-full border-2 transition-all ${isMine ? 'border-white scale-125' : 'border-transparent'} ${isUsed && !isMine ? 'opacity-20 cursor-not-allowed' : 'hover:scale-110'}`} style={{ backgroundColor: colorOption.hex }} />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 遊戲時間設定 */}
        <div className="w-full bg-[#12051f]/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(6,182,212,0.15)] mb-8">
          <h2 className="text-2xl font-black text-white mb-4">⏱ 遊戲時長設定</h2>
          <div className="flex flex-wrap items-center gap-3">
            {[10, 30, 45, 60].map(t => (
              <button 
                key={t} 
                onClick={() => {
                  if (!isPremium && t > 10) {
                    return alert(`🔒 ${t} 分鐘屬於長局模式！請解鎖 PRO 體驗完整派對！`);
                  }
                  setTimeMinutes(t);
                }} 
                className={`px-5 py-3 rounded-xl font-black text-lg transition-all border-2 relative overflow-hidden
                  ${timeMinutes === t ? 'border-cyan-400 bg-cyan-900/60 text-white shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'border-gray-700 bg-gray-800 text-gray-400'}
                  ${!isPremium && t > 10 ? 'opacity-60 grayscale cursor-not-allowed hover:border-red-500' : 'hover:border-gray-500'}
                `}
              >
                {t} 分鐘 
                {!isPremium && t > 10 && <span className="absolute -top-1 -right-1 text-sm bg-red-600 text-white px-1.5 py-0.5 rounded-bl-lg">PRO</span>}
                {!isPremium && t === 10 && <span className="absolute -top-1 -right-1 text-[10px] bg-green-600 text-white px-1 py-0.5 rounded-bl-lg">免費試玩</span>}
              </button>
            ))}
          </div>
        </div>

        {/* 👑 PRO 解鎖引導 (無感跳轉版) */}
        {!isPremium && (
          <div className="w-full bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-yellow-500/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(234,179,8,0.2)] mb-8 flex flex-col items-center text-center">
             <h2 className="text-3xl md:text-4xl font-black text-yellow-400 mb-4 flex items-center justify-center gap-2">
              👑 升級大醉翁 PRO
            </h2>
            <p className="text-gray-300 font-bold mb-6 text-lg">
              解鎖 8 人大亂鬥、60 分鐘超長局與完整殘酷懲罰！
            </p>
            
            {/* 這裡已經替換為你的專屬付款連結。移除了 target="_blank" 以確保跳轉在同一個分頁發生，實現無縫解鎖體驗 */}
            <a 
              href="https://buymeacoffee.com/thomas0982" 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:scale-105 transition-transform text-black font-black text-xl px-10 py-4 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.5)] w-full max-w-md flex flex-col items-center"
            >
              <span>💳 立即自動解鎖</span>
              <span className="text-sm font-bold opacity-80 mt-1">(約 1 杯 Shot 的價格)</span>
            </a>
            <p className="text-xs text-gray-400 mt-3 font-bold">付款後將自動跳轉回本頁並完成解鎖</p>
          </div>
        )}

        {/* 開始按鈕 */}
        <div className="w-full bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-2xl p-6 shadow-xl mb-6">
          <label className="flex items-center gap-3 cursor-pointer group w-max mb-6">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-6 h-6 appearance-none border-2 border-gray-500 rounded-md checked:bg-green-500 transition-all cursor-pointer" />
            <span className={`font-black text-lg select-none ${agreed ? 'text-green-400' : 'text-gray-400'}`}>我已滿法定飲酒年齡，並同意適量飲酒、注意安全。</span>
          </label>
          <button 
            onClick={() => agreed && setIsGameStarted(true)} disabled={!agreed}
            className={`w-full py-5 rounded-2xl font-black text-2xl transition-all duration-500 ${agreed ? 'bg-gradient-to-r from-purple-600 to-emerald-500 text-white shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:scale-[1.02]' : 'bg-gray-800 text-gray-500 cursor-not-allowed border-2 border-gray-700'}`}
          >
            {agreed ? "🚀 開始遊戲" : "請先勾選同意條款"}
          </button>
        </div>

        {/* 恢復購買按鈕 (雙保險機制) */}
        {!isPremium && (
          <button 
            onClick={handleRestorePurchase}
            className="text-gray-500 hover:text-gray-300 text-sm font-bold underline underline-offset-4 mb-8 transition-colors"
          >
            🔄 已經付款過？點此恢復購買
          </button>
        )}

      </div>
    </div>
  );
}