// ============================================
// ЭЛЕМЕНТЫ
// ============================================
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let width, height;
let snowflakes = [];

const audioHands = document.getElementById('audio-hands');
const audioOst = document.getElementById('audio-ost');
const audioKris = document.getElementById('audio-kris');
const audioFrisk = document.getElementById('audio-frisk');

const menuBackground = document.getElementById('menu-background');
const menuTrees = document.getElementById('menu-trees');
const menuBox = document.getElementById('menu-box');
const secretBox = document.getElementById('secret-box');
const gifBackground = document.getElementById('gif-background');
const overlayDark = document.getElementById('overlay-dark');
const returnHint = document.getElementById('return-hint');
const creamWindow = document.getElementById('cream-window');
const creamWindowLong = document.getElementById('cream-window-long');
const heartClick = document.getElementById('heart-click');
const krisNameClick = document.getElementById('kris-name-click');
const krisPopup = document.getElementById('kris-popup');
const krisResetButton = document.getElementById('kris-reset-button');
const volumeSlider = document.getElementById('volume-slider');
const volumeIcon = document.getElementById('volume-icon');
const questionLink = document.getElementById('question-link');
const questionsWindow = document.getElementById('questions-window');
const questionsList = document.querySelectorAll('.questions-list li');
const answerWindow = document.getElementById('answer-window');
const answerText = document.getElementById('answer-text');
const answerImage = document.getElementById('answer-image');
const answerImageContainer = document.querySelector('.answer-image-container');

// ============================================
// СОСТОЯНИЯ
// ============================================
let isMysteryAudioPlaying = false;
let isSecretShown = false;
let isGifShown = false;
let isLongWindowShown = false;
let isKrisPopupShown = false;
let isQuestionsShown = false;
let isAnswerShown = false;
let isFriskMusicPlaying = false;
let audioUnlocked = false;
let currentVolume = 0.5;
let questionIndex = 0;
let glitchInterval = null;
let currentSecretVariant = 'normal';

// ============================================
// ГРОМКОСТЬ
// ============================================
function setVolume(value) {
    currentVolume = value;
    audioFrisk.volume = value;
    audioKris.volume = value;
    audioHands.volume = value;
    audioOst.volume = value;
    if (value === 0) { volumeIcon.classList.add('muted'); }
    else { volumeIcon.classList.remove('muted'); }
}
volumeSlider.addEventListener('input', () => setVolume(volumeSlider.value / 100));
volumeIcon.addEventListener('click', () => {
    if (currentVolume > 0) { volumeSlider.value = 0; setVolume(0); }
    else { volumeSlider.value = 50; setVolume(0.5); }
});
setVolume(0.5);

// ============================================
// РАЗБЛОКИРОВКА АУДИО
// ============================================
function unlockAudio() {
    if (!audioUnlocked) {
        [audioHands, audioOst, audioKris, audioFrisk].forEach(a => {
            a.play().then(() => { a.pause(); a.currentTime = 0; }).catch(() => {});
        });
        audioUnlocked = true;
    }
}
document.addEventListener('click', unlockAudio, { once: true });
document.addEventListener('keydown', unlockAudio, { once: true });

// ============================================
// МУЗЫКА ФРИСК
// ============================================
function startFriskMusic() {
    if (!isFriskMusicPlaying && isGifShown) {
        audioFrisk.currentTime = 0;
        audioFrisk.volume = currentVolume;
        audioFrisk.play().catch(() => {});
        isFriskMusicPlaying = true;
    }
}
function pauseFriskMusic() { if (isFriskMusicPlaying) { audioFrisk.pause(); isFriskMusicPlaying = false; } }
function resumeFriskMusic() {
    if (!isFriskMusicPlaying && isGifShown && !isKrisPopupShown) {
        audioFrisk.volume = currentVolume;
        audioFrisk.play().catch(() => {});
        isFriskMusicPlaying = true;
    }
}
function stopFriskMusic() { audioFrisk.pause(); audioFrisk.currentTime = 0; isFriskMusicPlaying = false; }

// ============================================
// КЛИК НА СЕРДЕЧКО
// ============================================
heartClick.addEventListener('click', (e) => {
    e.stopPropagation(); e.preventDefault();
    if (isLongWindowShown || isKrisPopupShown) return;
    creamWindow.classList.remove('visible'); creamWindow.classList.add('fading');
    setTimeout(() => {
        creamWindowLong.classList.add('visible'); creamWindowLong.classList.remove('fading');
        isLongWindowShown = true;
    }, 500);
});

// ============================================
// КЛИК НА "КРИС"
// ============================================
krisNameClick.addEventListener('click', (e) => {
    e.stopPropagation(); e.preventDefault();
    if (isKrisPopupShown) return;
    pauseFriskMusic();
    overlayDark.classList.add('active');
    setTimeout(() => { krisPopup.classList.add('active'); isKrisPopupShown = true; }, 100);
    audioKris.currentTime = 0; audioKris.volume = currentVolume;
    audioKris.play().catch(() => {});
});

// ============================================
// КЛИК НА "[ Задать вопрос... ]"
// ============================================
questionLink.addEventListener('click', (e) => {
    e.stopPropagation(); e.preventDefault();
    if (isQuestionsShown || isAnswerShown) return;
    creamWindowLong.classList.remove('visible'); creamWindowLong.classList.add('fading');
    isLongWindowShown = false;
    setTimeout(() => {
        questionsWindow.classList.add('visible'); questionsWindow.classList.remove('fading');
        isQuestionsShown = true;
        questionIndex = 0;
        updateQuestionSelection();
    }, 500);
});

function updateQuestionSelection() {
    questionsList.forEach((li, i) => { li.classList.toggle('selected', i === questionIndex); });
}

// ============================================
// КНОПКА СБРОС (Крис)
// ============================================
krisResetButton.addEventListener('click', hideKrisPopup);
function hideKrisPopup() {
    krisPopup.classList.remove('active'); overlayDark.classList.remove('active');
    isKrisPopupShown = false; audioKris.pause(); audioKris.currentTime = 0;
    resumeFriskMusic();
}

// ============================================
// ВОЗВРАТ К ПЕРВОМУ ОКНУ
// ============================================
function backToFirstWindow() {
    if (isLongWindowShown) {
        creamWindowLong.classList.remove('visible'); creamWindowLong.classList.add('fading');
        setTimeout(() => { creamWindow.classList.add('visible'); creamWindow.classList.remove('fading'); isLongWindowShown = false; }, 500);
    }
}

// ============================================
// ОКНО ОТВЕТА (картинки для вопросов №1, №2, №3, №4)
// ============================================
function showAnswer(qNum) {
    if (isAnswerShown) return;
    
    questionsWindow.classList.remove('visible');
    questionsWindow.classList.add('fading');
    isQuestionsShown = false;
    
    if (answers[qNum]) {
        answerText.textContent = answers[qNum];
    }
    
    const images = {
        1: 'https://litter.catbox.moe/dj1wrxf2dq5crwfk.jpg',
        2: 'https://litter.catbox.moe/sob9v51fp9j28lok.webp',
        3: 'https://litter.catbox.moe/j84za9p8zgmw17a4.jpg',
        4: 'https://litter.catbox.moe/mnek5sxcnhmu7hdd.gif',
    };
    
    answerWindow.classList.remove('cave-mode', 'pie-mode');
    answerText.style.color = '#5c4033';
    answerText.style.textShadow = 'none';
    
    if (qNum === 3) {
        answerWindow.classList.add('pie-mode');
        answerText.style.color = '#d5e0f0';
        answerText.style.textShadow = '0 0 6px rgba(100, 150, 255, 0.3)';
    }
    
    if (qNum === 4) {
        answerWindow.classList.add('cave-mode');
        answerText.style.color = '#e8d5a3';
        answerText.style.textShadow = '0 0 8px rgba(255, 200, 50, 0.4)';
    }
    
    if (images[qNum]) {
        answerImage.src = images[qNum];
        answerImage.style.display = 'block';
        if (answerImageContainer) answerImageContainer.style.display = 'block';
    } else {
        answerImage.style.display = 'none';
        if (answerImageContainer) answerImageContainer.style.display = 'none';
    }
    
    setTimeout(() => {
        const inner = document.querySelector('.answer-inner');
        const text = document.querySelector('.answer-text');
        
        if (inner) { inner.style.animation = 'none'; inner.offsetHeight; inner.style.animation = 'fadeInContent 0.7s ease-out 0.2s both'; }
        if (images[qNum] && answerImage) { answerImage.style.animation = 'none'; answerImage.offsetHeight; answerImage.style.animation = 'fadeInImage 0.8s ease-out 0.3s both'; }
        if (text) { text.style.animation = 'none'; text.offsetHeight; text.style.animation = 'fadeInText 0.6s ease-out 0.5s both'; }
        
        answerWindow.classList.add('active');
        answerWindow.classList.remove('fading');
        isAnswerShown = true;
    }, 350);
}

function hideAnswer() {
    if (!isAnswerShown) return;
    
    answerWindow.classList.remove('active');
    answerWindow.classList.add('fading');
    answerWindow.classList.remove('cave-mode', 'pie-mode');
    answerText.style.color = '#5c4033';
    answerText.style.textShadow = 'none';
    isAnswerShown = false;
    
    setTimeout(() => {
        questionsWindow.classList.add('visible');
        questionsWindow.classList.remove('fading');
        isQuestionsShown = true;
    }, 300);
}

function backFromQuestions() {
    if (isAnswerShown) { hideAnswer(); return; }
    if (isQuestionsShown) {
        questionsWindow.classList.remove('visible'); questionsWindow.classList.add('fading');
        setTimeout(() => { 
            creamWindowLong.classList.add('visible'); creamWindowLong.classList.remove('fading'); 
            isLongWindowShown = true; isQuestionsShown = false; 
        }, 500);
    }
}

// ============================================
// ВАРИАЦИИ СЕКРЕТНОГО ПОСЛАНИЯ (???) 
// ============================================
function getRandomSecretVariant() { return Math.random() < 0.06 ? 'follow6' : 'normal'; }

function applySecretVariant(variant) {
    const title = document.querySelector('.secret-title');
    const text = document.querySelector('.secret-text');
    const subtitle = document.querySelector('.secret-subtitle');
    const box = document.getElementById('secret-box');
    if (!title || !text || !subtitle || !box) return;
    
    if (variant === 'follow6') {
        title.innerHTML = '⠠⠑⠗⠗⠕⠗ ⠼⠑⠛';
        title.style.color = '#ff3333'; title.style.animation = 'glitch-text 0.15s infinite';
        title.style.fontSize = '22px'; title.style.letterSpacing = '6px';
        text.innerHTML = `⠺⠁⠗⠝⠊⠝⠛: ⠙⠁⠞⠁ ⠉⠕⠗⠗⠥⠏⠞⠑⠙<br><span style="font-size:14px;color:#f44;">[DATA CORRUPTED]<br>[DATA CORRUPTED]<br>[DATA CORRUPTED]</span><br><span style="font-size:11px;color:#666;">⠞⠗⠁⠉⠑ ⠗⠑⠉⠕⠗⠙⠑⠙...<br>⠎⠽⠎⠞⠑⠍ ⠋⠁⠊⠇⠥⠗⠑...</span><br><br><span style="font-size:20px;color:#fff;text-shadow:3px 0 5px rgba(255,0,0,0.9),-3px 0 5px rgba(0,150,255,0.9),0 0 20px rgba(255,255,255,0.7);animation:glitch-text 0.2s infinite;letter-spacing:4px;">F̷O̷L̷L̷O̷W̷ ̷6̷</span>`;
        subtitle.innerHTML = '* ⠞⠓⠑ ⠧⠕⠊⠙ ⠉⠁⠇⠇⠎';
        subtitle.style.color = '#ff4444'; subtitle.style.animation = 'glitch-text 0.2s infinite';
        box.style.border = '2px solid rgba(255,0,0,0.6)';
        box.style.boxShadow = '0 0 40px rgba(255,0,0,0.4), 0 0 80px rgba(0,0,255,0.2), inset 0 0 30px rgba(255,0,0,0.2)';
        box.style.animation = 'vhs-shake 0.2s infinite ease-in-out';
        const scanlines = document.querySelector('.secret-scanlines');
        if (scanlines) scanlines.style.background = 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,0,0,0.15) 2px,rgba(255,0,0,0.15) 4px)';
    } else {
        title.innerHTML = '⠠⠵⠁⠏⠊⠎⠼ ⠼⠑⠛';
        title.style.color = '#ddd'; title.style.animation = '';
        title.style.fontSize = '26px'; title.style.letterSpacing = '3px';
        text.innerHTML = `⠶⠞⠓⠗⠑⠑ ⠓⠑⠗⠕⠑⠎ ⠁⠏⠏⠑⠁⠗⠑⠙<br>⠞⠕ ⠃⠁⠝⠊⠎⠓ ⠞⠓⠑ ⠁⠝⠛⠑⠇⠎ ⠓⠑⠁⠧⠑⠝⠶<br><br><span style="font-size:13px;color:#888;">⠞⠗⠕⠑ ⠛⠑⠗⠕⠑⠧ ⠫⠧⠊⠇⠊⠎⠼<br>⠟⠞⠕⠃⠮ ⠊⠵⠛⠝⠁⠞⠼ ⠝⠑⠃⠑⠎⠁ ⠁⠝⠛⠑⠇⠁</span>`;
        subtitle.innerHTML = '* ⠞⠓⠑ ⠎⠓⠁⠙⠕⠺⠎ ⠉⠥⠞⠞⠊⠝⠛ ⠙⠑⠑⠏⠑⠗';
        subtitle.style.color = '#777'; subtitle.style.animation = '';
        box.style.border = '2px solid rgba(255,255,255,0.4)';
        box.style.boxShadow = '0 0 40px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,0,0,0.5)';
        box.style.animation = 'vhs-shake 0.4s infinite ease-in-out';
        const scanlines = document.querySelector('.secret-scanlines');
        if (scanlines) scanlines.style.background = 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.2) 3px,rgba(0,0,0,0.2) 6px)';
    }
    currentSecretVariant = variant;
}

// ============================================
// СЛУЧАЙНЫЕ VHS-ГЛЮКИ
// ============================================
function startSecretGlitches() {
    if (glitchInterval) clearInterval(glitchInterval);
    glitchInterval = setInterval(() => {
        if (!isSecretShown) return;
        const box = document.getElementById('secret-box');
        const inner = document.querySelector('.secret-inner');
        if (!box || !inner) return;
        const glitchType = Math.floor(Math.random() * 5);
        switch(glitchType) {
            case 0: box.style.transform = `translate(calc(-50% + ${Math.random()*20-10}px), calc(-50% + ${Math.random()*15-7}px))`; box.style.transition = 'transform 0.08s ease-out'; setTimeout(() => { if (box) box.style.transform = 'translate(-50%,-50%)'; }, 80); break;
            case 1: const textEls = document.querySelectorAll('.secret-title,.secret-text,.secret-subtitle'); textEls.forEach(el => { el.style.textShadow = `${Math.random()*8-4}px ${Math.random()*4-2}px 3px rgba(255,0,0,0.9), ${Math.random()*-8+4}px ${Math.random()*-4+2}px 3px rgba(0,150,255,0.9)`; }); setTimeout(() => { textEls.forEach(el => { el.style.textShadow = currentSecretVariant === 'follow6' ? '3px 0 5px rgba(255,0,0,0.9),-3px 0 5px rgba(0,150,255,0.9),0 0 20px rgba(255,255,255,0.7)' : '1px 0 2px rgba(255,0,0,0.4),-1px 0 2px rgba(0,200,255,0.4),0 0 5px rgba(255,255,255,0.3)'; }); }, 150); break;
            case 2: const flash = document.createElement('div'); flash.style.cssText = `position:absolute;top:0;left:0;right:0;bottom:0;background:repeating-linear-gradient(0deg,transparent,transparent ${Math.random()*4+1}px,rgba(255,255,255,${Math.random()*0.3+0.1}) ${Math.random()*2+1}px,rgba(255,255,255,${Math.random()*0.3+0.1}) ${Math.random()*4+2}px);pointer-events:none;z-index:10;opacity:0.8;`; inner.appendChild(flash); setTimeout(() => { if (flash.parentNode) flash.remove(); }, 200+Math.random()*300); break;
            case 3: const allText = document.querySelectorAll('.secret-title,.secret-text,.secret-subtitle,.secret-hint'); allText.forEach(el => { el.style.transform = `translate(${Math.random()*6-3}px,${Math.random()*4-2}px)`; el.style.transition = 'transform 0.05s'; }); setTimeout(() => { allText.forEach(el => { el.style.transform = 'translate(0,0)'; }); }, 100); break;
            case 4: inner.style.filter = `hue-rotate(${Math.random()*60-30}deg) saturate(${Math.random()*2+1})`; inner.style.transition = 'filter 0.2s ease-out'; setTimeout(() => { if (inner) inner.style.filter = 'none'; }, 200); break;
        }
    }, 10000 + Math.random() * 10000);
}
function stopSecretGlitches() { if (glitchInterval) { clearInterval(glitchInterval); glitchInterval = null; } }

// ============================================
// СЕКРЕТНОЕ ПОСЛАНИЕ
// ============================================
function showSecretMessage() { menuBox.classList.add('hidden'); secretBox.classList.add('visible'); secretBox.style.display = 'block'; isSecretShown = true; applySecretVariant(getRandomSecretVariant()); startSecretGlitches(); setTimeout(() => playMysteryAudio(), 100); }
function hideSecretMessage() { stopSecretGlitches(); secretBox.classList.add('fade-out'); setTimeout(() => { secretBox.style.display = 'none'; secretBox.classList.remove('fade-out','visible'); secretBox.style.transform = 'translate(-50%,-50%)'; secretBox.style.border = '2px solid rgba(255,255,255,0.4)'; secretBox.style.boxShadow = '0 0 40px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,0,0,0.5)'; secretBox.style.animation = 'vhs-shake 0.4s infinite ease-in-out'; const inner = document.querySelector('.secret-inner'); if (inner) inner.style.filter = 'none'; const scanlines = document.querySelector('.secret-scanlines'); if (scanlines) scanlines.style.background = 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.2) 3px,rgba(0,0,0,0.2) 6px)'; }, 300); menuBox.classList.remove('hidden'); stopMysteryAudio(); isSecretShown = false; }

// ============================================
// СНЕЖИНКИ (МЕДЛЕННЫЕ)
// ============================================
class Snowflake {
    constructor() { this.reset(true); }
    reset(randomY = false) {
        this.x = Math.random() * width;
        this.y = randomY ? Math.random() * height : -10 - Math.random() * 20;
        this.size = Math.floor(Math.random() * 4) + 2;
        this.speed = Math.random() * 0.35 + 0.15;
        this.drift = Math.random() * 0.3 - 0.15;
        this.driftAngle = Math.random() * Math.PI * 2;
        this.opacity = Math.random() * 0.7 + 0.3;
        this.color = `rgba(180,220,255,${this.opacity})`;
    }
    update() {
        this.driftAngle += 0.005;
        this.x += Math.sin(this.driftAngle) * this.drift;
        this.y += this.speed;
        if (this.y > height + 10 || this.x < -10 || this.x > width + 10) this.reset(false);
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.size, this.size);
        if (this.size > 3) {
            ctx.fillStyle = `rgba(200,230,255,${this.opacity * 0.3})`;
            ctx.fillRect(Math.floor(this.x - 1), Math.floor(this.y - 1), this.size + 2, this.size + 2);
        }
    }
}

function init() { resizeCanvas(); snowflakes = []; for (let i = 0; i < 150; i++) snowflakes.push(new Snowflake()); }
function resizeCanvas() { width = window.innerWidth; height = window.innerHeight; canvas.width = width; canvas.height = height; }
function animate() { ctx.clearRect(0, 0, width, height); snowflakes.forEach(f => { f.update(); f.draw(ctx); }); drawVignette(); requestAnimationFrame(animate); }
function drawVignette() { const g = ctx.createRadialGradient(width/2, height/2, width*0.4, width/2, height/2, width*0.8); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.5)'); ctx.fillStyle = g; ctx.fillRect(0, 0, width, height); }
window.addEventListener('resize', resizeCanvas);

// ============================================
// АУДИО ДЛЯ ???
// ============================================
function playMysteryAudio() { if (isMysteryAudioPlaying) stopMysteryAudio(); audioHands.currentTime = 0; audioOst.currentTime = 0; audioHands.volume = currentVolume; audioOst.volume = currentVolume; audioHands.play().catch(() => {}); audioOst.play().catch(() => {}); isMysteryAudioPlaying = true; }
function stopMysteryAudio() { audioHands.pause(); audioOst.pause(); audioHands.currentTime = 0; audioOst.currentTime = 0; isMysteryAudioPlaying = false; }

// ============================================
// GIF-ФОН (ФРИСК)
// ============================================
function showGifBackground() {
    stopMysteryAudio(); hideSecretMessage(); overlayDark.classList.remove('active'); hideKrisPopup();
    overlayDark.classList.add('active'); isLongWindowShown = false; isQuestionsShown = false; isAnswerShown = false;
    creamWindowLong.classList.remove('visible'); creamWindowLong.classList.add('fading');
    questionsWindow.classList.remove('visible'); questionsWindow.classList.add('fading');
    answerWindow.classList.remove('active'); answerWindow.classList.add('fading');
    answerWindow.classList.remove('cave-mode', 'pie-mode');
    menuBackground.classList.add('fade-out');
    menuTrees.classList.add('fade-out');
    setTimeout(() => { canvas.classList.add('fade-out'); menuBox.classList.add('hidden'); gifBackground.classList.add('active'); creamWindow.classList.add('visible'); creamWindow.classList.remove('fading'); isGifShown = true; startFriskMusic(); setTimeout(() => overlayDark.classList.remove('active'), 500); }, 800);
    returnHint.classList.add('active');
}
function hideGifBackground() {
    stopFriskMusic(); isGifShown = false;
    creamWindow.classList.remove('visible'); creamWindow.classList.add('fading');
    creamWindowLong.classList.remove('visible'); creamWindowLong.classList.add('fading');
    questionsWindow.classList.remove('visible'); questionsWindow.classList.add('fading');
    answerWindow.classList.remove('active'); answerWindow.classList.add('fading');
    answerWindow.classList.remove('cave-mode', 'pie-mode');
    isLongWindowShown = false; isQuestionsShown = false; isAnswerShown = false; hideKrisPopup();
    menuBackground.classList.remove('fade-out');
    menuTrees.classList.remove('fade-out');
    setTimeout(() => { overlayDark.classList.add('active'); setTimeout(() => { gifBackground.classList.remove('active'); canvas.classList.remove('fade-out'); menuBox.classList.remove('hidden'); setTimeout(() => overlayDark.classList.remove('active'), 500); }, 300); }, 200);
    returnHint.classList.remove('active');
}
function returnToMenu() { if (isSecretShown) hideSecretMessage(); if (isGifShown) hideGifBackground(); }

// ============================================
// ЗВУКИ МЕНЮ
// ============================================
const menuItems = document.querySelectorAll('.menu-item');
let currentIndex = 0;
function playSelectSound() { try { const a = new (window.AudioContext||window.webkitAudioContext)(); const o = a.createOscillator(); const g = a.createGain(); o.connect(g); g.connect(a.destination); o.type = 'square'; o.frequency.setValueAtTime(800, a.currentTime); o.frequency.setValueAtTime(1000, a.currentTime+0.05); g.gain.setValueAtTime(0.1*currentVolume, a.currentTime); g.gain.exponentialRampToValueAtTime(0.01, a.currentTime+0.1); o.start(a.currentTime); o.stop(a.currentTime+0.1); } catch(e){} }
function playConfirmSound() { try { const a = new (window.AudioContext||window.webkitAudioContext)(); const o = a.createOscillator(); const g = a.createGain(); o.connect(g); g.connect(a.destination); o.type = 'square'; o.frequency.setValueAtTime(600, a.currentTime); o.frequency.setValueAtTime(1200, a.currentTime+0.08); g.gain.setValueAtTime(0.1*currentVolume, a.currentTime); g.gain.exponentialRampToValueAtTime(0.01, a.currentTime+0.15); o.start(a.currentTime); o.stop(a.currentTime+0.15); } catch(e){} }

// ============================================
// ОТВЕТЫ НА ВОПРОСЫ
// ============================================
const answers = {
    1: `* (Фриск смотрит вниз)\n* ...\n* Нет.\n* Золотые цветы мягкие.\n* Они... спасли меня.\n* Хотя...\n* Когда я падала...\n* Мне показалось...\n* Что кто-то говорил со мной.\n* Во тьме.\n* Перед тем, как я упала.\n* Голос...\n* Он звучал так, будто\n* доносился из ниоткуда.\n* И из везде.\n* Он сказал что-то...\n* Но я не помню слов.\n* Только...\n* "Интересно..."\n* Или...\n* "Очень, очень интересно."\n* А потом тишина.\n* И золотые цветы.`,
    2: '* ...\n* Зачем говорить?\n* Действия громче слов.',
    3: '* (Глаза слегка блестят)\n* Ирисковый.\n* Но коричный напоминает\n* о доме.',
    4: `* ...\n* Я чувствую...\n* Что всё будет хорошо.\n* Даже если это не так.\n* Когда я касаюсь звезды...\n* Время замирает.\n* И я слышу...\n* Нет.\n* Чувствую.\n* Что кто-то... наблюдает.\n* Не враг.\n* Просто... наблюдает.\n* Как учёный.\n* Или как тот...\n* Кто хочет понять.\n* Интересно...`,
    5: '* (Фриск прячет взгляд)\n* Это секрет.\n* Но палки очень важны.\n* Даже легендарные.',
    6: '* (Лёгкая улыбка)\n* Да.\n* Но иногда они смешные.\n* Иногда.',
    7: '* ...\n* Нет.\n* Там красиво.\n* И светлячки помогают\n* не сбиться с пути.',
    8: '* ...\n* "Человек" — это нормально.\n* Я знаю, кто я.\n* Разве этого мало?',
    9: '* ...\n* Нет.\n* Каждый заслуживает шанс.\n* Даже если это трудно.',
    10: `* (Долгая пауза)\n* Я улыбнусь.\n* А потом...\n* Пойду дальше.\n* Но...\n* Иногда я думаю...\n* О том, кто был там.\n* Во тьме.\n* До падения.\n* Кто говорил.\n* И куда он ушёл.\n* Может быть...\n* Я ещё встречу его.\n* Когда-нибудь.\n* Когда эксперимент...\n* Закончится.`
};

// ============================================
// КЛАВИАТУРА (исправленный ESC)
// ============================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        e.preventDefault();
        if (isKrisPopupShown) { hideKrisPopup(); return; }
        if (isAnswerShown) { hideAnswer(); return; }
        if (isQuestionsShown) { backFromQuestions(); return; }
        if (isLongWindowShown) { backToFirstWindow(); return; }
        if (isGifShown || isSecretShown) { returnToMenu(); return; }
        return;
    }
    
    if (isAnswerShown) { if (e.key==='z'||e.key==='Z'||e.key==='Enter') { e.preventDefault(); hideAnswer(); } return; }
    if (isQuestionsShown) { if (e.key==='ArrowUp'||e.key==='ArrowDown') { e.preventDefault(); questionIndex = e.key==='ArrowUp'?(questionIndex-1+questionsList.length)%questionsList.length:(questionIndex+1)%questionsList.length; updateQuestionSelection(); playSelectSound(); } if (e.key==='z'||e.key==='Z'||e.key==='Enter') { e.preventDefault(); playConfirmSound(); showAnswer(questionIndex+1); } return; }
    if (isSecretShown||isGifShown||isKrisPopupShown) return;
    if (e.key==='ArrowUp'||e.key==='ArrowDown') { e.preventDefault(); menuItems[currentIndex].classList.remove('selected'); currentIndex = e.key==='ArrowUp'?(currentIndex-1+menuItems.length)%menuItems.length:(currentIndex+1)%menuItems.length; menuItems[currentIndex].classList.add('selected'); playSelectSound(); }
    if (e.key==='z'||e.key==='Z'||e.key==='Enter') { e.preventDefault(); const name = menuItems[currentIndex].getAttribute('data-name'); playConfirmSound(); if (name==='frisk') showGifBackground(); else if (name==='chara') { stopMysteryAudio(); setTimeout(()=>alert('* Чара.\n* Тьма внутри тебя растёт...'),200); } else showSecretMessage(); }
});

// ============================================
// МЫШЬ
// ============================================
menuItems.forEach((item, index) => { item.addEventListener('mouseenter', ()=>{ if(isSecretShown||isGifShown)return; menuItems[currentIndex].classList.remove('selected'); currentIndex=index; menuItems[currentIndex].classList.add('selected'); playSelectSound(); }); item.addEventListener('click', ()=>{ if(isSecretShown||isGifShown)return; const name=item.getAttribute('data-name'); playConfirmSound(); if(name==='frisk')showGifBackground(); else if(name==='chara'){stopMysteryAudio();setTimeout(()=>alert('* Чара.\n* Тьма внутри тебя растёт...'),200);}else showSecretMessage(); }); });
questionsList.forEach((li, index) => { li.addEventListener('mouseenter', ()=>{ if(isAnswerShown)return; questionIndex=index; updateQuestionSelection(); playSelectSound(); }); li.addEventListener('click', ()=>{ if(isAnswerShown)return; playConfirmSound(); showAnswer(index+1); }); });

// ============================================
// РАЗБЛОКИРОВКА АУДИО
// ============================================
function unlockAudio() {
    if (!audioUnlocked) {
        // Принудительная разблокировка через Web Audio API
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            const audioCtx = new AudioContext();
            const buffer = audioCtx.createBuffer(1, 1, 22050);
            const source = audioCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(audioCtx.destination);
            source.start(0);
            audioCtx.resume();
        }
        
        [audioHands, audioOst, audioKris, audioFrisk].forEach(a => {
            a.load();
            a.play().then(() => { a.pause(); a.currentTime = 0; }).catch(() => {});
        });
        
        audioUnlocked = true;
        console.log('Аудио разблокировано');
    }
}

// Разблокируем при ЛЮБОМ взаимодействии
document.addEventListener('click', unlockAudio);
document.addEventListener('keydown', unlockAudio);
document.addEventListener('touchstart', unlockAudio);

// ============================================
// АУДИО ДЛЯ ???
// ============================================
function playMysteryAudio() {
    if (isMysteryAudioPlaying) stopMysteryAudio();
    
    audioHands.volume = currentVolume;
    audioOst.volume = currentVolume;
    audioHands.currentTime = 0;
    audioOst.currentTime = 0;
    
    const playPromise1 = audioHands.play();
    const playPromise2 = audioOst.play();
    
    if (playPromise1 !== undefined) {
        playPromise1.catch(error => {
            console.log('Ошибка аудио 1:', error);
        });
    }
    if (playPromise2 !== undefined) {
        playPromise2.catch(error => {
            console.log('Ошибка аудио 2:', error);
        });
    }
    
    isMysteryAudioPlaying = true;
}

function stopMysteryAudio() { 
    audioHands.pause(); 
    audioOst.pause(); 
    audioHands.currentTime = 0; 
    audioOst.currentTime = 0; 
    isMysteryAudioPlaying = false; 
}

// ============================================
// СЕКРЕТНОЕ ПОСЛАНИЕ
// ============================================
function showSecretMessage() {
    menuBox.classList.add('hidden');
    secretBox.classList.add('visible');
    secretBox.style.display = 'block';
    isSecretShown = true;
    applySecretVariant(getRandomSecretVariant());
    startSecretGlitches();
    
    // Принудительно разблокируем аудио
    unlockAudio();
    
    // Запускаем аудио с задержкой для гарантии
    setTimeout(() => {
        playMysteryAudio();
    }, 300);
    
    console.log('Секретное послание открыто, аудио запущено');
}
