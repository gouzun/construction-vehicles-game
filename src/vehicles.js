// SVG vehicle parts renderer for both Blueprint Puzzle, Site Action, and Car Wash

export function getVehiclePartSVG(vehicleId, partId, options = {}) {
  const { isSilhouette = false, isPreview = false, angle = 0 } = options;
  const fill = isSilhouette ? '#cbd5e1' : undefined;
  const stroke = isSilhouette ? '#94a3b8' : undefined;
  
  if (vehicleId === 'excavator') {
    switch (partId) {
      case 'chassis':
        return `
          <g id="part-excavator-chassis">
            <!-- Main Yellow Revolving Upper Frame -->
            <rect x="50" y="52" width="130" height="38" rx="10" fill="${fill || '#f59e0b'}" stroke="${stroke || '#b45309'}" stroke-width="3" />
            <!-- Counterweight at the back -->
            <rect x="52" y="55" width="38" height="32" rx="6" fill="${fill || '#374151'}" stroke="${stroke || '#1f2937'}" stroke-width="2" />
            <!-- Engine vents -->
            <line x1="58" y1="62" x2="82" y2="62" stroke="${stroke || '#111827'}" stroke-width="2.5" stroke-linecap="round" />
            <line x1="58" y1="68" x2="82" y2="68" stroke="${stroke || '#111827'}" stroke-width="2.5" stroke-linecap="round" />
            <line x1="58" y1="74" x2="82" y2="74" stroke="${stroke || '#111827'}" stroke-width="2.5" stroke-linecap="round" />
            <!-- Caution warning stripes -->
            <rect x="94" y="76" width="75" height="10" fill="${fill || '#1f2937'}" />
            <polygon points="100,86 108,76 114,76 106,86" fill="${fill || '#fbbf24'}" />
            <polygon points="118,86 126,76 132,76 124,86" fill="${fill || '#fbbf24'}" />
            <polygon points="136,86 144,76 150,76 142,86" fill="${fill || '#fbbf24'}" />
            <polygon points="154,86 162,76 168,76 160,86" fill="${fill || '#fbbf24'}" />
          </g>
        `;
        
      case 'wheels':
        return `
          <g id="part-excavator-wheels">
            <!-- Caterpillar Track Outer Loop -->
            <rect x="36" y="90" width="168" height="42" rx="21" fill="${fill || '#374151'}" stroke="${stroke || '#111827'}" stroke-width="4" />
            <rect x="42" y="96" width="156" height="30" rx="15" fill="${fill || '#1f2937'}" />
            <!-- Sprockets & Rollers -->
            <circle cx="56" cy="111" r="12" fill="${fill || '#9ca3af'}" stroke="${stroke || '#4b5563'}" stroke-width="3" />
            <circle cx="56" cy="111" r="4" fill="${fill || '#1f2937'}" />
            <circle cx="86" cy="111" r="10" fill="${fill || '#9ca3af'}" stroke="${stroke || '#4b5563'}" stroke-width="3" />
            <circle cx="86" cy="111" r="3" fill="${fill || '#1f2937'}" />
            <circle cx="116" cy="111" r="10" fill="${fill || '#9ca3af'}" stroke="${stroke || '#4b5563'}" stroke-width="3" />
            <circle cx="116" cy="111" r="3" fill="${fill || '#1f2937'}" />
            <circle cx="146" cy="111" r="10" fill="${fill || '#9ca3af'}" stroke="${stroke || '#4b5563'}" stroke-width="3" />
            <circle cx="146" cy="111" r="3" fill="${fill || '#1f2937'}" />
            <circle cx="178" cy="111" r="12" fill="${fill || '#9ca3af'}" stroke="${stroke || '#4b5563'}" stroke-width="3" />
            <circle cx="178" cy="111" r="4" fill="${fill || '#1f2937'}" />
            <!-- Track Cleats / Treads -->
            <line x1="45" y1="90" x2="45" y2="94" stroke="${stroke || '#111827'}" stroke-width="3" />
            <line x1="75" y1="90" x2="75" y2="94" stroke="${stroke || '#111827'}" stroke-width="3" />
            <line x1="105" y1="90" x2="105" y2="94" stroke="${stroke || '#111827'}" stroke-width="3" />
            <line x1="135" y1="90" x2="135" y2="94" stroke="${stroke || '#111827'}" stroke-width="3" />
            <line x1="165" y1="90" x2="165" y2="94" stroke="${stroke || '#111827'}" stroke-width="3" />
            <line x1="45" y1="128" x2="45" y2="132" stroke="${stroke || '#111827'}" stroke-width="3" />
            <line x1="75" y1="128" x2="75" y2="132" stroke="${stroke || '#111827'}" stroke-width="3" />
            <line x1="105" y1="128" x2="105" y2="132" stroke="${stroke || '#111827'}" stroke-width="3" />
            <line x1="135" y1="128" x2="135" y2="132" stroke="${stroke || '#111827'}" stroke-width="3" />
            <line x1="165" y1="128" x2="165" y2="132" stroke="${stroke || '#111827'}" stroke-width="3" />
          </g>
        `;
        
      case 'cabin':
        return `
          <g id="part-excavator-cabin">
            <!-- Operator Cabin Box -->
            <path d="M 98,16 L 148,16 L 158,54 L 95,54 Z" fill="${fill || '#f59e0b'}" stroke="${stroke || '#b45309'}" stroke-width="3" />
            <!-- Glass Window Front & Side -->
            <path d="M 104,22 L 142,22 L 150,50 L 102,50 Z" fill="${fill || '#38bdf8'}" opacity="0.85" stroke="${stroke || '#0284c7'}" stroke-width="2" />
            <!-- Interior Operator Seat & Steering -->
            <circle cx="116" cy="36" r="6" fill="${fill || '#1e293b'}" />
            <rect x="120" y="38" width="10" height="12" fill="${fill || '#1e293b'}" rx="2" />
            <!-- Orange Roof Flashing Beacon Light -->
            <polygon points="120,16 126,10 132,16" fill="${fill || '#f97316'}" stroke="${stroke || '#ea580c'}" stroke-width="2" />
            <rect x="122" y="14" width="8" height="3" fill="#ffffff" opacity="0.7" />
          </g>
        `;
        
      case 'arm':
        return `
          <g id="part-excavator-arm" transform="rotate(${angle}, 160, 68)">
            <!-- Main Boom Arm -->
            <path d="M 158,68 L 208,22 L 230,26 L 176,76 Z" fill="${fill || '#f59e0b'}" stroke="${stroke || '#b45309'}" stroke-width="3" />
            <!-- Hydraulic Cylinder 1 -->
            <line x1="168" y1="74" x2="202" y2="38" stroke="${stroke || '#9ca3af'}" stroke-width="5" stroke-linecap="round" />
            <line x1="185" y1="56" x2="202" y2="38" stroke="${stroke || '#475569'}" stroke-width="3" stroke-linecap="round" />
            <!-- Dipper Stick Arm -->
            <path d="M 218,22 L 268,66 L 258,74 L 208,30 Z" fill="${fill || '#d97706'}" stroke="${stroke || '#b45309'}" stroke-width="3" />
            <!-- Bucket Shovel with Teeth -->
            <path d="M 264,66 C 285,68 296,88 284,106 L 260,102 C 270,90 266,78 252,72 Z" fill="${fill || '#4b5563'}" stroke="${stroke || '#1f2937'}" stroke-width="3" />
            <!-- Heavy Teeth on Bucket -->
            <polygon points="284,106 292,109 285,102" fill="${fill || '#9ca3af'}" />
            <polygon points="277,105 285,108 278,101" fill="${fill || '#9ca3af'}" />
            <polygon points="270,104 278,107 271,100" fill="${fill || '#9ca3af'}" />
            <!-- Pivot Pin Joints -->
            <circle cx="166" cy="72" r="5" fill="${fill || '#1e293b'}" stroke="#e2e8f0" stroke-width="1.5" />
            <circle cx="218" cy="26" r="4.5" fill="${fill || '#1e293b'}" stroke="#e2e8f0" stroke-width="1.5" />
            <circle cx="264" cy="69" r="4" fill="${fill || '#1e293b'}" stroke="#e2e8f0" stroke-width="1.5" />
          </g>
        `;
    }
  } else if (vehicleId === 'dump_truck') {
    switch (partId) {
      case 'chassis':
        return `
          <g id="part-dump-chassis">
            <!-- Long Steel Chassis I-Beam Frame -->
            <rect x="42" y="68" width="220" height="24" rx="4" fill="${fill || '#374151'}" stroke="${stroke || '#1f2937'}" stroke-width="3" />
            <!-- Heavy Chrome Front Bumper and Grille Base -->
            <rect x="250" y="66" width="18" height="28" rx="4" fill="${fill || '#cbd5e1'}" stroke="${stroke || '#64748b'}" stroke-width="2" />
            <!-- Gas Tank Cylinder Mounted on Chassis -->
            <rect x="135" y="70" width="38" height="18" rx="6" fill="${fill || '#9ca3af'}" stroke="${stroke || '#4b5563'}" stroke-width="2" />
            <circle cx="138" cy="79" r="2.5" fill="#475569" />
            <circle cx="170" cy="79" r="2.5" fill="#475569" />
            <!-- Mudguards over rear and front -->
            <path d="M 46,68 Q 72,50 98,68" stroke="${stroke || '#1f2937'}" stroke-width="5" fill="none" />
            <path d="M 104,68 Q 130,50 156,68" stroke="${stroke || '#1f2937'}" stroke-width="5" fill="none" />
            <path d="M 204,68 Q 230,50 256,68" stroke="${stroke || '#1f2937'}" stroke-width="5" fill="none" />
          </g>
        `;
        
      case 'wheels':
        return `
          <g id="part-dump-wheels">
            <!-- 3 Pairs of Giant Heavy Duty Truck Wheels -->
            <!-- Rear Wheel 1 -->
            <circle cx="72" cy="98" r="24" fill="${fill || '#1f2937'}" stroke="${stroke || '#111827'}" stroke-width="4" />
            <circle cx="72" cy="98" r="14" fill="${fill || '#9ca3af'}" stroke="${stroke || '#4b5563'}" stroke-width="2.5" />
            <circle cx="72" cy="98" r="5" fill="${fill || '#374151'}" />
            <!-- Rear Wheel 2 -->
            <circle cx="130" cy="98" r="24" fill="${fill || '#1f2937'}" stroke="${stroke || '#111827'}" stroke-width="4" />
            <circle cx="130" cy="98" r="14" fill="${fill || '#9ca3af'}" stroke="${stroke || '#4b5563'}" stroke-width="2.5" />
            <circle cx="130" cy="98" r="5" fill="${fill || '#374151'}" />
            <!-- Front Wheel -->
            <circle cx="230" cy="98" r="24" fill="${fill || '#1f2937'}" stroke="${stroke || '#111827'}" stroke-width="4" />
            <circle cx="230" cy="98" r="14" fill="${fill || '#9ca3af'}" stroke="${stroke || '#4b5563'}" stroke-width="2.5" />
            <circle cx="230" cy="98" r="5" fill="${fill || '#374151'}" />
            <!-- Wheel Hub Lug Nuts -->
            <circle cx="72" cy="90" r="1.5" fill="#ffffff" />
            <circle cx="72" cy="106" r="1.5" fill="#ffffff" />
            <circle cx="64" cy="98" r="1.5" fill="#ffffff" />
            <circle cx="80" cy="98" r="1.5" fill="#ffffff" />
            <circle cx="130" cy="90" r="1.5" fill="#ffffff" />
            <circle cx="130" cy="106" r="1.5" fill="#ffffff" />
            <circle cx="122" cy="98" r="1.5" fill="#ffffff" />
            <circle cx="138" cy="98" r="1.5" fill="#ffffff" />
            <circle cx="230" cy="90" r="1.5" fill="#ffffff" />
            <circle cx="230" cy="106" r="1.5" fill="#ffffff" />
            <circle cx="222" cy="98" r="1.5" fill="#ffffff" />
            <circle cx="238" cy="98" r="1.5" fill="#ffffff" />
          </g>
        `;
        
      case 'cabin':
        return `
          <g id="part-dump-cabin">
            <!-- Front Truck Cab -->
            <path d="M 182,30 L 235,30 L 262,56 L 262,70 L 182,70 Z" fill="${fill || '#eab308'}" stroke="${stroke || '#ca8a04'}" stroke-width="3" />
            <!-- Windshield Glass & Door Window -->
            <path d="M 233,34 L 256,54 L 234,54 Z" fill="${fill || '#38bdf8'}" opacity="0.9" stroke="${stroke || '#0284c7'}" stroke-width="2" />
            <rect x="188" y="34" width="38" height="20" rx="3" fill="${fill || '#38bdf8'}" opacity="0.9" stroke="${stroke || '#0284c7'}" stroke-width="2" />
            <!-- Chrome Vertical Exhaust Stack Pipe -->
            <rect x="178" y="10" width="6" height="58" fill="${fill || '#e2e8f0'}" stroke="${stroke || '#94a3b8'}" stroke-width="1.5" />
            <path d="M 178,10 Q 172,6 168,10" stroke="${stroke || '#94a3b8'}" stroke-width="2" fill="none" />
            <!-- Headlight and Front Grille -->
            <rect x="258" y="58" width="6" height="8" rx="2" fill="${fill || '#fef08a'}" stroke="${stroke || '#eab308'}" stroke-width="1.5" />
            <!-- Roof Marker Lights -->
            <circle cx="198" cy="27" r="2.5" fill="${fill || '#f97316'}" />
            <circle cx="215" cy="27" r="2.5" fill="${fill || '#f97316'}" />
            <circle cx="230" cy="27" r="2.5" fill="${fill || '#f97316'}" />
          </g>
        `;
        
      case 'bed':
        return `
          <g id="part-dump-bed" transform="rotate(${angle}, 50, 68)">
            <!-- Tipper Cargo Dumper Bed -->
            <path d="M 44,22 L 175,22 L 180,68 L 44,68 Z" fill="${fill || '#ca8a04'}" stroke="${stroke || '#a16207'}" stroke-width="3" />
            <!-- Bed Ribs / Structural Reinforcements -->
            <rect x="52" y="24" width="22" height="42" fill="${fill || '#eab308'}" rx="2" />
            <rect x="82" y="24" width="22" height="42" fill="${fill || '#eab308'}" rx="2" />
            <rect x="112" y="24" width="22" height="42" fill="${fill || '#eab308'}" rx="2" />
            <rect x="142" y="24" width="22" height="42" fill="${fill || '#eab308'}" rx="2" />
            <!-- Rear Tailgate -->
            <line x1="44" y1="22" x2="44" y2="68" stroke="${stroke || '#713f12'}" stroke-width="4" />
            <circle cx="44" cy="24" r="3" fill="#ffffff" />
            <!-- Hydraulic Lift Piston underneath -->
            <line x1="120" y1="68" x2="140" y2="72" stroke="${stroke || '#94a3b8'}" stroke-width="5" stroke-linecap="round" />
          </g>
        `;
    }
  }
  return '';
}

// Full Render of assembled vehicle
export function renderFullVehicleSVG(vehicleId, options = {}) {
  const { isSilhouette = false, isDirty = false, tiltAngle = 0 } = options;
  let partsHtml = '';
  
  if (vehicleId === 'excavator') {
    // Correct visual layering: wheels behind -> chassis -> cabin -> arm
    partsHtml += getVehiclePartSVG('excavator', 'wheels', { isSilhouette });
    partsHtml += getVehiclePartSVG('excavator', 'chassis', { isSilhouette });
    partsHtml += getVehiclePartSVG('excavator', 'cabin', { isSilhouette });
    partsHtml += getVehiclePartSVG('excavator', 'arm', { isSilhouette, angle: tiltAngle });
  } else {
    // Dump Truck: wheels behind -> chassis -> bed -> cabin
    partsHtml += getVehiclePartSVG('dump_truck', 'wheels', { isSilhouette });
    partsHtml += getVehiclePartSVG('dump_truck', 'chassis', { isSilhouette });
    partsHtml += getVehiclePartSVG('dump_truck', 'bed', { isSilhouette, angle: tiltAngle });
    partsHtml += getVehiclePartSVG('dump_truck', 'cabin', { isSilhouette });
  }
  
  // Dirty mud splatters if dirty
  let dirtyHtml = '';
  if (isDirty) {
    dirtyHtml = `
      <g id="mud-splatters" opacity="0.88">
        <ellipse cx="85" cy="75" rx="20" ry="12" fill="#78350f" />
        <ellipse cx="140" cy="50" rx="25" ry="14" fill="#5c2b09" />
        <ellipse cx="180" cy="78" rx="22" ry="10" fill="#78350f" />
        <circle cx="105" cy="40" r="10" fill="#5c2b09" />
        <circle cx="210" cy="55" r="12" fill="#78350f" />
        <circle cx="60" cy="100" r="14" fill="#451a03" />
        <circle cx="130" cy="102" r="16" fill="#451a03" />
        <circle cx="180" cy="104" r="15" fill="#451a03" />
      </g>
    `;
  }
  
  return `
    <svg viewBox="0 0 310 160" class="vehicle-svg w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="part-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.25"/>
        </filter>
      </defs>
      <g filter="url(#part-shadow)">
        ${partsHtml}
        ${dirtyHtml}
      </g>
    </svg>
  `;
}
