import React, { useState, useEffect } from 'react';

// ==========================================
// 霓虹光暈與背景組件
// ==========================================
const NeonGlow = ({ top, left, color, scale = 1 }) => (
  <div className="absolute pointer-events-none opacity-20 blur-[100px] animate-pulse" style={{ top, left, transform: `scale(${scale})` }}>
    <div className={`w-[400px] h-[400px] rounded-full ${color}`}></div>
  </div>
);

// ==========================================
// 音效引擎
// ==========================================
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'hop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'dice') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'alert') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } 
  } catch (e) { console.log("Audio skipped"); }
};

// ==========================================
// 👑 PRO 限制 3: 小遊戲題庫 (自動過濾版)
// ==========================================
const minigameLibrary = [
  // 🟢 免費版基礎破冰遊戲
  { name: '撞機', rules: '從 1 開始輪流喊數字。兩人同時喊出同個數字即為「撞號」。撞號者喝 1 口！', isPro: false },
  { name: '圍枚', rules: '全部人伸出拳頭。踩中格子的玩家開始，選擇一個方向接。由開始玩家自訂輸家喝多少口！', isPro: false },
  { name: '拍7', rules: '大家輪流報數，遇到 7 和 7 的倍數要拍手不能出聲。報錯或出聲的人喝 1 口！', isPro: false },
  { name: '上下樓梯', rules: '以莊家為一樓，順時針編號。莊家叫「一樓上X樓」，被叫者 5 秒內接「X樓上下Y樓」。錯的喝 1 口！', isPro: false },
  { name: '敲敲杯', rules: '用筷子圍一圈杯子，莊家喊口號，最後一句全體敲杯。與莊家同杯者喝！沒人同杯莊家喝！', isPro: false },
  
  // 👑 PRO 專屬刺激遊戲
  { name: '射龍門', rules: '抽兩張牌當門柱，先賭幾口再開第三張。門柱外=失敗；撞柱=喝兩倍！成功則指定下家喝！', isPro: true },
  { name: '真心話大冒險', rules: '轉玻璃瓶，轉到誰就必須選擇真心話或大冒險。不執行者喝 2 口！', isPro: true },
  { name: '倒楣A', rules: '排 5x4 撲克牌輪流翻。10=反轉方向, J=加公杯, Q=免喝牌, K=喝, A=再抽。最後一張A喝光公杯！', isPro: true },
  { name: '主題接龍', rules: '莊家出題，指定方向輪流接龍。每人只有 3 秒！接不上或重複者喝 1 口！', isPro: true },
  { name: 'Never Have I Ever', rules: '說一句「我從來沒有...」做過的事。做過的人喝 1 口！全場都沒做過出題者自罰！', isPro: true },
  { name: '倒水杯', rules: '準備一個杯子，玩家輪流往杯裡注水/酒。液體滿出來灑在桌上的人輸，喝 1 口！', isPro: true },
  { name: 'Assa', rules: '雙手隨機指人喊「啊薩你你」。被指到的大喊「Assa紅參」擺動作，其餘人模仿。做錯的喝 1 口！', isPro: true },
  { name: '7-11', rules: '抽牌與桌上牌加減湊 7 或 11，湊出幾張就罰下家幾口。算錯自己把牌收下並自罰！', isPro: true },
];

// ==========================================
// 👑 PRO 限制 4: 命運卡數量封印 (自動過濾版)
// ==========================================
const chanceCards = [
  // 🟢 免費基礎卡
  { id: 'shield', name: '免喝卡', icon: '🛡️', desc: '獲得一次免喝特權，遇到罰酒或失敗懲罰時可抵消！', isPro: false },
  { id: 'carpet', name: '飛天魔毯', icon: '🧞', desc: '立刻飛到棋盤上任意指定位置，並觸發該格事件！', isPro: false },
  { id: 'cup', name: '公杯加料', icon: '🍺', desc: '立刻往中央公杯加入 1 口你的飲料！', isPro: false },
  
  // 👑 PRO 專屬暗黑卡
  { id: 'destroy', name: '摧毀卡', icon: '💥', desc: '無情摧毀！強制移除對手的一塊區域與所有酒瓶！', isPro: true },
  { id: 'truth', name: '真心話', icon: '💬', desc: '向全場佔領「酒瓶數最少」的玩家發起一個辛辣提問！', isPro: true },
  { id: 'king', name: '國王卡', icon: '👑', desc: '絕對權力！指定現場一人做一件不違反底線的事！', isPro: true },
];

// ==========================================
// 💥 全域事件資料庫 (Meltdown Events)
// ==========================================
const MELTDOWN_MAX = 15; // 擲骰 15 次引爆

// 💡 國王的新規「隨機題庫」
const KING_RULES = [
  "禁止用手指人",
  "禁止說「你、我、他」",
  "放下酒杯時必須大聲說「謝謝」",
  "所有人只能用左手（或非慣用手）拿酒杯",
  "說話前必須先叫對方全名",
  "嚴禁滑手機，抓到直接喝",
  "禁止說任何英文單字 (包含 OK, Yes, No)",
  "任何人喝完酒必須發出「啊～」的滿足聲"
];

const GLOBAL_EVENTS = [
  { id: 'HAPPY_HOUR', icon: '🚨', title: '雙倍酒精狂熱', desc: '接下來 2 圈，所有踩地雷罰酒、搶奪失敗懲罰強制雙倍！', durationTurns: 8 },
  { id: 'RULE', icon: '🤫', title: '國王的新規', desc: '動態替換', durationTurns: 8 }, 
  { id: 'RENT_FREE', icon: '👮‍♂️', title: '警察查牌', desc: '全地圖凍結收費！接下來 2 圈踩別人的地免過路費！窮人快跑！', durationTurns: 8 },
  { id: 'LOTTERY', icon: '🎰', title: '命運大輪盤', desc: '天降甘霖與大旱災！全體玩家的總資產隨機增加或減少 1 支酒瓶！', durationTurns: 0 }
];

const citiesData = [
  { name: "台北", code: "tw" }, { name: "東京", code: "jp" }, { name: "首爾", code: "kr" }, { name: "曼谷", code: "th" },
  { name: "新加坡", code: "sg" }, { name: "吉隆坡", code: "my" }, { name: "胡志明", code: "vn" }, { name: "馬尼拉", code: "ph" },
  { name: "倫敦", code: "gb" }, { name: "巴黎", code: "fr" }, { name: "柏林", code: "de" }, { name: "羅馬", code: "it" },
  { name: "紐約", code: "us" }, { name: "洛杉磯", code: "us" }, { name: "多倫多", code: "ca" }, { name: "雪梨", code: "au" },
  { name: "奧克蘭", code: "nz" }, { name: "蘇黎世", code: "ch" }, { name: "馬德里", code: "es" }, { name: "杜拜", code: "ae" }
];

const getPropertyColor = (bottles) => {
  switch(bottles) {
    case 1: return 'bg-emerald-500'; 
    case 2: return 'bg-blue-500';    
    case 3: return 'bg-yellow-500';  
    case 4: return 'bg-orange-500';  
    case 5: return 'bg-red-600';     
    default: return 'bg-gray-500';
  }
};

const generateBoardSpaces = () => {
  const spaces = [];
  let propIndex = 0;
  for (let i = 0; i < 40; i++) {
    let baseBottles = Math.min(5, Math.max(1, Math.ceil(i / 8)));
    let space = { id: i, name: '', icon: '', type: '', baseBottles };

    if (i === 0) space = { ...space, name: '起點\n(分3口)', icon: '🚩', type: 'CORNER_START' };
    else if (i === 10) space = { ...space, name: '監獄\n(無敵)', icon: '⛓', type: 'CORNER_JAIL' };
    else if (i === 20) space = { ...space, name: '單程票\n(飛)', icon: '🎫', type: 'CORNER_TICKET' };
    else if (i === 30) space = { ...space, name: '陪酒小姐', icon: '🥂', type: 'CORNER_ESCORT' };
    else if (i === 4 || i === 24) space = { ...space, name: '加料', icon: '💧', type: 'CUP_ADD' };
    else if (i === 12 || i === 32) space = { ...space, name: 'Shot', icon: '🥃', type: 'CUP_SHOT' };
    else if (i === 18 || i === 38) space = { ...space, name: '全體乾杯', icon: '🍻', type: 'ALL_DRINK' };
    else if (i === 6 || i === 16 || i === 26 || i === 36) space = { ...space, name: '命運', icon: '🃏', type: 'CHANCE' };
    else if ([2, 8, 14, 22, 28, 34].includes(i)) space = { ...space, name: '小遊戲', icon: '🎯', type: 'MINIGAME' };
    else { 
      space = { 
        ...space, 
        name: citiesData[propIndex]?.name || "神秘地帶", 
        code: citiesData[propIndex]?.code || "un",
        type: 'PROPERTY', 
        colorBg: getPropertyColor(baseBottles) 
      };
      propIndex++;
    }
    spaces.push(space);
  }
  return spaces;
};
const boardSpaces = generateBoardSpaces();

const getGridStyle = (id) => {
  let gridPos = {};
  let rotateDeg = 0;
  let barStyle = "";
  let contentPadding = ""; 
  
  if (id === 0) { gridPos = { gridColumn: 11, gridRow: 11 }; rotateDeg = -45; barStyle = "inset-0 w-full h-full opacity-30"; } 
  else if (id > 0 && id < 10) { gridPos = { gridColumn: 11 - id, gridRow: 11 }; rotateDeg = 0; barStyle = "top-0 left-0 w-full h-[15%]"; contentPadding = "pt-[15%]"; } 
  else if (id === 10) { gridPos = { gridColumn: 1, gridRow: 11 }; rotateDeg = 45; barStyle = "inset-0 w-full h-full opacity-30"; } 
  else if (id > 10 && id < 20) { gridPos = { gridColumn: 1, gridRow: 11 - (id - 10) }; rotateDeg = 90; barStyle = "top-0 right-0 h-full w-[15%]"; contentPadding = "pr-[15%]"; } 
  else if (id === 20) { gridPos = { gridColumn: 1, gridRow: 1 }; rotateDeg = 135; barStyle = "inset-0 w-full h-full opacity-30"; } 
  else if (id > 20 && id < 30) { gridPos = { gridColumn: 1 + (id - 20), gridRow: 1 }; rotateDeg = 180; barStyle = "bottom-0 left-0 w-full h-[15%]"; contentPadding = "pb-[15%]"; } 
  else if (id === 30) { gridPos = { gridColumn: 11, gridRow: 1 }; rotateDeg = 225; barStyle = "inset-0 w-full h-full opacity-30"; } 
  else if (id > 30 && id < 40) { gridPos = { gridColumn: 11, gridRow: 1 + (id - 30) }; rotateDeg = 270; barStyle = "top-0 left-0 h-full w-[15%]"; contentPadding = "pl-[15%]"; } 
  
  return { gridPos, rotateDeg, barStyle, contentPadding };
};

const cleanSpaceName = (name) => {
  if (!name) return ""; 
  return name.replace(/\n.*/g, "");
};

// ==========================================
// 派對棋子組件
// ==========================================
const PlayerToken = ({ player, playerIdx, isMoving, isCurrentTurn }) => {
  if (!player) return null; 
  const getCenterPct = (pos) => {
    const edge = 1.625; 
    const mid = 1;    
    const total = edge * 2 + mid * 9; 
    if (pos === 1) return (edge / 2) / total * 100;
    if (pos === 11) return (edge + 9 * mid + edge / 2) / total * 100;
    return (edge + (pos - 2) * mid + mid / 2) / total * 100;
  };
  const getPosPercent = (index) => {
    let col = 11, row = 11;
    if (index >= 0 && index <= 10) { row = 11; col = 11 - index; }
    else if (index > 10 && index <= 20) { col = 1; row = 11 - (index - 10); }
    else if (index > 20 && index <= 30) { row = 1; col = 1 + (index - 20); }
    else if (index > 30 && index <= 39) { col = 11; row = 1 + (index - 30); }
    const offsets = [{x:-1.5,y:-1.5}, {x:1.5,y:1.5}, {x:-1.5,y:1.5}, {x:1.5,y:-1.5}, {x:0,y:-2.5}, {x:0,y:2.5}, {x:-2.5,y:0}, {x:2.5,y:0}];
    const offset = offsets[playerIdx % 8] || {x:0,y:0};
    return { left: `calc(${getCenterPct(col)}% + ${offset.x}%)`, top: `calc(${getCenterPct(row)}% + ${offset.y}%)` };
  };

  const posStyle = getPosPercent(player.position);
  return (
    <div className="absolute z-[100] pointer-events-none" style={{ left: posStyle.left, top: posStyle.top, transition: 'left 0.25s ease-in-out, top 0.25s ease-in-out', transform: 'translate(-50%, -50%)' }}>
      <div className={`w-5 h-5 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center border-[2px] border-white shadow-[0_0_10px_currentColor] transition-transform ${isMoving ? '-translate-y-4 scale-110' : ''} ${isCurrentTurn ? 'animate-bounce' : ''}`} style={{ backgroundColor: player.hexColor || '#333', color: player.hexColor || '#333' }}>
        <span className="text-[10px] md:text-sm lg:text-base drop-shadow-md text-white block">{player.icon || '👤'}</span>
      </div>
    </div>
  );
};

// ==========================================
// 遊戲主程式 (👑 接收 isPremium)
// ==========================================
export default function GameBoard({ initialPlayers, initialTime, isPremium, onRestart }) {
  
  const defaultPlayers = [
    { id: 1, name: "玩家一", color: "border-red-500 text-red-400 bg-red-950", hexColor: "#ef4444", icon: "🍷", position: 0, state: 'NORMAL', areas: 0, bottles: 0, inventory: [] },
    { id: 2, name: "玩家二", color: "border-blue-500 text-blue-400 bg-blue-950", hexColor: "#3b82f6", icon: "🍺", position: 0, state: 'NORMAL', areas: 0, bottles: 0, inventory: [] }
  ];
  
  const [players, setPlayers] = useState(initialPlayers && initialPlayers.length > 0 ? initialPlayers : defaultPlayers);
  const [timeLeft, setTimeLeft] = useState(initialTime || 30 * 60); 
  const [propertyOwnership, setPropertyOwnership] = useState({}); 
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState(null); 

  const [movingPlayerId, setMovingPlayerId] = useState(null);
  const [actionLog, setActionLog] = useState("歡迎來到大醉翁！\n請點擊中央骰子開局。");
  const [screenFlash, setScreenFlash] = useState(""); 
  const [publicCup, setPublicCup] = useState(0); 
  const maxCup = 20;
  
  const [activeModal, setActiveModal] = useState({ show: false, type: '', space: null, customData: null });
  const [modalInput, setModalInput] = useState(""); 
  const [turnPopup, setTurnPopup] = useState(false);

  // --- 全域崩壞機制 (Meltdown) 狀態 ---
  const [meltdownCount, setMeltdownCount] = useState(0);
  const [activeEvent, setActiveEvent] = useState(null);
  const [eventTurnsLeft, setEventTurnsLeft] = useState(0);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showFomoModal, setShowFomoModal] = useState(false);
  const [previewEvent, setPreviewEvent] = useState(null);

  const currentPlayer = players[currentTurnIndex] || players[0];
  const isMinigameActive = activeModal.show && (activeModal.type === 'MINIGAME' || activeModal.type === 'STEAL_CHALLENGE' || activeModal.type === 'PROMO_BLOCK');
  const isGameOver = activeModal.show && activeModal.type === 'GAME_OVER';

  // 取得全域事件倍率
  const getMultiplier = () => activeEvent?.id === 'HAPPY_HOUR' ? 2 : 1;

  useEffect(() => {
    setTurnPopup(true);
    const t = setTimeout(() => setTurnPopup(false), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isMinigameActive || isGameOver || timeLeft <= 0) return; 
    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerId); triggerGameOver(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [isMinigameActive, isGameOver, timeLeft]);

  const triggerGameOver = () => { setActiveModal({ show: true, type: 'GAME_OVER' }); };
  const triggerFlash = (colorClass) => { setScreenFlash(colorClass); setTimeout(() => setScreenFlash(""), 500); };
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds <= 0) return "00:00";
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSpaceAction = (space) => {
    if (timeLeft <= 0) return;
    playSound('hop');
    setModalInput(""); 
    if (space?.type === 'PROPERTY') {
      const ownership = propertyOwnership[space.id];
      if (!ownership) {
        setActiveModal({ show: true, type: 'PROPERTY_UNOWNED', space });
      } else if (ownership.ownerId === currentPlayer.id) {
        setActiveModal({ show: true, type: 'PROPERTY_OWNED', space, customData: ownership });
      } else {
        if (activeEvent?.id === 'RENT_FREE') {
          triggerFlash('bg-blue-500/40');
          setActionLog(`🚓 警察查牌中！\n【${cleanSpaceName(space?.name)}】免收過路費！`);
          setTimeout(() => nextTurn(), 2000);
          return;
        }
        const owner = players.find(p => p.id === ownership.ownerId);
        setActiveModal({ show: true, type: 'PROPERTY_PENALTY', space, customData: { ...ownership, owner } });
      }
    } 
    else if (space?.type === 'MINIGAME') {
      const availableGames = isPremium ? minigameLibrary : minigameLibrary.filter(g => !g.isPro);
      const randomGame = availableGames[Math.floor(Math.random() * availableGames.length)];
      setActiveModal({ show: true, type: 'MINIGAME', space, customData: randomGame });
    } 
    else {
      setActiveModal({ show: true, type: space?.type || '', space });
    }
  };

  const rollDice = async () => {
    if (isProcessing || isRolling || movingPlayerId || activeModal.show || timeLeft <= 0 || turnPopup) return;
    setIsProcessing(true); 

    if (currentPlayer?.state === 'JAIL') {
      setActiveModal({ show: true, type: 'SKIP_JAIL', space: null, customData: null });
      return;
    }

    if (currentPlayer?.state === 'ESCORT') {
      setActionLog(`✨ ${currentPlayer.name} 陪酒任務結束！`);
      setPlayers(prev => prev.map((p, i) => i === currentTurnIndex ? { ...p, state: 'NORMAL' } : p));
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setIsRolling(true);
    setLastRoll(null);
    playSound('dice');
    await new Promise(resolve => setTimeout(resolve, 800));
    const steps = Math.floor(Math.random() * 11) + 2; 
    setIsRolling(false);
    setLastRoll(steps); 
    await new Promise(resolve => setTimeout(resolve, 600));

    setMovingPlayerId(currentPlayer.id);
    let tempPos = currentPlayer.position || 0;
    const passedStart = (tempPos + steps >= 40) && ((tempPos + steps) % 40 !== 0);

    for (let i = 0; i < steps; i++) {
      tempPos = (tempPos + 1) % 40;
      setPlayers(prev => prev.map((p, idx) => idx === currentTurnIndex ? { ...p, position: tempPos } : p));
      playSound('hop');
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    setMovingPlayerId(null);
    const finalSpace = boardSpaces[tempPos];
    
    if (passedStart) {
      triggerFlash('bg-yellow-400/40');
      setActionLog(`✨ 經過起點！\n📍 抵達【${cleanSpaceName(finalSpace?.name)}】`);
    } else {
      setActionLog(`📍 抵達【${cleanSpaceName(finalSpace?.name)}】`);
    }
    
    setTimeout(() => { handleSpaceAction(finalSpace); }, 500);
  };

  const nextTurn = () => {
    if (timeLeft <= 0) { triggerGameOver(); return; }
    setActiveModal({ show: false, type: '', space: null, customData: null });
    
    if (eventTurnsLeft > 0) {
      setEventTurnsLeft(prev => {
        const next = prev - 1;
        if (next <= 0) setActiveEvent(null);
        return next;
      });
    }

    const nextCount = meltdownCount + 1;
    if (nextCount >= MELTDOWN_MAX) {
      setMeltdownCount(0);
      triggerMeltdown();
    } else {
      setMeltdownCount(nextCount);
      advancePlayerTurn();
    }
  };

  const advancePlayerTurn = () => {
    const nextIdx = (currentTurnIndex + 1) % players.length;
    setCurrentTurnIndex(nextIdx);
    setActionLog(`輪到 ${players[nextIdx]?.name || '下一位'} 的回合！`);
    setIsProcessing(false);
    setLastRoll(null);
    setTurnPopup(true);
  };

  const triggerMeltdown = () => {
    let randomEvent = GLOBAL_EVENTS[Math.floor(Math.random() * GLOBAL_EVENTS.length)];
    
    if (randomEvent.id === 'RULE') {
      const randomRule = KING_RULES[Math.floor(Math.random() * KING_RULES.length)];
      randomEvent = {
        ...randomEvent,
        title: '國王的新規',
        desc: `接下來 2 圈【${randomRule}】！\n現實中誰被抓到犯規，立刻罰喝 1 口！`
      };
    }

    setPreviewEvent(randomEvent);
    if (isPremium) {
      setActiveEvent(randomEvent);
      setEventTurnsLeft(randomEvent.durationTurns);
      if (randomEvent.id === 'LOTTERY') {
        setPlayers(prev => prev.map(p => ({ 
          ...p, 
          bottles: Math.max(0, p.bottles + (Math.random() > 0.5 ? 1 : -1)) 
        })));
      }
      setShowEventModal(true);
    } else {
      setShowFomoModal(true);
    }
  };

  const closeEvent = () => { setShowEventModal(false); advancePlayerTurn(); };
  const closeFomoAndSkip = () => { setShowFomoModal(false); advancePlayerTurn(); };

  const notifyEscorts = () => {
    const escorts = players.filter(p => p.state === 'ESCORT' && p.id !== currentPlayer.id && p.state !== 'JAIL');
    if (escorts.length > 0) {
      const escortNames = escorts.map(e => e.name).join('、');
      alert(`⚠️ 陪酒小姐 【${escortNames}】 也必須跟著喝！`);
    }
  };

  const handleOccupy = () => {
    const space = activeModal.space;
    setPropertyOwnership(prev => ({ ...prev, [space.id]: { ownerId: currentPlayer.id, bottles: space.baseBottles } }));
    setPlayers(prev => prev.map(p => p.id === currentPlayer.id ? { ...p, areas: p.areas + 1, bottles: p.bottles + space.baseBottles } : p));
    triggerFlash('bg-cyan-500/40');
    nextTurn();
  };

  const handleUpgrade = () => {
    if (!isPremium) {
      setActiveModal({
        show: true,
        type: 'PROMO_BLOCK',
        space: activeModal.space,
        customData: {
          title: '🔒 升級地盤 (PRO 專屬)',
          message: '試玩版只能維持 1 級地產...\n\n想要疊加酒瓶、把過路費拉到最高，讓踩到的朋友喝到懷疑人生嗎？\n解鎖 PRO 版立刻開啟「地產升級系統」！',
          action: () => {
            nextTurn();
          }
        }
      });
      return;
    }

    const space = activeModal.space;
    setPropertyOwnership(prev => ({ ...prev, [space.id]: { ...prev[space.id], bottles: prev[space.id].bottles + 1 } }));
    setPlayers(prev => prev.map(p => p.id === currentPlayer.id ? { ...p, bottles: p.bottles + 1 } : p));
    triggerFlash('bg-green-500/40');
    nextTurn();
  };

  const handlePenaltyDrink = () => { triggerFlash('bg-red-500/40'); playSound('alert'); notifyEscorts(); nextTurn(); };
  
  const handleStealInitiate = () => {
    if (!isPremium) {
      setActiveModal({
        show: true,
        type: 'PROMO_BLOCK',
        space: activeModal.space,
        customData: {
          title: '🔒 搶奪失敗 (PRO 專屬)',
          message: '你原本可以發起決鬥，把這塊地搶過來並讓他喝兩杯...\n但試玩版不支援地產搶奪！請乖乖支付過路費。',
          action: () => {
            alert(`乖乖喝 ${activeModal.customData.bottles * getMultiplier()} 口！`);
            handlePenaltyDrink();
          }
        }
      });
    } else {
      setActiveModal({ show: true, type: 'STEAL_CHALLENGE', space: activeModal.space, customData: activeModal.customData });
    }
  };

  const handleStealWin = () => {
    const space = activeModal.space;
    const oldOwnerId = activeModal.customData?.ownerId;
    const currentBottles = activeModal.customData?.bottles || 1;
    
    setPropertyOwnership(prev => ({ ...prev, [space.id]: { ...prev[space.id], ownerId: currentPlayer.id } }));
    setPlayers(prev => prev.map(p => {
      if (p.id === oldOwnerId) return { ...p, areas: Math.max(0, p.areas - 1), bottles: Math.max(0, p.bottles - currentBottles) };
      if (p.id === currentPlayer.id) return { ...p, areas: p.areas + 1, bottles: p.bottles + currentBottles };
      return p;
    }));
    
    triggerFlash('bg-yellow-500/40');
    alert(`⚔️ 挑戰勝利！對手喝下 ${currentBottles * 2 * getMultiplier()} 口，你成功奪得此地！`);
    notifyEscorts(); 
    nextTurn();
  };

  const handleStealLose = () => {
    const currentBottles = activeModal.customData?.bottles || 1;
    triggerFlash('bg-red-600/50');
    playSound('alert');
    alert(`💀 挑戰失敗！${currentPlayer.name} 賠了夫人又折兵，乖乖喝下 ${currentBottles * 2 * getMultiplier()} 口！`);
    notifyEscorts(); 
    nextTurn();
  };

  const handleAddCup = () => {
    setPublicCup(prev => {
      const next = prev + 1;
      if (next >= maxCup) { setTimeout(() => { playSound('alert'); triggerFlash('bg-red-600/60'); alert('💥 公杯爆滿！！全場所有人立刻罰喝 1 口！'); setPublicCup(0); }, 500); return maxCup; }
      return next;
    });
    triggerFlash('bg-amber-500/40');
    nextTurn();
  };

  const handleDrinkCup = () => { setPublicCup(0); triggerFlash('bg-orange-500/50'); notifyEscorts(); nextTurn(); };
  const handleChangeState = (newState) => { setPlayers(prev => prev.map(p => p.id === currentPlayer.id ? { ...p, state: newState } : p)); triggerFlash('bg-purple-500/40'); nextTurn(); };
  
  const handleUseImmunityCard = () => {
    playSound('buy'); triggerFlash('bg-yellow-400/40');
    setPlayers(prev => prev.map(p => {
      if (p.id === currentPlayer.id) { const inv = [...(p.inventory || [])]; const idx = inv.indexOf('免喝卡'); if (idx > -1) inv.splice(idx, 1); return { ...p, inventory: inv }; }
      return p;
    }));
    alert("🛡️ 成功發動【免喝卡】！已抵消本次懲罰！"); nextTurn();
  };

  const handleDrawCard = () => {
    const availableCards = isPremium ? chanceCards : chanceCards.filter(c => !c.isPro);
    const card = availableCards[Math.floor(Math.random() * availableCards.length)];
    setActiveModal({ show: true, type: 'CHANCE_RESULT', space: activeModal.space, customData: card });
  };

  const executeTeleport = () => {
    const targetId = parseInt(modalInput || "1"); 
    if (targetId === currentPlayer.position) { alert("不能原地傳送！"); return; }
    setPlayers(prev => prev.map(p => p.id === currentPlayer.id ? { ...p, position: targetId } : p));
    playSound('hop'); triggerFlash('bg-blue-500/40');
    const targetSpace = boardSpaces[targetId];
    setActionLog(`🌀 傳送抵達【${cleanSpaceName(targetSpace?.name)}】`);
    setActiveModal({ show: false, type: '', space: null, customData: null });
    setTimeout(() => { handleSpaceAction(targetSpace); }, 600);
  };

  const executeDestroy = () => {
    const targetSpaceId = parseInt(modalInput);
    if (isNaN(targetSpaceId)) return;
    const oldOwnerId = propertyOwnership[targetSpaceId]?.ownerId;
    const currentBottles = propertyOwnership[targetSpaceId]?.bottles || 0;
    setPropertyOwnership(prev => { const updated = { ...prev }; delete updated[targetSpaceId]; return updated; });
    setPlayers(prev => prev.map(p => p.id === oldOwnerId ? { ...p, areas: Math.max(0, p.areas - 1), bottles: Math.max(0, p.bottles - currentBottles) } : p));
    triggerFlash('bg-red-600/50'); playSound('alert');
    alert(`💥 轟隆！【${cleanSpaceName(boardSpaces[targetSpaceId]?.name)}】已被夷為平地，資產歸零！`);
    nextTurn();
  };

  const renderModalContent = () => {
    const { type, space, customData } = activeModal;
    switch (type) {
      case 'EVENT_DETAILS': {
        return (
          <>
            <div className="text-6xl mb-4">{customData?.icon}</div>
            <h2 className="text-3xl font-black text-red-400 mb-4">{customData?.title}</h2>
            <p className="text-lg text-gray-300 mb-8 whitespace-pre-line leading-relaxed font-bold bg-red-950/40 p-4 rounded-xl border border-red-500/30 shadow-inner">
              {customData?.desc}
            </p>
            <button className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl text-xl transition-all" 
              onClick={() => setActiveModal({ show: false, type: '', space: null, customData: null })}
            >
              ✅ 我知道了
            </button>
          </>
        );
      }
      case 'PROMO_BLOCK': {
        return (
          <>
            <h3 className="text-3xl font-black text-yellow-400 mb-4">{customData.title}</h3>
            <p className="text-gray-300 mb-8 whitespace-pre-line font-bold leading-relaxed">{customData.message}</p>
            <button onClick={customData.action} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-xl transition-colors">
              無奈接受
            </button>
          </>
        );
      }
      case 'SKIP_JAIL': {
        return (
          <>
            <div className="text-6xl mb-4">🛑</div>
            <h2 className="text-3xl font-black text-gray-400 mb-4">坐牢中，暫停一回合</h2>
            <p className="text-lg text-gray-300 mb-8">
              【<span style={{color: currentPlayer.hexColor}}>{currentPlayer.name}</span>】正在監獄服刑，本回合無法移動！<br/>
              <span className="text-yellow-400 mt-2 block font-bold">無敵狀態即將解除。</span>
            </p>
            <button className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-4 rounded-xl text-xl transition-all" 
              onClick={() => {
                setPlayers(prev => prev.map((p, i) => i === currentTurnIndex ? { ...p, state: 'NORMAL' } : p));
                nextTurn();
              }}
            >✅ 結束回合</button>
          </>
        );
      }
      case 'GAME_OVER': {
        const sortedPlayers = [...players].sort((a, b) => b.bottles - a.bottles || b.areas - a.areas);
        const winner = sortedPlayers[0];
        return (
          <>
            <h1 className="text-4xl md:text-5xl font-black text-red-500 mb-6 animate-bounce">
              {isPremium ? '🏁 遊戲結束！' : '⏳ 試玩局 熱身結束！'}
            </h1>
            <div className="w-full bg-gray-900/80 px-6 py-4 rounded-2xl border border-gray-600 mb-6">
              <p className="text-lg text-gray-300 mb-1">大醉翁地產王：</p>
              <p className="text-3xl font-black mb-2" style={{ color: winner?.hexColor }}>{winner?.icon} {winner?.name}</p>
              <div className="flex justify-center gap-4 text-sm font-bold text-gray-400">
                <span>🏠 {winner?.areas} 塊</span>
                <span>🍾 {winner?.bottles} 支</span>
              </div>
            </div>
            {!isPremium ? (
              <div className="w-full bg-gradient-to-r from-yellow-900/60 to-orange-900/60 border border-yellow-500 rounded-3xl p-6 mb-6 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                <p className="text-lg text-gray-200 mb-4 font-black leading-relaxed">
                  各位的酒杯似乎還很滿？<br/>氣氛才剛熱起來就結束了嗎？
                </p>
                <ul className="text-left text-yellow-200 mb-6 space-y-2 font-bold w-fit mx-auto text-sm">
                  <li>✅ 解鎖 <span className="text-white">60 分鐘</span> 無限血戰模式</li>
                  <li>✅ 開放 8 人大亂鬥與 <span className="text-white">地產升級與搶奪</span></li>
                  <li>✅ 擴充 <span className="text-white">8 款超刺激小遊戲</span> (如真心話、射龍門)</li>
                  <li>✅ 釋放 <span className="text-white">摧毀卡、國王卡、全域災難</span> 等暗黑機制</li>
                </ul>
                <a href="https://buymeacoffee.com/thomas0982/e/584709" className="flex flex-col items-center justify-center bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black text-xl px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform">
                  <span>💳 立即解鎖大醉翁 PRO</span>
                  <span className="text-xs font-bold opacity-80 mt-1">(僅需約 1 杯 Shot 的價格)</span>
                </a>
              </div>
            ) : (
              <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:scale-105 transition-transform text-white font-black tracking-widest py-4 rounded-xl text-xl shadow-[0_0_20px_rgba(8,145,178,0.6)]" onClick={onRestart}>🔄 再戰一局</button>
            )}
            {!isPremium && (<button onClick={onRestart} className="text-gray-400 hover:text-white underline font-bold mt-2">返回大廳</button>)}
          </>
        );
      }
      case 'PROPERTY_UNOWNED': {
        return (
          <>
            <h2 className="text-3xl font-black text-cyan-400 mb-4">✈️ 抵達未佔領城市</h2>
            <p className="text-lg text-gray-300 mb-6">【{cleanSpaceName(space?.name)}】還沒有主人。<br/>你要喝下 <span className="text-yellow-400 font-bold text-2xl">{space?.baseBottles} 口</span> 來佔領它嗎？</p>
            <div className="flex flex-col gap-3 w-full">
              <button className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(8,145,178,0.6)] text-xl" onClick={handleOccupy}>🍻 喝 {space?.baseBottles} 口並佔領！</button>
              <button className="bg-gray-800 text-gray-400 font-bold py-3 rounded-xl border border-gray-600" onClick={nextTurn}>⏭️ 認慫略過</button>
            </div>
          </>
        );
      }
      case 'PROPERTY_OWNED': {
        return (
          <>
            <h2 className="text-3xl font-black text-green-400 mb-4">🥂 巡視領地</h2>
            <p className="text-lg text-gray-300 mb-6">歡迎回到你的【{cleanSpaceName(space?.name)}】。<br/>目前已有 {customData?.bottles} 支酒瓶，喝 1 口可再加碼 1 支！</p>
            <div className="flex flex-col gap-3 w-full">
              <button 
                className={`${isPremium ? 'bg-green-600 hover:bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'bg-purple-700 hover:bg-purple-600 shadow-[0_0_15px_rgba(126,34,206,0.6)]'} text-white font-bold py-4 rounded-xl text-xl`} 
                onClick={handleUpgrade}
              >
                {isPremium ? '📈 喝 1 口升級地盤' : '🔒 喝 1 口升級 (PRO 專屬)'}
              </button>
              <button className="bg-gray-800 text-gray-400 font-bold py-3 rounded-xl border border-gray-600" onClick={nextTurn}>🛡️ 安全休息一回合</button>
            </div>
          </>
        );
      }
      case 'PROPERTY_PENALTY': {
        return (
          <>
            <h2 className="text-3xl font-black text-red-500 mb-4 animate-pulse">⚠️ 踩到別人地盤</h2>
            <p className="text-lg text-gray-300 mb-6">這是 <span style={{color: customData?.owner?.hexColor}} className="font-black text-xl">{customData?.owner?.name}</span> 的【{cleanSpaceName(space?.name)}】！<br/>此地有 <span className="text-red-400 font-bold text-2xl">{customData?.bottles} 支酒瓶</span>。</p>
            <div className="flex flex-col gap-3 w-full">
              {currentPlayer?.inventory?.includes('免喝卡') && (
                <button className="w-full bg-yellow-600 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(202,138,4,0.6)] text-lg animate-pulse" onClick={handleUseImmunityCard}>🛡️ 使用【免喝卡】抵消</button>
              )}
              <button className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.6)] text-xl" onClick={handlePenaltyDrink}>
                😭 乖乖罰喝 {customData?.bottles * getMultiplier()} 口
              </button>
              <button className="bg-purple-700 hover:bg-purple-600 text-white font-bold py-3 rounded-xl border border-purple-500" onClick={handleStealInitiate}>
                ⚔️ 喝 {customData?.bottles * 2 * getMultiplier()} 口並發起搶奪挑戰！
              </button>
            </div>
          </>
        );
      }
      case 'STEAL_CHALLENGE': {
        return (
          <>
            <div className="text-5xl mb-2 animate-bounce">⚔️</div>
            <h2 className="text-3xl font-black text-yellow-400 mb-2">自由搶奪對決</h2>
            <div className="w-full bg-yellow-900/40 border border-yellow-500/50 p-4 rounded-xl mb-4">
              <p className="text-sm text-gray-300 mb-2">
                <span style={{color: currentPlayer.hexColor}} className="font-bold">{currentPlayer.name}</span> 挑戰 <span style={{color: customData?.owner?.hexColor}} className="font-bold">{customData?.owner?.name}</span>！
              </p>
              <div className="bg-black/40 py-3 px-2 rounded-lg my-3 border border-yellow-500/30">
                <p className="text-base font-bold text-white leading-relaxed">請雙方自行決定一個 PK 遊戲<br/><span className="text-gray-400 text-sm font-normal">(例如：剪刀石頭布、比大小、喝水)</span></p>
              </div>
              <p className="text-xs text-red-400 font-bold mt-2">※ 對決結束後，請點擊下方按鈕結算！<br/>※ 輸家必須喝下 {customData?.bottles * 2 * getMultiplier()} 口！</p>
            </div>
            <div className="w-full bg-yellow-900/60 border-2 border-yellow-400 text-yellow-100 p-3 rounded-xl my-4 font-bold shadow-[0_0_15px_rgba(250,204,21,0.5)] flex items-center justify-center gap-2 animate-pulse">
              <span className="text-2xl">⏸</span>
              <span>對決進行中...<br/>(主計時器已凍結)</span>
            </div>
            <div className="flex gap-3 w-full mt-2">
              <button className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.5)] text-lg transition-all" onClick={handleStealWin}>🏆 我贏了<br/>(搶奪成功)</button>
              <button className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.5)] text-lg transition-all" onClick={handleStealLose}>💀 我輸了<br/>(搶奪失敗)</button>
            </div>
          </>
        );
      }
      case 'MINIGAME': {
        return (
          <>
            <div className="text-5xl mb-2 animate-bounce">{space?.icon}</div>
            <h2 className="text-3xl font-black text-green-400 mb-2">{customData?.name}</h2>
            <p className="text-base text-gray-200 mb-2 bg-green-900/40 p-4 rounded-xl border-2 border-green-500/50 leading-relaxed text-left shadow-inner">
              {customData?.rules}
            </p>
            <div className="w-full bg-yellow-900/60 border-2 border-yellow-400 text-yellow-100 p-3 rounded-xl my-4 font-bold shadow-[0_0_15px_rgba(250,204,21,0.5)] flex items-center justify-center gap-2 animate-pulse">
              <span className="text-2xl">⏸</span>
              <span>小遊戲進行中...<br/>(主計時器已凍結)</span>
            </div>
            <div className="flex flex-col gap-3 w-full mt-2">
              {currentPlayer?.inventory?.includes('免喝卡') && (
                <button className="w-full bg-yellow-600 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(202,138,4,0.6)] text-lg animate-pulse" onClick={handleUseImmunityCard}>🛡️ 我輸了，我要用【免喝卡】抵消！</button>
              )}
              <button className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.5)] text-xl" onClick={nextTurn}>✅ 結算完成，下一回合</button>
            </div>
          </>
        );
      }
      case 'CUP_ADD': {
        return (
          <>
            <div className="text-6xl mb-4 animate-pulse">💧</div>
            <h2 className="text-3xl font-black text-amber-500 mb-4">公杯加料</h2>
            <p className="text-lg text-gray-300 mb-8">請立刻往中央的實體大公杯中<br/><span className="text-white font-bold">加入 1 口任意液體！</span></p>
            <button className="w-full bg-amber-600 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.6)] text-xl" onClick={handleAddCup}>✅ 我加好了</button>
          </>
        );
      }
      case 'CUP_SHOT': {
        return (
          <>
            <div className="text-6xl mb-4">🥃</div>
            <h2 className="text-3xl font-black text-orange-500 mb-4">Shot 挑戰！</h2>
            <p className="text-lg text-gray-300 mb-8">系統顯示目前公杯有 <span className="text-orange-400 font-black text-2xl">{publicCup} 口</span> 的量。<br/>請一口氣喝光實體大公杯！</p>
            <button className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(234,88,12,0.6)] text-xl" onClick={handleDrinkCup}>🤢 我喝光了</button>
          </>
        );
      }
      case 'ALL_DRINK': {
        return (
          <>
            <div className="text-6xl mb-4">🍻</div>
            <h2 className="text-3xl font-black text-red-500 mb-4">全體乾杯</h2>
            <p className="text-xl text-gray-200 mb-8 font-bold">不管你在哪裡，全場所有人立刻喝 1 口！</p>
            <button className="w-full bg-red-600 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.6)] text-xl" onClick={nextTurn}>✅ 大家喝完了</button>
          </>
        );
      }
      case 'CORNER_START': {
        return (
          <>
            <div className="text-6xl mb-4">🚩</div>
            <h2 className="text-3xl font-black text-yellow-400 mb-4">起點派對</h2>
            <p className="text-lg text-gray-300 mb-8">你可以任意分配 <span className="text-white font-bold text-2xl">3 口酒</span> 給全場任何人！<br/>(可集中或分散給不同人)</p>
            <button className="w-full bg-yellow-600 text-white font-bold py-4 rounded-xl text-xl" onClick={nextTurn}>✅ 分配完畢</button>
          </>
        );
      }
      case 'CORNER_JAIL': {
        return (
          <>
            <div className="text-6xl mb-4">⛓️</div>
            <h2 className="text-3xl font-black text-gray-400 mb-4">坐牢反省</h2>
            <p className="text-lg text-gray-300 mb-8">下一回合暫停，但期間內你<span className="text-yellow-400 font-bold">絕對無敵</span>！<br/>免疫所有罰酒與連帶懲罰。</p>
            <button className="w-full bg-gray-600 text-white font-bold py-4 rounded-xl text-xl" onClick={() => handleChangeState('JAIL')}>✅ 入獄服刑</button>
          </>
        );
      }
      case 'CORNER_ESCORT': {
        return (
          <>
            <div className="text-6xl mb-4">🥂</div>
            <h2 className="text-3xl font-black text-pink-400 mb-4">化身陪酒小姐</h2>
            <p className="text-lg text-gray-300 mb-8">直到你下一次擲骰前，只要有人被罰酒，<br/><span className="text-pink-300 font-bold text-xl">妳/你都必須跟著喝一樣的量！</span></p>
            <button className="w-full bg-pink-600 text-white font-bold py-4 rounded-xl text-xl shadow-[0_0_20px_rgba(219,39,119,0.6)]" onClick={() => handleChangeState('ESCORT')}>✅ 認命陪酒</button>
          </>
        );
      }
      case 'CHANCE': {
        return (
          <>
            <div className="text-6xl mb-4 animate-pulse">🃏</div>
            <h2 className="text-3xl font-black text-purple-400 mb-4">命運時刻</h2>
            <p className="text-lg text-gray-300 mb-8">命運的齒輪開始轉動...<br/>點擊下方按鈕抽取一張命運卡牌！</p>
            <button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl text-xl shadow-[0_0_20px_rgba(168,85,247,0.6)]" onClick={handleDrawCard}>🃏 抽取卡牌</button>
          </>
        );
      }
      case 'CHANCE_RESULT': {
        let truthTargetElement = null;
        if (customData?.id === 'truth') {
          const minBottles = Math.min(...players.map(p => p.bottles || 0));
          const targetNames = players.filter(p => p.bottles === minBottles).map(p => p.name).join('、');
          truthTargetElement = (
            <div className="w-full bg-blue-900/60 border-2 border-blue-400 text-blue-100 p-4 rounded-xl mb-6 font-bold shadow-[0_0_20px_rgba(59,130,246,0.6)] text-center animate-pulse">
              <div className="text-2xl mb-1">🎯 真心話目標鎖定</div>
              <div className="text-lg text-yellow-300">資產最少的是【{targetNames}】 ({minBottles} 瓶)</div>
            </div>
          );
        }

        const renderCardAction = () => {
          if (customData?.id === 'shield') return <button className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl text-xl" onClick={() => { setPlayers(prev => prev.map(p => p.id === currentPlayer.id ? { ...p, inventory: [...(p.inventory || []), '免喝卡'] } : p)); nextTurn(); }}>✅ 收下卡牌</button>;
          if (customData?.id === 'carpet') return <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl text-xl" onClick={() => setActiveModal({ show: true, type: 'TELEPORT_SELECT', space, customData: null })}>🧞 選擇傳送目的地</button>;
          if (customData?.id === 'destroy') return <button className="w-full bg-red-600 text-white font-bold py-4 rounded-xl text-xl" onClick={() => setActiveModal({ show: true, type: 'DESTROY_SELECT', space, customData: null })}>💥 選擇摧毀目標</button>;
          if (customData?.id === 'cup') return <button className="w-full bg-amber-600 text-white font-bold py-4 rounded-xl text-xl" onClick={handleAddCup}>🍺 加入 1 口</button>;
          return <button className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl text-xl" onClick={nextTurn}>✅ 執行完畢</button>;
        };

        return (
          <>
            <div className="text-6xl mb-4">{customData?.icon}</div>
            <h2 className="text-3xl font-black text-white mb-2">獲得【{customData?.name}】</h2>
            <p className="text-lg text-purple-200 bg-purple-900/40 p-4 rounded-xl border border-purple-500/50 mb-6">{customData?.desc}</p>
            {truthTargetElement}
            {renderCardAction()}
          </>
        );
      }
      case 'CORNER_TICKET':
      case 'TELEPORT_SELECT': {
        return (
          <>
            <div className="text-6xl mb-4">🌀</div>
            <h2 className="text-3xl font-black text-blue-400 mb-4">空間傳送</h2>
            <p className="text-sm text-gray-300 mb-4">請選擇你要飛去的格子，落地後將立刻觸發該格事件！</p>
            <select className="w-full bg-gray-900 border-2 border-blue-500 text-white text-lg rounded-xl p-4 mb-8 focus:outline-none" value={modalInput} onChange={(e) => setModalInput(e.target.value)}>
              <option value="" disabled>-- 請選擇傳送目的地 --</option>
              {boardSpaces.map(s => (s.id !== currentPlayer?.position && <option key={s.id} value={s.id}>第 {s.id} 格 - {cleanSpaceName(s.name)}</option>))}
            </select>
            <div className="flex gap-3 w-full">
              <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl text-xl shadow-[0_0_20px_rgba(37,99,235,0.6)] disabled:opacity-50" disabled={!modalInput} onClick={executeTeleport}>🚀 確認傳送</button>
              {type === 'CORNER_TICKET' && <button className="bg-gray-800 text-gray-400 px-6 rounded-xl border border-gray-600 font-bold" onClick={nextTurn}>放棄</button>}
            </div>
          </>
        );
      }
      case 'DESTROY_SELECT': {
        const ownedProperties = Object.keys(propertyOwnership).map(id => {
          const owner = players.find(p => p.id === propertyOwnership[id]?.ownerId);
          const sp = boardSpaces.find(s => s.id === parseInt(id));
          return { id: parseInt(id), name: cleanSpaceName(sp?.name), icon: sp?.icon, ownerName: owner?.name || '未知', bottles: propertyOwnership[id]?.bottles || 0 };
        });

        if (ownedProperties.length === 0) {
          return (
            <>
              <div className="text-6xl mb-4">🏜</div>
              <h2 className="text-3xl font-black text-gray-400 mb-4">無人佔領</h2>
              <p className="text-lg text-gray-300 mb-8">目前場上沒有任何被佔領的區域，摧毀卡失效！</p>
              <button className="w-full bg-gray-600 text-white font-bold py-4 rounded-xl text-xl" onClick={nextTurn}>✅ 結束回合</button>
            </>
          );
        }
        return (
          <>
            <div className="text-6xl mb-4">💥</div>
            <h2 className="text-3xl font-black text-red-500 mb-4">選擇摧毀目標</h2>
            <p className="text-sm text-gray-300 mb-4">請選擇一塊區域，將其夷為平地（移除佔領者與所有資產）！</p>
            <select className="w-full bg-gray-900 border-2 border-red-500 text-white text-lg rounded-xl p-4 mb-8 focus:outline-none" value={modalInput} onChange={(e) => setModalInput(e.target.value)}>
              <option value="" disabled>-- 選擇要摧毀的區域 --</option>
              {ownedProperties.map(op => (<option key={op.id} value={op.id}>[{op.ownerName}] 的 {op.name} ({op.bottles} 瓶)</option>))}
            </select>
            <button className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl text-xl shadow-[0_0_20px_rgba(220,38,38,0.6)] disabled:opacity-50" disabled={!modalInput} onClick={executeDestroy}>💥 確定摧毀</button>
          </>
        );
      }
      default:
        return <button className="bg-gray-600 text-white p-4 rounded-xl" onClick={nextTurn}>關閉</button>;
    }
  };

  const renderPlayerPanels = (playerList) => {
    return playerList.map(p => {
      if (!p) return null;
      const isActive = currentTurnIndex === players.findIndex(player => player.id === p.id) && !isGameOver;
      return (
        <div key={p.id} 
             className="relative flex flex-col justify-center px-1.5 sm:px-2 md:px-3 py-1 md:py-1.5 rounded-xl transition-all duration-300 bg-black/60 border-solid backdrop-blur-md flex-1 min-w-[80px] max-w-[160px] md:max-w-[200px]"
             style={{
               borderWidth: isActive ? '3px' : '1px',
               borderColor: isActive ? p.hexColor : 'rgba(255,255,255,0.1)',
               boxShadow: isActive ? `0 0 16px ${p.hexColor}` : 'none',
               transform: isActive ? 'scale(1.05)' : 'scale(1)',
               opacity: isActive ? 1 : 0.6
             }}>
           <div className="flex items-center gap-1 md:gap-2 mb-0.5 md:mb-1 overflow-hidden">
              <div className="w-[8px] h-[8px] md:w-[10px] md:h-[10px] shrink-0 rounded-full shadow-sm" style={{backgroundColor: p.hexColor || '#333'}}></div>
              <span className="font-bold text-[10px] sm:text-xs md:text-base truncate">{p.icon} {p.name}</span>
           </div>
           <div className="text-[9px] sm:text-[10px] md:text-sm text-gray-300 font-bold whitespace-nowrap overflow-hidden text-ellipsis">
              🏠 {p.areas || 0} &nbsp; 🍾 {p.bottles || 0}
           </div>
           <div className="absolute -top-2 -right-2 flex gap-1 scale-75 md:scale-100 z-10">
              {p.state === 'JAIL' && <span className="w-5 h-5 text-[11px] bg-yellow-600 rounded-full flex items-center justify-center shadow-md border border-yellow-400" title="坐牢中">⛓</span>}
              {p.state === 'ESCORT' && <span className="w-5 h-5 text-[11px] bg-pink-600 rounded-full flex items-center justify-center shadow-md border border-pink-400" title="陪酒中">🥂</span>}
              {p.inventory?.includes('免喝卡') && <span className="w-5 h-5 text-[11px] bg-purple-600 rounded-full flex items-center justify-center shadow-md border border-purple-400" title="免喝卡">🛡️</span>}
           </div>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col w-full h-[100dvh] bg-[#07020d] text-white overflow-hidden font-sans select-none relative justify-between">
      <NeonGlow top="10%" left="10%" color="bg-purple-700" scale={1.2} />
      <NeonGlow top="60%" left="70%" color="bg-cyan-700" scale={1.5} />
      <div className={`fixed inset-0 z-[50] pointer-events-none transition-colors duration-300 ${screenFlash}`}></div>

      {/* 頂部資訊列 (計時器與公杯) */}
      <div className="h-[40px] md:h-[50px] shrink-0 px-2 md:px-6 flex justify-between items-center text-sm md:text-base font-bold z-50 bg-black/50 border-b border-white/10 backdrop-blur-md">
        <div className={`flex items-center gap-2 ${timeLeft <= 300 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
          <span className="text-lg md:text-xl">⏱️</span>
          <span className="font-mono tracking-wider font-bold text-sm md:text-base">{isMinigameActive ? "⏸ 暫停中" : formatTime(timeLeft)}</span>
        </div>
        <div className="flex items-center gap-2 md:gap-3 text-amber-500 font-bold text-sm md:text-base">
          <span>🍺 公杯：{publicCup}/{maxCup}</span>
          <div className="w-20 md:w-32 h-2.5 md:h-3 bg-gray-900 rounded-full overflow-hidden relative shadow-[inset_0_0_10px_rgba(0,0,0,1)]">
            {publicCup > 0 && (
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-600 to-yellow-400 transition-all duration-500 ease-out shadow-[0_0_15px_#f59e0b]" style={{ width: `${(publicCup / maxCup) * 100}%` }}></div>
            )}
          </div>
        </div>
      </div>

      {/* 🚨 全域崩壞進度條 */}
      <div className="w-full px-2 md:px-6 pt-2 z-40 flex flex-col gap-1.5 shrink-0">
        <div className="w-full flex justify-between items-center px-1">
          <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">⚠️ 事件?</span>
          <span className="text-xs font-bold text-gray-400">{meltdownCount} / {MELTDOWN_MAX}</span>
        </div>
        <div className="w-full h-1.5 md:h-2 bg-gray-900 rounded-full border border-gray-800 overflow-hidden shadow-[inset_0_1px_5px_rgba(0,0,0,0.5)]">
          <div className={`h-full transition-all duration-500 ease-out ${meltdownCount >= MELTDOWN_MAX - 2 ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-yellow-500 to-orange-500'}`} style={{ width: `${(meltdownCount / MELTDOWN_MAX) * 100}%` }}></div>
        </div>
        
        {/* 活躍事件提示區 (附帶查看詳情小按鈕) */}
        {activeEvent && activeEvent.durationTurns > 0 && (
          <div className="w-full bg-red-950/60 border border-red-500/50 rounded-lg py-1 px-3 mt-1 flex justify-between items-center shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="text-[11px] md:text-xs font-black text-red-400 flex items-center gap-1.5 whitespace-nowrap">
                <span>{activeEvent.icon}</span>
                <span>{activeEvent.title} 生效中！</span>
              </span>
              <button 
                onClick={() => setActiveModal({ show: true, type: 'EVENT_DETAILS', space: null, customData: activeEvent })}
                className="bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-full w-5 h-5 flex items-center justify-center text-[10px] ml-1 shrink-0 border border-red-500/50 transition-colors"
                title="查看事件規則"
              >
                ❓
              </button>
            </div>
            <div className="text-[10px] font-bold text-red-200 shrink-0">剩餘 {Math.ceil(eventTurnsLeft / players.length)} 圈</div>
          </div>
        )}
      </div>

      {/* 玩家列表 (上) */}
      <div className="w-full flex justify-center items-center gap-1 md:gap-3 px-2 md:px-4 pt-1 md:pt-2 z-40 shrink-0 h-[60px] md:h-[70px]">
         {renderPlayerPanels(players.slice(0, Math.ceil(players.length / 2)))}
      </div>

      {/* 遊戲主要版圖區 */}
      <div className="flex-1 w-full flex items-center justify-center relative min-h-0 z-30 py-2">
         <div className="relative mx-auto transition-transform duration-700" style={{ width: 'min(100vw - 20px, 100dvh - 300px)', height: 'min(100vw - 20px, 100dvh - 300px)' }}>
            <div className="absolute inset-0 bg-[#000] rounded-xl md:rounded-[1.5rem] border-[3px] border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.3),inset_0_0_30px_rgba(0,0,0,0.8)]"></div>
            <div className="absolute inset-0 grid gap-[1px] md:gap-[2px] p-1.5 md:p-2 rounded-xl md:rounded-[1.5rem] bg-[#12081f]" style={{ gridTemplateColumns: '1.625fr repeat(9, 1fr) 1.625fr', gridTemplateRows: '1.625fr repeat(9, 1fr) 1.625fr' }}>
              {boardSpaces.map((space) => {
                const { gridPos, rotateDeg, barStyle, contentPadding } = getGridStyle(space.id);
                const isCorner = space.type?.includes('CORNER');
                const isProperty = space.type === 'PROPERTY'; 
                const ownerId = propertyOwnership[space.id]?.ownerId;
                const owner = players.find(p => p.id === ownerId);

                return (
                  <div key={space.id} style={{ ...gridPos, color: owner ? owner.hexColor : 'inherit' }} className={`relative flex items-center justify-center bg-[#1a0f2e] transition-all overflow-hidden ${isCorner ? 'rounded-lg' : ''} ${owner ? 'shadow-[inset_0_0_20px_currentColor]' : ''}`}>
                    {isProperty && (<div className={`absolute ${barStyle} ${owner ? '' : space.colorBg} shadow-[0_0_10px_currentColor]`} style={{ backgroundColor: owner ? owner.hexColor : '' }}></div>)}
                    <div className={`absolute inset-0 flex flex-col items-center justify-center ${isProperty ? contentPadding : ''}`}>
                      <div className="flex flex-col items-center justify-center w-max" style={{ transform: `rotate(${rotateDeg}deg)` }}>
                        {isProperty ? (
                          <img src={`https://flagcdn.com/w80/${space.code}.png`} className="w-5 md:w-6 lg:w-8 mb-0.5 md:mb-1 drop-shadow-md rounded-[2px]" alt={space.name} />
                        ) : (
                          <span className={`${isCorner ? 'text-2xl md:text-4xl' : 'text-xl md:text-3xl lg:text-4xl'} drop-shadow-md mb-0.5`}>{space.icon}</span>
                        )}
                        <span className={`text-[9px] md:text-[12px] lg:text-[14px] font-black text-center whitespace-pre-wrap ${isCorner ? 'text-yellow-400' : 'text-gray-300'}`}>
                          {cleanSpaceName(space.name)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="col-start-2 col-end-11 row-start-2 row-end-11 m-2 md:m-3 relative bg-black/60 backdrop-blur-md rounded-xl md:rounded-[1.5rem] border-2 border-white/10 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center p-2 z-30">
                <div className="w-full max-w-[250px] mx-auto bg-black/50 text-white text-xs md:text-sm font-bold text-center py-2 px-2 rounded-xl border border-purple-500/30 whitespace-pre-line h-12 flex items-center justify-center mb-4 md:mb-8">
                  {actionLog}
                </div>
                <button 
                  className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-4 flex items-center justify-center transition-all ${isProcessing || isRolling || movingPlayerId || activeModal.show || timeLeft <= 0 || turnPopup ? 'opacity-50 scale-95 border-gray-600 bg-gray-800 cursor-not-allowed' : 'border-purple-400 bg-gradient-to-br from-purple-600 to-[#120524] shadow-[0_0_50px_rgba(168,85,247,0.6)] hover:scale-105 active:scale-95 cursor-pointer'}`}
                  onClick={rollDice}
                  disabled={isProcessing || isRolling || movingPlayerId || activeModal.show || timeLeft <= 0 || turnPopup}
                >
                  <div className={isRolling ? 'animate-spin' : ''}>
                    {isRolling ? (
                      <span className="text-6xl md:text-7xl lg:text-[6rem] drop-shadow-lg pb-1">🎲</span>
                    ) : lastRoll !== null ? (
                      <span className="text-6xl md:text-7xl lg:text-[5rem] font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">{lastRoll}</span>
                    ) : (
                      <span className="text-6xl md:text-7xl lg:text-[6rem] drop-shadow-lg pb-1">🎲</span>
                    )}
                  </div>
                </button>
              </div>
            </div>
            {players.map((p, idx) => (
              <PlayerToken key={p.id} player={p} playerIdx={idx} isMoving={movingPlayerId === p.id} isCurrentTurn={currentTurnIndex === idx && !movingPlayerId} />
            ))}
         </div>
      </div>

      {/* 玩家列表 (下) */}
      <div className="w-full flex justify-center items-center gap-1 md:gap-3 px-2 md:px-4 pb-4 md:pb-6 z-40 shrink-0 h-[60px] md:h-[80px]">
         {renderPlayerPanels(players.slice(Math.ceil(players.length / 2)))}
      </div>

      {turnPopup && !isGameOver && currentPlayer && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 backdrop-blur-sm cursor-pointer" onClick={() => setTurnPopup(false)}>
          <div className="rounded-[2rem] px-10 py-6 flex flex-col items-center shadow-[0_0_40px_currentColor] animate-[popIn_0.3s_ease-out]" style={{ backgroundColor: currentPlayer.hexColor || '#333', color: '#ffffff' }}>
            <h2 className="text-[28px] md:text-4xl font-black tracking-widest drop-shadow-md">輪到 {currentPlayer.name} 的回合</h2>
            <p className="text-white/70 text-sm mt-2 font-bold tracking-widest">( 點擊螢幕任意處跳過 )</p>
          </div>
        </div>
      )}

      {/* 常規事件 Modal */}
      {activeModal.show && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#120512] border-2 border-purple-500/50 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.3)] flex flex-col items-center text-center p-6 md:p-8 animate-[fadeIn_0.2s_ease-out]">
            {activeModal.type !== 'GAME_OVER' && activeModal.type !== 'PROMO_BLOCK' && activeModal.type !== 'EVENT_DETAILS' && currentPlayer && (
              <div className="absolute -top-4 bg-black border border-gray-600 text-gray-300 px-4 py-1 rounded-full text-xs md:text-sm font-bold shadow-md">
                {currentPlayer.name} 的指令
              </div>
            )}
            {renderModalContent()}
          </div>
        </div>
      )}

      {/* 💥 PRO 專屬全域事件 Modal */}
      {showEventModal && previewEvent && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-b from-red-950 to-black border-2 border-red-500 w-full max-w-md rounded-3xl p-8 flex flex-col items-center text-center shadow-[0_0_50px_rgba(239,68,68,0.4)] animate-[wiggle_0.3s_ease-in-out_infinite]">
            <div className="text-6xl mb-4 animate-bounce">{previewEvent.icon}</div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-400 mb-2">全域災難爆發！</h2>
            <h3 className="text-2xl font-bold text-white mb-4">{previewEvent.title}</h3>
            <p className="text-gray-300 font-bold mb-8 leading-relaxed whitespace-pre-line bg-red-950/40 p-3 rounded-xl border border-red-500/30">
              {previewEvent.desc}
            </p>
            <button onClick={closeEvent} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-lg transition-colors">🔥 接受命運</button>
          </div>
        </div>
      )}

      {/* 💸 免費版逼課攔截 Modal */}
      {showFomoModal && previewEvent && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
          <div className="bg-gradient-to-b from-yellow-950/80 to-[#07020d] border border-yellow-500/50 w-full max-w-md rounded-3xl p-8 flex flex-col items-center text-center shadow-[0_0_50px_rgba(234,179,8,0.2)]">
            <span className="text-5xl mb-4">⚠️</span>
            <h2 className="text-2xl font-black text-red-400 mb-2">全域事件到達！</h2>
            <p className="text-gray-400 text-sm font-bold mb-6">系統原定觸發災難事件，但您目前處於免費試玩模式。</p>
            
            <div className="w-full bg-black/60 border border-gray-700 rounded-xl p-4 mb-8 opacity-60">
              <div className="text-2xl grayscale mb-2">{previewEvent.icon}</div>
              <h3 className="text-lg font-black text-gray-500 mb-1">即將觸發：{previewEvent.title}...</h3>
              <p className="text-xs text-gray-600 line-clamp-2">{previewEvent.desc}</p>
              <div className="mt-3 text-red-500/80 text-xs font-black uppercase">[ 🔒 PRO VERSION REQUIRED ]</div>
            </div>

            <a href="https://buymeacoffee.com/thomas0982/e/584709" className="bg-gradient-to-r from-yellow-500 via-orange-400 to-yellow-500 text-black font-black text-lg px-6 py-4 rounded-2xl w-full mb-4 flex items-center justify-center transition-transform hover:scale-105">
              💳 支付 HK$40 解鎖 PRO
            </a>
            <button onClick={closeFomoAndSkip} className="text-gray-500 hover:text-gray-400 text-sm font-bold underline underline-offset-4">
              無奈跳過，繼續平淡的遊戲
            </button>
          </div>
        </div>
      )}

    </div>
  );
}