# Task P1a: Design Homepage Layout & Information Architecture

**Agent Type**: architect
**Complexity**: Low
**Dependencies**: P0 (completed ✅)

## Context
You are designing a coding blog homepage for a Harvard CS course (BST236). The design must support:
- Main blog landing page
- Navigation links to: Pac-Man Game, arXiv Feed
- Expandable for 5+ future assignment pages
- Mobile-responsive
- Clean, academic aesthetic with Valentine's theme touches

## Requirements

### 1. Create `homepage-wireframe.md`
Provide ASCII wireframe showing:
- Header/Navigation bar layout
- Hero section (title, tagline, call-to-action)
- Featured projects grid (3-column on desktop, 1 on mobile)
- Footer with links
- Label each section with coordinates/sizes

Example:
```
┌─────────────────────────────────┐
│ HEADER: Logo | Nav Links        │
├─────────────────────────────────┤
│ HERO: Title + Subtitle          │
├─────────────────────────────────┤
│ [Project 1] [Project 2] [Proj 3]│
├─────────────────────────────────┤
│ FOOTER: Links | Contact         │
└─────────────────────────────────┘
```

### 2. Create `design-spec.json`
Provide structured design specification:

```json
{
  "project": "Coding Blog Homepage",
  "version": "1.0",
  "colors": {
    "primary": "#HEX",
    "secondary": "#HEX",
    "accent": "#HEX (Valentine's: pink/red)",
    "background": "#HEX",
    "text": "#HEX"
  },
  "typography": {
    "font_family_heading": "font-stack (e.g., 'Georgia, serif')",
    "font_family_body": "font-stack (e.g., 'Segoe UI, sans-serif')",
    "sizes": {
      "h1": "48px",
      "h2": "32px",
      "body": "16px",
      "small": "14px"
    }
  },
  "spacing": {
    "unit": "8px",
    "container_max_width": "1200px",
    "margin_vertical": "24px",
    "padding_container": "16px"
  },
  "responsive_breakpoints": {
    "mobile": "max-width: 480px",
    "tablet": "481px to 768px",
    "desktop": "769px+"
  },
  "components": {
    "nav_bar": {
      "height": "60px",
      "position": "sticky",
      "items": ["Home", "Pac-Man Game", "arXiv Feed", "About"]
    },
    "hero_section": {
      "height": "400px (desktop), 300px (mobile)",
      "background": "gradient or image",
      "call_to_action": "Primary button style"
    },
    "project_card": {
      "width": "auto (grid 3-col desktop, 1-col mobile)",
      "components": ["image/icon", "title", "description", "link button"]
    }
  }
}
```

### 3. Design Considerations
- Ensure links are placeholders (will be filled in P1b): `/pacman/index.html`, `/arxiv.html`
- Include accessibility: ARIA labels, color contrast ratios (WCAG AA)
- Design for dark mode friendly (optional advanced feature)
- Valentine's theme: Consider subtle heart icons, pink/red accents in accent color

## Success Criteria
✅ Wireframe is clear and ASCII-readable
✅ JSON spec is valid and complete
✅ All responsive breakpoints covered
✅ Color palette has 5+ colors defined
✅ Typography uses web-safe font stacks
✅ Ready for P1b implementation (HTML/CSS coder will use this spec)

## Notes
- This is DESIGN only, no code generation yet
- Output should be human-readable and detailed
- Ready to hand off to P1b (code generator) with no ambiguity