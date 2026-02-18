# Coding Blog with Pac-Man Game & arXiv Feed

Harvard BST236 Computing - Homework 1

**Live Demo**: [https://hsph-bst236-2026.github.io/homework-1-zsyfirst/](https://hsph-bst236-2026.github.io/homework-1-zsyfirst/)

---

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Report](#report)
5. [Contributions](#contributions)

---

## Introduction

This repository contains the solution for Harvard BST236 Computing Homework 1, which consists of three problems:

1. **Problem 1 - Coding Blog Homepage**: A responsive homepage for a coding blog hosted on GitHub Pages, designed to be expandable for future assignments.

2. **Problem 2 - Valentine's Pac-Man Game**: A browser-based Valentine's-themed Pac-Man game featuring:
   - Classic maze gameplay with pellet collection
   - 4 AI-controlled ghosts with unique behaviors
   - Rose power-ups that enable heart projectile shooting
   - Heart projectiles that can eliminate ghosts

3. **Problem 3 - arXiv Paper Feed**: An auto-updating arXiv paper feed featuring:
   - Daily automated fetching of Biomedical & Health AI papers
   - Interactive keyword search functionality
   - GitHub Actions workflow for midnight UTC updates

| Component | URL |
|-----------|-----|
| Homepage | [https://hsph-bst236-2026.github.io/homework-1-zsyfirst/](https://hsph-bst236-2026.github.io/homework-1-zsyfirst/) |
| Pac-Man Game | [https://hsph-bst236-2026.github.io/homework-1-zsyfirst/pacman/](https://hsph-bst236-2026.github.io/homework-1-zsyfirst/pacman/) |
| arXiv Feed | [https://hsph-bst236-2026.github.io/homework-1-zsyfirst/papers/](https://hsph-bst236-2026.github.io/homework-1-zsyfirst/papers/) |

---

## Installation

### Prerequisites

- **Git**: For cloning the repository
- **Node.js**: Version 14.0.0 or higher (for running arXiv scripts)
- **Python 3**: For running the local development server (optional)
- **Web Browser**: Chrome, Firefox, Safari, or Edge

### Step 1: Clone the Repository

```bash
git clone https://github.com/zsyfirst/homework-1-zsyfirst.git
cd homework-1-zsyfirst
```

### Step 2: Install Dependencies (Optional)

The project uses only Node.js built-in modules, so no npm install is required. However, if you want to use npm scripts:

```bash
npm install
```

### Step 3: Verify Installation

Check that all required files exist:

```bash
ls -la index.html pacman/index.html papers/index.html
ls -la js/entities.js js/maze.js js/game.js js/effects.js
ls -la scripts/fetchArxiv.js scripts/generateFeedHTML.js
ls -la .github/workflows/update-arxiv-feed.yml
```

Expected output: All files should be listed without errors.

---

## Usage

### Running Locally

Start a local development server:

```bash
# Using Python 3
python3 -m http.server 8000

# Then visit in your browser:
# http://localhost:8000
```

### Playing the Pac-Man Game

1. Navigate to [http://localhost:8000/pacman/](http://localhost:8000/pacman/) (local) or the live demo
2. **Controls**:
   - **Arrow Keys**: Move Pac-Man (Up, Down, Left, Right)
   - **SPACE**: Pause/Resume game
   - **R**: Restart game

**Expected Gameplay**:
- Collect all pellets (white dots) to complete the level
- Avoid ghosts - contact loses a life
- Collect roses (🌹) for power-up mode
- In power-up mode, Pac-Man shoots hearts (❤️) that eliminate ghosts

**Scoring**:
| Action | Points |
|--------|--------|
| Pellet | +10 |
| Rose | +50 |
| Ghost (while powered) | +200 |

### Updating the arXiv Feed

To manually fetch new papers and regenerate the feed:

```bash
# Fetch latest papers from arXiv API
node scripts/fetchArxiv.js

# Expected output:
# 🔬 Fetching Biomedical & Health AI papers from arXiv...
# ✅ Successfully fetched X papers
# 📝 Saved to data/papers.json
```

```bash
# Generate the HTML feed page
node scripts/generateFeedHTML.js

# Expected output:
# 📄 Generating papers/index.html...
# ✓ Generated HTML (XXXXX bytes)
# ✅ Complete! Papers displayed: XX
```

Or run both with npm:

```bash
npm run update-feed
```

### Using the Paper Search Feature

1. Visit the papers page ([/papers/](https://hsph-bst236-2026.github.io/homework-1-zsyfirst/papers/))
2. Enter keywords in the search box (e.g., "deep learning", "clinical", "diagnosis")
3. Papers matching your keywords are highlighted
4. Click "Clear" to reset the search

---

## Report

I firstly use the "Ask" of Claude Haiku 4.5 to design effective prompts and workflow to solve three problems.
```
Read the #fileREADME.md and give me a prompt to solve the three question, includes 6 components ranked by importance:
-[task] Clearly define your end goal
-[context] Tailor your responses
-[examples] Mimic style, structure, tone
-[persona] Embody a specific expertise
-[format] Bullet points, markdown, table
-[tone] Add layer of emotional context'
```

It gives me Prompt Strategy for BST236 Homework 1 and break this into 5-7 discrete agent tasks ranked by dependency. For each task, specify:
- Clear input/output
- Required libraries/APIs
- Estimated complexity
- Which tasks can run in parallel

I saved the prompt into different file and submit these tasks to Copilot in sequence, including TASK_P0_PROMPT.md, TASK_P1a_PROMPT.md, and TASK_EXECUTION_MENU.md.

### Problem 1: Homepage Design

**Approach**: Created a responsive single-page homepage with:
- Hero section with project introduction
- Project cards linking to Pac-Man and arXiv pages
- Mobile-first responsive design using CSS media queries
- Semantic HTML5 structure for accessibility

**Files**: `index.html`, `styles/main.css`, `styles/responsive.css`

### Problem 2: Pac-Man Game Implementation

**Approach**: Built a complete game engine using vanilla JavaScript and HTML5 Canvas:

1. **Architecture**: Modular design with separate files for entities, maze, game loop, and effects
2. **Entity System** (`js/entities.js`):
   - `PacMan` class: Player-controlled character with grid-based movement
   - `Ghost` class: AI enemies with unique chase/scatter behaviors
   - `Rose` class: Power-up spawns that enable heart shooting
   - `Heart` class: Projectiles fired during power-up mode

3. **Maze System** (`js/maze.js`):
   - 2D array-based maze layout
   - Collision detection with walls
   - Pellet placement and tracking

4. **Game Loop** (`js/game.js`):
   - 60 FPS rendering using requestAnimationFrame
   - AABB collision detection
   - Game state management (playing, paused, game over)
   - Lives and scoring system

5. **Effects** (`js/effects.js`):
   - Particle system for visual feedback
   - Valentine's theme styling

**Valentine's Features**:
- Rose power-ups appear randomly on the maze
- Eating a rose grants 8 seconds of powered-up state
- During power-up, hearts fire continuously in Pac-Man's direction
- Hearts eliminate any ghost they hit

### Problem 3: arXiv Feed Automation

**Approach**: Used GitHub Copilot to build an automated paper fetching system:

1. **Fetch Script** (`scripts/fetchArxiv.js`):
   - Queries arXiv API with biomedical keywords:
     - `medical`, `healthcare`, `clinical`, `biomedical`
     - `diagnosis`, `patient`, `disease`, `health`
   - Categories: `cs.AI`, `cs.LG`, `q-bio.QM`
   - Parses XML response into JSON
   - Includes fallback demo data for offline testing

2. **HTML Generator** (`scripts/generateFeedHTML.js`):
   - Generates responsive paper cards with title, authors, abstract
   - Links to arXiv page and PDF
   - Interactive search functionality with keyword highlighting

3. **GitHub Actions** (`.github/workflows/update-arxiv-feed.yml`):
   - Scheduled to run at midnight UTC daily
   - Fetches papers, generates HTML, commits changes
   - Manual trigger available via workflow_dispatch

**Copilot Usage**:

I used GitHub Copilot throughout the development process. Key prompts and outcomes:

| Task | Prompt Summary | Outcome |
|------|----------------|---------|
| Fetch Script | "Create a Node.js script to fetch papers from arXiv API with biomedical keywords, parse XML, save as JSON" | Generated complete 466-line script with retry logic and fallback data |
| HTML Generator | "Generate HTML page from papers.json with responsive card layout and search functionality" | Created template system with embedded JavaScript search |
| GitHub Actions | "Create workflow to run at midnight, fetch papers, commit changes" | 141-line workflow with proper permissions and error handling |
| Search Feature | "Add client-side search that filters papers by keywords with highlighting" | Implemented search box with real-time filtering |

**What Worked Well**:
- Breaking tasks into atomic, specific prompts
- Providing expected input/output formats
- Specifying file paths and function signatures upfront

**What Required Iteration**:
- API error handling (added retry logic and fallback data)
- JavaScript escaping in template literals (fixed regex issues)

See `COPILOT_USAGE_REPORT.md` for detailed prompts and methodology.

---

## Project Structure

```
homework-1-zsyfirst/
├── index.html                      # Homepage (Problem 1)
├── pacman/
│   └── index.html                  # Pac-Man game page (Problem 2)
├── papers/
│   └── index.html                  # arXiv feed page (Problem 3)
├── js/                             # Game engine
│   ├── entities.js                 # PacMan, Ghost, Rose, Heart classes
│   ├── maze.js                     # Maze generation and collision
│   ├── game.js                     # Game loop and state management
│   └── effects.js                  # Particle effects
├── styles/
│   ├── main.css                    # Main styles
│   └── responsive.css              # Media queries
├── scripts/
│   ├── fetchArxiv.js               # arXiv API fetcher
│   └── generateFeedHTML.js         # HTML generator
├── data/
│   └── papers.json                 # Cached paper data
├── .github/
│   └── workflows/
│       └── update-arxiv-feed.yml   # GitHub Actions workflow
├── package.json                    # npm scripts
└── README.md                       # This file
```

---

## Contributions

| Member | Contributions |
|--------|--------------|
| Siyu Zou | All problems (solo project): Homepage design, Pac-Man game implementation, arXiv feed automation, documentation |

---

## Troubleshooting

**Game not loading?**
- Check browser console (F12) for JavaScript errors
- Ensure all js/ files exist

**Papers feed empty?**
- Run `node scripts/fetchArxiv.js` to fetch papers
- Check `data/papers.json` exists and has content

**GitHub Pages not updating?**
- Go to Settings > Pages > Verify source is "main" branch
- Wait 1-2 minutes for deployment

---

## License

MIT License - Free to use and modify.

