/**
 * GAME ENGINE - Valentine's Pac-Man
 * Main game loop, state management, collision detection
 */

class GameEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error(`Canvas "${canvasId}" not found`);
      return;
    }

    this.ctx = this.canvas.getContext('2d');

    // Game state
    this.state = 'PLAYING'; // PLAYING, PAUSED, GAME_OVER, LEVEL_COMPLETE
    this.lives = 3;
    this.score = 0;
    this.level = 1;

    // Timing
    this.frameCount = 0;
    this.lastTime = Date.now();
    this.gameLoopId = null;

    // Initialize entities
    this.maze = new Maze(40);
    this.pacman = new PacMan(1, 1, 40);
    this.ghosts = [
      new Ghost(9, 7, 40, '#FF0000', 0),     // Red (Blinky)
      new Ghost(10, 7, 40, '#FFB6C1', 1),    // Pink (Pinky)
      new Ghost(8, 7, 40, '#00FFFF', 2),     // Cyan (Inky)
      new Ghost(11, 7, 40, '#FFA500', 3)     // Orange (Clyde)
    ];
    this.hearts = [];
    this.rose = null;
    this.roseSpawnTimer = 0;
    this.roseSpawnInterval = 300; // 5 seconds at 60 FPS

    // Spawn first rose after 3 seconds
    setTimeout(() => {
      if (!this.rose) {
        this.spawnRose();
      }
    }, 3000);

    // Effects
    this.effects = new EffectsManager();

    // Input
    this.keys = {};
    this.setupInput();

    // Start
    this.start();
  }

  setupInput() {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      this.keys[e.key.toLowerCase()] = true;

      if (e.key === ' ') {
        this.togglePause();
      }
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        if (this.state === 'GAME_OVER') {
          this.resetGame();
        } else {
          this.resetRound();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  start() {
    this.gameLoop();
    this.updateUI();
  }

  gameLoop() {
    const now = Date.now();
    const deltaTime = now - this.lastTime;
    this.lastTime = now;

    this.update(deltaTime);
    this.draw();

    this.frameCount++;
    this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
  }

  update(deltaTime) {
    if (this.state !== 'PLAYING') return;

    // Handle input
    if (this.keys['arrowup'] || this.keys['w']) {
      this.pacman.setDirection(3);
    }
    if (this.keys['arrowdown'] || this.keys['s']) {
      this.pacman.setDirection(1);
    }
    if (this.keys['arrowleft'] || this.keys['a']) {
      this.pacman.setDirection(2);
    }
    if (this.keys['arrowright'] || this.keys['d']) {
      this.pacman.setDirection(0);
    }

    // Update Pac-Man
    this.pacman.update(this.maze.data);

    // Update ghosts
    const pacmanPos = { x: this.pacman.x, y: this.pacman.y };
    for (const ghost of this.ghosts) {
      ghost.update(pacmanPos, this.maze.data);
    }

    // Update hearts
    for (const heart of this.hearts) {
      heart.update(this.maze.data);
    }
    this.hearts = this.hearts.filter(h => h.isActive);

    // Update rose
    if (this.rose) {
      this.rose.update();
    }

    // Update effects
    this.effects.update();

    // Collision: Pac-Man vs Pellets
    if (this.maze.collectPellet(this.pacman)) {
      this.score += 10;
      this.effects.add(
        this.pacman.x + this.pacman.width / 2,
        this.pacman.y + this.pacman.height / 2,
        'pellet'
      );
      this.updateUI();
    }

    // Collision: Pac-Man vs Rose
    if (this.rose && checkAABBCollision(this.pacman, this.rose, 15)) {
      console.log('💕 Rose collected! Activating power-up...');
      this.pacman.activatePowerUp();
      this.score += 50;
      this.effects.add(
        this.rose.x + this.rose.width / 2,
        this.rose.y + this.rose.height / 2,
        'rose'
      );
      this.rose = null;
      this.updateUI();
    }

    // Collision: Pac-Man vs Ghosts
    for (const ghost of this.ghosts) {
      if (!ghost.isDead && checkAABBCollision(this.pacman, ghost, 5)) {
        this.loseLife();
        break;
      }
    }

    // Collision: Hearts vs Ghosts
    for (const heart of this.hearts) {
      if (!heart.isActive) continue;
      
      for (const ghost of this.ghosts) {
        if (!ghost.isDead && checkAABBCollision(heart, ghost, 15)) {
          console.log('👻 Ghost hit by heart!');
          ghost.die();
          heart.isActive = false;
          this.score += 200;
          this.effects.add(
            ghost.x + ghost.width / 2,
            ghost.y + ghost.height / 2,
            'ghost'
          );
          this.updateUI();
          break;
        }
      }
    }

    // Fire hearts when powered
    if (this.pacman.isPowered) {
      if (this.pacman.canFireHeart(this.frameCount)) {
        const heart = new Heart(
          this.pacman.x + this.pacman.width / 2 - 10,
          this.pacman.y + this.pacman.height / 2 - 10,
          this.pacman.direction,
          this.maze.tileSize
        );
        this.hearts.push(heart);
        console.log('💕 Heart fired! Direction:', this.pacman.direction, 'Total hearts:', this.hearts.length);
      }
    }

    // Spawn rose periodically
    this.roseSpawnTimer++;
    if (!this.rose && this.roseSpawnTimer >= this.roseSpawnInterval) {
      this.spawnRose();
    }

    // Check level complete
    if (this.maze.getPelletsRemaining() === 0) {
      this.levelComplete();
    }
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw maze
    this.maze.draw(this.ctx);

    // Draw rose
    if (this.rose) {
      this.rose.draw(this.ctx);
    }

    // Draw hearts
    for (const heart of this.hearts) {
      heart.draw(this.ctx);
    }

    // Draw ghosts
    for (const ghost of this.ghosts) {
      ghost.draw(this.ctx);
    }

    // Draw Pac-Man
    this.pacman.draw(this.ctx);

    // Draw effects
    this.effects.draw(this.ctx);

    // Draw power-up timer bar
    if (this.pacman.isPowered) {
      const barWidth = 200;
      const barHeight = 8;
      const barX = (this.canvas.width - barWidth) / 2;
      const barY = 10;
      const progress = this.pacman.powerUpTimer / this.pacman.powerUpDuration;

      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);

      this.ctx.fillStyle = '#FF6B6B';
      this.ctx.fillRect(barX, barY, barWidth * progress, barHeight);

      this.ctx.fillStyle = '#fff';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('💕 POWER-UP 💕', this.canvas.width / 2, barY + barHeight + 15);
    }

    // Draw game state overlays
    if (this.state === 'PAUSED') {
      this.drawOverlay('PAUSED', 'Press SPACE to continue');
    } else if (this.state === 'GAME_OVER') {
      this.drawOverlay('GAME OVER', 'Press R to restart');
    } else if (this.state === 'LEVEL_COMPLETE') {
      this.drawOverlay(`LEVEL ${this.level} COMPLETE!`, 'Press SPACE to continue');
    }
  }

  drawOverlay(title, subtitle) {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#FF6B6B';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(title, this.canvas.width / 2, this.canvas.height / 2 - 20);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '20px Arial';
    this.ctx.fillText(subtitle, this.canvas.width / 2, this.canvas.height / 2 + 20);
  }

  loseLife() {
    this.lives--;
    this.updateUI();

    if (this.lives <= 0) {
      this.state = 'GAME_OVER';
    } else {
      this.resetRound();
    }
  }

  resetRound() {
    this.pacman.respawn();
    for (const ghost of this.ghosts) {
      ghost.respawn();
    }
    this.hearts = [];
    this.effects.clear();
  }

  resetGame() {
    this.lives = 3;
    this.score = 0;
    this.level = 1;
    this.maze.reset();
    this.resetRound();
    this.rose = null;
    this.roseSpawnTimer = 0;
    this.state = 'PLAYING';
    this.updateUI();
  }

  levelComplete() {
    this.state = 'LEVEL_COMPLETE';
    this.level++;
  }

  nextLevel() {
    this.maze.reset();
    this.resetRound();
    this.rose = null;
    this.roseSpawnTimer = 0;
    this.state = 'PLAYING';
    this.updateUI();
  }

  spawnRose() {
    const tile = this.maze.getRandomEmptyTile();
    if (tile) {
      this.rose = new Rose(tile.x, tile.y, this.maze.tileSize);
      this.roseSpawnTimer = 0;
      console.log('🌹 Rose spawned at', tile.x, tile.y);
    }
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
    } else if (this.state === 'LEVEL_COMPLETE') {
      this.nextLevel();
    }
  }

  updateUI() {
    const scoreEl = document.getElementById('score');
    const livesEl = document.getElementById('lives');
    const levelEl = document.getElementById('level');

    if (scoreEl) scoreEl.textContent = this.score;
    if (livesEl) livesEl.textContent = '❤️'.repeat(this.lives);
    if (levelEl) levelEl.textContent = this.level;
  }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.game = new GameEngine('gameCanvas');
});
