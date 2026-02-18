# Task P0: Initialize GitHub Pages Repository & Structure

You are a DevOps engineer setting up a GitHub Pages static site for a coding blog assignment.

## Context
- **Project**: Multi-page coding blog with Pac-Man game and arXiv paper feed
- **Hosting**: GitHub Pages (main branch)
- **Repository**: Must be public for GitHub Pages deployment
- **Goal**: Create foundational directory structure and configuration files

## Requirements

Create the following directory structure and files:

### Directories to Create
```
.
├── .github/
│   ├── workflows/          (will store GitHub Actions workflows)
│   └── WORKFLOW_NOTES.md   (documentation placeholder)
├── styles/                 (CSS files)
├── js/                     (JavaScript files)
├── pacman/                 (Pac-Man game subdirectory)
├── data/                   (arXiv data storage)
└── scripts/                (Node.js automation scripts)
```

### Files to Create

**1. `.gitignore`** (Python/Node.js standard, no IDE files)
```
node_modules/
*.log
.DS_Store
.vscode/
.env
dist/
build/
```

**2. `README.md`** (Initial template)
```markdown
# Coding Blog with Pac-Man Game & arXiv Feed

**Status**: Under development

## Components
1. [Homepage](https://[username].github.io/[repo]) - Main blog landing page
2. [Pac-Man Game](https://[username].github.io/[repo]/pacman/) - Valentine's-themed game
3. [arXiv Feed](https://[username].github.io/[repo]/arxiv.html) - Auto-updating ML papers

## Setup
- GitHub Pages enabled on `main` branch
- Auto-deployment on push
- Nightly arXiv updates via GitHub Actions

## Files
- See ORCHESTRATION_PLAN.json for full project structure
```

**3. `index.html`** (Minimal placeholder)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Coding Blog</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
        h1 { color: #333; }
        p { color: #666; }
    </style>
</head>
<body>
    <h1>🚀 Coding Blog Under Construction</h1>
    <p>Homepage coming soon...</p>
    <p>Check back for:</p>
    <ul>
        <li>Pac-Man Game (Valentine's Edition 💘)</li>
        <li>arXiv Paper Feed 📚</li>
    </ul>
</body>
</html>
```

**4. `package.json`** (for Node.js scripts - P3 will need this)
```json
{
  "name": "coding-blog",
  "version": "1.0.0",
  "description": "GitHub Pages blog with Pac-Man game and arXiv feed",
  "scripts": {
    "fetch-arxiv": "node scripts/fetchArxiv.js",
    "generate-feed": "node scripts/generateFeedHTML.js",
    "build": "npm run fetch-arxiv && npm run generate-feed"
  },
  "keywords": ["blog", "game", "arxiv"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {}
}
```

**5. `.github/workflows/README.md`** (placeholder documentation)
```markdown
# GitHub Actions Workflows

This directory contains CI/CD automation for the coding blog.

## Workflows
- `update-arxiv-feed.yml` - Daily paper feed update (created in Task P3c)

## Testing Locally
```bash
# Install act tool: https://github.com/nektos/act
act -l  # List workflows
act     # Run all workflows
```
```

## Outputs Checklist
After completion, verify these exist:
- [ ] `.github/workflows/` directory
- [ ] `.gitignore` file
- [ ] `README.md` (v1)
- [ ] `index.html` (placeholder)
- [ ] `package.json`
- [ ] `styles/` directory
- [ ] `js/` directory
- [ ] `pacman/` directory
- [ ] `data/` directory
- [ ] `scripts/` directory

## Notes
- Do NOT commit `.env` or node_modules/
- Use semantic HTML5 structure
- All files should be formatted and ready for Git tracking
- This is foundation for Tasks P1-P3; don't skip any directory

## Success Criteria
✅ Running `git status` shows only project files (no system files)
✅ Running `git ls-files` shows all expected directories
✅ README.md has valid markdown syntax
✅ All HTML/JSON files are properly formatted
