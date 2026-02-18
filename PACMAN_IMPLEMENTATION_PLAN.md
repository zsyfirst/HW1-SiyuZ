# Valentine's Pac-Man Game - Implementation Plan

**TL;DR**: Build a Valentine-themed Pac-Man using Canvas 2D API with multi-file ES6 architecture. Core features: maze navigation, pellet collection, 4 AI ghosts, rose power-up that triggers heart projectiles. Files organized as `pacman/index.html` (game page) + `js/` modules (game.js, entities.js, maze.js).

---

## Steps

### 1. Create game page at `pacman/index.html`
- HTML5 canvas element (800×600px)
- Valentine-themed CSS (gradients, pink/red colors)
- Load JS modules: maze.js → entities.js → game.js
- HUD: score, lives counter, power-up indicator
- Controls section: arrow keys to move, spacebar to pause

### 2. Build maze system in `js/maze.js`
- Define `MAZE_DATA` as 20×15 2D array (1=wall, 0=walkable)
- `Maze` class: constructor, `generatePellets()`, `draw()`, `isWalkable(x,y)`, `collectPellet(pacman)`
- Pellets spawn on all walkable tiles at game start
- Draw walls as dark rectangles, pellets as gold circles

### 3. Implement entities in `js/entities.js`
- **`PacMan` class**: position, direction (0-3), speed, `update()`, `draw()`, `setDirection()`, mouth animation
- **`Ghost` class**: color, AI mode enum (CHASE/SCATTER/FRIGHTENED/DEAD), behavior timers, `update()` with pathfinding, `draw()` with frightened animation
- **`Rose` class**: spawn position, rotation animation, collision radius, `draw()` as pink rose emoji or shape
- **`Heart` class**: direction, speed, lifetime counter, `update()` move in direction, `draw()` as heart shape
- Collision helper: `checkAABBCollision(e1, e2, margin)`

### 4. Build game engine in `js/game.js`
- `GameEngine` class with 60 FPS loop via `requestAnimationFrame`
- States: PLAYING, PAUSED, GAME_OVER, LEVEL_COMPLETE
- Create maze, pacman, 4 ghosts on init
- Input handling: keydown/keyup listeners for arrow keys
- **Update loop**: input → pacman.update() → ghosts.update() → collisions → spawning → effects
- **Collision detection**: pellet pickup (+10 pts), ghost hit (lose life or kill if heart), rose pickup (trigger power-up)
- Rose spawning: random interval (8-15s), 30% chance per check
- Heart spawning: when powered, fire hearts every 10 frames in Pac-Man's direction
- Level complete when all pellets collected

### 5. Implement ghost AI (inside `Ghost.update()`)
- CHASE mode: target Pac-Man's position, pick direction minimizing Manhattan distance
- SCATTER mode: target assigned corner, cycle with CHASE every ~7s
- FRIGHTENED mode: random direction (not used - roses trigger hearts, not frightened mode)
- DEAD mode: return to spawn, respawn after reaching home
- Each of 4 ghosts has unique personality (corner targets)

### 6. Valentine power-up mechanics
- Rose spawns randomly on empty tile every 10-15 seconds
- On collision: Pac-Man enters powered state for 8 seconds
- While powered: auto-fire `Heart` projectile every 10 frames
- Heart travels in Pac-Man's facing direction at 4px/frame
- Heart hitting ghost: ghost enters DEAD mode, +200 points
- Hearts destroyed on wall collision or after 2 seconds

### 7. Add visual polish in `js/effects.js` (optional)
- `ParticleEffect` class for pellet/ghost/rose events
- Valentine color palette (#FF6B6B, #FFB6C1, #E74C3C)
- Pac-Man: yellow circle with animated mouth
- Ghosts: colored shapes with wobbly bottom, eyes
- Hearts: pink/red heart shapes (use bezier curves or emoji)

### 8. Link from homepage at `index.html`
- Add navigation link: `<a href="/pacman/index.html">Pac-Man Game</a>`
- Add project card in projects section with description and "Play Game" button

---

## Verification

- [ ] Open `pacman/index.html` in browser - canvas should render maze
- [ ] Arrow keys move Pac-Man, ghosts chase after delay
- [ ] Eating pellets increases score, all pellets = level complete
- [ ] Rose appears periodically, collecting triggers heart shooting
- [ ] Hearts travel through maze, eliminate ghosts on contact
- [ ] Losing 3 lives shows game over screen
- [ ] Homepage links to game page correctly

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Rendering | Canvas 2D | Better performance for 60 FPS game loop |
| Code structure | Multi-file ES6 | Cleaner separation of concerns |
| Maze shape | Classic rectangular | Easier collision detection, more playable |
| Power-up mechanic | Rose → hearts | Unique Valentine twist per requirements |
| Ghost count | 4 with corner targeting | Classic Pac-Man feel |

---

## File Structure

```
homework-1-zsyfirst/
├── pacman/
│   └── index.html      # Game page with canvas and styles
├── js/
│   ├── maze.js         # Maze data and rendering
│   ├── entities.js     # PacMan, Ghost, Rose, Heart classes
│   ├── game.js         # GameEngine main loop
│   └── effects.js      # Particle effects (optional)
├── styles/
│   ├── main.css        # Shared styles
│   └── responsive.css  # Mobile breakpoints
└── index.html          # Homepage with link to game
```
