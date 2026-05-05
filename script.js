// ============================================
// СТАРТОВЫЙ ЭКРАН
// ============================================
const startScreen = document.getElementById('start-screen');

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
const audioVhs = document.getElementById('audio-vhs');

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
const gasterWindow = document.getElementById('gaster-window');
const gasterDialogue = document.getElementById('gaster-dialogue');
const gasterAnswer = document.getElementById('gaster-answer');

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
let isGasterShown = false;
let isFriskMusicPlaying = false;
let audioUnlocked = false;
let currentVolume = 0.5;
let questionIndex = 0;
let gasterQuestionIndex = 0;
let glitchInterval = null;
let currentSecretVariant = 'normal';
let dialogueInterval = null;
let dialogueTimeout = null;
let gasterTimer = null;
let gasterTimerDisplay = null;
let gasterSecondsLeft = 10;

// ============================================
// ГРОМКОСТЬ
// ============================================
function setVolume(value) {
    currentVolume = value;
    audioFrisk.volume = value; audioKris.volume = value; audioHands.volume = value; audioOst.volume = value; audioVhs.volume = value;
    if (value === 0) volumeIcon.classList.add('muted'); else volumeIcon.classList.remove('muted');
}
volumeSlider.addEventListener('input', () => setVolume(volumeSlider.value / 100));
volumeIcon.addEventListener('click', () => { if (currentVolume > 0) { volumeSlider.value = 0; setVolume(0); } else { volumeSlider.value = 50; setVolume(0.5); } });
setVolume(0.5);

// ============================================
// РАЗБЛОКИРОВКА АУДИО
// ============================================
function unlockAudio() {
    if (!audioUnlocked) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) { const a = new AudioContext(); const o = a.createOscillator(); const g = a.createGain(); g.gain.value = 0.01; o.connect(g); g.connect(a.destination); o.start(0); o.stop(0.01); }
        [audioHands, audioOst, audioKris, audioFrisk, audioVhs].forEach(a => { a.load(); a.volume = 0.01; a.play().then(() => { a.pause(); a.currentTime = 0; a.volume = currentVolume; }).catch(() => {}); });
        audioUnlocked = true;
    }
}

// ============================================
// МУЗЫКА ФРИСК
// ============================================
function startFriskMusic() { if (!isFriskMusicPlaying && isGifShown) { audioFrisk.load(); audioFrisk.currentTime = 0; audioFrisk.volume = currentVolume; const pp = audioFrisk.play(); if (pp !== undefined) { pp.then(() => { isFriskMusicPlaying = true; }).catch(() => { setTimeout(() => { audioFrisk.load(); audioFrisk.play().then(() => { isFriskMusicPlaying = true; }).catch(() => {}); }, 1000); }); } } }
function pauseFriskMusic() { if (isFriskMusicPlaying) { audioFrisk.pause(); isFriskMusicPlaying = false; } }
function resumeFriskMusic() { if (!isFriskMusicPlaying && isGifShown && !isKrisPopupShown && !isGasterShown) { audioFrisk.volume = currentVolume; audioFrisk.play().catch(() => {}); isFriskMusicPlaying = true; } }
function stopFriskMusic() { audioFrisk.pause(); audioFrisk.currentTime = 0; isFriskMusicPlaying = false; }

// ============================================
// КЛИК НА СЕРДЕЧКО
// ============================================
heartClick.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); if (isLongWindowShown || isKrisPopupShown) return; creamWindow.classList.remove('visible'); creamWindow.classList.add('fading'); setTimeout(() => { creamWindowLong.classList.add('visible'); creamWindowLong.classList.remove('fading'); isLongWindowShown = true; }, 500); });

// ============================================
// КЛИК НА "КРИС"
// ============================================
krisNameClick.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); if (isKrisPopupShown) return; pauseFriskMusic(); overlayDark.classList.add('active'); setTimeout(() => { krisPopup.classList.add('active'); isKrisPopupShown = true; }, 100); audioKris.currentTime = 0; audioKris.volume = currentVolume; audioKris.play().catch(() => {}); });

// ============================================
// КЛИК НА "[ Задать вопрос... ]"
// ============================================
questionLink.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); if (isQuestionsShown || isAnswerShown) return; creamWindowLong.classList.remove('visible'); creamWindowLong.classList.add('fading'); isLongWindowShown = false; setTimeout(() => { questionsWindow.classList.add('visible'); questionsWindow.classList.remove('fading'); isQuestionsShown = true; questionIndex = 0; updateQuestionSelection(); }, 500); });
function updateQuestionSelection() { questionsList.forEach((li, i) => { li.classList.toggle('selected', i === questionIndex); }); }

// ============================================
// КНОПКА СБРОС (Крис)
// ============================================
krisResetButton.addEventListener('click', hideKrisPopup);
function hideKrisPopup() { krisPopup.classList.remove('active'); overlayDark.classList.remove('active'); isKrisPopupShown = false; audioKris.pause(); audioKris.currentTime = 0; resumeFriskMusic(); }

// ============================================
// ВОЗВРАТ К ПЕРВОМУ ОКНУ
// ============================================
function backToFirstWindow() { if (isLongWindowShown) { creamWindowLong.classList.remove('visible'); creamWindowLong.classList.add('fading'); setTimeout(() => { creamWindow.classList.add('visible'); creamWindow.classList.remove('fading'); isLongWindowShown = false; }, 500); } }

// ============================================
// ОКНО ОТВЕТА
// ============================================
function showAnswer(qNum) {
    if (isAnswerShown) return;
    questionsWindow.classList.remove('visible'); questionsWindow.classList.add('fading'); isQuestionsShown = false;
    if (answers[qNum]) answerText.textContent = answers[qNum];
    
    const images = { 
        1: '1667059529_4-zefirka-club-p-fon-anderteil-zolotie-tsveti-4.jpg', 
        2: 'https://litter.catbox.moe/sob9v51fp9j28lok.webp', 
        3: 'fdfc8cdf655e9bfb0c069bc9b35ef675.jpg', 
        4: '636drhmtadud1.gif',
        6: 'eb1e054e383b6da88f322d846e8d79ed.jpg',
        7: '11df82aea021e2fc18ab681008d47bc4.jpg',
        8: 'c2a0c65ceb743c3bd355cb01ac1eeb24.jpg',
        9: '2d5238d4daea905cfb2c4c4c9feec2f1.jpg',
        10: '37125d9c99120d3c1a01df4473f2e0f8.jpg'
    };
    
    answerWindow.classList.remove('cave-mode', 'pie-mode', 'mercy-mode', 'sunset-mode', 'waterfall-mode', 'purple-mode');
    answerText.style.color = '#5c4033'; answerText.style.textShadow = 'none';
    if (qNum === 3) { answerWindow.classList.add('pie-mode'); answerText.style.color = '#d5e0f0'; answerText.style.textShadow = '0 0 6px rgba(100, 150, 255, 0.3)'; }
    if (qNum === 4) { answerWindow.classList.add('cave-mode'); answerText.style.color = '#e8d5a3'; answerText.style.textShadow = '0 0 8px rgba(255, 200, 50, 0.4)'; }
    if (qNum === 7) { answerWindow.classList.add('waterfall-mode'); answerText.style.color = '#c0d0f0'; answerText.style.textShadow = '0 0 6px rgba(20, 60, 160, 0.5)'; }
    if (qNum === 8) { answerWindow.classList.add('purple-mode'); answerText.style.color = '#d0c0f0'; answerText.style.textShadow = '0 0 6px rgba(120, 40, 200, 0.4)'; }
    if (qNum === 9) { answerWindow.classList.add('mercy-mode'); answerText.style.color = '#d4c080'; answerText.style.textShadow = '0 0 6px rgba(200, 160, 40, 0.4)'; }
    if (qNum === 10) { answerWindow.classList.add('sunset-mode'); answerText.style.color = '#ffe0c0'; answerText.style.textShadow = '0 0 6px rgba(255, 180, 80, 0.4)'; }
    
    if (images[qNum]) { answerImage.src = images[qNum]; answerImage.style.display = 'block'; if (answerImageContainer) answerImageContainer.style.display = 'block'; }
    else { answerImage.style.display = 'none'; if (answerImageContainer) answerImageContainer.style.display = 'none'; }
    
    setTimeout(() => {
        const inner = document.querySelector('.answer-inner'), text = document.querySelector('.answer-text');
        if (inner) { inner.style.animation = 'none'; inner.offsetHeight; inner.style.animation = 'fadeInContent 0.7s ease-out 0.2s both'; }
        if (images[qNum] && answerImage) { answerImage.style.animation = 'none'; answerImage.offsetHeight; answerImage.style.animation = 'fadeInImage 0.8s ease-out 0.3s both'; }
        if (text) { text.style.animation = 'none'; text.offsetHeight; text.style.animation = 'fadeInText 0.6s ease-out 0.5s both'; }
        answerWindow.classList.add('active'); answerWindow.classList.remove('fading'); isAnswerShown = true;
        
        if (qNum === 4) {
            setTimeout(() => {
                const answerEl = document.querySelector('.answer-text');
                if (answerEl) {
                    answerEl.innerHTML = answerEl.innerHTML.replace('* Интересно...', '* Интересно...<br><br><span class="hidden-word" style="color:transparent;cursor:pointer;user-select:text;transition:color 0.3s;" onmouseover="this.style.color=\'#fff\'" onmouseout="this.style.color=\'transparent\'">* ПРОДОЛЖАЙ</span>');
                    const hw = document.querySelector('.hidden-word');
                    if (hw) hw.addEventListener('click', function(e) { e.stopPropagation(); showGasterOrDarkWindow(); });
                }
            }, 600);
        }
    }, 350);
}

function hideAnswer() {
    if (!isAnswerShown) return;
    answerWindow.classList.remove('active'); answerWindow.classList.add('fading');
    answerWindow.classList.remove('cave-mode', 'pie-mode', 'mercy-mode', 'sunset-mode', 'waterfall-mode', 'purple-mode');
    answerText.style.color = '#5c4033'; answerText.style.textShadow = 'none'; isAnswerShown = false;
    setTimeout(() => { questionsWindow.classList.add('visible'); questionsWindow.classList.remove('fading'); isQuestionsShown = true; }, 300);
}

function backFromQuestions() { if (isAnswerShown) { hideAnswer(); return; } if (isQuestionsShown) { questionsWindow.classList.remove('visible'); questionsWindow.classList.add('fading'); setTimeout(() => { creamWindowLong.classList.add('visible'); creamWindowLong.classList.remove('fading'); isLongWindowShown = true; isQuestionsShown = false; }, 500); } }

// ============================================
// ОКНО ГАСТЕРА (26%) / ЧЁРНЫЙ ЭКРАН (74%)
// ============================================
const gasterPhrases = ['* Вы чувствуете чьё-то присутствие...\n* Но его здесь нет.','* Тут кто-то был.\n* Совсем недавно.','* ...\n* Пусто.','* Кажется, вы не одни.\n* Но никого нет.','* Шёпот в темноте.\n* Или показалось?'];
const welcomeText = '*Приветствую тебя, игрок... я даю тебе шанс задать любой твой вопрос.';
const gasterAnswersData = {1:'⠫ ⠵⠙⠑⠎⠼ ⠺⠑⠛⠙⠁ ⠃⠮⠇ ⠏⠗⠕⠺⠑⠙⠑⠝ ⠷⠅⠎⠏⠑⠗⠊⠍⠑⠝⠞ ⠊ ⠞⠑⠏⠑⠗⠼ ⠫ ⠏⠗⠕⠙⠕⠇⠚⠁⠌ ⠎⠇⠑⠙⠊⠞⠶ ⠵⠁ ⠝⠊⠍⠊.',2:'⠫ ⠏⠕⠫⠊⠇⠎⠫ ⠵⠙⠑⠎⠶ ⠟⠑⠗⠑⠵ ⠞⠗⠑⠭⠊⠝⠥ ⠺ ⠏⠗⠕⠎⠞⠗⠁⠝⠎⠞⠺⠑ ⠊ ⠺⠗⠑⠍⠑⠝⠊. ⠍⠝⠑ ⠝⠥⠚⠝⠕ ⠏⠕⠝⠫⠞⠶ ⠟⠞⠕ ⠞⠁⠅⠕⠑ ⠗⠑⠲⠇⠶⠝⠕⠎⠞⠶.',3:'⠏⠁⠙⠚⠊⠚ ⠁⠝⠛⠑⠇ — ⠷⠞⠕ ⠎⠥⠱⠑⠎⠞⠺⠕⠲ ⠞⠕⠞⠲ ⠅⠞⠕ ⠃⠮⠇ ⠵⠁⠃⠮⠞ ⠊ ⠺⠑⠗⠝⠥⠇⠎⠫⠲ ⠞⠑⠏⠑⠗⠶ ⠫ ⠝⠑ ⠵⠝⠁⠳⠲ ⠅⠞⠕ ⠕⠝⠊.'};

function typeWriter(text, element, speed = 50, callback = null) { let i = 0; element.textContent = ''; clearInterval(dialogueInterval); dialogueInterval = setInterval(() => { if (i < text.length) { element.textContent += text.charAt(i); i++; } else { clearInterval(dialogueInterval); if (callback) callback(); } }, speed); }
function eraseText(element, speed = 30, callback = null) { let text = element.textContent; clearInterval(dialogueInterval); dialogueInterval = setInterval(() => { if (text.length > 0) { text = text.slice(0, -1); element.textContent = text; } else { clearInterval(dialogueInterval); if (callback) callback(); } }, speed); }

function showGasterOrDarkWindow() { if (isGasterShown) return; stopMysteryAudio(); pauseFriskMusic(); answerWindow.classList.remove('active'); answerWindow.classList.add('fading'); isAnswerShown = false; setTimeout(() => { if (Math.random() < 0.26) showFullGasterDialog(); else showDarkScreen(); }, 300); }
function showFullGasterDialog() { gasterWindow.classList.add('active'); isGasterShown = true; gasterQuestionIndex = 0; gasterAnswer.textContent = ''; updateGasterQuestionSelection(); document.querySelector('.gaster-gif-container').style.display = 'block'; document.querySelector('.gaster-questions').style.display = 'flex'; document.querySelector('.gaster-hint-text').style.display = 'block'; typeWriter(welcomeText, gasterDialogue, 40, () => { clearTimeout(dialogueTimeout); dialogueTimeout = setTimeout(() => { eraseText(gasterDialogue, 30); }, 5000 + Math.random() * 10000); }); audioVhs.currentTime = 0; audioVhs.volume = currentVolume; audioVhs.play().catch(() => {}); }
function showDarkScreen() { gasterWindow.classList.add('active'); isGasterShown = true; document.querySelector('.gaster-gif-container').style.display = 'none'; document.querySelector('.gaster-questions').style.display = 'none'; document.querySelector('.gaster-hint-text').style.display = 'none'; gasterAnswer.textContent = ''; if (gasterTimerDisplay) gasterTimerDisplay.style.display = 'none'; clearInterval(gasterTimer); const phrase = gasterPhrases[Math.floor(Math.random() * gasterPhrases.length)]; typeWriter(phrase, gasterDialogue, 35, () => { setTimeout(() => { eraseText(gasterDialogue, 25, () => { setTimeout(() => { hideGasterWindow(); }, 500); }); }, 3000); }); }
function startGasterTimer() { gasterSecondsLeft = 10; if (!gasterTimerDisplay) { gasterTimerDisplay = document.createElement('div'); gasterTimerDisplay.className = 'gaster-timer'; gasterWindow.appendChild(gasterTimerDisplay); } gasterTimerDisplay.textContent = `[ ${gasterSecondsLeft} ]`; gasterTimerDisplay.style.display = 'block'; clearInterval(gasterTimer); gasterTimer = setInterval(() => { gasterSecondsLeft--; gasterTimerDisplay.textContent = `[ ${gasterSecondsLeft} ]`; if (gasterSecondsLeft <= 0) { clearInterval(gasterTimer); audioVhs.pause(); audioVhs.currentTime = 0; const va = new Audio('gaster-vanish.mp3'); va.volume = currentVolume; va.play().catch(() => {}); setTimeout(() => { hideGasterWindowForce(); }, 2000); } }, 1000); }
function hideGasterWindowForce() { clearInterval(gasterTimer); clearInterval(dialogueInterval); clearTimeout(dialogueTimeout); if (gasterTimerDisplay) gasterTimerDisplay.style.display = 'none'; gasterWindow.classList.remove('active'); isGasterShown = false; hideGifBackground(); }
function showGasterWindow() { showGasterOrDarkWindow(); }
function hideGasterWindow() { clearInterval(gasterTimer); clearInterval(dialogueInterval); clearTimeout(dialogueTimeout); if (gasterTimerDisplay) gasterTimerDisplay.style.display = 'none'; audioVhs.pause(); audioVhs.currentTime = 0; gasterWindow.classList.remove('active'); isGasterShown = false; if (isGifShown && !isKrisPopupShown) resumeFriskMusic(); setTimeout(() => { questionsWindow.classList.add('visible'); questionsWindow.classList.remove('fading'); isQuestionsShown = true; }, 300); }
function updateGasterQuestionSelection() { document.querySelectorAll('.gaster-question').forEach((q, i) => { q.classList.toggle('selected', i === gasterQuestionIndex); }); }
function showGasterAnswer(qNum) { if (gasterAnswersData[qNum]) { typeWriter(gasterAnswersData[qNum], gasterAnswer, 35, () => { clearTimeout(dialogueTimeout); dialogueTimeout = setTimeout(() => { eraseText(gasterAnswer, 25); }, 3000 + Math.random() * 3000); }); if (!gasterTimer || gasterSecondsLeft <= 0) startGasterTimer(); } }

// ============================================
// ВАРИАЦИИ СЕКРЕТНОГО ПОСЛАНИЯ (???) 
// ============================================
function getRandomSecretVariant() { return Math.random() < 0.06 ? 'follow6' : 'normal'; }
function applySecretVariant(variant) { const title = document.querySelector('.secret-title'), text = document.querySelector('.secret-text'), subtitle = document.querySelector('.secret-subtitle'), box = document.getElementById('secret-box'); if (!title || !text || !subtitle || !box) return; if (variant === 'follow6') { title.innerHTML = '⠠⠑⠗⠗⠕⠗ ⠼⠑⠛'; title.style.color = '#ff3333'; title.style.animation = 'glitch-text 0.15s infinite'; title.style.fontSize = '22px'; title.style.letterSpacing = '6px'; text.innerHTML = `⠺⠁⠗⠝⠊⠝⠛: ⠙⠁⠞⠁ ⠉⠕⠗⠗⠥⠏⠞⠑⠙<br><span style="font-size:14px;color:#f44;">[DATA CORRUPTED]<br>[DATA CORRUPTED]<br>[DATA CORRUPTED]</span><br><span style="font-size:11px;color:#666;">⠞⠗⠁⠉⠑ ⠗⠑⠉⠕⠗⠙⠑⠙...<br>⠎⠽⠎⠞⠑⠍ ⠋⠁⠊⠇⠥⠗⠑...</span><br><br><span style="font-size:20px;color:#fff;text-shadow:3px 0 5px rgba(255,0,0,0.9),-3px 0 5px rgba(0,150,255,0.9),0 0 20px rgba(255,255,255,0.7);animation:glitch-text 0.2s infinite;letter-spacing:4px;">F̷O̷L̷L̷O̷W̷ ̷6̷</span>`; subtitle.innerHTML = '* ⠞⠓⠑ ⠧⠕⠊⠙ ⠉⠁⠇⠇⠎'; subtitle.style.color = '#ff4444'; subtitle.style.animation = 'glitch-text 0.2s infinite'; box.style.border = '2px solid rgba(255,0,0,0.6)'; box.style.boxShadow = '0 0 40px rgba(255,0,0,0.4), 0 0 80px rgba(0,0,255,0.2), inset 0 0 30px rgba(255,0,0,0.2)'; box.style.animation = 'vhs-shake 0.2s infinite ease-in-out'; const scanlines = document.querySelector('.secret-scanlines'); if (scanlines) scanlines.style.background = 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,0,0,0.15) 2px,rgba(255,0,0,0.15) 4px)'; } else { title.innerHTML = '⠠⠵⠁⠏⠊⠎⠼ ⠼⠑⠛'; title.style.color = '#ddd'; title.style.animation = ''; title.style.fontSize = '26px'; title.style.letterSpacing = '3px'; text.innerHTML = `⠶⠞⠓⠗⠑⠑ ⠓⠑⠗⠕⠑⠎ ⠁⠏⠏⠑⠁⠗⠑⠙<br>⠞⠕ ⠃⠁⠝⠊⠎⠓ ⠞⠓⠑ ⠁⠝⠛⠑⠇⠎ ⠓⠑⠁⠧⠑⠝⠶<br><br><span style="font-size:13px;color:#888;">⠞⠗⠕⠑ ⠛⠑⠗⠕⠑⠧ ⠫⠧⠊⠇⠊⠎⠼<br>⠟⠞⠕⠃⠮ ⠊⠵⠛⠝⠁⠞⠼ ⠝⠑⠃⠑⠎⠁ ⠁⠝⠛⠑⠇⠁</span>`; subtitle.innerHTML = '* ⠞⠓⠑ ⠎⠓⠁⠙⠕⠺⠎ ⠉⠥⠞⠞⠊⠝⠛ ⠙⠑⠑⠏⠑⠗'; subtitle.style.color = '#777'; subtitle.style.animation = ''; box.style.border = '2px solid rgba(255,255,255,0.4)'; box.style.boxShadow = '0 0 40px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,0,0,0.5)'; box.style.animation = 'vhs-shake 0.4s infinite ease-in-out'; const scanlines = document.querySelector('.secret-scanlines'); if (scanlines) scanlines.style.background = 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.2) 3px,rgba(0,0,0,0.2) 6px)'; } currentSecretVariant = variant; }

// ============================================
// СЛУЧАЙНЫЕ VHS-ГЛЮКИ
// ============================================
function startSecretGlitches() { if (glitchInterval) clearInterval(glitchInterval); glitchInterval = setInterval(() => { if (!isSecretShown) return; const box = document.getElementById('secret-box'), inner = document.querySelector('.secret-inner'); if (!box || !inner) return; const t = Math.floor(Math.random() * 5); switch(t) { case 0: box.style.transform = `translate(calc(-50% + ${Math.random()*20-10}px), calc(-50% + ${Math.random()*15-7}px))`; box.style.transition = 'transform 0.08s ease-out'; setTimeout(() => { if (box) box.style.transform = 'translate(-50%,-50%)'; }, 80); break; case 1: const els = document.querySelectorAll('.secret-title,.secret-text,.secret-subtitle'); els.forEach(el => { el.style.textShadow = `${Math.random()*8-4}px ${Math.random()*4-2}px 3px rgba(255,0,0,0.9), ${Math.random()*-8+4}px ${Math.random()*-4+2}px 3px rgba(0,150,255,0.9)`; }); setTimeout(() => { els.forEach(el => { el.style.textShadow = currentSecretVariant === 'follow6' ? '3px 0 5px rgba(255,0,0,0.9),-3px 0 5px rgba(0,150,255,0.9),0 0 20px rgba(255,255,255,0.7)' : '1px 0 2px rgba(255,0,0,0.4),-1px 0 2px rgba(0,200,255,0.4),0 0 5px rgba(255,255,255,0.3)'; }); }, 150); break; case 2: const fl = document.createElement('div'); fl.style.cssText = `position:absolute;top:0;left:0;right:0;bottom:0;background:repeating-linear-gradient(0deg,transparent,transparent ${Math.random()*4+1}px,rgba(255,255,255,${Math.random()*0.3+0.1}) ${Math.random()*2+1}px,rgba(255,255,255,${Math.random()*0.3+0.1}) ${Math.random()*4+2}px);pointer-events:none;z-index:10;opacity:0.8;`; inner.appendChild(fl); setTimeout(() => { if (fl.parentNode) fl.remove(); }, 200+Math.random()*300); break; case 3: const all = document.querySelectorAll('.secret-title,.secret-text,.secret-subtitle,.secret-hint'); all.forEach(el => { el.style.transform = `translate(${Math.random()*6-3}px,${Math.random()*4-2}px)`; el.style.transition = 'transform 0.05s'; }); setTimeout(() => { all.forEach(el => { el.style.transform = 'translate(0,0)'; }); }, 100); break; case 4: inner.style.filter = `hue-rotate(${Math.random()*60-30}deg) saturate(${Math.random()*2+1})`; inner.style.transition = 'filter 0.2s ease-out'; setTimeout(() => { if (inner) inner.style.filter = 'none'; }, 200); break; } }, 10000 + Math.random() * 10000); }
function stopSecretGlitches() { if (glitchInterval) { clearInterval(glitchInterval); glitchInterval = null; } }

// ============================================
// СЕКРЕТНОЕ ПОСЛАНИЕ
// ============================================
function showSecretMessage() { menuBox.classList.add('hidden'); secretBox.classList.add('visible'); secretBox.style.display = 'block'; isSecretShown = true; applySecretVariant(getRandomSecretVariant()); startSecretGlitches(); playMysteryAudio(); }
function hideSecretMessage() { stopSecretGlitches(); stopMysteryAudio(); secretBox.classList.add('fade-out'); setTimeout(() => { secretBox.style.display = 'none'; secretBox.classList.remove('fade-out','visible'); secretBox.style.transform = 'translate(-50%,-50%)'; secretBox.style.border = '2px solid rgba(255,255,255,0.4)'; secretBox.style.boxShadow = '0 0 40px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,0,0,0.5)'; secretBox.style.animation = 'vhs-shake 0.4s infinite ease-in-out'; const inner = document.querySelector('.secret-inner'); if (inner) inner.style.filter = 'none'; const scanlines = document.querySelector('.secret-scanlines'); if (scanlines) scanlines.style.background = 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.2) 3px,rgba(0,0,0,0.2) 6px)'; }, 300); menuBox.classList.remove('hidden'); isSecretShown = false; }

// ============================================
// СНЕЖИНКИ
// ============================================
class Snowflake { constructor() { this.reset(true); } reset(r = false) { this.x = Math.random() * width; this.y = r ? Math.random() * height : -10 - Math.random() * 20; this.size = Math.floor(Math.random() * 4) + 2; this.speed = Math.random() * 0.35 + 0.15; this.drift = Math.random() * 0.3 - 0.15; this.driftAngle = Math.random() * Math.PI * 2; this.opacity = Math.random() * 0.7 + 0.3; this.color = `rgba(180,220,255,${this.opacity})`; } update() { this.driftAngle += 0.005; this.x += Math.sin(this.driftAngle) * this.drift; this.y += this.speed; if (this.y > height + 10 || this.x < -10 || this.x > width + 10) this.reset(false); } draw(ctx) { ctx.fillStyle = this.color; ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.size, this.size); if (this.size > 3) { ctx.fillStyle = `rgba(200,230,255,${this.opacity * 0.3})`; ctx.fillRect(Math.floor(this.x - 1), Math.floor(this.y - 1), this.size + 2, this.size + 2); } } }
function init() { resizeCanvas(); snowflakes = []; for (let i = 0; i < 150; i++) snowflakes.push(new Snowflake()); }
function resizeCanvas() { width = window.innerWidth; height = window.innerHeight; canvas.width = width; canvas.height = height; }
function animate() { ctx.clearRect(0, 0, width, height); snowflakes.forEach(f => { f.update(); f.draw(ctx); }); drawVignette(); requestAnimationFrame(animate); }
function drawVignette() { const g = ctx.createRadialGradient(width/2, height/2, width*0.4, width/2, height/2, width*0.8); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.5)'); ctx.fillStyle = g; ctx.fillRect(0, 0, width, height); }
window.addEventListener('resize', resizeCanvas);

// ============================================
// АУДИО ДЛЯ ???
// ============================================
function playMysteryAudio() { stopMysteryAudio(); audioHands.volume = currentVolume; audioOst.volume = currentVolume; audioHands.currentTime = 0; audioOst.currentTime = 0; audioHands.load(); audioOst.load(); audioHands.play().catch(() => {}); audioOst.play().catch(() => {}); isMysteryAudioPlaying = true; }
function stopMysteryAudio() { audioHands.pause(); audioOst.pause(); audioHands.currentTime = 0; audioOst.currentTime = 0; isMysteryAudioPlaying = false; }

// ============================================
// GIF-ФОН (ФРИСК)
// ============================================
function showGifBackground() { stopMysteryAudio(); hideSecretMessage(); overlayDark.classList.remove('active'); hideKrisPopup(); overlayDark.classList.add('active'); isLongWindowShown = false; isQuestionsShown = false; isAnswerShown = false; isGasterShown = false; creamWindowLong.classList.remove('visible'); creamWindowLong.classList.add('fading'); questionsWindow.classList.remove('visible'); questionsWindow.classList.add('fading'); answerWindow.classList.remove('active'); answerWindow.classList.add('fading'); answerWindow.classList.remove('cave-mode','pie-mode','mercy-mode','sunset-mode','waterfall-mode','purple-mode'); gasterWindow.classList.remove('active'); menuBackground.classList.add('fade-out'); menuTrees.classList.add('fade-out'); setTimeout(() => { canvas.classList.add('fade-out'); menuBox.classList.add('hidden'); gifBackground.classList.add('active'); creamWindow.classList.add('visible'); creamWindow.classList.remove('fading'); isGifShown = true; startFriskMusic(); setTimeout(() => overlayDark.classList.remove('active'), 500); }, 800); returnHint.classList.add('active'); }
function hideGifBackground() { stopFriskMusic(); isGifShown = false; creamWindow.classList.remove('visible'); creamWindow.classList.add('fading'); creamWindowLong.classList.remove('visible'); creamWindowLong.classList.add('fading'); questionsWindow.classList.remove('visible'); questionsWindow.classList.add('fading'); answerWindow.classList.remove('active'); answerWindow.classList.add('fading'); answerWindow.classList.remove('cave-mode','pie-mode','mercy-mode','sunset-mode','waterfall-mode','purple-mode'); gasterWindow.classList.remove('active'); isLongWindowShown = false; isQuestionsShown = false; isAnswerShown = false; isGasterShown = false; hideKrisPopup(); menuBackground.classList.remove('fade-out'); menuTrees.classList.remove('fade-out'); setTimeout(() => { overlayDark.classList.add('active'); setTimeout(() => { gifBackground.classList.remove('active'); canvas.classList.remove('fade-out'); menuBox.classList.remove('hidden'); setTimeout(() => overlayDark.classList.remove('active'), 500); }, 300); }, 200); returnHint.classList.remove('active'); }
function returnToMenu() { if (isSecretShown) hideSecretMessage(); if (isGifShown) hideGifBackground(); }

// ============================================
// ЗВУКИ МЕНЮ
// ============================================
const menuItems = document.querySelectorAll('.menu-item'); let currentIndex = 0;
function playSelectSound() { try { const a = new (window.AudioContext||window.webkitAudioContext)(); const o = a.createOscillator(); const g = a.createGain(); o.connect(g); g.connect(a.destination); o.type = 'square'; o.frequency.setValueAtTime(800, a.currentTime); o.frequency.setValueAtTime(1000, a.currentTime+0.05); g.gain.setValueAtTime(0.1*currentVolume, a.currentTime); g.gain.exponentialRampToValueAtTime(0.01, a.currentTime+0.1); o.start(a.currentTime); o.stop(a.currentTime+0.1); } catch(e){} }
function playConfirmSound() { try { const a = new (window.AudioContext||window.webkitAudioContext)(); const o = a.createOscillator(); const g = a.createGain(); o.connect(g); g.connect(a.destination); o.type = 'square'; o.frequency.setValueAtTime(600, a.currentTime); o.frequency.setValueAtTime(1200, a.currentTime+0.08); g.gain.setValueAtTime(0.1*currentVolume, a.currentTime); g.gain.exponentialRampToValueAtTime(0.01, a.currentTime+0.15); o.start(a.currentTime); o.stop(a.currentTime+0.15); } catch(e){} }

// ============================================
// ОТВЕТЫ
// ============================================
const answers = { 1: `* (Фриск смотрит вниз)\n* ...\n* Нет.\n* Золотые цветы мягкие.\n* Они... спасли меня.\n* Хотя...\n* Когда я падала...\n* Мне показалось...\n* Что кто-то говорил со мной.\n* Во тьме.\n* Перед тем, как я упала.\n* Голос...\n* Он звучал так, будто\n* доносился из ниоткуда.\n* И из везде.\n* Он сказал что-то...\n* Но я не помню слов.\n* Только...\n* "Интересно..."\n* Или...\n* "Очень, очень интересно."\n* А потом тишина.\n* И золотые цветы.`, 2: '* ...\n* Зачем говорить?\n* Действия громче слов.', 3: '* (Глаза слегка блестят)\n* Ирисковый.\n* Но коричный напоминает\n* о доме.', 4: `* ...\n* Я чувствую...\n* Что всё будет хорошо.\n* Даже если это не так.\n* Когда я касаюсь звезды...\n* Время замирает.\n* И я слышу...\n* Нет.\n* Чувствую.\n* Что кто-то... наблюдает.\n* Не враг.\n* Просто... наблюдает.\n* Как учёный.\n* Или как тот...\n* Кто хочет понять.\n* Интересно...`, 5: '* (Фриск прячет взгляд)\n* Это секрет.\n* Но палки очень важны.\n* Даже легендарные.', 6: '* (Лёгкая улыбка)\n* Да.\n* Но иногда они смешные.\n* Иногда.', 7: '* ...\n* Нет.\n* Там красиво.\n* И светлячки помогают\n* не сбиться с пути.', 8: '* ...\n* "Человек" — это нормально.\n* Я знаю, кто я.\n* Разве этого мало?', 9: '* ...\n* Нет.\n* Каждый заслуживает шанс.\n* Даже если это трудно.', 10: `* (Долгая пауза)\n* Я улыбнусь.\n* А потом...\n* Пойду дальше.\n* Но...\n* Иногда я думаю...\n* О том, кто был там.\n* Во тьме.\n* До падения.\n* Кто говорил.\n* И куда он ушёл.\n* Может быть...\n* Я ещё встречу его.\n* Когда-нибудь.\n* Когда эксперимент...\n* Закончится.` };

// ============================================
// КЛАВИАТУРА
// ============================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); if (isKrisPopupShown) { hideKrisPopup(); return; } if (isGasterShown) { hideGasterWindow(); return; } if (isAnswerShown) { hideAnswer(); return; } if (isQuestionsShown) { backFromQuestions(); return; } if (isLongWindowShown) { backToFirstWindow(); return; } if (isGifShown||isSecretShown) { returnToMenu(); return; } return; }
    if (isGasterShown) { if (e.key==='Escape') { e.preventDefault(); hideGasterWindow(); return; } if (e.key==='ArrowUp'||e.key==='ArrowDown') { e.preventDefault(); gasterQuestionIndex = e.key==='ArrowUp'?(gasterQuestionIndex-1+3)%3:(gasterQuestionIndex+1)%3; updateGasterQuestionSelection(); playSelectSound(); } if (e.key==='z'||e.key==='Z'||e.key==='Enter') { e.preventDefault(); showGasterAnswer(gasterQuestionIndex+1); playConfirmSound(); } return; }
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
questionsList.forEach((li, index) => { li.addEventListener('mouseenter', ()=>{ if(isAnswerShown||isGasterShown)return; questionIndex=index; updateQuestionSelection(); playSelectSound(); }); li.addEventListener('click', ()=>{ if(isAnswerShown||isGasterShown)return; playConfirmSound(); showAnswer(index+1); }); });
document.querySelectorAll('.gaster-question').forEach((q, index) => { q.addEventListener('click', () => { if (!isGasterShown) return; gasterQuestionIndex = index; updateGasterQuestionSelection(); showGasterAnswer(index + 1); playConfirmSound(); }); });

// ============================================
// ЗАПУСК
// ============================================
startScreen.addEventListener('click', () => { unlockAudio(); startScreen.classList.add('hidden'); init(); animate(); });
// ============================================
// МИНИ-ИГРА (Undertale Style)
// ============================================
const gameCanvas = document.getElementById('game-canvas');
const gctx = gameCanvas.getContext('2d');
const gameScore = document.getElementById('game-score');
let gameRunning = false;
let player = { x: 300, y: 280, w: 14, h: 20, speed: 2, facing: 'down', frame: 0, frameTimer: 0 };
let flowers = [];
let score = 0;
let fountainDrops = [];
let stars = [];
let keys = {};
let gameFrame = 0;

function initStars() {
    stars = [];
    for (let i = 0; i < 50; i++) {
        stars.push({
            x: Math.random() * 600,
            y: Math.random() * 180,
            size: 1 + Math.random() * 1.5,
            twinkle: Math.random() * Math.PI * 2,
            speed: 0.01 + Math.random() * 0.03
        });
    }
}

function initFountain() {
    fountainDrops = [];
    // Создаём капли с дугообразной траекторией
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.3;
        const speed = 2 + Math.random() * 2;
        fountainDrops.push({
            originX: 300,
            originY: 222,
            angle: angle,
            speed: speed,
            progress: Math.random(),
            size: 2 + Math.random()
        });
    }
}

function spawnFlowers(count = 8) {
    flowers = [];
    for (let i = 0; i < count; i++) {
        flowers.push({
            x: 30 + Math.random() * 540,
            y: 210 + Math.random() * 100,
            size: 6 + Math.random() * 5,
            sway: Math.random() * Math.PI * 2
        });
    }
}

function startMiniGame() {
    if (gameRunning) return;
    gameRunning = true; score = 0;
    player.x = 300; player.y = 280; player.facing = 'down';
    spawnFlowers(8); initFountain(); initStars();
    gameCanvas.style.display = 'block';
    gameScore.style.display = 'block';
    gameCanvas.width = 600; gameCanvas.height = 380;
    gameScore.textContent = '💛 x 0';
    gameFrame = 0;
    requestAnimationFrame(gameLoop);
}

function stopMiniGame() {
    gameRunning = false;
    gameCanvas.style.display = 'none';
    gameScore.style.display = 'none';
}

function drawPixelChar(x, y, facing, frame) {
    gctx.imageSmoothingEnabled = false;
    if (facing === 'down') {
        gctx.fillStyle = '#ff5555'; gctx.fillRect(x+3, y+6, 8, 14);
        gctx.fillStyle = '#ffddbb'; gctx.fillRect(x+3, y, 8, 8);
        gctx.fillStyle = '#000'; gctx.fillRect(x+4, y+2, 2, 2); gctx.fillRect(x+8, y+2, 2, 2);
        gctx.fillRect(x+5, y+6, 4, 1);
        gctx.fillStyle = '#333399';
        if (frame % 30 < 15) { gctx.fillRect(x+3, y+20, 3, 4); gctx.fillRect(x+8, y+20, 3, 4); }
        else { gctx.fillRect(x+3, y+20, 4, 3); gctx.fillRect(x+7, y+20, 4, 3); }
    } else if (facing === 'up') {
        gctx.fillStyle = '#ff5555'; gctx.fillRect(x+3, y+6, 8, 14);
        gctx.fillStyle = '#553311'; gctx.fillRect(x+2, y, 10, 6); gctx.fillRect(x+4, y-2, 6, 3);
        gctx.fillStyle = '#333399';
        if (frame % 30 < 15) { gctx.fillRect(x+3, y+20, 3, 4); gctx.fillRect(x+8, y+20, 3, 4); }
        else { gctx.fillRect(x+3, y+20, 4, 3); gctx.fillRect(x+7, y+20, 4, 3); }
    } else if (facing === 'left' || facing === 'right') {
        const flip = facing === 'right' ? 1 : -1;
        gctx.fillStyle = '#ff5555'; gctx.fillRect(x+3, y+6, 8, 14);
        gctx.fillStyle = '#ffddbb'; gctx.fillRect(x+3, y, 8, 8);
        gctx.fillStyle = '#000'; gctx.fillRect(x+5+flip*2, y+2, 2, 2);
        gctx.fillStyle = '#333399';
        if (frame % 30 < 15) { gctx.fillRect(x+4, y+20, 3, 4); gctx.fillRect(x+7, y+20, 3, 4); }
        else { gctx.fillRect(x+4, y+20, 2, 5); gctx.fillRect(x+8, y+20, 2, 5); }
    }
}

function drawPixelFlower(x, y, size, sway) {
    const sx = x + Math.sin(sway) * 1.5;
    gctx.fillStyle = '#228822'; gctx.fillRect(sx-1, y, 2, size*1.5);
    gctx.fillStyle = '#ffdd44';
    for (let a = 0; a < 5; a++) {
        const angle = a * Math.PI*2/5 + gameFrame*0.02;
        gctx.fillRect(sx + Math.cos(angle)*size*0.7 - 2, y + Math.sin(angle)*size*0.5 - 2, 4, 4);
    }
    gctx.fillStyle = '#ffaa00'; gctx.fillRect(sx-2, y-2, 4, 4);
}

function drawBigFountain() {
    // Большое основание (3 яруса)
    gctx.fillStyle = '#556677';
    gctx.fillRect(240, 310, 120, 16);
    gctx.fillStyle = '#667788';
    gctx.fillRect(250, 308, 100, 4);
    gctx.fillStyle = '#445566';
    gctx.fillRect(245, 314, 110, 6);
    
    // Основной бассейн
    gctx.fillStyle = '#334466';
    gctx.fillRect(248, 318, 104, 12);
    gctx.fillStyle = '#5588aa';
    gctx.fillRect(252, 320, 96, 6);
    gctx.fillStyle = '#77aaCC';
    gctx.fillRect(256, 322, 88, 3);
    
    // Центральный столб (шире и выше)
    gctx.fillStyle = '#889999';
    gctx.fillRect(288, 230, 24, 88);
    gctx.fillStyle = '#99aabb';
    gctx.fillRect(290, 228, 20, 4);
    
    // Декоративные кольца на столбе
    gctx.fillStyle = '#aabbcc';
    gctx.fillRect(284, 260, 32, 4);
    gctx.fillRect(285, 275, 30, 4);
    gctx.fillRect(284, 290, 32, 4);
    
    // Верхняя чаша (больше)
    gctx.fillStyle = '#778899';
    gctx.fillRect(270, 215, 60, 15);
    gctx.fillStyle = '#8899aa';
    gctx.fillRect(274, 213, 52, 4);
    // Вода в чаше
    gctx.fillStyle = '#3366aa';
    gctx.fillRect(274, 220, 52, 8);
    gctx.fillStyle = '#5588cc';
    gctx.fillRect(278, 222, 44, 4);
    
    // Струи воды (дугой)
    fountainDrops.forEach(drop => {
        drop.progress += 0.015;
        if (drop.progress > 1) {
            drop.progress = 0;
            drop.angle = (Math.random() * Math.PI * 2);
            drop.speed = 2 + Math.random() * 2;
        }
        
        // Дугообразная траектория
        const t = drop.progress;
        const r = drop.speed * 35;
        const px = drop.originX + Math.cos(drop.angle) * r * Math.sin(t * Math.PI);
        const py = drop.originY - t * 50 + Math.sin(t * Math.PI) * 8;
        
        const alpha = t < 0.5 ? 1 : 1 - (t - 0.5) * 2;
        gctx.fillStyle = `rgba(150,210,255,${alpha})`;
        gctx.fillRect(Math.floor(px), Math.floor(py), drop.size, drop.size);
    });
    
    // Брызги у основания
    for (let i = 0; i < 6; i++) {
        const sx = 270 + i * 12;
        const sy = 312 + Math.sin(gameFrame * 0.1 + i) * 2;
        gctx.fillStyle = 'rgba(150,210,255,0.4)';
        gctx.fillRect(sx, sy, 3, 2);
    }
}

function gameLoop() {
    if (!gameRunning) return;
    gameFrame++;
    
    let moved = false;
    if (keys['ArrowLeft'] || keys['KeyA']) { player.x -= player.speed; player.facing = 'left'; moved = true; }
    if (keys['ArrowRight'] || keys['KeyD']) { player.x += player.speed; player.facing = 'right'; moved = true; }
    if (keys['ArrowUp'] || keys['KeyW']) { player.y -= player.speed; player.facing = 'up'; moved = true; }
    if (keys['ArrowDown'] || keys['KeyS']) { player.y += player.speed; player.facing = 'down'; moved = true; }
    if (moved) player.frame++;
    
    player.x = Math.max(0, Math.min(gameCanvas.width - player.w, player.x));
    player.y = Math.max(200, Math.min(gameCanvas.height - player.h - 10, player.y));
    
    // Сбор цветов
    flowers = flowers.filter(f => {
        const dx = player.x + 7 - f.x, dy = player.y + 10 - f.y;
        if (Math.sqrt(dx*dx+dy*dy) < f.size + 10) { score++; gameScore.textContent = '💛 x ' + score; return false; }
        f.sway += 0.03; return true;
    });
    if (flowers.length < 4) spawnFlowers(8);
    
    // ОТРИСОВКА
    gctx.imageSmoothingEnabled = false;
    
    // Небо
    const skyGrad = gctx.createLinearGradient(0, 0, 0, 200);
    skyGrad.addColorStop(0, '#050520'); skyGrad.addColorStop(1, '#0a0a30');
    gctx.fillStyle = skyGrad; gctx.fillRect(0, 0, 600, 200);
    
    // Звёзды
    stars.forEach(s => {
        s.twinkle += s.speed;
        const alpha = 0.4 + Math.sin(s.twinkle) * 0.4;
        gctx.fillStyle = `rgba(255,255,255,${alpha})`;
        gctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
    });
    
    // Горы дальние
    gctx.fillStyle = '#151530';
    for (let x = 0; x < 600; x += 30) {
        const h = 70 + Math.sin(x*0.012)*25 + Math.cos(x*0.018)*15;
        gctx.fillRect(x, 200-h, 30, h);
    }
    // Горы ближние
    gctx.fillStyle = '#1a1a35';
    for (let x = 0; x < 600; x += 25) {
        const h = 50 + Math.sin(x*0.015+1)*20;
        gctx.fillRect(x, 200-h, 25, h);
    }
    
    // Трава
    gctx.fillStyle = '#1a3a0a'; gctx.fillRect(0, 200, 600, 180);
    gctx.fillStyle = '#1d4410';
    for (let x = 0; x < 600; x += 6) { gctx.fillRect(x, 198+Math.sin(x*0.4+gameFrame*0.04)*2, 6, 6); }
    gctx.fillStyle = '#224d12';
    for (let x = 2; x < 600; x += 8) { gctx.fillRect(x, 200+Math.cos(x*0.3+gameFrame*0.03)*2, 6, 5); }
    
    // Земля
    gctx.fillStyle = '#2a1a0a'; gctx.fillRect(0, 340, 600, 40);
    // Тропинка
    gctx.fillStyle = '#3a2a1a';
    for (let x = 80; x < 520; x += 3) { gctx.fillRect(x, 330+Math.sin(x*0.08)*3, 3, 30); }
    
    // Фонтан
    drawBigFountain();
    
    // Цветы
    flowers.forEach(f => drawPixelFlower(f.x, f.y, f.size, f.sway));
    
    // Игрок
    drawPixelChar(player.x, player.y, player.facing, player.frame);
    
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if ((e.key === 'g' || e.key === 'G') && isQuestionsShown && !gameRunning) { e.preventDefault(); startMiniGame(); }
    if (e.key === 'Escape' && gameRunning) { e.preventDefault(); stopMiniGame(); }
});
document.addEventListener('keyup', (e) => { keys[e.code] = false; });
