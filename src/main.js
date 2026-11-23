// Main entrypoint for Construction Vehicles & Trucks game
import { gameState, VIEWPORTS } from './state.js';
import { initLanguage, setLanguage, getLanguage, t } from './i18n.js';
import { initSoundSettings, setSoundEnabled, isSoundEnabled, playDing } from './audio.js';
import { renderSelectStage } from './stages/select.js';
import { renderCanvasGameStage, cleanupCanvasGame } from './stages/canvas_stage.js';

// DOM elements
const root = document.getElementById('game-app-root');
const deviceContainer = document.getElementById('device-container');
const deviceNotch = document.getElementById('device-notch');

const vpBtns = {
  portrait: document.getElementById('vp-portrait'),
  landscape: document.getElementById('vp-landscape'),
  tablet: document.getElementById('vp-tablet'),
  fluid: document.getElementById('vp-fluid')
};

const langBtns = {
  en: document.getElementById('lang-en'),
  zh: document.getElementById('lang-zh'),
  ms: document.getElementById('lang-ms')
};

const btnSound = document.getElementById('btn-toggle-sound');
const soundIcon = document.getElementById('sound-icon');
const soundText = document.getElementById('sound-text');
const btnHome = document.getElementById('btn-home');

// Initialize settings
initLanguage();
initSoundSettings();

function updateSoundUI() {
  const enabled = isSoundEnabled();
  soundIcon.textContent = enabled ? '🔊' : '🔇';
  soundText.textContent = enabled ? 'Sound: ON' : 'Muted';
  btnSound.classList.toggle('text-amber-400', enabled);
  btnSound.classList.toggle('text-slate-400', !enabled);
}

function updateLanguageUI() {
  const current = getLanguage();
  Object.keys(langBtns).forEach(lang => {
    const btn = langBtns[lang];
    if (btn) {
      if (lang === current) {
        btn.className = 'lang-btn px-2 py-1 rounded-lg font-bold bg-slate-800 text-amber-400 transition-all';
      } else {
        btn.className = 'lang-btn px-2 py-1 rounded-lg font-bold text-slate-400 hover:text-white transition-all';
      }
    }
  });
}

function updateViewportUI(mode) {
  // Update button active styles
  Object.keys(vpBtns).forEach(key => {
    const btn = vpBtns[key];
    if (btn) {
      if (key === mode) {
        btn.className = 'vp-btn px-2.5 py-1 rounded-lg font-bold bg-amber-500 text-slate-950 transition-all flex items-center gap-1 cursor-pointer';
      } else {
        btn.className = 'vp-btn px-2.5 py-1 rounded-lg font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1 cursor-pointer';
      }
    }
  });

  // Update device container classes
  deviceContainer.className = `device-frame-${mode} bg-white relative overflow-hidden transition-all duration-300 flex flex-col`;
  
  // Hide notch in landscape / fluid / tablet or adjust
  if (mode === 'fluid') {
    deviceNotch.style.display = 'none';
    deviceContainer.style.maxHeight = '100%';
    deviceContainer.style.maxWidth = '100%';
  } else if (mode === 'landscape') {
    deviceNotch.style.display = 'none';
    deviceContainer.style.maxHeight = '';
    deviceContainer.style.maxWidth = '';
  } else {
    deviceNotch.style.display = 'flex';
    deviceContainer.style.maxHeight = '';
    deviceContainer.style.maxWidth = '';
  }
}

// Render active stage
function renderCurrentStage() {
  const state = gameState.getState();
  root.innerHTML = '';

  if (state.stage === 'select') {
    cleanupCanvasGame();
    renderSelectStage(root);
  } else {
    // Stages: assembly, fueling, site, wash all run on 60FPS canvas engine!
    renderCanvasGameStage(root);
  }
}

// Wire up Viewport Buttons
Object.keys(vpBtns).forEach(mode => {
  const btn = vpBtns[mode];
  if (btn) {
    btn.addEventListener('click', () => {
      gameState.setViewport(mode);
      updateViewportUI(mode);
    });
  }
});

// Wire up Language Buttons
Object.keys(langBtns).forEach(lang => {
  const btn = langBtns[lang];
  if (btn) {
    btn.addEventListener('click', () => {
      setLanguage(lang);
      updateLanguageUI();
      renderCurrentStage();
    });
  }
});

// Wire up Sound Button
btnSound.addEventListener('click', () => {
  const next = !isSoundEnabled();
  setSoundEnabled(next);
  updateSoundUI();
  if (next) playDing();
});

// Wire up Home Button
btnHome.addEventListener('click', () => {
  playDing();
  gameState.setStage('select');
});

let lastRenderedStage = null;
let lastRenderedVehicle = null;

// Subscribe to game stage and vehicle transitions
gameState.subscribe((state) => {
  if (state.stage !== lastRenderedStage || state.vehicleId !== lastRenderedVehicle) {
    lastRenderedStage = state.stage;
    lastRenderedVehicle = state.vehicleId;
    renderCurrentStage();
  }
});

// Initial boot
updateSoundUI();
updateLanguageUI();
updateViewportUI('portrait');
renderCurrentStage();
