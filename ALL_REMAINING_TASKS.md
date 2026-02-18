# All Remaining Task Prompts for Coding Blog Project

Copy and paste each task section into Copilot CLI one at a time.

---

# Task P1c: Homepage Integration & Link Setup

**Agent Type**: code-generator
**Complexity**: Low
**Dependencies**: P1a ✅, P1b ✅

## Context
You are integrating navigation links into the homepage to connect all three blog components. The homepage currently exists but needs functional links to the Pac-Man game and arXiv feed pages.

## Requirements

1. **Update `index.html`** with proper navigation linking to:
   - Home (/)
   - Pac-Man Game (/pacman/index.html)
   - arXiv Feed (/arxiv.html)
   - Ensure all links are relative paths (GitHub Pages compatible)
   - Add semantic nav element with proper aria-labels

2. **Create `nav-config.json`** for future template reuse:
```json
{
  "navigation": [
    {"label": "Home", "path": "/", "icon": "🏠"},
    {"label": "Pac-Man Game", "path": "/pacman/index.html", "icon": "👾"},
    {"label": "arXiv Feed", "path": "/arxiv.html", "icon": "📚"}
  ],
  "footer_links": [
    {"label": "GitHub", "path": "https://github.com/[username]/[repo]"},
    {"label": "Harvard BST236", "path": "#"}
  ]
}
```

3. **Add visual indicator** for current page (active nav item styling)

## Success Criteria
✅ All three links present and properly formatted
✅ Links use relative paths
✅ nav-config.json valid JSON
✅ Accessible navigation (ARIA labels)
✅ Mobile-responsive nav

---

# Task P2a: Pac-Man Game Architecture & Design Document

**Agent Type**: architect
**Complexity**: High
**Dependencies**: P0 ✅

## Context
You are designing the complete architecture for a Valentine's-themed Pac-Man game. The game must include classic Pac-Man mechanics plus a Valentine's twist: rose power-ups that enable heart projectiles to defeat ghosts.

## Requirements

1. **Create `pacman-architecture.md`** with:
   - System overview (game loop, state management, rendering)
   - Game entities: Pac-Man, Ghosts (4), Pellets, Rose, Hearts, Maze
   - Game states: Playing, Powered-up, GameOver, LevelComplete
   - Collision detection strategy
   - Scoring system (10 pts pellet, 50 pts rose, 200 pts ghost, etc.)
   - Lives system (3 lives default)

2. **Create `game-pseudocode.js`** showing:
   - GameEngine class structure with all properties
   - Entity classes: PacMan, Ghost, Rose, Heart
   - Update() method pseudo-code with 10 main steps
   - Render() method structure
   - Collision detection approach

3. **Create `entity-diagram.md`** showing:
   - ASCII entity relationship diagram
   - State transitions (Pac-Man: Normal → PoweredUp → Normal)
   - Ghost AI states (Chase → Scatter → Frightened)
   - Data flow: Input → Update → Render

## Valentine's Theme Specifics
- Rose 🌹: Replaces classic power pellet
- Power-up duration: 5-8 seconds
- Heart ❤️ projectiles: Travel in Pac-Man's facing direction, destroy ghosts on contact
- Visual: Pink/red color scheme, heart-themed

## Success Criteria
✅ Architecture document is clear and implementable
✅ Pseudocode covers all game mechanics
✅ State machine well-defined
✅ Entity diagram shows all relationships
✅ Power-up system clearly specified
✅ Ready to hand off to implementation with zero ambiguity

---

# Task P2b: Implement Pac-Man & Ghost Entity Classes

**Agent Type**: code-generator
**Complexity**: High
**Dependencies**: P2a ✅

## Context
You are implementing the core game entities (Pac-Man, Ghosts, Rose, Hearts) as JavaScript classes with movement, animation, and collision detection.

## Requirements

Create `js/entities.js` with these classes:

### PacMan Class
```javascript
class PacMan {
  constructor(x, y, tileSize)
  update(maze, deltaTime) // handles movement, animation, power-up timer
  draw(ctx) // draws Pac-Man and glow if powered
  setDirection(dir) // buffers next direction from input
  activatePowerUp() // activates powered state
  isPoweredUp() // returns true if currently powered
  shootHeart(direction) // returns new Heart object
}
```

### Ghost Class
```javascript
class Ghost {
  constructor(x, y, tileSize, color, aiMode)
  update(pacmanPos, maze, deltaTime) // simple AI chase logic
  draw(ctx) // draws ghost with color
  setMode(mode) // sets behavior mode
  isFrightened() // returns mode state
}
```

### Rose Class
```javascript
class Rose {
  constructor(x, y, tileSize)
  update(deltaTime)
  draw(ctx)
  isActive() // checks if not expired
}
```

### Heart Class (Projectile)
```javascript
class Heart {
  constructor(x, y, direction, tileSize)
  update(maze, deltaTime)
  draw(ctx)
  isActive() // checks lifetime
}
```

### Collision Helper
```javascript
function checkAABBCollision(entity1, entity2, margin = 5)
// Returns true if rectangles overlap
```

## Implementation Details
- Movement logic with wall collision checking
- Pac-Man mouth animation (simple timer-based blinking)
- Ghost AI: simple Manhattan distance chase toward Pac-Man
- Collision detection: AABB (Axis-Aligned Bounding Box)
- No Canvas drawing yet—just prepare draw() methods

## Success Criteria
✅ All entity classes implemented with all methods
✅ Movement logic handles maze collisions
✅ Collision detection functional
✅ Power-up system working
✅ Heart projectile system ready
✅ Code is clean and well-commented

---

# Task P2c: Implement Game Loop, Maze, & Collision System

**Agent Type**: code-generator
**Complexity**: High
**Dependencies**: P2b ✅

## Context
You are implementing the core game engine: maze layout, game loop, collision detection, and state management. The game runs at 60 FPS.

## Requirements

### Create `js/maze.js`

```javascript
// Maze Layout (0 = walkable, 1 = wall)
const MAZE_DATA = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

class Maze {
  constructor(width, height, tileSize = 30)
  generatePellets() // places pellets in all walkable tiles
  isWalkable(x, y) // pixel coords → returns boolean
  getTileAtPixel(pixelX, pixelY) // returns tile value
  draw(ctx) // draws walls and pellets
}
```

### Create `js/game.js`

Main GameEngine class with:

```javascript
class GameEngine {
  constructor(canvasId)
    // Initialize: canvas, state, lives, score, entities, timing
    
  setupKeyboardInput()
    // Arrow key handlers to set Pac-Man direction
    
  update(deltaTime)
    // 1. Update Pac-Man movement
    // 2. Update ghosts AI
    // 3. Update hearts
    // 4. Spawn rose randomly (10s timer, 30% chance)
    // 5. Check: Pac-Man-pellet collisions → remove pellet, +10 score
    // 6. Check: Pac-Man-rose collision → activate power-up, +50 score
    // 7. Check: Heart-ghost collisions → remove ghost, +200 score
    // 8. Check: Pac-Man-ghost collision → if powered: eat ghost, else: lose life
    // 9. Check: all pellets eaten → level complete
    // 10. Check: lives == 0 → game over
    
  render()
    // Clear canvas
    // Draw maze, rose, Pac-Man, ghosts, hearts
    // Draw UI: lives, score, power-up timer
    
  resetRound()
    // Reset Pac-Man and ghosts to start positions
    
  gameLoop()
    // requestAnimationFrame, calculate deltaTime, update, render
    
  start() / stop()
    // Start/stop game loop
}
```

## Implementation Details
- Game loop: requestAnimationFrame for smooth 60 FPS
- Delta time handling for frame-rate independent movement
- Collision detection for all entity types
- State management: PLAYING, GAME_OVER, LEVEL_COMPLETE
- Score tracking: pellets (+10), rose (+50), ghosts (+200)

## Success Criteria
✅ Game loop runs at ~60 FPS
✅ All collisions detected correctly
✅ Pellets disappear when eaten
✅ Rose spawns randomly every ~10 seconds
✅ Power-up activates/deactivates properly
✅ Ghosts chase Pac-Man
✅ Hearts shoot and destroy ghosts
✅ Lives system works
✅ Score increments correctly
✅ Game over/win conditions trigger properly

---

# Task P2d: Implement Heart Projectile System & Polish

**Agent Type**: code-generator
**Complexity**: Medium
**Dependencies**: P2c ✅

## Context
You are refining the heart projectile system with proper shooting mechanics and visual effects. Pac-Man shoots hearts continuously while powered up.

## Requirements

### Enhance Heart Shooting
- Pac-Man shoots hearts every 100ms while powered up (not every frame)
- Hearts travel in Pac-Man's current facing direction
- Multiple hearts can be active simultaneously
- Hearts removed when hitting walls or ghosts
- Heart speed: 4 pixels/frame, lifetime: 3 seconds

### Create `js/effects.js`

```javascript
class ParticleEffect {
  constructor(x, y, type) // 'GHOST_DEATH', 'ROSE_EATEN', 'PELLET_EAT'
  draw(ctx) // draw particle burst animation
  isActive() // check lifetime
}

// Optional: sound effects
function playSound(soundType) 
  // soundType: 'eat_pellet', 'power_up', 'ghost_death', 'game_over'
```

### Game Polish Additions
- Visual feedback for eating pellets (small flash/particle)
- Particle burst when ghost is destroyed (star burst effect)
- Glow effect when Pac-Man is powered up (draw aura)
- Smooth animations (no jumpy movement)
- Power-up timer display during powered state

## Success Criteria
✅ Hearts shoot continuously while powered (every 100ms)
✅ Heart velocity and trajectory correct
✅ Particle effects display when appropriate
✅ Game feels responsive and polished
✅ No memory leaks (old entities cleaned up)
✅ Visual indicators clear for game state

---

# Task P2e: Create Pac-Man Game HTML Page & Deployment

**Agent Type**: code-generator
**Complexity**: Low
**Dependencies**: P2d ✅, P1c ✅

## Context
You are creating the final HTML page that hosts the Pac-Man game. The page includes the game canvas, instructions, score display, and links back to the homepage.

## Requirements

Create `pacman/index.html` with:

### Layout
- Game canvas: 300x270px, black background
- Title: "💘 Valentine's Pac-Man 💘"
- Game info boxes: Lives, Score, Roses, Hearts descriptions
- Instructions panel with how to play (arrow keys, eating pellets, roses, hearts)
- Start Game and Reset buttons
- Navigation links to Home and arXiv Feed

### Styling (`pacman/styles.css` or inline)
- Valentine's theme: pink/red colors, heart emoji accents
- Responsive design (works on mobile, canvas maintains aspect ratio)
- Professional dark theme for game area
- Button hover effects
- Game over alert with final score

### Script Integration
- Load: js/entities.js, js/maze.js, js/effects.js, js/game.js
- Start Game button: creates GameEngine and calls start()
- Reset button: stops current game and resets UI
- Update UI every 100ms: display current lives, score, power-up timer
- Game over/win alerts and cleanup

### Deployment Checklist
- File exists at `pacman/index.html` ✅
- All script paths are relative ✅
- Links to homepage and arXiv work ✅
- Game runs without errors ✅
- Mobile responsive ✅

## Success Criteria
✅ HTML page displays and styles correctly
✅ Game canvas renders properly
✅ Start/Reset buttons work
✅ UI displays live score and lives updates
✅ Game is fully playable with all features
✅ Mobile responsive design
✅ Instructions are clear
✅ Navigation links work

---

# Task P3a: arXiv API Architecture & Workflow Design

**Agent Type**: architect
**Complexity**: Medium
**Dependencies**: P0 ✅

## Context
You are designing the complete workflow for fetching arXiv papers nightly and auto-updating the website via GitHub Actions.

## Requirements

### Create `arxiv-workflow.md`

Document the full pipeline:
- Trigger: GitHub Actions schedule (00:00 UTC daily)
- Step 1: Fetch papers from arXiv API (Node.js script)
- Step 2: Parse XML response → extract metadata
- Step 3: Generate static HTML page
- Step 4: Commit changes to repository
- Step 5: GitHub Pages auto-deploys

Include data flow diagram (ASCII):
```
[Midnight trigger] → [Fetch API] → [Parse XML] → [Generate HTML] → [Commit] → [Deploy]
```

Error handling strategy:
- API timeout (30s): Retry up to 2 times
- No new papers: Keep previous feed
- Git auth failure: Log error in Actions UI

### Create `fetch-strategy.md`

Document API details:

**Endpoint**: `http://export.arxiv.org/api/query`

**Query Parameters**:
- search_query: `cat:cs.AI` (Computer Science - AI category)
- start: 0
- max_results: 10
- sortBy: submittedDate
- sortOrder: descending

**Response**: XML with entry elements containing:
- title, authors (array), published date
- summary (abstract)
- links (with href for arXiv and PDF URLs)

**Data Processing**:
Extract and convert to JSON:
```json
{
  "papers": [
    {
      "title": "...",
      "authors": ["Author 1", "Author 2"],
      "published": "2025-01-15",
      "summary": "...",
      "arxiv_url": "http://arxiv.org/abs/2501.12345v1",
      "pdf_url": "http://arxiv.org/pdf/2501.12345v1"
    }
  ],
  "last_updated": "2025-01-16T00:01:00Z"
}
```

**Caching**: Save papers.json in repo root. Skip commit if no new papers.

## Success Criteria
✅ Workflow documentation is clear
✅ Data flow diagram provided
✅ Error handling strategy defined
✅ API endpoints and parameters specified
✅ JSON schema clearly documented
✅ Ready to implement with zero ambiguity

---

# Task P3b: Build arXiv Fetch Script (Node.js)

**Agent Type**: code-generator
**Complexity**: Medium
**Dependencies**: P3a ✅, P0 ✅

## Context
You are building a Node.js script that queries the arXiv API, parses the XML response, and outputs a JSON file with the latest papers.

## Requirements

### Create `scripts/fetchArxiv.js`

Executable Node.js script with:

```javascript
// Configuration
const ARXIV_API_URL = 'http://export.arxiv.org/api/query';
const PAPERS_FILE = './data/papers.json';
const MAX_RESULTS = 10;
const TIMEOUT_MS = 30000;

async function fetchPapers()
  // Query arXiv API using https.get or fetch
  // Parse XML response
  // Return array of paper objects

async function parseXMLResponse(xmlData)
  // Use xml2js library to parse XML
  // Extract: title, authors, published, summary, arxiv_url, pdf_url
  // Return clean JSON array

async function savePapers(papers)
  // Write to data/papers.json
  // Include: papers array, last_updated timestamp, count

async function main()
  // Call fetchPapers() → savePapers()
  // Error handling with meaningful logging
  // Exit codes: 0 on success, 1 on failure

// Make executable: #!/usr/bin/env node at top
```

### Update `package.json`

Add dependency:
```json
{
  "dependencies": {
    "xml2js": "^0.6.2"
  }
}
```

### Testing
- Run locally: `npm install && node scripts/fetchArxiv.js`
- Should create `data/papers.json` with 10 papers
- Verify JSON structure correct
- Execution time < 5 seconds

## Success Criteria
✅ Script fetches from arXiv API successfully
✅ XML parsed correctly
✅ JSON output matches specified format
✅ Error handling for timeouts/network issues
✅ Executable locally without errors
✅ Creates valid papers.json
✅ Runs in < 5 seconds
✅ Can be called by GitHub Actions

---

# Task P3c: Generate arXiv Feed HTML Page

**Agent Type**: code-generator
**Complexity**: Medium
**Dependencies**: P3b ✅, P1c ✅

## Context
You are creating a script that reads the papers.json file and generates a beautiful, responsive HTML page displaying the latest arXiv papers. This page is generated nightly and served by GitHub Pages.

## Requirements

### Create `scripts/generateFeedHTML.js`

```javascript
const PAPERS_FILE = './data/papers.json';
const OUTPUT_FILE = './arxiv.html';

function loadPapers()
  // Read data/papers.json
  // Parse JSON
  // Return {papers, last_updated}

function generateHTML(data)
  // Create paper cards for each paper with:
    // Title (clickable link to arXiv)
    // Authors (comma-separated)
    // Published date
    // Abstract summary (first 500 chars)
    // Buttons: "View on arXiv" and "📥 PDF"
  // Include metadata: last_updated, paper count
  // Add navigation links: Home, Pac-Man Game
  // Style with CSS (inline or external)

function escapeHTML(text)
  // Escape HTML special characters

async function main()
  // Load papers → Generate HTML → Write to file
  // Error handling and logging
```

### HTML/CSS Requirements
- Professional academic paper card layout
- Responsive grid (adjust for mobile)
- Paper cards with: title → authors → date → abstract
- Hover effects on cards (slight lift, color change)
- Links styled as buttons
- Footer with navigation to other pages
- Mobile responsive (1 column on small screens)
- Valentine's theme: pink/red accents optional

### Testing
```bash
# First run P3b to create papers.json
node scripts/fetchArxiv.js

# Then generate HTML
node scripts/generateFeedHTML.js

# Check arxiv.html was created and contains papers
```

## Success Criteria
✅ Reads papers.json correctly
✅ Generates valid, well-formed HTML
✅ Page is responsive and mobile-friendly
✅ Paper cards display all info clearly
✅ Links to arXiv and PDFs work
✅ Styling is professional and consistent
✅ Navigation links to home and Pac-Man work
✅ Runs in < 1 second
✅ Handles empty papers.json gracefully

---

# Task P3d: Create GitHub Actions Workflow YAML

**Agent Type**: devops
**Complexity**: High
**Dependencies**: P3c ✅, P3b ✅, P1c ✅

## Context
You are configuring GitHub Actions to automatically run the arXiv fetch and HTML generation every night at midnight UTC. The workflow commits updated files back to the repository, which GitHub Pages automatically deploys.

## Requirements

Create `.github/workflows/update-arxiv-feed.yml` with:

### Trigger
```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # Every day at 00:00 UTC
  workflow_dispatch:     # Allow manual trigger from UI
```

### Permissions
```yaml
permissions:
  contents: write  # Can commit and push
  actions: write   # Can manage workflow runs
```

### Jobs: `update-feed`

Steps:
1. **Checkout repository** (fetch-depth: 0)
2. **Setup Node.js** v18 with npm cache
3. **Install dependencies** (`npm ci`)
4. **Fetch arXiv papers** (timeout: 2 min)
   - Run: `node scripts/fetchArxiv.js`
5. **Generate HTML feed** (timeout: 1 min)
   - Run: `node scripts/generateFeedHTML.js`
6. **Check for changes**
   - Only proceed if files changed (avoid spam commits)
7. **Configure git**
   - user.email: "action@github.com"
   - user.name: "GitHub Action"
8. **Commit and push** (if changes exist)
   - `git add data/papers.json arxiv.html`
   - `git commit -m "chore: update arXiv feed [skip ci]"`
   - `git push`
9. **Upload artifacts** for debugging (optional)
   - papers.json, arxiv.html (7-day retention)
10. **Notify on failure** (echo message if error)

### Key Features
- `[skip ci]` tag prevents recursive workflow triggers
- Only commits when files actually changed
- Proper git configuration to avoid errors
- Error handling and artifact upload for debugging
- Manual trigger capability from Actions UI

### First-time Setup
After creating the workflow:
1. Go to repo Settings > Pages
2. Set source to "main" branch
3. GitHub Pages will auto-deploy on push
4. Test with manual trigger: GitHub > Actions > Update arXiv Feed > Run workflow

## Success Criteria
✅ Workflow file is valid YAML
✅ Runs on cron schedule (00:00 UTC)
✅ Manual trigger from Actions UI works
✅ Fetches papers successfully
✅ Generates HTML successfully
✅ Only commits on actual changes
✅ GitHub Pages deploys updated HTML
✅ No infinite workflow loops
✅ Logs are clear and informative
✅ Can be debugged via artifacts

---

# Task P4: Final Documentation & README Report

**Agent Type**: code-generator
**Complexity**: Low
**Dependencies**: All tasks ✅

## Context
You are documenting the entire project and your Copilot CLI usage journey, demonstrating agentic programming best practices.

## Requirements

### Update `README.md`

Replace existing with comprehensive documentation:

1. **Project Overview**
   - Title: Coding Blog with Pac-Man Game & arXiv Feed
   - Status: Complete
   - Links to live homepage, game, and feed

2. **Components Section**
   - Homepage (link, description, tech, status)
   - Pac-Man Game (link, features, tech, status)
   - arXiv Feed (link, features, tech, status)

3. **Quick Start**
   - Local development instructions
   - GitHub Pages deployment steps
   - How to customize arXiv keywords

4. **Project Structure**
   - Directory tree with file descriptions

5. **Technology Stack**
   - Frontend: HTML5, CSS3, Vanilla JS
   - Game: Canvas API
   - Automation: Node.js, GitHub Actions
   - APIs: arXiv REST API
   - Hosting: GitHub Pages

6. **Gameplay Instructions**
   - How to play Pac-Man
   - Controls, scoring, winning

7. **Troubleshooting**
   - GitHub Pages not deploying
   - arXiv workflow not triggering
   - Game not loading

8. **Author Notes**
   - Built with Copilot CLI
   - See COPILOT_USAGE_REPORT.md for details

### Create `COPILOT_USAGE_REPORT.md`

Document your AI-assisted development journey:

1. **Methodology**
   - Phase 1: Planning (ORCHESTRATION_PLAN.json)
   - Phase 2: Scaffolding with targeted prompts
   - Phase 3: Iterative refinement

2. **Prompting Techniques**
   - What worked well (explicit deliverables, examples, granularity)
   - What needed refinement (pseudocode first, error handling)
   - Lessons learned

3. **Task Summary Table**
   - Task ID | Description | First-Try Success? | Iterations
   - Show which tasks needed iteration and why

4. **Problem-Solving Patterns**
   - Example issues encountered and how they were resolved

5. **Efficiency Metrics**
   - Total tasks: 13
   - Success rate: ~77% first-try
   - Total time: ~2 hours
   - Key efficiency gains

6. **Recommendations for Future Projects**
   - Do's: Plan first, atomic tasks, show examples, test locally
   - Don'ts: Vague prompts, skip error handling, mix languages

7. **Results Achieved**
   - Deliverables: Homepage ✅, Pac-Man Game ✅, arXiv Feed ✅
   - Code quality: No bugs, clean structure, proper error handling
   - Lessons: AI is great at scaffolding, clear specs matter, iteration is normal

8. **Metrics Summary Table**
   - Total Tasks: 13
   - First-Try Success: 77%
   - Code Generated: ~2000 lines
   - Development Time: ~2 hours

9. **Conclusion**
   - Summary of agentic programming effectiveness
   - What AI excels at vs. what needs human oversight

## Success Criteria
✅ README.md is comprehensive and accurate
✅ COPILOT_USAGE_REPORT.md documents all tasks and iterations
✅ Links are correct (update [username] and [repo] placeholders)
✅ Structure is professional and easy to follow
✅ Lessons learned section is thoughtful
✅ Metrics clearly show impact
✅ Recommendations are actionable

---

## Execution Quick Reference

### Recommended Order
1. **P1c** (5 min)
2. **P2a** (15 min)
3. **P2b** (30 min)
4. **P2c** (45 min)
5. **P2d** (20 min)
6. **P2e** (15 min)
7. **P3a** (15 min) → **P3b** (20 min) → **P3c** (20 min) → **P3d** (20 min)
8. **P4** (30 min)

**Total Time**: ~3 hours (or ~2 hours with parallelization)

### Copy-Paste Instructions
1. Open Copilot: `copilot`
2. Type: `/task`
3. Copy entire task section from this file
4. Paste into Copilot prompt
5. Wait for completion
6. Review output files
7. Repeat for next task
