/**
 * VISUAL EFFECTS - Valentine's Pac-Man
 * Particle system for game events
 */

class ParticleEffect {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.particles = [];
    this.isActive = true;

    this.createParticles();
  }

  createParticles() {
    const configs = {
      'pellet': { count: 5, color: '#FFD700', speed: 1.5, life: 20, size: 3 },
      'rose': { count: 12, color: '#FF69B4', speed: 3, life: 40, size: 5 },
      'ghost': { count: 15, color: '#FF6B6B', speed: 4, life: 50, size: 6 },
      'heart': { count: 8, color: '#FFB6C1', speed: 2, life: 30, size: 4 }
    };

    const config = configs[this.type] || configs['pellet'];

    for (let i = 0; i < config.count; i++) {
      const angle = (Math.PI * 2 / config.count) * i + Math.random() * 0.5;
      const speed = config.speed * (0.5 + Math.random() * 0.5);

      this.particles.push({
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: config.life,
        maxLife: config.life,
        size: config.size * (0.5 + Math.random() * 0.5),
        color: config.color,
        rotation: Math.random() * Math.PI * 2
      });
    }
  }

  update() {
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // Gravity
      p.life--;
      p.rotation += 0.1;
    }

    this.particles = this.particles.filter(p => p.life > 0);
    this.isActive = this.particles.length > 0;
  }

  draw(ctx) {
    for (const p of this.particles) {
      const alpha = p.life / p.maxLife;
      
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = alpha;

      if (this.type === 'heart' || this.type === 'rose') {
        // Heart-shaped particles
        ctx.beginPath();
        const size = p.size;
        ctx.moveTo(0, size * 0.3);
        ctx.bezierCurveTo(-size, -size * 0.3, -size, -size, 0, -size * 0.5);
        ctx.bezierCurveTo(size, -size, size, -size * 0.3, 0, size * 0.3);
        ctx.fillStyle = p.color;
        ctx.fill();
      } else {
        // Circular particles
        ctx.beginPath();
        ctx.arc(0, 0, p.size * alpha, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      ctx.restore();
    }
  }
}

class EffectsManager {
  constructor() {
    this.effects = [];
  }

  add(x, y, type) {
    this.effects.push(new ParticleEffect(x, y, type));
  }

  update() {
    for (const effect of this.effects) {
      effect.update();
    }
    this.effects = this.effects.filter(e => e.isActive);
  }

  draw(ctx) {
    for (const effect of this.effects) {
      effect.draw(ctx);
    }
  }

  clear() {
    this.effects = [];
  }
}
