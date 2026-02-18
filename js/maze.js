/**
 * MAZE SYSTEM - Valentine's Pac-Man
 * Grid-based maze layout with pellet management
 */

// 20x15 maze grid: 1 = wall, 0 = walkable path
const MAZE_DATA = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

class Maze {
  constructor(tileSize = 40) {
    this.tileSize = tileSize;
    this.width = MAZE_DATA[0].length;
    this.height = MAZE_DATA.length;
    this.data = JSON.parse(JSON.stringify(MAZE_DATA));
    
    this.pellets = [];
    this.totalPellets = 0;
    this.generatePellets();
  }

  generatePellets() {
    this.pellets = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.data[y][x] === 0) {
          // Skip ghost spawn area (center)
          const isGhostSpawn = (x >= 8 && x <= 11 && y >= 6 && y <= 8);
          if (!isGhostSpawn) {
            this.pellets.push({ x, y, collected: false });
          }
        }
      }
    }
    this.totalPellets = this.pellets.length;
  }

  isWalkable(pixelX, pixelY) {
    const gridX = Math.floor(pixelX / this.tileSize);
    const gridY = Math.floor(pixelY / this.tileSize);

    if (gridX < 0 || gridX >= this.width || gridY < 0 || gridY >= this.height) {
      return true;
    }

    return this.data[gridY][gridX] !== 1;
  }

  getTileAtPixel(pixelX, pixelY) {
    const gridX = Math.floor(pixelX / this.tileSize);
    const gridY = Math.floor(pixelY / this.tileSize);

    if (gridX < 0 || gridX >= this.width || gridY < 0 || gridY >= this.height) {
      return 0;
    }

    return this.data[gridY][gridX];
  }

  getPelletsRemaining() {
    return this.pellets.filter(p => !p.collected).length;
  }

  collectPellet(pacman) {
    const pacmanCenterX = pacman.x + pacman.width / 2;
    const pacmanCenterY = pacman.y + pacman.height / 2;

    for (const pellet of this.pellets) {
      if (!pellet.collected) {
        const pelletCenterX = pellet.x * this.tileSize + this.tileSize / 2;
        const pelletCenterY = pellet.y * this.tileSize + this.tileSize / 2;
        
        const dx = pacmanCenterX - pelletCenterX;
        const dy = pacmanCenterY - pelletCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.tileSize * 0.5) {
          pellet.collected = true;
          return true;
        }
      }
    }
    return false;
  }

  getRandomEmptyTile() {
    const emptyTiles = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.data[y][x] === 0) {
          // Exclude edges and ghost spawn area
          const isEdge = x <= 1 || x >= this.width - 2 || y <= 1 || y >= this.height - 2;
          const isGhostSpawn = (x >= 8 && x <= 11 && y >= 6 && y <= 8);
          if (!isEdge && !isGhostSpawn) {
            emptyTiles.push({ x, y });
          }
        }
      }
    }
    
    if (emptyTiles.length === 0) {
      console.warn('No empty tiles found for rose spawn!');
      // Fallback: use any walkable tile
      for (let y = 1; y < this.height - 1; y++) {
        for (let x = 1; x < this.width - 1; x++) {
          if (this.data[y][x] === 0) {
            emptyTiles.push({ x, y });
          }
        }
      }
    }
    
    const tile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    return tile;
  }

  draw(ctx) {
    // Draw walls
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.data[y][x] === 1) {
          const gradient = ctx.createLinearGradient(
            x * this.tileSize,
            y * this.tileSize,
            x * this.tileSize + this.tileSize,
            y * this.tileSize + this.tileSize
          );
          gradient.addColorStop(0, '#2C3E50');
          gradient.addColorStop(1, '#34495E');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(
            x * this.tileSize,
            y * this.tileSize,
            this.tileSize,
            this.tileSize
          );
          
          ctx.strokeStyle = '#1a252f';
          ctx.lineWidth = 1;
          ctx.strokeRect(
            x * this.tileSize,
            y * this.tileSize,
            this.tileSize,
            this.tileSize
          );
        }
      }
    }

    // Draw pellets
    for (const pellet of this.pellets) {
      if (!pellet.collected) {
        const centerX = pellet.x * this.tileSize + this.tileSize / 2;
        const centerY = pellet.y * this.tileSize + this.tileSize / 2;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD700';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.fill();
      }
    }
  }

  reset() {
    this.generatePellets();
  }
}
