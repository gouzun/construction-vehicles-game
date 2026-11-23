// Stage 3: Construction Site Action (Digging Earth & Dumping Foundation)
import { t } from '../i18n.js';
import { gameState, VEHICLES } from '../state.js';
import { getVehiclePartSVG } from '../vehicles.js';
import { playDig, playDump, playDing, playFanfare, playEngine } from '../audio.js';
import { triggerConfetti } from '../confetti.js';

export function renderSiteStage(container) {
  const currentVehicleId = gameState.getState().vehicleId;
  const vehicleConfig = VEHICLES[currentVehicleId];
  let actionCount = gameState.getState().siteActionCount || 0;
  const totalActions = vehicleConfig.taskCount || 3;
  let isAnimating = false;
  let tiltAngle = 0;

  function renderBuildingGraphic(level) {
    // 0: Bare trench, 1: Foundation poured, 2: Brick wall risen, 3: Full structure complete
    if (level === 0) {
      return `
        <!-- Deep trench dug in ground -->
        <rect x="20" y="70" width="120" height="35" rx="4" fill="#78350f" stroke="#451a03" stroke-width="2" />
        <line x1="25" y1="88" x2="135" y2="88" stroke="#92400e" stroke-width="2" stroke-dasharray="4" />
      `;
    } else if (level === 1) {
      return `
        <!-- Concrete Slab Foundation Poured -->
        <rect x="20" y="65" width="120" height="40" rx="4" fill="#94a3b8" stroke="#475569" stroke-width="3" />
        <rect x="28" y="72" width="104" height="26" fill="#cbd5e1" rx="2" />
        <text x="80" y="88" font-size="9" font-weight="bold" fill="#475569" text-anchor="middle">CONCRETE SLAB</text>
      `;
    } else if (level === 2) {
      return `
        <!-- Brick walls rising -->
        <rect x="20" y="45" width="120" height="60" rx="4" fill="#e2e8f0" stroke="#475569" stroke-width="3" />
        <!-- Red Brick pattern -->
        <rect x="25" y="52" width="50" height="15" fill="#f87171" stroke="#dc2626" rx="1" />
        <rect x="80" y="52" width="54" height="15" fill="#f87171" stroke="#dc2626" rx="1" />
        <rect x="25" y="72" width="110" height="15" fill="#f87171" stroke="#dc2626" rx="1" />
        <rect x="68" y="70" width="24" height="34" fill="#38bdf8" stroke="#0284c7" stroke-width="2" />
      `;
    } else {
      return `
        <!-- Completed Cozy House -->
        <!-- Roof Triangle -->
        <polygon points="80,10 15,48 145,48" fill="#ef4444" stroke="#b91c1c" stroke-width="3" />
        <!-- House Walls -->
        <rect x="24" y="48" width="112" height="58" rx="2" fill="#fed7aa" stroke="#ea580c" stroke-width="3" />
        <!-- Window -->
        <rect x="36" y="58" width="24" height="24" rx="3" fill="#38bdf8" stroke="#0284c7" stroke-width="2" />
        <line x1="48" y1="58" x2="48" y2="82" stroke="#ffffff" stroke-width="2" />
        <line x1="36" y1="70" x2="60" y2="70" stroke="#ffffff" stroke-width="2" />
        <!-- Front Door -->
        <rect x="82" y="58" width="24" height="48" rx="3" fill="#b45309" stroke="#78350f" stroke-width="2" />
        <circle cx="100" cy="82" r="2.5" fill="#fef08a" />
        <!-- Chimney with smoke -->
        <rect x="110" y="16" width="14" height="24" fill="#b91c1c" stroke="#991b1b" stroke-width="2" />
        <circle cx="117" cy="10" r="4" fill="#cbd5e1" opacity="0.8" />
        <circle cx="122" cy="4" r="5" fill="#cbd5e1" opacity="0.6" />
      `;
    }
  }

  function getHtml() {
    return `
      <div class="h-full flex flex-col justify-between p-3 sm:p-5 bg-gradient-to-b from-sky-300 via-amber-100 to-amber-200 select-none overflow-hidden relative">
        <!-- Top Stage Header -->
        <div class="flex items-center justify-between gap-2">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full bg-amber-600 text-white text-xs font-black uppercase">
                3 / 4
              </span>
              <h2 class="text-lg sm:text-xl font-black text-slate-800">
                🏗️ ${t('stageSite')}
              </h2>
            </div>
            <p class="text-xs text-slate-600 font-medium">
              ${t('stageSiteHint')}
            </p>
          </div>
          <!-- Progress Tracker -->
          <div class="flex items-center gap-2 px-3 py-1.5 bg-white/85 backdrop-blur rounded-2xl shadow-sm border border-amber-300">
            <span class="text-xs font-bold text-slate-600">${t('foundationProgress')}:</span>
            <span id="site-counter" class="text-sm font-black text-amber-600">${actionCount} / ${totalActions}</span>
          </div>
        </div>

        <!-- Center Stage: Construction Job Site -->
        <div class="relative my-auto w-full max-w-xl mx-auto flex flex-col items-center justify-between p-3 sm:p-4 bg-white/70 backdrop-blur rounded-3xl border border-amber-200 shadow-lg min-h-[260px] overflow-hidden">
          
          <!-- Background Crane and Sky -->
          <div class="w-full flex items-center justify-between px-2 mb-1 opacity-70">
            <span class="text-xs font-bold text-slate-500">📍 CITY EXPANSION LOT #7</span>
            <span class="text-xl">🏗️ 🌤️</span>
          </div>

          <!-- Interactive Site Grid (Building on Left, Machine on Right) -->
          <div class="w-full grid grid-cols-2 gap-2 items-end my-auto py-2">
            <!-- Left: Building Construction Progress -->
            <div class="flex flex-col items-center justify-end h-40 bg-amber-50/80 rounded-2xl p-2 border-2 border-dashed border-amber-300 relative">
              <span class="absolute top-2 left-2 text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-200 px-2 py-0.5 rounded-full">
                Level ${actionCount}
              </span>
              <svg id="building-svg" viewBox="0 0 160 110" class="w-full h-auto max-h-32 filter drop-shadow">
                ${renderBuildingGraphic(actionCount)}
              </svg>
            </div>

            <!-- Right: Working Construction Vehicle -->
            <div id="machine-slot" class="flex flex-col items-center justify-end h-40 rounded-2xl p-1 relative cursor-pointer active:scale-95 transition-transform">
              <svg id="vehicle-action-svg" viewBox="0 0 310 160" class="w-full h-auto max-h-36 filter drop-shadow transition-transform duration-300 ${isAnimating ? (currentVehicleId === 'excavator' ? 'translate-y-2' : '-translate-y-2') : ''}">
                ${currentVehicleId === 'excavator' ? `
                  ${getVehiclePartSVG('excavator', 'wheels')}
                  ${getVehiclePartSVG('excavator', 'chassis')}
                  ${getVehiclePartSVG('excavator', 'cabin')}
                  ${getVehiclePartSVG('excavator', 'arm', { angle: tiltAngle })}
                ` : `
                  ${getVehiclePartSVG('dump_truck', 'wheels')}
                  ${getVehiclePartSVG('dump_truck', 'chassis')}
                  ${getVehiclePartSVG('dump_truck', 'bed', { angle: tiltAngle })}
                  ${getVehiclePartSVG('dump_truck', 'cabin')}
                `}
              </svg>
              <!-- Earth / Gravel Mound under vehicle -->
              <div class="w-full h-3 bg-amber-800/80 rounded-full mt-1"></div>
            </div>
          </div>

          <!-- Big Action Button -->
          <div class="w-full flex flex-col items-center gap-2 mt-2">
            <button 
              id="btn-perform-action"
              class="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-black text-sm uppercase shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer ${actionCount >= totalActions ? 'opacity-50 cursor-not-allowed' : ''}"
              ${actionCount >= totalActions ? 'disabled' : ''}
            >
              <span class="text-xl">${currentVehicleId === 'excavator' ? '⛏️' : '🚛'}</span>
              <span>${t(vehicleConfig.taskActionKey)}</span>
            </button>
            <span class="text-[11px] text-slate-500 font-medium">
              ${currentVehicleId === 'excavator' ? 'Tap to scoop earth into foundation' : 'Tap to dump gravel and raise walls'}
            </span>
          </div>

          <!-- Success Banner -->
          <div id="site-success-banner" class="${actionCount >= totalActions ? 'flex' : 'hidden'} absolute inset-0 bg-white/90 backdrop-blur-md rounded-3xl flex-col items-center justify-center p-4 text-center z-20">
            <div class="text-4xl animate-bounce mb-2">🏠🎉</div>
            <h3 class="text-xl font-black text-slate-800">${t('foundationComplete')}</h3>
            <p class="text-xs text-slate-600 font-semibold mb-4">The truck got very muddy! Time for a wash!</p>
            <button id="btn-to-wash" class="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold text-sm uppercase shadow-lg hover:shadow-xl active:scale-95 transition-all">
              ${t('nextStage')} (🧼 ${t('stageWash')})
            </button>
          </div>
        </div>

        <!-- Footer Info -->
        <div class="text-center text-xs text-slate-500 py-1">
          <span>Step 3 of 4 · Construction Operation</span>
        </div>
      </div>
    `;
  }

  container.innerHTML = getHtml();

  function triggerAction() {
    if (actionCount >= totalActions || isAnimating) return;
    isAnimating = true;

    if (currentVehicleId === 'excavator') {
      playDig();
      playEngine(0.6);
      tiltAngle = -22; // bucket dips down into soil
    } else {
      playDump();
      playEngine(0.6);
      tiltAngle = 26; // dumper bed lifts up
    }

    // Update vehicle tilt in DOM
    const vehicleSvg = container.querySelector('#vehicle-action-svg');
    if (vehicleSvg) {
      if (currentVehicleId === 'excavator') {
        vehicleSvg.innerHTML = `
          ${getVehiclePartSVG('excavator', 'wheels')}
          ${getVehiclePartSVG('excavator', 'chassis')}
          ${getVehiclePartSVG('excavator', 'cabin')}
          ${getVehiclePartSVG('excavator', 'arm', { angle: tiltAngle })}
        `;
      } else {
        vehicleSvg.innerHTML = `
          ${getVehiclePartSVG('dump_truck', 'wheels')}
          ${getVehiclePartSVG('dump_truck', 'chassis')}
          ${getVehiclePartSVG('dump_truck', 'bed', { angle: tiltAngle })}
          ${getVehiclePartSVG('dump_truck', 'cabin')}
        `;
      }
    }

    setTimeout(() => {
      // Revert tilt angle
      tiltAngle = 0;
      if (vehicleSvg) {
        if (currentVehicleId === 'excavator') {
          vehicleSvg.innerHTML = `
            ${getVehiclePartSVG('excavator', 'wheels')}
            ${getVehiclePartSVG('excavator', 'chassis')}
            ${getVehiclePartSVG('excavator', 'cabin')}
            ${getVehiclePartSVG('excavator', 'arm', { angle: tiltAngle })}
          `;
        } else {
          vehicleSvg.innerHTML = `
            ${getVehiclePartSVG('dump_truck', 'wheels')}
            ${getVehiclePartSVG('dump_truck', 'chassis')}
            ${getVehiclePartSVG('dump_truck', 'bed', { angle: tiltAngle })}
            ${getVehiclePartSVG('dump_truck', 'cabin')}
          `;
        }
      }

      actionCount++;
      gameState.performSiteAction();
      isAnimating = false;

      // Update building SVG
      const buildingSvg = container.querySelector('#building-svg');
      if (buildingSvg) {
        buildingSvg.innerHTML = renderBuildingGraphic(actionCount);
      }

      const counter = container.querySelector('#site-counter');
      if (counter) {
        counter.textContent = `${actionCount} / ${totalActions}`;
      }

      playDing();

      if (actionCount >= totalActions) {
        setTimeout(() => {
          playFanfare();
          triggerConfetti(container, 50);
          const banner = container.querySelector('#site-success-banner');
          if (banner) {
            banner.classList.remove('hidden');
            banner.classList.add('flex', 'animate-fade-in');
          }
        }, 400);
      }
    }, 650);
  }

  const btnAction = container.querySelector('#btn-perform-action');
  const machineSlot = container.querySelector('#machine-slot');
  btnAction.addEventListener('click', triggerAction);
  machineSlot.addEventListener('click', triggerAction);

  const btnToWash = container.querySelector('#btn-to-wash');
  if (btnToWash) {
    btnToWash.addEventListener('click', () => {
      gameState.setStage('wash');
    });
  }
}
