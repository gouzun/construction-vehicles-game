// Stage 2: Fueling Station (Interactive Gas Pump & Tank Gauge)
import { t } from '../i18n.js';
import { gameState } from '../state.js';
import { renderFullVehicleSVG } from '../vehicles.js';
import { playPumpPulse, playDing, playFanfare, playEngine } from '../audio.js';
import { triggerConfetti } from '../confetti.js';

export function renderFuelingStage(container) {
  const currentVehicleId = gameState.getState().vehicleId;
  let fuelLevel = gameState.getState().fuelLevel || 0;
  let isNozzleInserted = fuelLevel > 0;
  let isPumpHeld = false;
  let pumpInterval = null;

  container.innerHTML = `
    <div class="h-full flex flex-col justify-between p-3 sm:p-5 bg-gradient-to-b from-sky-200 via-amber-50 to-emerald-100 select-none overflow-hidden relative">
      <!-- Top Stage Header -->
      <div class="flex items-center justify-between gap-2">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-black uppercase">
              2 / 4
            </span>
            <h2 class="text-lg sm:text-xl font-black text-slate-800">
              ⛽ ${t('stageFueling')}
            </h2>
          </div>
          <p class="text-xs text-slate-500 font-medium">
            ${t('stageFuelingHint')}
          </p>
        </div>
        <!-- Digital Fuel Meter -->
        <div class="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-emerald-400 rounded-xl shadow border border-slate-700 font-mono">
          <span class="text-xs text-slate-400 uppercase">GAS:</span>
          <span id="fuel-display" class="text-sm sm:text-base font-black">${fuelLevel}%</span>
        </div>
      </div>

      <!-- Center Scene: Gas Station & Vehicle -->
      <div class="relative my-auto w-full max-w-xl mx-auto flex flex-col items-center justify-center p-3 sm:p-5 bg-white/75 backdrop-blur rounded-3xl border border-slate-200 shadow-lg min-h-[260px]">
        
        <!-- Gas Pump Canopy / Machine -->
        <div class="w-full flex items-center justify-between px-2 mb-2">
          <!-- Gas Pump Dispenser -->
          <div class="flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white p-2.5 rounded-2xl shadow-md border-2 border-red-700">
            <div class="text-2xl">⛽</div>
            <div class="text-left leading-tight">
              <span class="block text-[10px] font-bold text-red-100 uppercase tracking-widest">Octane 98</span>
              <span class="block text-xs font-black">SUPER FUEL</span>
            </div>
          </div>

          <!-- Fuel Tank Visual Level Gauge -->
          <div class="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-2xl border border-slate-300">
            <span class="text-xs font-bold text-slate-600">${t('fuelLevel')}:</span>
            <div class="w-24 sm:w-32 h-5 bg-slate-200 rounded-full overflow-hidden border border-slate-300 relative">
              <div id="fuel-bar" class="h-full bg-gradient-to-r from-amber-400 to-emerald-500 transition-all duration-150" style="width: ${fuelLevel}%"></div>
              <!-- Bubbles animation in bar -->
              <div class="absolute inset-0 opacity-40 bg-[radial-gradient(#fff_2px,transparent_2px)] [background-size:8px_8px]"></div>
            </div>
          </div>
        </div>

        <!-- Vehicle Scene with Interactive Nozzle -->
        <div class="relative w-full max-w-md my-2 flex items-center justify-center">
          <!-- Truck SVG -->
          <div class="w-full h-auto max-h-52 filter drop-shadow-md">
            ${renderFullVehicleSVG(currentVehicleId)}
          </div>

          <!-- Gas Tank Inlet Hotspot -->
          <div id="tank-inlet" class="absolute ${currentVehicleId === 'excavator' ? 'left-[46%] top-[55%]' : 'left-[52%] top-[58%]'} -translate-x-1/2 -translate-y-1/2 z-10">
            <button id="btn-nozzle-target" class="group flex items-center justify-center p-2 rounded-full ${isNozzleInserted ? 'bg-emerald-500 ring-4 ring-emerald-300' : 'bg-red-500 animate-pulse ring-4 ring-red-200'} text-white shadow-lg cursor-pointer transition-all">
              <span class="text-sm">${isNozzleInserted ? '🔌' : '⛽'}</span>
            </button>
          </div>
        </div>

        <!-- Interactive Pump Controls -->
        <div class="w-full flex flex-col items-center gap-2 mt-2">
          <!-- Hold Pump Button -->
          <button 
            id="btn-hold-pump"
            class="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 text-white font-black text-sm uppercase shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer select-none"
          >
            <span class="text-xl">⛽</span>
            <span id="btn-pump-text">${fuelLevel >= 100 ? t('fuelFull') : t('holdToPump')}</span>
          </button>
          <span class="text-[11px] text-slate-500 font-medium">
            💡 Touch & hold the green button to pump fuel
          </span>
        </div>

        <!-- Full Fuel Success Banner -->
        <div id="fuel-success-banner" class="${fuelLevel >= 100 ? 'flex' : 'hidden'} absolute inset-0 bg-white/90 backdrop-blur-md rounded-3xl flex-col items-center justify-center p-4 text-center z-20">
          <div class="text-4xl animate-bounce mb-2">🎉</div>
          <h3 class="text-xl font-black text-slate-800">${t('fuelFull')}</h3>
          <p class="text-xs text-slate-600 font-semibold mb-4">100% Full Tank! Engine Ready!</p>
          <button id="btn-to-site" class="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-sm uppercase shadow-lg hover:shadow-xl active:scale-95 transition-all">
            ${t('nextStage')} (🏗️ ${t('stageSite')})
          </button>
        </div>
      </div>

      <!-- Quick Action Guide -->
      <div class="text-center text-xs text-slate-400 py-1">
        <span>Step 2 of 4 · Fueling Station</span>
      </div>
    </div>
  `;

  const btnPump = container.querySelector('#btn-hold-pump');
  const btnPumpText = container.querySelector('#btn-pump-text');
  const fuelBar = container.querySelector('#fuel-bar');
  const fuelDisplay = container.querySelector('#fuel-display');
  const nozzleBtn = container.querySelector('#btn-nozzle-target');
  const successBanner = container.querySelector('#fuel-success-banner');
  const btnToSite = container.querySelector('#btn-to-site');

  function updateFuel(newLevel) {
    fuelLevel = Math.min(100, Math.max(0, newLevel));
    gameState.setFuelLevel(fuelLevel);
    fuelBar.style.width = `${fuelLevel}%`;
    fuelDisplay.textContent = `${Math.round(fuelLevel)}%`;

    if (fuelLevel >= 100) {
      stopPumping();
      playDing();
      playFanfare();
      playEngine(1.2);
      triggerConfetti(container, 45);
      btnPumpText.textContent = t('fuelFull');
      btnPump.disabled = true;
      btnPump.classList.add('opacity-50', 'cursor-not-allowed');
      setTimeout(() => {
        successBanner.classList.remove('hidden');
        successBanner.classList.add('flex', 'animate-fade-in');
      }, 400);
    }
  }

  function startPumping() {
    if (fuelLevel >= 100) return;
    isPumpHeld = true;
    isNozzleInserted = true;
    nozzleBtn.classList.remove('bg-red-500', 'animate-pulse');
    nozzleBtn.classList.add('bg-emerald-500', 'ring-4', 'ring-emerald-300');
    
    // Play immediate pulse
    playPumpPulse();
    updateFuel(fuelLevel + 4);

    pumpInterval = setInterval(() => {
      if (fuelLevel < 100) {
        playPumpPulse();
        updateFuel(fuelLevel + 4);
      } else {
        stopPumping();
      }
    }, 180);
  }

  function stopPumping() {
    isPumpHeld = false;
    if (pumpInterval) {
      clearInterval(pumpInterval);
      pumpInterval = null;
    }
  }

  // Pointer/Touch listeners for Hold-to-pump or single click tap
  btnPump.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    startPumping();
  });

  btnPump.addEventListener('click', (e) => {
    if (fuelLevel < 100) {
      playPumpPulse();
      updateFuel(fuelLevel + 15);
    }
  });

  window.addEventListener('pointerup', () => {
    if (isPumpHeld) stopPumping();
  });

  window.addEventListener('pointercancel', () => {
    if (isPumpHeld) stopPumping();
  });

  // Tap nozzle to insert/connect and pump
  nozzleBtn.addEventListener('click', () => {
    playDing();
    if (fuelLevel < 100) {
      updateFuel(fuelLevel + 20);
    }
  });

  if (btnToSite) {
    btnToSite.addEventListener('click', () => {
      gameState.setStage('site');
    });
  }
}
