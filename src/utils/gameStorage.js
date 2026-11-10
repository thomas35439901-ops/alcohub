const STORAGE_KEY = 'alcohub_saved_game_v1';
const UPGRADE_FLAG_KEY = 'alcohub_pending_upgrade';

// 1. 儲存當前牌局狀態（合併外層設定與棋盤內進度）
export function saveGameSnapshot(snapshot) {
  try {
    const existing = loadGameSnapshot() || {};
    const merged = {
      ...existing,
      ...snapshot,
      savedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (err) {
    console.error('儲存牌局進度失敗:', err);
  }
}

// 2. 讀取已儲存的牌局（超過 12 小時的舊局自動清除）
export function loadGameSnapshot() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const TWELVE_HOURS = 12 * 60 * 60 * 1000;
    if (data.savedAt && Date.now() - data.savedAt > TWELVE_HOURS) {
      clearGameSnapshot();
      return null;
    }
    return data;
  } catch (err) {
    console.error('讀取牌局進度失敗:', err);
    return null;
  }
}

// 3. 標記玩家正準備跳轉至 Stripe 付款升級
export function markPendingUpgrade() {
  try {
    localStorage.setItem(UPGRADE_FLAG_KEY, 'true');
  } catch (err) {
    console.error('標記升級狀態失敗:', err);
  }
}

// 4. 檢查並消費升級成功狀態，自動為試玩結束的牌局補上 30 分鐘
export function consumeUpgradeBonus() {
  try {
    const isPending = localStorage.getItem(UPGRADE_FLAG_KEY) === 'true';
    const urlParams = new URLSearchParams(window.location.search);
    const isPaymentSuccess = urlParams.get('payment') === 'success';

    if (isPending || isPaymentSuccess) {
      localStorage.removeItem(UPGRADE_FLAG_KEY);
      const snapshot = loadGameSnapshot();
      if (snapshot) {
        const currentLeft = typeof snapshot.timeLeft === 'number' ? snapshot.timeLeft : 0;
        // 若試玩時間已耗盡或快結束，直接補上 30 分鐘（1800 秒）
        const upgradedTimeLeft = currentLeft <= 60 ? currentLeft + 30 * 60 : currentLeft + 20 * 60;

        saveGameSnapshot({
          ...snapshot,
          duration: Math.max(snapshot.duration || 10, 30),
          timeLeft: upgradedTimeLeft,
          justUpgraded: true,
        });
      }
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

// 5. 清除牌局存檔（正常結束遊戲或點擊「重新開局」時呼叫）
export function clearGameSnapshot() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(UPGRADE_FLAG_KEY);
  } catch (err) {
    console.error('清除牌局進度失敗:', err);
  }
}