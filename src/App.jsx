import React, { useState } from 'react';
import GameBoard from './GameBoard'; 

// ==========================================
// 霓虹光暈背景
// ==========================================
const NeonGlow = ({ top, left, color, scale = 1 }) => (
  <div className="absolute pointer-events-none opacity-20 blur-[100px] animate-pulse" style={{ top, left, transform: `scale(${scale})` }}>
    <div className={`w-[400px] h-[400px] rounded-full ${color}`}></div>
  </div>
);

// 8 種專屬預設顏色
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
  const [timeMinutes, setTimeMinutes] = useState(30); 
  const [agreed, setAgreed] = useState(false);

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

  const startGame = () => {
    if (!agreed) return;
    setIsGameStarted(true);
  };

  if (isGameStarted) {
    return <GameBoard initialPlayers={players} initialTime={timeMinutes * 60} onRestart={() => setIsGameStarted(false)} />;
  }

  return (
    <div className="relative min-h-screen bg-[#07020d] text-white overflow-x-hidden font-sans p-4 md:p-8 flex flex-col items-center">
      <NeonGlow top="5%" left="20%" color="bg-purple-700" scale={1.5} />
      <NeonGlow top="50%" left="70%" color="bg-cyan-700" scale={1.5} />

      <div className="z-10 w-full max-w-4xl flex flex-col items-center">
        
        {/* ========================================== */}
        {/* 【修改】全新 Logo 與副標題 */}
        {/* ========================================== */}
        <h1 className="text-5xl md:text-7xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-2 drop-shadow-lg text-center mt-6">
          大醉翁
        </h1>
        <p className="text-gray-400 tracking-widest mb-10 font-bold text-sm md:text-lg">
          ALCOHUB | 酒精版地產爭奪戰
        </p>

        {/* ========================================== */}
        {/* 玩家設定區塊 */}
        {/* ========================================== */}
        <div className="w-full bg-[#12051f]/80 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.15)] mb-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-2">
                👥 玩家設定 <span className="text-sm text-gray-400 font-normal">({players.length}/8 人)</span>
              </h2>
              <p className="text-amber-400 text-sm font-bold bg-amber-900/30 px-3 py-1.5 rounded-lg border border-amber-500/30 inline-block shadow-inner">
                💡 建議最少 4 人遊玩體驗最佳！若超過 8 人，建議可兩人組成一隊共用一個角色。
              </p>
            </div>
            
            {players.length < 8 && (
              <button onClick={addPlayer} className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg font-bold transition-colors shadow-md shrink-0">
                + 新增玩家
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {players.map((p, idx) => (
              <div key={p.id} className={`flex flex-col p-4 rounded-xl border-2 transition-all ${p.color}`}>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-lg text-white">玩家 {idx + 1}</span>
                  {players.length > 2 && (
                    <button onClick={() => removePlayer(p.id)} className="text-red-400 hover:text-red-300 font-bold text-sm bg-black/40 px-2 py-1 rounded">刪除</button>
                  )}
                </div>
                
                <div className="flex gap-3 mb-3">
                  <div className="flex flex-col w-1/4">
                    <label className="text-xs text-white/70 font-bold mb-1">頭像</label>
                    <input 
                      type="text" 
                      value={p.icon} 
                      onChange={(e) => handlePlayerChange(p.id, 'icon', e.target.value)} 
                      className="bg-black/50 border border-white/20 rounded-lg p-2 text-center text-xl focus:outline-none focus:border-white w-full"
                      maxLength={2}
                    />
                  </div>
                  <div className="flex flex-col w-3/4">
                    <label className="text-xs text-white/70 font-bold mb-1">暱稱</label>
                    <input 
                      type="text" 
                      value={p.name} 
                      onChange={(e) => handlePlayerChange(p.id, 'name', e.target.value)} 
                      className="bg-black/50 border border-white/20 rounded-lg p-2 text-white focus:outline-none focus:border-white font-bold w-full"
                      placeholder="輸入暱稱"
                      maxLength={10}
                    />
                  </div>
                </div>

                {/* 顏色選擇器 */}
                <div className="flex flex-col">
                  <label className="text-xs text-white/70 font-bold mb-1">專屬代表色</label>
                  <div className="flex gap-2">
                    {PRESET_COLORS.map(colorOption => {
                      const isUsed = players.some(player => player.hexColor === colorOption.hex);
                      const isMine = p.hexColor === colorOption.hex;
                      return (
                        <button
                          key={colorOption.hex}
                          onClick={() => handleColorChange(p.id, colorOption.hex)}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${isMine ? 'border-white scale-125 shadow-[0_0_10px_currentColor]' : 'border-transparent'} ${isUsed && !isMine ? 'opacity-20 cursor-not-allowed' : 'hover:scale-110'}`}
                          style={{ backgroundColor: colorOption.hex, color: colorOption.hex }}
                          title={isUsed && !isMine ? '已被使用' : colorOption.name}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================== */}
        {/* 遊戲時間設定區塊 */}
        {/* ========================================== */}
        <div className="w-full bg-[#12051f]/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(6,182,212,0.15)] mb-8">
          <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2">⏱ 遊戲時長設定</h2>
          <div className="flex flex-wrap items-center gap-3">
            {[20, 30, 45, 60].map(t => (
              <button 
                key={t} 
                onClick={() => setTimeMinutes(t)} 
                className={`px-5 py-3 rounded-xl font-black text-lg transition-all border-2 ${timeMinutes === t ? 'border-cyan-400 bg-cyan-900/60 text-white shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500'}`}
              >
                {t} 分鐘
              </button>
            ))}
            <div className="flex items-center gap-2 bg-gray-900 border-2 border-gray-700 rounded-xl p-2 focus-within:border-cyan-500 transition-colors">
              <span className="text-gray-400 font-bold pl-2">自訂:</span>
              <input 
                type="number" 
                value={timeMinutes} 
                onChange={(e) => setTimeMinutes(Math.max(1, parseInt(e.target.value) || 1))} 
                className="w-16 bg-transparent text-white font-black text-xl text-center focus:outline-none"
              />
              <span className="text-gray-400 font-bold pr-2">分鐘</span>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* 遊戲規則說明區塊 */}
        {/* ========================================== */}
        <div className="w-full bg-blue-900/20 backdrop-blur-md border border-blue-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(59,130,246,0.15)] mb-8">
          <h2 className="text-2xl font-black text-blue-400 mb-4 flex items-center gap-2">📖 遊戲規則說明</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300 text-sm leading-relaxed">
            
            <div className="bg-black/40 p-4 rounded-xl border border-blue-500/20">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">🎒 必備實體道具</h3>
              <p className="mb-2 font-bold text-gray-400">開局前請確保桌上備妥以下道具：</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>充足的 <span className="text-white font-bold">飲料或酒水</span></li>
                <li>一個容量夠大且乾淨的 <span className="text-amber-400 font-bold">「中央大公杯」</span></li>
                <li>每個人的 <span className="text-white font-bold">個人杯子</span> 與數個 <span className="text-orange-400 font-bold">Shot 杯</span></li>
                <li>一副 <span className="text-purple-400 font-bold">撲克牌</span>（部分小遊戲需使用）</li>
                <li>數雙 <span className="text-green-400 font-bold">筷子</span>（敲敲杯遊戲必備）</li>
              </ul>
            </div>

            <div className="bg-black/40 p-4 rounded-xl border border-blue-500/20">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">📍 基本玩法</h3>
              <p>點擊中央骰子移動。踩中「未被佔領的城市」可選擇喝下該格酒數並佔領它；踩中「自己的城市」可喝 1 口升級地盤。若是踩中「別人的城市」，則必須乖乖罰酒！</p>
            </div>

            <div className="bg-black/40 p-4 rounded-xl border border-blue-500/20">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">⚔️ 搶奪對決</h3>
              <p>若你不爽交保護費，可以向該城市主人發起「搶奪挑戰」。防守方決定小遊戲，贏家拿走地盤與所有酒瓶，<span className="text-red-400 font-bold">輸家必須喝下雙倍罰酒！</span></p>
            </div>

            <div className="bg-black/40 p-4 rounded-xl border border-blue-500/20">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">🎯 小遊戲自由發揮</h3>
              <p>系統內建多種小遊戲，但若抽中的遊戲大家不會玩，請直接無視！防守方或當下玩家可以<span className="text-green-400 font-bold">完全自定義任何你們熟悉的遊戲</span>來決勝負！</p>
            </div>

            <div className="bg-black/40 p-4 rounded-xl border border-blue-500/20">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">🍺 公杯系統</h3>
              <p>踩到「加料」要往中央實體公杯加點好料。公杯設有 20 口的極限值，一旦滿了就會引發<span className="text-amber-400 font-bold">全場連坐爆炸</span>！踩到「Shot」的人則必須一口氣清空公杯！</p>
            </div>

            <div className="bg-black/40 p-4 rounded-xl border border-blue-500/20">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">🥂 陪酒小姐</h3>
              <p>踩到此格將化身萬眾矚目的陪酒小姐，在解除狀態前，只要場上有任何人被罰酒，<span className="text-pink-400 font-bold">妳/你都必須跟著喝下相同的份量！</span></p>
            </div>

          </div>

          <div className="mt-4 text-center bg-yellow-900/30 border border-yellow-500/50 p-3 rounded-xl">
            <span className="text-yellow-400 font-bold text-lg">🏆 勝利條件：</span> 倒數計時結束時，系統將結算「總酒瓶數」與「地盤總數」，最多者加冕為全場 MVP 酒神！
          </div>
        </div>

        {/* ========================================== */}
        {/* 安全免責聲明與開始按鈕 */}
        {/* ========================================== */}
        <div className="w-full bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-2xl p-6 shadow-xl mb-12">
          <h2 className="text-xl font-black text-red-400 mb-3 flex items-center gap-2">⚠️ 安全免責聲明</h2>
          <div className="bg-black/50 p-4 rounded-lg text-gray-400 text-sm leading-relaxed mb-4 max-h-32 overflow-y-auto border border-gray-800 custom-scrollbar">
            <p>1. 本遊戲包含飲酒懲罰機制，僅限達到法定飲酒年齡之成年人遊玩。</p>
            <p>2. 玩家應根據自身酒量與身體狀況量力而為，嚴禁強迫灌酒或霸凌行為。</p>
            <p>3. 遊戲過程中若感身體不適，請立即停止遊戲並尋求協助。</p>
            <p>4. 喝酒不開車，開車不喝酒。遊玩後請確保有安全返家的交通方式。</p>
            <p>5. 遊戲開發者與平台對玩家因遊玩本遊戲而產生之任何健康、法律或財產後果概不負責。</p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer group w-max">
            <div className="relative flex items-center justify-center">
              <input 
                type="checkbox" 
                checked={agreed} 
                onChange={(e) => setAgreed(e.target.checked)} 
                className="w-6 h-6 appearance-none border-2 border-gray-500 rounded-md checked:bg-green-500 checked:border-green-500 transition-all cursor-pointer" 
              />
              {agreed && <span className="absolute text-white pointer-events-none text-sm font-black">✓</span>}
            </div>
            <span className={`font-black text-lg transition-colors select-none ${agreed ? 'text-green-400' : 'text-gray-400 group-hover:text-gray-300'}`}>
              我已閱讀並同意上述條款
            </span>
          </label>

          <button 
            onClick={startGame}
            disabled={!agreed}
            className={`w-full py-5 mt-6 rounded-2xl font-black text-2xl transition-all duration-500 ${
              agreed 
                ? 'bg-gradient-to-r from-purple-600 to-emerald-500 hover:scale-[1.02] shadow-[0_0_30px_rgba(168,85,247,0.6)] text-white cursor-pointer active:scale-95' 
                : 'bg-gray-800 text-gray-500 cursor-not-allowed border-2 border-gray-700'
            }`}
          >
            {agreed ? "🚀 我已閱讀並同意，開始遊戲" : "請先勾選同意上述條款"}
          </button>
        </div>

      </div>
    </div>
  );
}