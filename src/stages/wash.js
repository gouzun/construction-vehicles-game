// Stage 4: Truck Wash & Polish (Sponge Soap, Water Spray Hose, Air Dryer & Sparkle)
import { t } from '../i18n.js';
import { gameState } from '../state.js';
import { renderFullVehicleSVG } from '../vehicles.js';
import { playBubble, playWaterSpray, playDryer, playSparkle, playFanfare, playDing, playEngine } from '../audio.js';
import { triggerConfetti } from '../confetti.js';

export function renderWashStage(container) {
  const currentVehicleId = gameState.getState().vehicleId;
  let activeTool = 'sponge'; // 'sponge' | 'water' | 'dryer'
  let foamLevel = 0;       // 0 to 100%
  let cleanLevel = 0;      // 0 to 100%
  let dryLevel = 0;        // 0 to 100%
  let isDragging = false;
  let sparklesActive = false;

  container.innerHTML = `
    <div class="h-full flex flex-col justify-between p-3 sm:p-5 bg-gradient-to-b from-sky-200 via-blue-50 to-indigo-100 select-none overflow-hidden relative">
      <!-- Top Stage Header -->
      <div class="flex items-center justify-between gap-2">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-black uppercase">
              4 / 4
            </span>
            <h2 class="text-lg sm:text-xl font-black text-slate-800">
              🧼 ${t('stageWash')}
            </h2>
          </div>
          <p class="text-xs text-slate-600 font-medium">
            ${t('stageWashHint')}
          </p>
        </div>
        <!-- Status Indicator -->
        <div id="wash-status-badge" class="flex items-center gap-1.5 px-3 py-1 bg-white/85 backdrop-blur rounded-2xl shadow-sm border border-blue-200 text-xs font-bold text-blue-700">
          <span id="wash-status-text">1. Scrub Soap 🧽</span>
        </div>
      </div>

      <!-- Center Wash Bay Area -->
      <div id="wash-bay" class="relative my-auto w-full max-w-xl mx-auto flex flex-col items-center justify-center p-3 sm:p-4 bg-white/80 backdrop-blur rounded-3xl border border-blue-200 shadow-xl min-h-[250px] overflow-hidden cursor-crosshair">
        
        <!-- Garage Roof Lighting -->
        <div class="w-full flex items-center justify-around px-4 mb-1 opacity-70">
          <div class="w-16 h-2 bg-yellow-200 rounded-full shadow-[0_0_12px_#fef08a]"></div>
          <div class="w-16 h-2 bg-yellow-200 rounded-full shadow-[0_0_12px_#fef08a]"></div>
        </div>

        <!-- Vehicle Scene with Mud & Foam Layers -->
        <div class="relative w-full max-w-md my-auto flex items-center justify-center pointer-events-none">
          <!-- Truck Base SVG -->
          <div id="wash-vehicle-container" class="w-full h-auto max-h-52 filter drop-shadow-md">
            ${renderFullVehicleSVG(currentVehicleId, { isDirty: true })}
          </div>

          <!-- Dynamic Soap Foam Overlay -->
          <div id="foam-overlay" class="absolute inset-0 pointer-events-none transition-opacity duration-300" style="opacity: 0">
            <!-- Simulated Fluffy Soap Bubbles Cloud -->
            <div class="absolute inset-x-8 top-12 bottom-6 bg-white/80 backdrop-blur-xs rounded-full filter blur-[1px] shadow-inner border-4 border-white"></div>
            <div class="absolute left-16 top-16 text-3xl animate-bounce">🫧</div>
            <div class="absolute right-20 top-20 text-3xl animate-bounce delay-150">🫧</div>
            <div class="absolute left-32 bottom-10 text-2xl animate-pulse">🫧</div>
          </div>

          <!-- Sparkle Gleam Stars Overlay -->
          <div id="sparkle-overlay" class="absolute inset-0 pointer-events-none hidden">
            <span class="absolute top-4 left-1/4 text-3xl animate-ping">✨</span>
            <span class="absolute top-12 right-1/4 text-4xl animate-pulse delay-200">⭐</span>
            <span class="absolute bottom-8 left-1/3 text-3xl animate-bounce">✨</span>
            <span class="absolute top-1/2 right-1/3 text-2xl animate-ping delay-300">⭐</span>
          </div>
        </div>

        <!-- Interactive Scrub / Spray Hint -->
        <div class="absolute bottom-3 text-center pointer-events-none">
          <span id="wash-interactive-hint" class="px-3 py-1 rounded-full bg-slate-900/60 text-white text-[11px] font-bold backdrop-blur">
            👉 Swipe or tap across the truck to wash!
          </span>
        </div>

        <!-- Wash Complete Banner -->
        <div id="wash-success-banner" class="hidden absolute inset-0 bg-white/95 backdrop-blur-md rounded-3xl flex-col items-center justify-center p-4 text-center z-20">
          <div class="text-4xl animate-bounce mb-2">✨⭐🎉</div>
          <h3 class="text-xl font-black text-slate-800">${t('washDone')}</h3>
          <p class="text-xs text-slate-600 font-semibold mb-4">${t('sparkling')}</p>
          <button id="btn-finish-game" class="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-sm uppercase shadow-lg hover:shadow-xl active:scale-95 transition-all">
            🏆 ${t('playAgain')}
          </button>
        </div>
      </div>

      <!-- Bottom Tools Dock (Sponge, Hose, Dryer) -->
      <div class="w-full max-w-xl mx-auto">
        <div class="grid grid-cols-3 gap-2 sm:gap-3 bg-white/90 backdrop-blur p-2.5 rounded-2xl border border-blue-200 shadow-md">
          
          <!-- Tool 1: Sponge -->
          <button id="tool-sponge" class="tool-btn flex flex-col items-center justify-center p-2 rounded-xl border-2 border-amber-400 bg-amber-50 shadow-sm active:scale-95 transition-all cursor-pointer">
            <span class="text-2xl sm:text-3xl mb-1">🧽</span>
            <span class="text-xs font-bold text-slate-700">${t('spongeSoap')}</span>
            <div class="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div id="bar-sponge" class="bg-amber-500 h-full transition-all" style="width: 0%"></div>
            </div>
          </button>

          <!-- Tool 2: Water Hose -->
          <button id="tool-water" class="tool-btn flex flex-col items-center justify-center p-2 rounded-xl border-2 border-slate-200 bg-slate-50 opacity-60 shadow-sm active:scale-95 transition-all cursor-pointer">
            <span class="text-2xl sm:text-3xl mb-1">🚿</span>
            <span class="text-xs font-bold text-slate-700">${t('waterHose')}</span>
            <div class="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div id="bar-water" class="bg-blue-500 h-full transition-all" style="width: 0%"></div>
            </div>
          </button>

          <!-- Tool 3: Air Dryer -->
          <button id="tool-dryer" class="tool-btn flex flex-col items-center justify-center p-2 rounded-xl border-2 border-slate-200 bg-slate-50 opacity-60 shadow-sm active:scale-95 transition-all cursor-pointer">
            <span class="text-2xl sm:text-3xl mb-1">💨</span>
            <span class="text-xs font-bold text-slate-700">${t('airDryer')}</span>
            <div class="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div id="bar-dryer" class="bg-indigo-500 h-full transition-all" style="width: 0%"></div>
            </div>
          </button>
        </div>
      </div>
    </div>
  `;

  const washBay = container.querySelector('#wash-bay');
  const vehicleContainer = container.querySelector('#wash-vehicle-container');
  const foamOverlay = container.querySelector('#foam-overlay');
  const sparkleOverlay = container.querySelector('#sparkle-overlay');
  const statusBadge = container.querySelector('#wash-status-text');
  const hint = container.querySelector('#wash-interactive-hint');

  const btnSponge = container.querySelector('#tool-sponge');
  const btnWater = container.querySelector('#tool-water');
  const btnDryer = container.querySelector('#tool-dryer');

  const barSponge = container.querySelector('#bar-sponge');
  const barWater = container.querySelector('#bar-water');
  const barDryer = container.querySelector('#bar-dryer');
  const banner = container.querySelector('#wash-success-banner');

  function selectTool(tool) {
    activeTool = tool;
    btnSponge.classList.toggle('border-amber-400', tool === 'sponge');
    btnSponge.classList.toggle('bg-amber-50', tool === 'sponge');
    btnSponge.classList.toggle('opacity-60', tool !== 'sponge');

    btnWater.classList.toggle('border-blue-400', tool === 'water');
    btnWater.classList.toggle('bg-blue-50', tool === 'water');
    btnWater.classList.toggle('opacity-60', tool !== 'water');

    btnDryer.classList.toggle('border-indigo-400', tool === 'dryer');
    btnDryer.classList.toggle('bg-indigo-50', tool === 'dryer');
    btnDryer.classList.toggle('opacity-60', tool !== 'dryer');

    if (tool === 'sponge') {
      statusBadge.textContent = '1. Scrub Soap 🧽';
      hint.textContent = '👉 Scrub with sponge to make soap foam!';
    } else if (tool === 'water') {
      statusBadge.textContent = '2. Rinse Water 🚿';
      hint.textContent = '👉 Spray water hose to wash away mud & soap!';
    } else {
      statusBadge.textContent = '3. Blow Dry 💨';
      hint.textContent = '👉 Blow warm air to dry the truck!';
    }
  }

  btnSponge.addEventListener('click', () => selectTool('sponge'));
  btnWater.addEventListener('click', () => selectTool('water'));
  btnDryer.addEventListener('click', () => selectTool('dryer'));

  function handleWashAction() {
    if (sparklesActive) return;

    if (activeTool === 'sponge') {
      if (foamLevel < 100) {
        foamLevel = Math.min(100, foamLevel + 25);
        barSponge.style.width = `${foamLevel}%`;
        foamOverlay.style.opacity = `${(foamLevel / 100) * 0.9}`;
        playBubble();

        if (foamLevel >= 100) {
          playDing();
          selectTool('water'); // auto advance tool to water
        }
      }
    } else if (activeTool === 'water') {
      if (cleanLevel < 100) {
        cleanLevel = Math.min(100, cleanLevel + 25);
        barWater.style.width = `${cleanLevel}%`;
        // Reduce foam
        const remainingFoam = Math.max(0, (100 - cleanLevel) / 100);
        foamOverlay.style.opacity = `${remainingFoam * 0.9}`;
        playWaterSpray(0.25);

        // Remove mud splatters
        if (cleanLevel >= 50) {
          vehicleContainer.innerHTML = renderFullVehicleSVG(currentVehicleId, { isDirty: false });
        }

        if (cleanLevel >= 100) {
          playDing();
          selectTool('dryer'); // auto advance tool to dryer
        }
      }
    } else if (activeTool === 'dryer') {
      if (dryLevel < 100) {
        dryLevel = Math.min(100, dryLevel + 25);
        barDryer.style.width = `${dryLevel}%`;
        playDryer(0.3);

        if (dryLevel >= 100) {
          sparklesActive = true;
          sparkleOverlay.classList.remove('hidden');
          playSparkle();
          playFanfare();
          playEngine(1.2);
          triggerConfetti(container, 60);

          setTimeout(() => {
            banner.classList.remove('hidden');
            banner.classList.add('flex', 'animate-fade-in');
          }, 600);
        }
      }
    }
  }

  // Pointer and click interactions on the wash bay
  washBay.addEventListener('pointerdown', (e) => {
    isDragging = true;
    handleWashAction();
  });

  washBay.addEventListener('click', (e) => {
    handleWashAction();
  });

  washBay.addEventListener('pointermove', (e) => {
    if (isDragging) {
      handleWashAction();
    }
  });

  window.addEventListener('pointerup', () => {
    isDragging = false;
  });

  const btnFinish = container.querySelector('#btn-finish-game');
  if (btnFinish) {
    btnFinish.addEventListener('click', () => {
      gameState.setStage('select');
    });
  }
}
