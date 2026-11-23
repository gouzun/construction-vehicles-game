// Dynamic Canvas Game Stage Component
// Mounts the 60FPS ConstructionGameScene into the device viewport
import { ConstructionGameScene } from '../game/scene.js';
import { gameState } from '../state.js';
import { t } from '../i18n.js';
import { playDing } from '../audio.js';

let activeScene = null;

export function renderCanvasGameStage(container) {
  const state = gameState.getState();

  // Create canvas game container
  container.innerHTML = `
    <div class="relative w-full h-full flex flex-col justify-between overflow-hidden bg-slate-900 select-none">
      
      <!-- Top In-Game Bar (Home, Stage title, Sound) -->
      <div class="absolute top-2 left-2 right-2 flex items-center justify-between z-20 pointer-events-none">
        <button id="in-game-btn-home" class="pointer-events-auto px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-bold backdrop-blur border border-slate-700 shadow flex items-center gap-1 active:scale-95 cursor-pointer">
          <span>🏠</span>
          <span>${t('home')}</span>
        </button>

        <!-- Current Vehicle Label -->
        <span class="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow">
          ${state.vehicleId === 'excavator' ? '🚜 ' + t('excavator') : '🚚 ' + t('dumpTruck')}
        </span>
      </div>

      <!-- Main Game Canvas -->
      <div class="w-full h-full flex-1 relative flex items-center justify-center">
        <canvas id="game-canvas" class="w-full h-full block cursor-pointer"></canvas>
      </div>

      <!-- Bottom Hint & Stage Navigation Bar -->
      <div class="absolute bottom-2 left-2 right-2 flex items-center justify-between z-20 pointer-events-none">
        <div class="bg-slate-950/70 backdrop-blur px-3 py-1 rounded-full text-white text-[11px] font-semibold border border-slate-800">
          ✨ <span>Interactive Physics & Sound</span>
        </div>

        <!-- Quick Jump / Next Stage Button -->
        <button id="in-game-btn-next" class="pointer-events-auto px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white text-xs font-extrabold uppercase shadow-lg border border-amber-400/50 active:scale-95 cursor-pointer flex items-center gap-1">
          <span>${t('nextStage')}</span>
        </button>
      </div>

    </div>
  `;

  // Attach canvas scene
  const canvas = container.querySelector('#game-canvas');
  if (activeScene) {
    activeScene.stop();
  }

  activeScene = new ConstructionGameScene(canvas);
  activeScene.setMode(state.vehicleId, state.stage);
  activeScene.start();

  // Attach in-game home & next buttons
  const btnHome = container.querySelector('#in-game-btn-home');
  btnHome.addEventListener('click', () => {
    playDing();
    if (activeScene) activeScene.stop();
    gameState.setStage('select');
  });

  const btnNext = container.querySelector('#in-game-btn-next');
  btnNext.addEventListener('click', () => {
    playDing();
    const stages = ['assembly', 'fueling', 'site', 'wash', 'select'];
    const curIdx = stages.indexOf(state.stage);
    const nextStage = stages[(curIdx + 1) % stages.length];
    gameState.setStage(nextStage);
  });
}

export function cleanupCanvasGame() {
  if (activeScene) {
    activeScene.stop();
    activeScene = null;
  }
}
