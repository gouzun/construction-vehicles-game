// Stage 1: Vehicle Assembly Puzzle (Drag & Drop + Tap Snapping)
import { t } from '../i18n.js';
import { gameState, VEHICLES } from '../state.js';
import { getVehiclePartSVG } from '../vehicles.js';
import { playSnap, playFanfare, playEngine } from '../audio.js';
import { triggerConfetti } from '../confetti.js';

export function renderAssemblyStage(container) {
  const currentVehicleId = gameState.getState().vehicleId;
  const vehicleConfig = VEHICLES[currentVehicleId];
  const assembled = new Set(gameState.getState().assembledParts);
  const isComplete = vehicleConfig.parts.every(p => assembled.has(p.id));

  container.innerHTML = `
    <div class="h-full flex flex-col justify-between p-3 sm:p-5 bg-gradient-to-b from-sky-100 via-slate-50 to-amber-100 select-none overflow-hidden relative">
      <!-- Top Stage Header -->
      <div class="flex items-center justify-between gap-2">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-xs font-black uppercase">
              1 / 4
            </span>
            <h2 class="text-lg sm:text-xl font-black text-slate-800">
              🧩 ${t('stageAssembly')}
            </h2>
          </div>
          <p class="text-xs text-slate-500 font-medium">
            ${t('stageAssemblyHint')}
          </p>
        </div>
        <!-- Progress Counter -->
        <div class="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-slate-200">
          <span class="text-xs font-bold text-slate-600">Parts:</span>
          <span id="assembly-counter" class="text-sm font-black text-amber-600">${assembled.size} / ${vehicleConfig.parts.length}</span>
        </div>
      </div>

      <!-- Center: Blueprint Vehicle Work Bench -->
      <div id="assembly-bench" class="relative my-auto w-full max-w-lg mx-auto flex items-center justify-center p-4 bg-white/70 backdrop-blur rounded-3xl border-2 border-dashed border-slate-300 shadow-inner min-h-[220px]">
        <!-- Blueprint Grid Background Pattern -->
        <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] rounded-3xl pointer-events-none"></div>
        
        <!-- SVG Canvas for Assembled & Ghost Parts -->
        <svg id="blueprint-canvas" viewBox="0 0 310 160" class="w-full h-auto max-h-56 filter drop-shadow">
          <!-- Render Ghost Silhouette for unplaced parts, or real part for placed -->
          <g id="layer-wheels">
            ${getVehiclePartSVG(currentVehicleId, 'wheels', { isSilhouette: !assembled.has('wheels') })}
          </g>
          <g id="layer-chassis">
            ${getVehiclePartSVG(currentVehicleId, 'chassis', { isSilhouette: !assembled.has('chassis') })}
          </g>
          <g id="layer-${currentVehicleId === 'excavator' ? 'bed' : 'bed'}">
            ${currentVehicleId === 'dump_truck' ? getVehiclePartSVG('dump_truck', 'bed', { isSilhouette: !assembled.has('bed') }) : ''}
          </g>
          <g id="layer-cabin">
            ${getVehiclePartSVG(currentVehicleId, 'cabin', { isSilhouette: !assembled.has('cabin') })}
          </g>
          <g id="layer-arm">
            ${currentVehicleId === 'excavator' ? getVehiclePartSVG('excavator', 'arm', { isSilhouette: !assembled.has('arm') }) : ''}
          </g>
        </svg>

        <!-- Completion Overlay -->
        <div id="assembly-success-banner" class="${isComplete ? 'flex' : 'hidden'} absolute inset-0 bg-white/85 backdrop-blur-md rounded-3xl flex-col items-center justify-center p-4 text-center z-20">
          <div class="text-4xl animate-bounce mb-2">🎉</div>
          <h3 class="text-xl font-black text-slate-800">${t('greatJob')}</h3>
          <p class="text-xs text-slate-600 font-semibold mb-4">${t('perfect')}</p>
          <button id="btn-to-fueling" class="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm uppercase shadow-lg hover:shadow-xl active:scale-95 transition-all">
            ${t('nextStage')} (⛽ ${t('stageFueling')})
          </button>
        </div>
      </div>

      <!-- Bottom: Parts Tray to Pick / Drag -->
      <div class="w-full max-w-xl mx-auto">
        <div class="text-xs font-bold text-slate-500 mb-1.5 flex items-center justify-between">
          <span>Tap or drag parts to fit:</span>
          <span class="text-amber-600 font-medium">⚡ Snap to slot</span>
        </div>
        <div id="parts-tray" class="grid grid-cols-4 gap-2 sm:gap-3 bg-white/90 backdrop-blur p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-md">
          ${vehicleConfig.parts.map(part => {
            const isPlaced = assembled.has(part.id);
            return `
              <div 
                id="tray-part-${part.id}"
                data-part-id="${part.id}"
                class="part-item flex flex-col items-center justify-center p-2 rounded-xl border-2 ${isPlaced ? 'opacity-30 border-slate-200 bg-slate-100 cursor-not-allowed' : 'border-amber-400 bg-amber-50 hover:bg-amber-100 active:scale-95 cursor-pointer shadow-sm hover:shadow'} transition-all"
                draggable="${!isPlaced}"
              >
                <div class="w-full h-12 flex items-center justify-center pointer-events-none">
                  <svg viewBox="0 0 310 160" class="w-full h-full">
                    ${getVehiclePartSVG(currentVehicleId, part.id, { isSilhouette: false })}
                  </svg>
                </div>
                <span class="text-[10px] sm:text-xs font-bold text-slate-700 mt-1 text-center truncate w-full pointer-events-none">
                  ${t(part.nameKey)}
                </span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  // Attach drag & drop + click interactions
  const trayItems = container.querySelectorAll('.part-item');
  const bench = container.querySelector('#assembly-bench');

  function snapPart(partId) {
    if (gameState.assemblePart(partId)) {
      playSnap();
      
      // Update SVG layer immediately
      const layer = container.querySelector(`#layer-${partId}`);
      if (layer) {
        layer.innerHTML = getVehiclePartSVG(currentVehicleId, partId, { isSilhouette: false });
        layer.classList.add('animate-ping-once');
      }

      // Update tray item
      const trayItem = container.querySelector(`#tray-part-${partId}`);
      if (trayItem) {
        trayItem.classList.add('opacity-30', 'border-slate-200', 'bg-slate-100', 'cursor-not-allowed');
        trayItem.classList.remove('border-amber-400', 'bg-amber-50', 'hover:bg-amber-100', 'cursor-pointer');
        trayItem.draggable = false;
      }

      // Update counter
      const counter = container.querySelector('#assembly-counter');
      if (counter) {
        const count = gameState.getState().assembledParts.length;
        counter.textContent = `${count} / ${vehicleConfig.parts.length}`;
      }

      // Check if all assembled
      if (gameState.isAssemblyComplete()) {
        setTimeout(() => {
          playFanfare();
          playEngine(1.2);
          triggerConfetti(container, 50);
          const banner = container.querySelector('#assembly-success-banner');
          if (banner) {
            banner.classList.remove('hidden');
            banner.classList.add('flex', 'animate-fade-in');
          }
        }, 300);
      }
    }
  }

  // 1. Click-to-snap (touch friendly)
  trayItems.forEach(item => {
    item.addEventListener('click', () => {
      const partId = item.getAttribute('data-part-id');
      if (!gameState.getState().assembledParts.includes(partId)) {
        snapPart(partId);
      }
    });

    // 2. Drag & Drop HTML5
    item.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', item.getAttribute('data-part-id'));
    });
  });

  bench.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  bench.addEventListener('drop', (e) => {
    e.preventDefault();
    const partId = e.dataTransfer.getData('text/plain');
    if (partId && !gameState.getState().assembledParts.includes(partId)) {
      snapPart(partId);
    }
  });

  // Next stage button
  const btnNext = container.querySelector('#btn-to-fueling');
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      gameState.setStage('fueling');
    });
  }
}
