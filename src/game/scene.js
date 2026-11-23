// Complete 2D Construction Canvas Game World
// 60FPS loop, dynamic parallax camera, interactive dragging & pedals, sound feedback.

import { 
  drawExcavatorTracks, 
  drawExcavatorBody, 
  drawExcavatorArm,
  drawDumpTruckChassis,
  drawTruckWheel,
  drawDumpTruckCab,
  drawDumpBed,
  drawCartoonRect,
  drawCartoonCircle
} from './renderer.js';

import { ParticleSystem } from './particles.js';
import { 
  playSnap, 
  playDing, 
  playFanfare, 
  playDig, 
  playDump, 
  playBubble, 
  playWaterSpray, 
  playDryer, 
  playSparkle,
  playEngine,
  isSoundEnabled
} from '../audio.js';

import {
  engineStart,
  engineLevel,
  engineStop,
  startMusic,
  playHonk,
  playBoing
} from '../audio_extra.js';

import { t } from '../i18n.js';
import { gameState } from '../state.js';

export class ConstructionGameScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = new ParticleSystem();

    // Virtual Game Resolution (16:9 widescreen or portrait adaptable)
    this.virtualWidth = 960;
    this.virtualHeight = 540;
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;

    // Camera
    this.camera = { x: 0, y: 0, targetX: 0, targetY: 0 };

    // Stage State
    this.stage = 'assembly'; // 'assembly' | 'fueling' | 'site' | 'wash'
    this.vehicleId = 'excavator';

    // Interactive Vehicle Physics & Kinematics
    this.truck = {
      x: 320,
      y: 380,
      vx: 0,
      wheelRotation: 0,
      targetX: 320,
      bob: 0,
      // Excavator Arm Angles
      boomAngle: -0.65,
      stickAngle: 1.1,
      bucketAngle: 0.4,
      targetBoom: -0.65,
      targetStick: 1.1,
      targetBucket: 0.4,
      // Dump Truck Bed Tilt
      tiltAngle: 0,
      targetTilt: 0,
      stoneCount: 0
    };

    // Stage 1: Assembly Puzzle
    this.assembly = {
      parts: [],
      draggedPart: null,
      dragOffsetX: 0,
      dragOffsetY: 0,
      completed: false
    };

    // Stage 2: Fueling
    this.fueling = {
      nozzlePos: { x: 740, y: 280 },
      isDraggingNozzle: false,
      isNozzleConnected: false,
      pumpPressed: false,
      fuelLevel: 0,
      completed: false
    };

    // Stage 3: Construction Site Action
    this.site = {
      actionCount: 0,
      targetActions: 3,
      buildingLevel: 0,
      isDigging: false,
      isDumping: false,
      driveSpeed: 0,
      moundSize: 100,
      completed: false
    };

    // Stage 4: Car Wash
    this.wash = {
      activeTool: 'sponge', // 'sponge' | 'water' | 'dryer'
      foamLevel: 0,
      cleanLevel: 0,
      dryLevel: 0,
      dirtSpots: [
        { x: -50, y: -20, r: 22, cleaned: false },
        { x: 30, y: -15, r: 26, cleaned: false },
        { x: -10, y: 15, r: 24, cleaned: false },
        { x: 80, y: 5, r: 20, cleaned: false },
        { x: -80, y: 10, r: 25, cleaned: false }
      ],
      isWashing: false,
      completed: false
    };

    // Input Pointers
    this.pointer = { x: 0, y: 0, isDown: false, rawX: 0, rawY: 0 };

    this.animId = null;
    this.lastTime = performance.now();

    this.bindEvents();
    this.resize();
    this.initStage();
  }

  // Set current vehicle & stage
  setMode(vehicleId, stage) {
    this.vehicleId = vehicleId;
    this.stage = stage;
    this.particles.clear();
    this.initStage();
  }

  initStage() {
    this.truck.x = 350;
    this.truck.y = 380;
    this.truck.vx = 0;
    this.truck.tiltAngle = 0;
    this.truck.targetTilt = 0;
    this.truck.boomAngle = -0.65;
    this.truck.stickAngle = 1.1;
    this.truck.bucketAngle = 0.4;

    if (this.stage === 'assembly') {
      this.initAssemblyStage();
    } else if (this.stage === 'fueling') {
      this.fueling.fuelLevel = 0;
      this.fueling.isNozzleConnected = false;
      this.fueling.nozzlePos = { x: 740, y: 280 };
      this.fueling.completed = false;
      engineStop();
    } else if (this.stage === 'site') {
      this.site.actionCount = 0;
      this.site.buildingLevel = 0;
      this.site.completed = false;
      this.truck.stoneCount = this.vehicleId === 'dump_truck' ? 3 : 0;
      engineStart();
      engineLevel(0.25);
    } else if (this.stage === 'wash') {
      this.wash.foamLevel = 0;
      this.wash.cleanLevel = 0;
      this.wash.dryLevel = 0;
      this.wash.activeTool = 'sponge';
      this.wash.completed = false;
      this.wash.dirtSpots.forEach(s => s.cleaned = false);
      engineStop();
    }
  }

  initAssemblyStage() {
    this.assembly.completed = false;
    const isExcavator = this.vehicleId === 'excavator';

    // Parts waiting in tray at bottom/right
    this.assembly.parts = [
      {
        id: 'chassis',
        nameKey: 'partChassis',
        x: 180,
        y: 470,
        targetX: 350,
        targetY: 340,
        placed: false,
        w: 120,
        h: 60
      },
      {
        id: 'wheels',
        nameKey: 'partWheels',
        x: 360,
        y: 470,
        targetX: 350,
        targetY: 380,
        placed: false,
        w: 140,
        h: 50
      },
      {
        id: 'cabin',
        nameKey: 'partCabin',
        x: 540,
        y: 470,
        targetX: isExcavator ? 350 : 440,
        targetY: isExcavator ? 310 : 340,
        placed: false,
        w: 90,
        h: 70
      },
      {
        id: isExcavator ? 'arm' : 'bed',
        nameKey: isExcavator ? 'partArm' : 'partBed',
        x: 740,
        y: 470,
        targetX: isExcavator ? 430 : 280,
        targetY: isExcavator ? 320 : 340,
        placed: false,
        w: 120,
        h: 70
      }
    ];
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    // Fit virtual 960x540 viewport into container
    const scaleX = this.canvas.width / this.virtualWidth;
    const scaleY = this.canvas.height / this.virtualHeight;
    this.scale = Math.min(scaleX, scaleY);
    this.offsetX = (this.canvas.width - this.virtualWidth * this.scale) / 2;
    this.offsetY = (this.canvas.height - this.virtualHeight * this.scale) / 2;
  }

  toVirtualCoords(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const canvasX = (clientX - rect.left) * dpr;
    const canvasY = (clientY - rect.top) * dpr;
    const vx = (canvasX - this.offsetX) / this.scale;
    const vy = (canvasY - this.offsetY) / this.scale;
    return { x: vx, y: vy };
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    const onDown = (clientX, clientY) => {
      const v = this.toVirtualCoords(clientX, clientY);
      this.pointer.x = v.x;
      this.pointer.y = v.y;
      this.pointer.isDown = true;
      this.handlePointerDown(v.x, v.y);
    };

    const onMove = (clientX, clientY) => {
      const v = this.toVirtualCoords(clientX, clientY);
      this.pointer.x = v.x;
      this.pointer.y = v.y;
      this.handlePointerMove(v.x, v.y);
    };

    const onUp = () => {
      this.handlePointerUp(this.pointer.x, this.pointer.y);
      this.pointer.isDown = false;
    };

    // Touch & Mouse
    this.canvas.addEventListener('mousedown', e => onDown(e.clientX, e.clientY));
    window.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onUp);

    this.canvas.addEventListener('touchstart', e => {
      if (e.touches.length > 0) {
        onDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchmove', e => {
      if (e.touches.length > 0) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchend', onUp);
  }

  // --- STAGE INPUT HANDLERS ---
  handlePointerDown(x, y) {
    // Stage 1: Assembly
    if (this.stage === 'assembly' && !this.assembly.completed) {
      for (let i = this.assembly.parts.length - 1; i >= 0; i--) {
        const p = this.assembly.parts[i];
        if (!p.placed) {
          const dx = x - p.x;
          const dy = y - p.y;
          if (Math.abs(dx) < p.w / 2 && Math.abs(dy) < p.h / 2) {
            this.assembly.draggedPart = p;
            this.assembly.dragOffsetX = dx;
            this.assembly.dragOffsetY = dy;
            playDing();
            break;
          }
        }
      }
      return;
    }

    // Stage 2: Fueling
    if (this.stage === 'fueling' && !this.fueling.completed) {
      // Check nozzle click
      const dNozzle = Math.hypot(x - this.fueling.nozzlePos.x, y - this.fueling.nozzlePos.y);
      if (dNozzle < 45) {
        this.fueling.isDraggingNozzle = true;
        playDing();
        return;
      }

      // Check pump handle button (x: 820, y: 390)
      if (this.fueling.isNozzleConnected) {
        if (x > 730 && x < 910 && y > 350 && y < 430) {
          this.fueling.pumpPressed = true;
          return;
        }
      }
    }

    // Stage 3: Construction Site Action
    if (this.stage === 'site' && !this.site.completed) {
      // Check drive pedal buttons
      // Left pedal (x: 100, y: 460), Right pedal (x: 210, y: 460)
      if (y > 425 && y < 510) {
        if (x > 60 && x < 150) {
          this.site.driveSpeed = -3.5;
          return;
        }
        if (x > 170 && x < 260) {
          this.site.driveSpeed = 3.5;
          return;
        }
      }

      // Action Big Button: Dig or Dump (x: 770, y: 450)
      if (x > 670 && x < 910 && y > 410 && y < 510) {
        this.triggerSiteAction();
        return;
      }

      // Tap on truck honks horn!
      if (Math.abs(x - this.truck.x) < 90 && Math.abs(y - this.truck.y) < 70) {
        playHonk();
        this.particles.emitExhaustSmoke(this.truck.x - 60, this.truck.y - 45);
      }
    }

    // Stage 4: Car Wash
    if (this.stage === 'wash' && !this.wash.completed) {
      // Check Tool Selectors at bottom (x: 320, 480, 640; y: 480)
      if (y > 440 && y < 520) {
        if (x > 250 && x < 390) { this.wash.activeTool = 'sponge'; playDing(); return; }
        if (x > 410 && x < 550) { this.wash.activeTool = 'water'; playDing(); return; }
        if (x > 570 && x < 710) { this.wash.activeTool = 'dryer'; playDing(); return; }
      }

      this.wash.isWashing = true;
      this.applyWashTool(x, y);
    }
  }

  handlePointerMove(x, y) {
    if (this.assembly.draggedPart) {
      this.assembly.draggedPart.x = x - this.assembly.dragOffsetX;
      this.assembly.draggedPart.y = y - this.assembly.dragOffsetY;
    }

    if (this.fueling.isDraggingNozzle) {
      this.fueling.nozzlePos.x = x;
      this.fueling.nozzlePos.y = y;

      // Check distance to vehicle tank inlet (tank is at truck.x, truck.y - 10)
      const tankInletX = this.truck.x + (this.vehicleId === 'excavator' ? 0 : 25);
      const tankInletY = this.truck.y - 20;
      if (Math.hypot(x - tankInletX, y - tankInletY) < 40) {
        this.fueling.isNozzleConnected = true;
        this.fueling.nozzlePos = { x: tankInletX, y: tankInletY };
        this.fueling.isDraggingNozzle = false;
        playSnap();
      }
    }

    if (this.wash.isWashing) {
      this.applyWashTool(x, y);
    }
  }

  handlePointerUp(x, y) {
    if (this.assembly.draggedPart) {
      const p = this.assembly.draggedPart;
      const dist = Math.hypot(p.x - p.targetX, p.y - p.targetY);

      if (dist < 70) {
        // Snap successfully!
        p.x = p.targetX;
        p.y = p.targetY;
        p.placed = true;
        playSnap();
        this.particles.emitSparkles(p.x, p.y);

        // Check if all parts placed
        const allPlaced = this.assembly.parts.every(part => part.placed);
        if (allPlaced) {
          this.assembly.completed = true;
          playFanfare();
          playEngine(1.2);
          setTimeout(() => {
            gameState.setStage('fueling');
          }, 1400);
        }
      } else {
        // Return back to tray with boing sound
        p.x = p.targetX < 400 ? 200 : 700;
        p.y = 470;
        playBoing();
      }
      this.assembly.draggedPart = null;
    }

    this.fueling.isDraggingNozzle = false;
    this.fueling.pumpPressed = false;
    this.site.driveSpeed = 0;
    this.wash.isWashing = false;
  }

  triggerSiteAction() {
    if (this.site.isDigging || this.site.isDumping) return;

    if (this.vehicleId === 'excavator') {
      // Excavator dig cycle
      this.site.isDigging = true;
      playDig();
      engineLevel(0.7);

      // Arm kinematic sequence: reach down -> scoop -> lift -> return
      this.truck.targetBoom = -0.15;
      this.truck.targetStick = 1.6;
      this.truck.targetBucket = 1.2;

      setTimeout(() => {
        this.particles.emitSoilScoop(this.truck.x + 180, 420, 430);
        this.truck.targetBoom = -0.9;
        this.truck.targetStick = 0.7;
        this.truck.targetBucket = -0.2;
      }, 700);

      setTimeout(() => {
        this.site.isDigging = false;
        this.truck.targetBoom = -0.65;
        this.truck.targetStick = 1.1;
        this.truck.targetBucket = 0.4;
        engineLevel(0.25);
        this.onSiteStepCompleted();
      }, 1500);

    } else {
      // Dump truck dump cycle
      this.site.isDumping = true;
      playDump();
      engineLevel(0.6);
      this.truck.targetTilt = 0.65;

      setTimeout(() => {
        this.particles.emitGravelDump(this.truck.x - 120, 390, 430);
        this.truck.stoneCount = Math.max(0, this.truck.stoneCount - 1);
      }, 500);

      setTimeout(() => {
        this.truck.targetTilt = 0;
      }, 1200);

      setTimeout(() => {
        this.site.isDumping = false;
        engineLevel(0.25);
        this.onSiteStepCompleted();
      }, 1800);
    }
  }

  onSiteStepCompleted() {
    this.site.actionCount++;
    this.site.buildingLevel = Math.min(3, this.site.actionCount);
    playDing();

    if (this.site.actionCount >= this.site.targetActions) {
      this.site.completed = true;
      playFanfare();
      setTimeout(() => {
        gameState.setStage('wash');
      }, 1600);
    }
  }

  applyWashTool(x, y) {
    // Only apply if over vehicle body
    const distToTruck = Math.hypot(x - this.truck.x, y - (this.truck.y - 20));
    if (distToTruck > 150) return;

    if (this.wash.activeTool === 'sponge') {
      if (this.wash.foamLevel < 100) {
        this.wash.foamLevel = Math.min(100, this.wash.foamLevel + 2.5);
        this.particles.emitSoapFoam(x, y);
        if (Math.random() > 0.6) playBubble();

        if (this.wash.foamLevel >= 100) {
          playDing();
          this.wash.activeTool = 'water';
        }
      }
    } else if (this.wash.activeTool === 'water') {
      if (this.wash.cleanLevel < 100) {
        this.wash.cleanLevel = Math.min(100, this.wash.cleanLevel + 2.5);
        this.particles.emitWaterSpray(x - 20, y - 20, x, y);
        if (Math.random() > 0.5) playWaterSpray(0.12);

        // Clean dirt spots near pointer
        this.wash.dirtSpots.forEach(s => {
          const sx = this.truck.x + s.x;
          const sy = this.truck.y + s.y;
          if (Math.hypot(x - sx, y - sy) < 45) {
            s.cleaned = true;
          }
        });

        if (this.wash.cleanLevel >= 100) {
          playDing();
          this.wash.activeTool = 'dryer';
        }
      }
    } else if (this.wash.activeTool === 'dryer') {
      if (this.wash.dryLevel < 100) {
        this.wash.dryLevel = Math.min(100, this.wash.dryLevel + 3);
        this.particles.emitAirBlower(x, y, 0.8, 0.4);
        if (Math.random() > 0.6) playDryer(0.12);

        if (this.wash.dryLevel >= 100) {
          this.wash.completed = true;
          playSparkle();
          playFanfare();
          this.particles.emitSparkles(this.truck.x, this.truck.y - 30);
          setTimeout(() => {
            gameState.setStage('select');
          }, 2200);
        }
      }
    }
  }

  // --- GAME LOOP UPDATE ---
  update(dt) {
    this.particles.update();

    // Smooth Kinematics lerp
    this.truck.boomAngle += (this.truck.targetBoom - this.truck.boomAngle) * 0.12;
    this.truck.stickAngle += (this.truck.targetStick - this.truck.stickAngle) * 0.12;
    this.truck.bucketAngle += (this.truck.targetBucket - this.truck.bucketAngle) * 0.14;
    this.truck.tiltAngle += (this.truck.targetTilt - this.truck.tiltAngle) * 0.1;

    // Truck driving physics on site
    if (this.stage === 'site') {
      this.truck.vx = this.site.driveSpeed;
      this.truck.x += this.truck.vx;
      // Clamp truck to ground zone
      this.truck.x = Math.max(160, Math.min(520, this.truck.x));
      this.truck.wheelRotation += this.truck.vx * 0.08;

      if (Math.abs(this.truck.vx) > 0.5) {
        this.truck.bob = Math.sin(performance.now() * 0.015) * 2;
        if (Math.random() > 0.7) {
          this.particles.emitExhaustSmoke(this.truck.x - 55, this.truck.y - 40);
        }
      } else {
        this.truck.bob = Math.sin(performance.now() * 0.005) * 0.8;
      }
    }

    // Fuel pumping loop
    if (this.stage === 'fueling' && this.fueling.pumpPressed && !this.fueling.completed) {
      if (this.fueling.fuelLevel < 100) {
        this.fueling.fuelLevel = Math.min(100, this.fueling.fuelLevel + 0.6);
        engineLevel(0.15 + (this.fueling.fuelLevel / 100) * 0.3);
        if (Math.random() > 0.75) playBubble();

        if (this.fueling.fuelLevel >= 100) {
          this.fueling.completed = true;
          playDing();
          playFanfare();
          this.particles.emitSparkles(this.truck.x, this.truck.y - 40);
          setTimeout(() => {
            gameState.setStage('site');
          }, 1500);
        }
      }
    }
  }

  // --- 60FPS RENDER PASS ---
  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    // Center & scale virtual screen
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);

    // 1. Environmental Backdrop
    this.drawEnvironment(ctx);

    // 2. Active Stage World
    if (this.stage === 'assembly') {
      this.drawAssemblyStage(ctx);
    } else if (this.stage === 'fueling') {
      this.drawFuelingStage(ctx);
    } else if (this.stage === 'site') {
      this.drawSiteStage(ctx);
    } else if (this.stage === 'wash') {
      this.drawWashStage(ctx);
    }

    // 3. Dynamic Particles (debris, water, bubbles, sparkles)
    this.particles.draw(ctx);

    // 4. Interactive HUD & Controls
    this.drawHUD(ctx);

    ctx.restore();
  }

  drawEnvironment(ctx) {
    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, 360);
    if (this.stage === 'wash') {
      sky.addColorStop(0, '#bfdbfe');
      sky.addColorStop(1, '#e0e7ff');
    } else {
      sky.addColorStop(0, '#38bdf8');
      sky.addColorStop(0.7, '#bae6fd');
      sky.addColorStop(1, '#fef08a');
    }
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.virtualWidth, 380);

    // Sun & Clouds
    ctx.save();
    ctx.beginPath();
    ctx.arc(840, 80, 42, 0, Math.PI * 2);
    ctx.fillStyle = '#fde047';
    ctx.fill();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();

    // Distant Hills / City Skyline
    ctx.fillStyle = '#93c5fd';
    ctx.beginPath();
    ctx.arc(180, 380, 160, Math.PI, 0, false);
    ctx.arc(420, 380, 190, Math.PI, 0, false);
    ctx.arc(720, 380, 150, Math.PI, 0, false);
    ctx.fill();

    // Ground Dirt / Concrete
    const ground = ctx.createLinearGradient(0, 380, 0, this.virtualHeight);
    if (this.stage === 'wash') {
      ground.addColorStop(0, '#94a3b8');
      ground.addColorStop(1, '#475569');
    } else {
      ground.addColorStop(0, '#78350f');
      ground.addColorStop(0.2, '#92400e');
      ground.addColorStop(1, '#451a03');
    }
    ctx.fillStyle = ground;
    ctx.fillRect(0, 380, this.virtualWidth, this.virtualHeight - 380);

    // Ground grass line
    if (this.stage !== 'wash') {
      ctx.fillStyle = '#65a30d';
      ctx.fillRect(0, 376, this.virtualWidth, 8);
    }
  }

  // --- DRAW STAGE 1: ASSEMBLY ---
  drawAssemblyStage(ctx) {
    const isEx = this.vehicleId === 'excavator';

    // Blueprint grid mat
    drawCartoonRect(ctx, 160, 120, 640, 310, 24, '#1e293b', '#38bdf8', 4);
    // Blueprint blueprint lines
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.lineWidth = 2;
    for (let x = 180; x < 780; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 140); ctx.lineTo(x, 410); ctx.stroke();
    }
    for (let y = 140; y < 410; y += 30) {
      ctx.beginPath(); ctx.moveTo(180, y); ctx.lineTo(780, y); ctx.stroke();
    }
    ctx.restore();

    // Ghost Silhouettes on Blueprint
    const partsMap = {};
    this.assembly.parts.forEach(p => partsMap[p.id] = p.placed);

    if (isEx) {
      drawExcavatorTracks(ctx, 255, 340, 190, 48, 0);
      drawExcavatorBody(ctx, 290, 295, { isSilhouette: !partsMap['chassis'] });
      drawExcavatorArm(ctx, 410, 280, { boomAngle: -0.65, stickAngle: 1.1, bucketAngle: 0.4 }, !partsMap['arm']);
    } else {
      drawDumpTruckChassis(ctx, 235, 335, 230, 30);
      drawTruckWheel(ctx, 273, 365, 24, 0);
      drawTruckWheel(ctx, 339, 365, 24, 0);
      drawTruckWheel(ctx, 440, 365, 24, 0);
      drawDumpBed(ctx, 235, 330, 0, !partsMap['bed']);
      drawDumpTruckCab(ctx, 385, 335, !partsMap['cabin']);
    }

    // Parts Tray Bar at Bottom
    drawCartoonRect(ctx, 60, 440, 840, 80, 20, '#0f172a', '#334155', 3);

    // Draw Unplaced Draggable Parts in Tray
    this.assembly.parts.forEach(p => {
      if (!p.placed) {
        ctx.save();
        ctx.translate(p.x, p.y);
        drawCartoonRect(ctx, -p.w / 2, -p.h / 2, p.w, p.h, 12, '#38bdf8', '#0284c7', 3);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t(p.nameKey), 0, 0);
        ctx.restore();
      }
    });
  }

  // --- DRAW STAGE 2: FUELING ---
  drawFuelingStage(ctx) {
    const isEx = this.vehicleId === 'excavator';

    // Gas Pump Station Dispenser
    drawCartoonRect(ctx, 720, 220, 140, 200, 18, '#ef4444', '#991b1b', 5);
    drawCartoonRect(ctx, 740, 240, 100, 50, 8, '#0f172a', '#334155', 3);

    // Fuel digital meter
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(this.fueling.fuelLevel)}%`, 790, 272);

    // Fuel hose connecting dispenser to nozzle
    ctx.save();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(730, 320);
    ctx.bezierCurveTo(700, 410, this.fueling.nozzlePos.x + 20, 410, this.fueling.nozzlePos.x, this.fueling.nozzlePos.y);
    ctx.stroke();
    ctx.restore();

    // Nozzle handle
    drawCartoonCircle(ctx, this.fueling.nozzlePos.x, this.fueling.nozzlePos.y, 14, '#10b981', '#065f46', 3);

    // Parked Vehicle
    ctx.save();
    ctx.translate(this.truck.x, this.truck.y);
    if (isEx) {
      drawExcavatorTracks(ctx, -95, 0, 190, 48);
      drawExcavatorBody(ctx, -60, -45);
      drawExcavatorArm(ctx, 60, -60, { boomAngle: this.truck.boomAngle, stickAngle: this.truck.stickAngle, bucketAngle: this.truck.bucketAngle });
    } else {
      drawDumpTruckChassis(ctx, -115, -15, 230, 30);
      drawTruckWheel(ctx, -77, 15, 24);
      drawTruckWheel(ctx, -11, 15, 24);
      drawTruckWheel(ctx, 90, 15, 24);
      drawDumpBed(ctx, -115, -20, 0);
      drawDumpTruckCab(ctx, 35, -15);
    }
    ctx.restore();

    // Big Green PUMP Button if nozzle connected
    if (this.fueling.isNozzleConnected && !this.fueling.completed) {
      drawCartoonRect(ctx, 730, 350, 180, 80, 22, this.fueling.pumpPressed ? '#059669' : '#10b981', '#064e3b', 4);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 20px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(t('holdToPump'), 820, 396);
    }
  }

  // --- DRAW STAGE 3: SITE ACTION ---
  drawSiteStage(ctx) {
    const isEx = this.vehicleId === 'excavator';

    // Building Under Construction (Left side: x: 120, y: 380)
    this.drawBuilding(ctx, 120, 380, this.site.buildingLevel);

    // Earth Mound (Right side: x: 620, y: 380)
    ctx.save();
    ctx.beginPath();
    ctx.arc(620, 420, 120, Math.PI, 0, false);
    ctx.fillStyle = '#78350f';
    ctx.fill();
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();

    // Vehicle on Site (interactive driving & arm kinematic)
    ctx.save();
    ctx.translate(this.truck.x, this.truck.y + this.truck.bob);

    if (isEx) {
      drawExcavatorTracks(ctx, -95, 0, 190, 48, this.truck.wheelRotation);
      drawExcavatorBody(ctx, -60, -45);
      drawExcavatorArm(ctx, 60, -60, {
        boomAngle: this.truck.boomAngle,
        stickAngle: this.truck.stickAngle,
        bucketAngle: this.truck.bucketAngle
      });
    } else {
      drawDumpTruckChassis(ctx, -115, -15, 230, 30);
      drawTruckWheel(ctx, -77, 15, 24, this.truck.wheelRotation);
      drawTruckWheel(ctx, -11, 15, 24, this.truck.wheelRotation);
      drawTruckWheel(ctx, 90, 15, 24, this.truck.wheelRotation);
      drawDumpBed(ctx, -115, -20, this.truck.tiltAngle, false, this.truck.stoneCount);
      drawDumpTruckCab(ctx, 35, -15);
    }
    ctx.restore();

    // Virtual Drive Pedals (Left: Backwards, Right: Forwards)
    drawCartoonRect(ctx, 60, 435, 90, 75, 16, this.site.driveSpeed < 0 ? '#3b82f6' : '#60a5fa', '#1e40af', 3);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('◀ 🚜', 105, 480);

    drawCartoonRect(ctx, 170, 435, 90, 75, 16, this.site.driveSpeed > 0 ? '#3b82f6' : '#60a5fa', '#1e40af', 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🚜 ▶', 215, 480);

    // Big Action Button: DIG or DUMP
    const actionKey = isEx ? 'digSoil' : 'dumpLoad';
    drawCartoonRect(ctx, 670, 420, 240, 90, 24, '#f59e0b', '#b45309', 4);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 22px system-ui, sans-serif';
    ctx.fillText((isEx ? '⛏️ ' : '🚛 ') + t(actionKey), 790, 472);
  }

  drawBuilding(ctx, bx, by, level) {
    ctx.save();
    ctx.translate(bx, by);

    if (level === 0) {
      // Trench
      ctx.fillStyle = '#5c2b09';
      ctx.fillRect(-60, -10, 120, 40);
    } else if (level === 1) {
      // Concrete foundation poured
      drawCartoonRect(ctx, -70, -25, 140, 40, 6, '#cbd5e1', '#64748b', 3);
    } else if (level === 2) {
      // Brick walls
      drawCartoonRect(ctx, -70, -85, 140, 100, 8, '#f87171', '#b91c1c', 3);
      drawCartoonRect(ctx, -20, -50, 40, 65, 4, '#38bdf8', '#0284c7', 2);
    } else {
      // Full completed house with roof & chimney
      drawCartoonRect(ctx, -70, -85, 140, 100, 8, '#fed7aa', '#ea580c', 3);
      // Roof triangle
      ctx.beginPath();
      ctx.moveTo(0, -150);
      ctx.lineTo(-90, -85);
      ctx.lineTo(90, -85);
      ctx.closePath();
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 4;
      ctx.stroke();
      // Door & Window
      drawCartoonRect(ctx, -15, -45, 30, 60, 4, '#b45309', '#78350f', 2);
      drawCartoonCircle(ctx, 8, -15, 3, '#fef08a', null, 0);
    }
    ctx.restore();
  }

  // --- DRAW STAGE 4: CAR WASH ---
  drawWashStage(ctx) {
    const isEx = this.vehicleId === 'excavator';

    // Wash bay canopy overhead lamps
    drawCartoonRect(ctx, 180, 40, 600, 20, 8, '#334155', '#1e293b', 3);
    drawCartoonCircle(ctx, 320, 65, 18, '#fef08a', '#eab308', 3);
    drawCartoonCircle(ctx, 640, 65, 18, '#fef08a', '#eab308', 3);

    // Muddy / Soapy Vehicle in Center
    ctx.save();
    ctx.translate(this.truck.x, this.truck.y);

    if (isEx) {
      drawExcavatorTracks(ctx, -95, 0, 190, 48);
      drawExcavatorBody(ctx, -60, -45);
      drawExcavatorArm(ctx, 60, -60, { boomAngle: -0.65, stickAngle: 1.1, bucketAngle: 0.4 });
    } else {
      drawDumpTruckChassis(ctx, -115, -15, 230, 30);
      drawTruckWheel(ctx, -77, 15, 24);
      drawTruckWheel(ctx, -11, 15, 24);
      drawTruckWheel(ctx, 90, 15, 24);
      drawDumpBed(ctx, -115, -20, 0);
      drawDumpTruckCab(ctx, 35, -15);
    }

    // Dirt Spots on Vehicle (before water rinse)
    this.wash.dirtSpots.forEach(s => {
      if (!s.cleaned) {
        ctx.save();
        ctx.fillStyle = '#5c2b09';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    // Soap Foam Layer (translucent bubbly cloud over vehicle)
    if (this.wash.foamLevel > 0) {
      const foamAlpha = (this.wash.foamLevel / 100) * (1 - this.wash.cleanLevel / 100);
      if (foamAlpha > 0.05) {
        ctx.save();
        ctx.globalAlpha = foamAlpha * 0.9;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-40, -30, 45, 0, Math.PI * 2);
        ctx.arc(20, -40, 55, 0, Math.PI * 2);
        ctx.arc(60, -20, 45, 0, Math.PI * 2);
        ctx.arc(-20, 10, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.restore();

    // Tools Dock at Bottom
    const tools = [
      { id: 'sponge', label: t('spongeSoap'), icon: '🧽', x: 320, color: '#f59e0b' },
      { id: 'water', label: t('waterHose'), icon: '🚿', x: 480, color: '#38bdf8' },
      { id: 'dryer', label: t('airDryer'), icon: '💨', x: 640, color: '#818cf8' }
    ];

    tools.forEach(tool => {
      const isSelected = this.wash.activeTool === tool.id;
      drawCartoonRect(ctx, tool.x - 70, 445, 140, 75, 16, isSelected ? tool.color : '#f1f5f9', '#475569', isSelected ? 4 : 2);
      ctx.fillStyle = isSelected ? '#ffffff' : '#1e293b';
      ctx.font = 'bold 24px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(tool.icon, tool.x, 475);
      ctx.font = 'bold 12px system-ui';
      ctx.fillText(tool.label, tool.x, 505);
    });
  }

  // --- DRAW HUD ---
  drawHUD(ctx) {
    // Current Stage Badge (Top Left)
    drawCartoonRect(ctx, 30, 20, 220, 44, 22, '#0f172a', '#38bdf8', 3);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let stageName = t('stageAssembly');
    if (this.stage === 'fueling') stageName = t('stageFueling');
    if (this.stage === 'site') stageName = t('stageSite');
    if (this.stage === 'wash') stageName = t('stageWash');

    ctx.fillText(stageName, 140, 42);
  }

  // Start Animation Loop
  start() {
    const loop = (time) => {
      const dt = Math.min(0.1, (time - this.lastTime) / 1000);
      this.lastTime = time;
      this.update(dt);
      this.render();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    engineStop();
  }
}
