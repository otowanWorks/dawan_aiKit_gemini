// ===== 音のオン/オフ設定 =====
const SOUND_SETTINGS = {
    sendSound: true,    // 送信音（ポン）のオン/オフ
    typeSound: false,   // タイプライター音のオン/オフ
};
// ============================

// Web Audio API による効果音
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// タイプライター音（1文字ごと）
function playTypeSound() {
    if (!SOUND_SETTINGS.typeSound) return;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(900, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(700, audioCtx.currentTime + 0.04);

    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.05);
}

// 送信音（ポン）
function playSendSound() {
    if (!SOUND_SETTINGS.sendSound) return;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.15);
}
