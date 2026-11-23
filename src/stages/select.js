// Vehicle selection screen
import { t } from '../i18n.js';
import { gameState } from '../state.js';
import { renderFullVehicleSVG } from '../vehicles.js';
import { playEngine, playDing } from '../audio.js';

export function renderSelectStage(container) {
  container.innerHTML = `
    <div class="h-full flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b from-sky-100 via-amber-50 to-orange-100 select-none">
      <!-- Title Banner -->
      <div class="text-center mt-2 animate-bounce-short">
        <span class="inline-block px-4 py-1 rounded-full bg-amber-400 text-amber-950 text-xs sm:text-sm font-black uppercase tracking-wider shadow-sm mb-2">
          🚧 ${t('gameTitle')}
        </span>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
          ${t('chooseVehicle')}
        </h1>
        <p class="text-xs sm:text-sm text-slate-600 font-medium mt-1">
          ${t('gameSubtitle')}
        </p>
      </div>

      <!-- Vehicle Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto w-full my-auto">
        <!-- Excavator Card -->
        <button id="btn-select-excavator" class="vehicle-select-card group flex flex-col items-center bg-white border-4 border-amber-300 hover:border-amber-500 rounded-3xl p-4 shadow-lg hover:shadow-xl transition-all active:scale-95 text-center cursor-pointer">
          <div class="w-full h-36 flex items-center justify-center p-2 rounded-2xl bg-amber-50 group-hover:bg-amber-100 transition-colors">
            ${renderFullVehicleSVG('excavator')}
          </div>
          <div class="mt-3">
            <h2 class="text-lg sm:text-xl font-black text-slate-800 group-hover:text-amber-600 transition-colors">
              🚜 ${t('excavator')}
            </h2>
            <p class="text-xs text-slate-500 mt-1 line-clamp-2 px-2">
              ${t('excavatorDesc')}
            </p>
          </div>
          <span class="mt-3 px-4 py-1.5 rounded-full bg-amber-500 text-white font-bold text-xs uppercase shadow tracking-wider group-hover:bg-amber-600">
            ▶ ${t('nextStage')}
          </span>
        </button>

        <!-- Dump Truck Card -->
        <button id="btn-select-dump" class="vehicle-select-card group flex flex-col items-center bg-white border-4 border-yellow-300 hover:border-yellow-500 rounded-3xl p-4 shadow-lg hover:shadow-xl transition-all active:scale-95 text-center cursor-pointer">
          <div class="w-full h-36 flex items-center justify-center p-2 rounded-2xl bg-yellow-50 group-hover:bg-yellow-100 transition-colors">
            ${renderFullVehicleSVG('dump_truck')}
          </div>
          <div class="mt-3">
            <h2 class="text-lg sm:text-xl font-black text-slate-800 group-hover:text-yellow-600 transition-colors">
              🚚 ${t('dumpTruck')}
            </h2>
            <p class="text-xs text-slate-500 mt-1 line-clamp-2 px-2">
              ${t('dumpTruckDesc')}
            </p>
          </div>
          <span class="mt-3 px-4 py-1.5 rounded-full bg-yellow-500 text-white font-bold text-xs uppercase shadow tracking-wider group-hover:bg-yellow-600">
            ▶ ${t('nextStage')}
          </span>
        </button>
      </div>

      <!-- Footer Info -->
      <div class="text-center text-xs text-slate-400 py-2">
        <span>✨ 100% Touch & Mobile Friendly · Multi-Viewport</span>
      </div>
    </div>
  `;

  // Attach event handlers
  const btnExcavator = container.querySelector('#btn-select-excavator');
  const btnDump = container.querySelector('#btn-select-dump');

  btnExcavator.addEventListener('click', () => {
    playDing();
    playEngine(0.6);
    gameState.selectVehicle('excavator');
  });

  btnDump.addEventListener('click', () => {
    playDing();
    playEngine(0.6);
    gameState.selectVehicle('dump_truck');
  });
}
