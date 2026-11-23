// Particle and Environmental Physics System:
// - Dirt & rock debris from excavation & dumping
// - Soap suds, fluffy bubbles & water splash streams
// - Warm air vapor & glittering sparkle stars
// - Celebration confetti & smoke puffs

export class Particle {
  constructor(options = {}) {
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.vx = options.vx || (Math.random() - 0.5) * 4;
    this.vy = options.vy || (Math.random() - 0.5) * 4;
    this.size = options.size || Math.random() * 8 + 4;
    this.color = options.color || '#f59e0b';
    this.alpha = options.alpha !== undefined ? options.alpha : 1;
    this.decay = options.decay || 0.02;
    this.gravity = options.gravity !== undefined ? options.gravity : 0.2;
    this.bounce = options.bounce || 0.4;
    this.groundY = options.groundY || 9999;
    this.type = options.type || 'circle'; // 'circle' | 'rock' | 'bubble' | 'sparkle' | 'foam' | 'star' | 'water'
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.2;
  }

  update() {
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotSpeed;
    this.alpha -= this.decay;

    // Ground bounce
    if (this.y + this.size > this.groundY && this.vy > 0) {
      this.y = this.groundY - this.size;
      this.vy = -this.vy * this.bounce;
      this.vx *= 0.8;
    }

    return this.alpha > 0;
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    if (this.type === 'rock') {
      ctx.fillStyle = this.color;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const s = this.size;
      ctx.moveTo(-s, -s * 0.6);
      ctx.lineTo(s * 0.8, -s);
      ctx.lineTo(s, s * 0.5);
      ctx.lineTo(-s * 0.2, s);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (this.type === 'bubble') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Bubble sheen
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-this.size * 0.35, -this.size * 0.35, this.size * 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'water') {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size * 1.5, this.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'sparkle' || this.type === 'star') {
      ctx.fillStyle = this.color || '#fef08a';
      const spikes = 4;
      const outer = this.size;
      const inner = this.size * 0.35;
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const ang = (i * Math.PI) / spikes;
        const px = Math.cos(ang) * r;
        const py = Math.sin(ang) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    } else if (this.type === 'foam') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.arc(this.size * 0.6, 0, this.size * 0.7, 0, Math.PI * 2);
      ctx.arc(-this.size * 0.5, this.size * 0.2, this.size * 0.8, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Circle default
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  update() {
    this.particles = this.particles.filter(p => p.update());
  }

  draw(ctx) {
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].draw(ctx);
    }
  }

  clear() {
    this.particles = [];
  }

  emit(particle) {
    if (this.particles.length < 350) {
      this.particles.push(particle);
    }
  }

  // Preset Emitters
  emitSoilScoop(x, y, groundY) {
    const soilColors = ['#78350f', '#92400e', '#b45309', '#5c2b09', '#a16207'];
    for (let i = 0; i < 18; i++) {
      this.emit(new Particle({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 7 - 2,
        vy: -Math.random() * 6 - 3,
        size: Math.random() * 7 + 4,
        color: soilColors[Math.floor(Math.random() * soilColors.length)],
        type: Math.random() > 0.4 ? 'rock' : 'circle',
        decay: 0.015,
        gravity: 0.35,
        groundY: groundY
      }));
    }
  }

  emitGravelDump(x, y, groundY) {
    const stoneColors = ['#64748b', '#94a3b8', '#cbd5e1', '#475569', '#334155'];
    for (let i = 0; i < 22; i++) {
      this.emit(new Particle({
        x: x + (Math.random() - 0.5) * 25,
        y: y + (Math.random() - 0.5) * 15,
        vx: -Math.random() * 5 - 1,
        vy: -Math.random() * 4 - 1,
        size: Math.random() * 9 + 4,
        color: stoneColors[Math.floor(Math.random() * stoneColors.length)],
        type: 'rock',
        decay: 0.012,
        gravity: 0.4,
        bounce: 0.3,
        groundY: groundY
      }));
    }
  }

  emitWaterSpray(x, y, targetX, targetY) {
    const angle = Math.atan2(targetY - y, targetX - x);
    for (let i = 0; i < 8; i++) {
      const spread = (Math.random() - 0.5) * 0.35;
      const speed = Math.random() * 8 + 12;
      this.emit(new Particle({
        x,
        y,
        vx: Math.cos(angle + spread) * speed,
        vy: Math.sin(angle + spread) * speed,
        size: Math.random() * 5 + 3,
        color: '#38bdf8',
        type: 'water',
        decay: 0.04,
        gravity: 0.2
      }));
    }
  }

  emitSoapFoam(x, y) {
    for (let i = 0; i < 5; i++) {
      this.emit(new Particle({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 1.5 - 0.5,
        size: Math.random() * 8 + 5,
        color: '#ffffff',
        type: Math.random() > 0.4 ? 'bubble' : 'foam',
        decay: 0.015,
        gravity: -0.02
      }));
    }
  }

  emitAirBlower(x, y, dirX, dirY) {
    for (let i = 0; i < 6; i++) {
      this.emit(new Particle({
        x,
        y,
        vx: dirX * (Math.random() * 10 + 8) + (Math.random() - 0.5) * 3,
        vy: dirY * (Math.random() * 10 + 8) + (Math.random() - 0.5) * 3,
        size: Math.random() * 7 + 4,
        color: 'rgba(255, 255, 255, 0.7)',
        type: 'circle',
        decay: 0.06,
        gravity: 0
      }));
    }
  }

  emitSparkles(x, y) {
    const starColors = ['#fde047', '#38bdf8', '#fb7185', '#4ade80', '#c084fc', '#ffffff'];
    for (let i = 0; i < 15; i++) {
      this.emit(new Particle({
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - 2,
        size: Math.random() * 10 + 6,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        type: 'sparkle',
        decay: 0.025,
        gravity: 0.1
      }));
    }
  }

  emitExhaustSmoke(x, y) {
    this.emit(new Particle({
      x,
      y,
      vx: -Math.random() * 1.8 - 0.5,
      vy: -Math.random() * 1.5 - 1.2,
      size: Math.random() * 5 + 4,
      color: 'rgba(100, 116, 139, 0.45)',
      type: 'circle',
      decay: 0.035,
      gravity: -0.04
    }));
  }
}
