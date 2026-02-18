/**
 * PACMAN GAME ENTITIES - Valentine's Theme
 * Core entity classes: PacMan, Ghost, Rose, Heart
 */

// Collision detection helper
function checkAABBCollision(entity1, entity2, margin = 5) {
  const x1Min = entity1.x - margin;
  const x1Max = entity1.x + entity1.width + margin;
  const y1Min = entity1.y - margin;
  const y1Max = entity1.y + entity1.height + margin;

  const x2Min = entity2.x - margin;
  const x2Max = entity2.x + entity2.width + margin;
  const y2Min = entity2.y - margin;
  const y2Max = entity2.y + entity2.height + margin;

  return !(x1Max < x2Min || x2Max < x1Min || y1Max < y2Min || y2Max < y1Min);
}

// ============================================================
// PACMAN CLASS
// ============================================================

class PacMan {
  constructor(x, y, tileSize = 40) {
    this.gridX = x;
    this.gridY = y;
    this.x = x * tileSize;
    this.y = y * tileSize;
    this.spawnX = this.x;
    this.spawnY = this.y;

    this.tileSize = tileSize;
    this.width = tileSize;
    this.height = tileSize;
    this.radius = tileSize / 2.5;

    this.speed = 2.5;
    this.direction = 0; // 0=RIGHT, 1=DOWN, 2=LEFT, 3=UP
    this.nextDirection = 0;

    // Animation
    this.mouthOpenness = 0;
    this.mouthDirection = 1;
    this.mouthSpeed = 0.1;

    // Power-up state
    this.isPowered = false;
    this.powerUpTimer = 0;
    this.powerUpDuration = 480; // 8 seconds at 60 FPS
    this.lastHeartFired = 0;
    this.heartFireRate = 12; // Fire heart every 12 frames
  }

  setDirection(dir) {
    this.nextDirection = dir;
  }

  update(maze) {
    // Try to change to next direction if possible
    if (this.nextDirection !== this.direction) {
      if (this.canMoveInDirection(this.nextDirection, maze)) {
        this.direction = this.nextDirection;
      }
    }

    // Move in current direction
    this.moveInDirection(this.direction, maze);

    // Update power-up timer
    if (this.isPowered) {
      this.powerUpTimer--;
      if (this.powerUpTimer <= 0) {
        this.isPowered = false;
        this.powerUpTimer = 0;
      }
    }

    // Update animation
    this.updateAnimation();

    // Update grid position
    this.gridX = Math.round(this.x / this.tileSize);
    this.gridY = Math.round(this.y / this.tileSize);
  }

  canMoveInDirection(direction, maze) {
    const nextX = this.getNextPosition(direction, this.x, 'x');
    const nextY = this.getNextPosition(direction, this.y, 'y');
    return !this.isWallCollision(nextX, nextY, maze);
  }

  moveInDirection(direction, maze) {
    const nextX = this.getNextPosition(direction, this.x, 'x');
    const nextY = this.getNextPosition(direction, this.y, 'y');

    if (!this.isWallCollision(nextX, nextY, maze)) {
      this.x = nextX;
      this.y = nextY;

      // Wrap around maze edges
      const mazeWidth = maze[0].length * this.tileSize;
      if (this.x < 0) this.x = mazeWidth - this.width;
      if (this.x > mazeWidth) this.x = 0;
    }
  }

  getNextPosition(direction, currentPos, axis) {
    const deltaMap = {
      0: { x: this.speed, y: 0 },     // RIGHT
      1: { x: 0, y: this.speed },     // DOWN
      2: { x: -this.speed, y: 0 },    // LEFT
      3: { x: 0, y: -this.speed }     // UP
    };
    return currentPos + deltaMap[direction][axis];
  }

  canMoveInDirection(direction, maze) {
    const nextX = this.getNextPosition(direction, this.x, 'x');
    const nextY = this.getNextPosition(direction, this.y, 'y');
    return !this.isWallCollision(nextX, nextY, maze);
  }

  isWallCollision(x, y, maze) {
    const margin = 6; // Larger margin for easier turning
    const corners = [
      { px: x + margin, py: y + margin },
      { px: x + this.width - margin, py: y + margin },
      { px: x + margin, py: y + this.height - margin },
      { px: x + this.width - margin, py: y + this.height - margin }
    ];

    for (const corner of corners) {
      const gridX = Math.floor(corner.px / this.tileSize);
      const gridY = Math.floor(corner.py / this.tileSize);

      if (gridX < 0 || gridX >= maze[0].length ||
          gridY < 0 || gridY >= maze.length) {
        return false;
      }

      if (maze[gridY][gridX] === 1) {
        return true;
      }
    }
    return false;
  }

  updateAnimation() {
    this.mouthOpenness += this.mouthDirection * this.mouthSpeed;
    if (this.mouthOpenness >= 0.5) {
      this.mouthDirection = -1;
    } else if (this.mouthOpenness <= 0) {
      this.mouthDirection = 1;
    }
  }

  activatePowerUp() {
    this.isPowered = true;
    this.powerUpTimer = this.powerUpDuration;
    this.lastHeartFired = -this.heartFireRate; // Ensure first heart fires immediately
    console.log('🔥 Power-up activated! Duration:', this.powerUpDuration, 'frames');
  }

  canFireHeart(frameCount) {
    if (!this.isPowered) return false;
    const timeSinceLastFire = frameCount - this.lastHeartFired;
    if (timeSinceLastFire >= this.heartFireRate) {
      this.lastHeartFired = frameCount;
      return true;
    }
    return false;
  }

  respawn() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.direction = 0;
    this.nextDirection = 0;
    this.isPowered = false;
    this.powerUpTimer = 0;
  }

  draw(ctx) {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    // Calculate mouth angle based on direction
    const rotationAngles = {
      0: 0,               // RIGHT
      1: Math.PI / 2,     // DOWN
      2: Math.PI,         // LEFT
      3: -Math.PI / 2     // UP
    };
    const rotation = rotationAngles[this.direction];

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);

    // Draw Pac-Man body (yellow circle with mouth)
    const mouthAngle = this.mouthOpenness * Math.PI / 2;
    
    // Glow effect when powered
    if (this.isPowered) {
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 107, 107, 0.4)';
      ctx.fill();
    }

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, this.radius, mouthAngle, Math.PI * 2 - mouthAngle);
    ctx.closePath();

    // Color based on power-up state
    ctx.fillStyle = this.isPowered ? '#FF6B6B' : '#FFD700';
    ctx.fill();

    // Eye
    ctx.beginPath();
    ctx.arc(3, -this.radius / 2, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();

    ctx.restore();
  }
}

// ============================================================
// GHOST CLASS
// ============================================================

class Ghost {
  constructor(x, y, tileSize, color, personality) {
    this.gridX = x;
    this.gridY = y;
    this.x = x * tileSize;
    this.y = y * tileSize;
    this.spawnX = this.x;
    this.spawnY = this.y;

    this.tileSize = tileSize;
    this.width = tileSize;
    this.height = tileSize;

    this.speed = 1.8;
    this.direction = Math.floor(Math.random() * 4);

    this.color = color;
    this.personality = personality;

    // AI modes: CHASE, SCATTER, FRIGHTENED, DEAD
    this.mode = 'SCATTER';
    this.modeTimer = 0;
    this.currentModeIndex = 0;

    // Corner targets for scatter mode
    const corners = [
      { x: 18, y: 1 },   // Top-right
      { x: 1, y: 1 },    // Top-left
      { x: 18, y: 13 },  // Bottom-right
      { x: 1, y: 13 }    // Bottom-left
    ];
    this.cornerX = corners[personality % 4].x * tileSize;
    this.cornerY = corners[personality % 4].y * tileSize;

    this.updateCounter = 0;
    this.updateInterval = 8;

    this.isDead = false;
    this.animationFrame = 0;
  }

  update(pacmanPos, maze) {
    // Mode timer for CHASE/SCATTER cycling
    this.modeTimer++;
    const cycleDuration = this.mode === 'SCATTER' ? 420 : 1200; // 7s scatter, 20s chase

    if (this.mode !== 'DEAD') {
      if (this.modeTimer >= cycleDuration) {
        this.modeTimer = 0;
        this.currentModeIndex = (this.currentModeIndex + 1) % 4;
        this.mode = this.currentModeIndex % 2 === 0 ? 'SCATTER' : 'CHASE';
      }
    }

    // Update direction periodically
    this.updateCounter++;
    if (this.updateCounter >= this.updateInterval) {
      this.updateCounter = 0;

      if (this.mode === 'CHASE') {
        this.direction = this.getChaseDirection(pacmanPos, maze);
      } else if (this.mode === 'SCATTER') {
        this.direction = this.getScatterDirection(maze);
      } else if (this.mode === 'DEAD') {
        this.direction = this.getHomeDirection(maze);
      }
    }

    this.moveInDirection(this.direction, maze);
    this.updateAnimation();

    // Check if reached home when dead
    if (this.isDead) {
      const dx = Math.abs(this.x - this.spawnX);
      const dy = Math.abs(this.y - this.spawnY);
      if (dx < this.tileSize / 2 && dy < this.tileSize / 2) {
        this.respawn();
      }
    }

    this.gridX = Math.round(this.x / this.tileSize);
    this.gridY = Math.round(this.y / this.tileSize);
  }

  getChaseDirection(pacmanPos, maze) {
    let bestDirection = this.direction;
    let bestDistance = Infinity;
    let validDirections = [];

    for (let dir = 0; dir < 4; dir++) {
      const nextX = this.getNextPosition(dir, this.x, 'x');
      const nextY = this.getNextPosition(dir, this.y, 'y');

      if (this.isWallCollision(nextX, nextY, maze)) continue;
      
      validDirections.push(dir);
      
      // Don't reverse unless it's the only option
      if ((dir + 2) % 4 === this.direction && validDirections.length > 1) continue;

      const distance = Math.abs(nextX - pacmanPos.x) + Math.abs(nextY - pacmanPos.y);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestDirection = dir;
      }
    }

    // If stuck, allow any valid direction including reverse
    if (bestDistance === Infinity && validDirections.length > 0) {
      bestDirection = validDirections[0];
    }

    return bestDirection;
  }

  getScatterDirection(maze) {
    let bestDirection = this.direction;
    let bestDistance = Infinity;
    let validDirections = [];

    for (let dir = 0; dir < 4; dir++) {
      const nextX = this.getNextPosition(dir, this.x, 'x');
      const nextY = this.getNextPosition(dir, this.y, 'y');

      if (this.isWallCollision(nextX, nextY, maze)) continue;
      
      validDirections.push(dir);
      
      if ((dir + 2) % 4 === this.direction && validDirections.length > 1) continue;

      const distance = Math.abs(nextX - this.cornerX) + Math.abs(nextY - this.cornerY);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestDirection = dir;
      }
    }

    if (bestDistance === Infinity && validDirections.length > 0) {
      bestDirection = validDirections[0];
    }

    return bestDirection;
  }

  getHomeDirection(maze) {
    let bestDirection = this.direction;
    let bestDistance = Infinity;
    let validDirections = [];

    for (let dir = 0; dir < 4; dir++) {
      const nextX = this.getNextPosition(dir, this.x, 'x');
      const nextY = this.getNextPosition(dir, this.y, 'y');

      if (this.isWallCollision(nextX, nextY, maze)) continue;
      
      validDirections.push(dir);

      const distance = Math.abs(nextX - this.spawnX) + Math.abs(nextY - this.spawnY);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestDirection = dir;
      }
    }

    if (bestDistance === Infinity && validDirections.length > 0) {
      bestDirection = validDirections[0];
    }

    return bestDirection;
  }

  moveInDirection(direction, maze) {
    const nextX = this.getNextPosition(direction, this.x, 'x');
    const nextY = this.getNextPosition(direction, this.y, 'y');

    if (!this.isWallCollision(nextX, nextY, maze)) {
      this.x = nextX;
      this.y = nextY;
    }
  }

  getNextPosition(direction, currentPos, axis) {
    const speed = this.isDead ? this.speed * 2 : this.speed;
    const deltaMap = {
      0: { x: speed, y: 0 },
      1: { x: 0, y: speed },
      2: { x: -speed, y: 0 },
      3: { x: 0, y: -speed }
    };
    return currentPos + deltaMap[direction][axis];
  }

  isWallCollision(x, y, maze) {
    const margin = 5;
    const corners = [
      { px: x + margin, py: y + margin },
      { px: x + this.width - margin, py: y + margin },
      { px: x + margin, py: y + this.height - margin },
      { px: x + this.width - margin, py: y + this.height - margin }
    ];

    for (const corner of corners) {
      const gridX = Math.floor(corner.px / this.tileSize);
      const gridY = Math.floor(corner.py / this.tileSize);

      if (gridX < 0 || gridX >= maze[0].length ||
          gridY < 0 || gridY >= maze.length) {
        return false;
      }

      if (maze[gridY][gridX] === 1) {
        return true;
      }
    }
    return false;
  }

  updateAnimation() {
    this.animationFrame = (this.animationFrame + 1) % 60;
  }

  die() {
    this.isDead = true;
    this.mode = 'DEAD';
  }

  respawn() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.isDead = false;
    this.mode = 'SCATTER';
    this.modeTimer = 0;
  }

  draw(ctx) {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const size = this.tileSize * 0.4;

    if (this.isDead) {
      // Draw only eyes when dead
      this.drawEyes(ctx, centerX, centerY, size);
      return;
    }

    // Ghost body
    ctx.beginPath();
    ctx.arc(centerX, centerY - size * 0.2, size, Math.PI, 0, false);
    
    // Wavy bottom
    const waveOffset = Math.sin(this.animationFrame * 0.2) * 2;
    ctx.lineTo(centerX + size, centerY + size * 0.8);
    for (let i = 0; i < 4; i++) {
      const waveX = centerX + size - (size * 0.5 * (i + 1));
      const waveY = centerY + size * 0.8 + (i % 2 === 0 ? waveOffset + 4 : waveOffset - 4);
      ctx.lineTo(waveX, waveY);
    }
    ctx.lineTo(centerX - size, centerY + size * 0.8);
    ctx.closePath();

    ctx.fillStyle = this.color;
    ctx.fill();

    // Draw eyes
    this.drawEyes(ctx, centerX, centerY, size);
  }

  drawEyes(ctx, centerX, centerY, size) {
    // Eye whites
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(centerX - size * 0.35, centerY - size * 0.3, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + size * 0.35, centerY - size * 0.3, size * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Pupils - look in movement direction
    const pupilOffset = {
      0: { x: 2, y: 0 },
      1: { x: 0, y: 2 },
      2: { x: -2, y: 0 },
      3: { x: 0, y: -2 }
    };
    const offset = pupilOffset[this.direction] || { x: 0, y: 0 };

    ctx.fillStyle = '#00f';
    ctx.beginPath();
    ctx.arc(centerX - size * 0.35 + offset.x, centerY - size * 0.3 + offset.y, size * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + size * 0.35 + offset.x, centerY - size * 0.3 + offset.y, size * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ============================================================
// ROSE CLASS (Power-up)
// ============================================================

class Rose {
  constructor(x, y, tileSize) {
    this.gridX = x;
    this.gridY = y;
    this.x = x * tileSize;
    this.y = y * tileSize;
    this.tileSize = tileSize;
    this.width = tileSize;
    this.height = tileSize;

    this.rotation = 0;
    this.bobOffset = 0;
    this.bobDirection = 1;
  }

  update() {
    this.rotation += 0.02;
    this.bobOffset += 0.1 * this.bobDirection;
    if (Math.abs(this.bobOffset) > 3) {
      this.bobDirection *= -1;
    }
  }

  draw(ctx) {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2 + this.bobOffset;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(Math.sin(this.rotation) * 0.1);

    // Rose glow
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 105, 180, 0.3)';
    ctx.fill();

    // Draw rose using emoji
    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🌹', 0, 0);

    ctx.restore();
  }
}

// ============================================================
// HEART CLASS (Projectile)
// ============================================================

class Heart {
  constructor(x, y, direction, tileSize) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.tileSize = tileSize;
    this.width = 20;
    this.height = 20;

    this.speed = 5;
    this.lifetime = 120; // 2 seconds at 60 FPS
    this.isActive = true;

    this.rotation = 0;
    this.scale = 1;
  }

  update(maze) {
    if (!this.isActive) return;

    // Move in direction
    const deltaMap = {
      0: { x: this.speed, y: 0 },
      1: { x: 0, y: this.speed },
      2: { x: -this.speed, y: 0 },
      3: { x: 0, y: -this.speed }
    };
    const delta = deltaMap[this.direction];

    this.x += delta.x;
    this.y += delta.y;

    // Check wall collision
    const gridX = Math.floor((this.x + this.width / 2) / this.tileSize);
    const gridY = Math.floor((this.y + this.height / 2) / this.tileSize);

    if (gridX < 0 || gridX >= maze[0].length ||
        gridY < 0 || gridY >= maze.length ||
        maze[gridY][gridX] === 1) {
      this.isActive = false;
    }

    // Update lifetime
    this.lifetime--;
    if (this.lifetime <= 0) {
      this.isActive = false;
    }

    // Animation
    this.rotation += 0.1;
    this.scale = 0.8 + Math.sin(this.rotation) * 0.2;
  }

  draw(ctx) {
    if (!this.isActive) return;

    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.rotation * 0.5);
    ctx.scale(this.scale, this.scale);

    // Draw heart shape
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.bezierCurveTo(-10, -5, -10, -15, 0, -8);
    ctx.bezierCurveTo(10, -15, 10, -5, 0, 5);
    ctx.fillStyle = '#FF6B6B';
    ctx.fill();

    // Inner highlight
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.bezierCurveTo(-5, -3, -5, -8, 0, -5);
    ctx.bezierCurveTo(5, -8, 5, -3, 0, 2);
    ctx.fillStyle = '#FFB6C1';
    ctx.fill();

    ctx.restore();

    // Trail effect
    for (let i = 1; i <= 3; i++) {
      const trailOffset = i * 8;
      const alphaFactor = 1 - i * 0.3;
      const trailX = centerX - (this.direction === 0 ? trailOffset : this.direction === 2 ? -trailOffset : 0);
      const trailY = centerY - (this.direction === 1 ? trailOffset : this.direction === 3 ? -trailOffset : 0);

      ctx.save();
      ctx.translate(trailX, trailY);
      ctx.globalAlpha = alphaFactor * 0.5;
      ctx.scale(0.6, 0.6);
      
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.bezierCurveTo(-10, -5, -10, -15, 0, -8);
      ctx.bezierCurveTo(10, -15, 10, -5, 0, 5);
      ctx.fillStyle = '#FF6B6B';
      ctx.fill();
      
      ctx.restore();
    }
  }
}
