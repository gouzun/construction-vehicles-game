// Procedural 2D Game Renderer for Construction Vehicles
// Renders vehicles with cartoon shading, outlines, highlights, dirt/foam particles, and joint kinematics.

export function drawCartoonRect(ctx, x, y, w, h, r = 8, fill = '#f59e0b', stroke = '#1e293b', strokeW = 4) {
  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke && strokeW > 0) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeW;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
  // Subtle top specular highlight
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x + 3, y + 3, Math.max(2, w - 6), Math.max(2, h * 0.28), Math.max(2, r - 2));
  } else {
    ctx.rect(x + 3, y + 3, Math.max(2, w - 6), Math.max(2, h * 0.28));
  }
  ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.fill();
  ctx.restore();
}

export function drawCartoonCircle(ctx, cx, cy, radius, fill = '#374151', stroke = '#111827', strokeW = 4) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke && strokeW > 0) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeW;
    ctx.stroke();
  }
  // Rim highlight
  ctx.beginPath();
  ctx.arc(cx - radius * 0.25, cy - radius * 0.25, radius * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.fill();
  ctx.restore();
}

// 1. Excavator Graphics
export function drawExcavatorTracks(ctx, x, y, w = 190, h = 48, rotation = 0) {
  ctx.save();
  ctx.translate(x, y);

  // Outer rubber track body
  drawCartoonRect(ctx, 0, 0, w, h, h / 2, '#374151', '#111827', 5);
  drawCartoonRect(ctx, 12, 8, w - 24, h - 16, (h - 16) / 2, '#1f2937', null, 0);

  // Big drive sprockets at ends
  const rBig = 15;
  const numRollers = 5;
  const startX = 22;
  const stepX = (w - 44) / (numRollers - 1);

  for (let i = 0; i < numRollers; i++) {
    const rx = startX + i * stepX;
    const ry = h / 2;
    const isEnd = i === 0 || i === numRollers - 1;
    drawCartoonCircle(ctx, rx, ry, isEnd ? rBig : 11, '#9ca3af', '#374151', 3);
    drawCartoonCircle(ctx, rx, ry, isEnd ? 5 : 3.5, '#1f2937', null, 0);

    // Tread teeth dots rotating with movement
    for (let a = 0; a < 4; a++) {
      const ang = rotation + a * (Math.PI / 2);
      const dotX = rx + Math.cos(ang) * (isEnd ? 9 : 6);
      const dotY = ry + Math.sin(ang) * (isEnd ? 9 : 6);
      ctx.beginPath();
      ctx.arc(dotX, dotY, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = '#4b5563';
      ctx.fill();
    }
  }

  // Tread cleats top and bottom
  for (let cx = 15; cx < w - 15; cx += 18) {
    ctx.fillStyle = '#111827';
    ctx.fillRect(cx, -2, 6, 6);
    ctx.fillRect(cx, h - 4, 6, 6);
  }

  ctx.restore();
}

export function drawExcavatorBody(ctx, x, y, options = {}) {
  const { angle = 0, isSilhouette = false, color = '#f59e0b', shadow = true } = options;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  const fill = isSilhouette ? '#94a3b8' : color;
  const stroke = isSilhouette ? '#64748b' : '#b45309';

  // Revolving base turn-table ring
  drawCartoonRect(ctx, 15, 45, 120, 10, 4, isSilhouette ? '#64748b' : '#475569', '#1e293b', 3);

  // Counterweight back block
  drawCartoonRect(ctx, -5, -5, 45, 52, 12, isSilhouette ? '#64748b' : '#374151', '#1e293b', 4);
  // Engine ventilation grilles
  if (!isSilhouette) {
    ctx.fillStyle = '#111827';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(5, 6 + i * 9, 26, 4);
    }
  }

  // Main Cab Engine Housing
  drawCartoonRect(ctx, 35, 2, 100, 45, 14, fill, stroke, 4);

  // Hazard warning chevron stripe on bottom edge
  if (!isSilhouette) {
    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(40, 32, 90, 12, 3);
    else ctx.rect(40, 32, 90, 12);
    ctx.clip();
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(40, 32, 90, 12);
    ctx.fillStyle = '#fbbf24';
    for (let c = 35; c < 140; c += 18) {
      ctx.beginPath();
      ctx.moveTo(c, 44);
      ctx.lineTo(c + 8, 32);
      ctx.lineTo(c + 15, 32);
      ctx.lineTo(c + 7, 44);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Operator Cabin
  drawCartoonRect(ctx, 50, -42, 60, 46, 10, fill, stroke, 4);

  // Cabin Glass Windshield (Sky tint & reflection)
  const glassFill = isSilhouette ? '#cbd5e1' : '#38bdf8';
  drawCartoonRect(ctx, 56, -36, 48, 36, 6, glassFill, '#0284c7', 3);
  if (!isSilhouette) {
    // Glass glare slash
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(62, -4);
    ctx.lineTo(82, -34);
    ctx.lineTo(92, -34);
    ctx.lineTo(72, -4);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.fill();
    ctx.restore();

    // Little cartoon driver helmet inside cabin
    ctx.beginPath();
    ctx.arc(76, -14, 9, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Safety cap visor
    ctx.fillRect(72, -16, 12, 3);
  }

  // Flashing Warning Beacon on roof
  if (!isSilhouette) {
    drawCartoonRect(ctx, 72, -50, 14, 9, 4, '#f97316', '#c2410c', 2);
    ctx.beginPath();
    ctx.arc(79, -46, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#fef08a';
    ctx.fill();
  }

  ctx.restore();
}

// Articulated Excavator Arm: Boom + Stick + Bucket
export function drawExcavatorArm(ctx, rootX, rootY, angles = {}, isSilhouette = false) {
  const { boomAngle = -0.65, stickAngle = 1.1, bucketAngle = 0.4 } = angles;
  const fill = isSilhouette ? '#94a3b8' : '#f59e0b';
  const accentFill = isSilhouette ? '#64748b' : '#d97706';
  const stroke = isSilhouette ? '#64748b' : '#b45309';

  ctx.save();
  ctx.translate(rootX, rootY);

  // Boom Pivot Base Joint Pin
  drawCartoonCircle(ctx, 0, 0, 9, '#475569', '#1e293b', 3);

  // --- BOOM ARM (Segment 1, ~110px length) ---
  ctx.rotate(boomAngle);
  const boomLen = 115;

  // Boom beam
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(boomLen * 0.45, -20);
  ctx.lineTo(boomLen, -7);
  ctx.lineTo(boomLen, 7);
  ctx.lineTo(boomLen * 0.45, 14);
  ctx.lineTo(0, 14);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Boom hydraulic cylinder
  if (!isSilhouette) {
    ctx.beginPath();
    ctx.moveTo(10, 8);
    ctx.lineTo(boomLen * 0.6, 2);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(boomLen * 0.4, 4);
    ctx.lineTo(boomLen * 0.75, 1);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 5;
    ctx.stroke();
  }

  // --- STICK / DIPPER ARM (Segment 2, ~90px length) ---
  ctx.translate(boomLen, 0);
  drawCartoonCircle(ctx, 0, 0, 7.5, '#475569', '#1e293b', 3);
  ctx.rotate(stickAngle);
  const stickLen = 95;

  ctx.beginPath();
  ctx.moveTo(0, -9);
  ctx.lineTo(stickLen, -6);
  ctx.lineTo(stickLen, 6);
  ctx.lineTo(0, 9);
  ctx.closePath();
  ctx.fillStyle = accentFill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 4;
  ctx.stroke();

  // --- BUCKET (Segment 3) ---
  ctx.translate(stickLen, 0);
  drawCartoonCircle(ctx, 0, 0, 6.5, '#475569', '#1e293b', 2.5);
  ctx.rotate(bucketAngle);

  // Bucket metal scoop
  const bucketFill = isSilhouette ? '#475569' : '#374151';
  ctx.beginPath();
  ctx.moveTo(-4, -12);
  ctx.quadraticCurveTo(42, -18, 48, 20);
  ctx.lineTo(26, 32);
  ctx.quadraticCurveTo(12, 18, -4, 10);
  ctx.closePath();
  ctx.fillStyle = bucketFill;
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Heavy steel digging teeth
  if (!isSilhouette) {
    ctx.fillStyle = '#9ca3af';
    for (let t = 0; t < 4; t++) {
      const toothY = 22 + t * 3;
      const toothX = 48 - t * 6;
      ctx.beginPath();
      ctx.moveTo(toothX, toothY);
      ctx.lineTo(toothX + 9, toothY + 6);
      ctx.lineTo(toothX - 2, toothY + 7);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  // Return the tip of the bucket in world coords if needed
  const tipPos = ctx.getTransform().transformPoint(new DOMPoint(48, 25));

  ctx.restore();
  return tipPos;
}

// 2. Dump Truck Graphics
export function drawDumpTruckChassis(ctx, x, y, w = 230, h = 30) {
  ctx.save();
  ctx.translate(x, y);

  // Heavy steel I-beam frame
  drawCartoonRect(ctx, 0, 0, w, h, 6, '#374151', '#111827', 4);

  // Chrome front bumper & grille push bar
  drawCartoonRect(ctx, w - 16, -6, 22, h + 12, 5, '#cbd5e1', '#475569', 3);

  // Fuel tank mounted on frame
  drawCartoonRect(ctx, 80, 2, 45, 22, 6, '#9ca3af', '#475569', 3);
  drawCartoonCircle(ctx, 88, 13, 3, '#334155', null, 0);

  // Mudguard arches over wheels
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(38, 0, 26, Math.PI, 0, false);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(104, 0, 26, Math.PI, 0, false);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(w - 48, 0, 26, Math.PI, 0, false);
  ctx.stroke();

  ctx.restore();
}

export function drawTruckWheel(ctx, cx, cy, radius = 24, rotation = 0) {
  ctx.save();
  ctx.translate(cx, cy);

  // Heavy ribbed rubber tire
  drawCartoonCircle(ctx, 0, 0, radius, '#1f2937', '#111827', 5);

  // Wheel rim
  drawCartoonCircle(ctx, 0, 0, radius * 0.58, '#9ca3af', '#4b5563', 3);
  drawCartoonCircle(ctx, 0, 0, radius * 0.22, '#374151', null, 0);

  // Rotating lug nuts
  ctx.rotate(rotation);
  for (let i = 0; i < 6; i++) {
    const ang = (i * Math.PI) / 3;
    const nx = Math.cos(ang) * radius * 0.42;
    const ny = Math.sin(ang) * radius * 0.42;
    ctx.beginPath();
    ctx.arc(nx, ny, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  // Tire deep treads around outer rim
  for (let i = 0; i < 10; i++) {
    const ang = (i * Math.PI) / 5;
    const tx = Math.cos(ang) * radius;
    const ty = Math.sin(ang) * radius;
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(tx * 0.88, ty * 0.88);
    ctx.lineTo(tx, ty);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawDumpTruckCab(ctx, x, y, isSilhouette = false) {
  ctx.save();
  ctx.translate(x, y);

  const fill = isSilhouette ? '#94a3b8' : '#eab308';
  const stroke = isSilhouette ? '#64748b' : '#ca8a04';

  // Vertical chrome exhaust stack pipe at back of cab
  if (!isSilhouette) {
    drawCartoonRect(ctx, -8, -62, 8, 70, 3, '#cbd5e1', '#64748b', 2);
    // Exhaust curve top
    ctx.beginPath();
    ctx.arc(-14, -62, 7, 0, Math.PI * 1.5, true);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  // Main Cab Body
  drawCartoonRect(ctx, 0, -45, 78, 52, 12, fill, stroke, 4);

  // Front Hood Slant Nose
  ctx.beginPath();
  ctx.moveTo(45, -45);
  ctx.lineTo(76, -18);
  ctx.lineTo(78, 5);
  ctx.lineTo(45, 5);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Windshield & Side Windows
  const glass = isSilhouette ? '#cbd5e1' : '#38bdf8';
  drawCartoonRect(ctx, 8, -40, 36, 26, 5, glass, '#0284c7', 2.5);
  // Slanted front windshield piece
  ctx.beginPath();
  ctx.moveTo(46, -40);
  ctx.lineTo(66, -20);
  ctx.lineTo(46, -20);
  ctx.closePath();
  ctx.fillStyle = glass;
  ctx.fill();
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Headlight with friendly glow
  if (!isSilhouette) {
    drawCartoonCircle(ctx, 74, -4, 6, '#fef08a', '#eab308', 2);
    // Roof clearance lights
    ctx.fillStyle = '#f97316';
    ctx.fillRect(16, -49, 6, 4);
    ctx.fillRect(32, -49, 6, 4);
    ctx.fillRect(48, -49, 6, 4);
  }

  ctx.restore();
}

// Dump Bed with Tilt Rotation Angle (0 to ~0.65 rad)
export function drawDumpBed(ctx, x, y, tiltAngle = 0, isSilhouette = false, stoneCount = 0) {
  ctx.save();
  ctx.translate(x, y);

  // Bed pivot hinge at the rear
  drawCartoonCircle(ctx, 0, 0, 7, '#475569', '#1e293b', 2.5);
  ctx.rotate(-tiltAngle);

  const fill = isSilhouette ? '#94a3b8' : '#ca8a04';
  const stroke = isSilhouette ? '#64748b' : '#854d0e';
  const bedW = 145;
  const bedH = 50;

  // Hydraulic lift piston underneath bed
  if (!isSilhouette && tiltAngle > 0.05) {
    ctx.save();
    ctx.rotate(tiltAngle); // counter-rotate for bottom piston base
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(50, 6);
    ctx.lineTo(50 + Math.sin(tiltAngle) * 35, -Math.cos(tiltAngle) * 35);
    ctx.stroke();
    ctx.restore();
  }

  // Dumper Bed Tub
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-bedW, 0);
  ctx.lineTo(-bedW - 14, -bedH);
  ctx.lineTo(8, -bedH);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Structural Stiffener Ribs on Bed sides
  if (!isSilhouette) {
    for (let i = 0; i < 4; i++) {
      const rx = -bedW + 15 + i * 32;
      drawCartoonRect(ctx, rx, -bedH + 6, 16, bedH - 12, 3, '#eab308', '#a16207', 2);
    }
  }

  // Stones / gravel load inside the bed
  if (stoneCount > 0 && !isSilhouette) {
    ctx.save();
    ctx.fillStyle = '#64748b';
    const stones = [
      { x: -30, y: -16, r: 12 },
      { x: -55, y: -20, r: 14 },
      { x: -80, y: -18, r: 13 },
      { x: -105, y: -15, r: 11 },
      { x: -45, y: -30, r: 11 },
      { x: -70, y: -32, r: 13 },
      { x: -95, y: -28, r: 10 }
    ];
    for (let i = 0; i < Math.min(stoneCount * 3, stones.length); i++) {
      const s = stones[i];
      drawCartoonCircle(ctx, s.x, s.y, s.r, '#94a3b8', '#475569', 2);
    }
    ctx.restore();
  }

  ctx.restore();
}
