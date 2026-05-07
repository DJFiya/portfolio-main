# Daevik Jain — Portfolio

A book-on-a-messy-desk portfolio built with Vite, React, TypeScript, and Tailwind CSS. The book opens page by page through experiences, projects, clubs, and links — all driven from a single JSON file.

## Stack

| Tool | Purpose |
|---|---|
| [Vite](https://vite.dev/) + React + TypeScript | App framework |
| [Tailwind CSS v3](https://tailwindcss.com/) | Styling (black / white / blue palette) |
| [Framer Motion](https://www.framer.com/motion/) | 3D book flip, idle sway, page transitions |
| [React Router v6](https://reactrouter.com/) | Per-spread routing (`/experience`, `/projects`, etc.) |
| Inline SVG | All desk props and icons — zero raster images |

## Local development

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:5173`.

```bash
npm run build   # production build → dist/
npm run preview # preview the production build locally
```

## Routes

| URL | Content |
|---|---|
| `/` | Cover (closed book) |
| `/experience` | Work experience + skills |
| `/projects` | Hackathon projects + awards |
| `/clubs` | Extracurricular clubs |
| `/links` | Social links (GitHub, LinkedIn, Devpost) |

You can navigate directly to any route and the book opens straight to that spread.

## Updating content

**All content lives in one file: [`src/data/portfolio.json`](src/data/portfolio.json)**. No React code needs to change for content updates.

### Experiences

```jsonc
"experiences": [
  {
    "title": "QA / SWE",
    "company": "Relay",
    "skills": ["AWS", "DynamoDB", "Vue", "React", "TypeScript", "Playwright"]
  }
]
```

### Projects

```jsonc
"projects": [
  {
    "name": "Avesia",
    "tagline": "Autonomous Smart Cameras",
    "awardLabel": "Winner — Overshoot Sponsor Track · NexHacks · $1k",
    "awardTier": "gold",       // "gold" | "silver" | "bronze"
    "devpostUrl": "https://devpost.com/software/avesia"
  }
]
```

`awardTier` controls the medallion size and blue intensity:
- `gold` — large filled medallion
- `silver` — medium lighter medallion
- `bronze` — small outline medallion

### Clubs

```jsonc
"clubs": [
  {
    "role": "ML Researcher",
    "org": "Watolink",
    "blurb": "Optional one-liner shown under the role."
  }
]
```

### Links

```jsonc
"links": [
  {
    "label": "GitHub",
    "handle": "DJFiya",
    "url": "https://github.com/DJFiya",
    "icon": "github"
  }
]
```

### Desk props

```jsonc
"desk": [
  {
    "id": "terminal",
    "type": "terminal",       // maps to a specific SVG sub-component
    "label": "terminal",
    "x": 72,                  // % from left
    "y": 15,                  // % from top
    "rotate": -6,             // degrees
    "zIndex": 5
  }
]
```

Available `type` values: `terminal`, `blueprint`, `stickers`, `cables`, `vinyl`, `cassette`, `controller`, `book`, `poem`, `mug`, `poster`, `dice-d20`, `dice-d12`, `dice-d6`.

## Project structure

```
src/
├── data/
│   └── portfolio.json       ← all content lives here
├── types/
│   └── portfolio.ts         ← TypeScript types mirroring the JSON
├── components/
│   ├── BookPortfolio.tsx    ← book shell, cover, nav state
│   ├── HangTag.tsx          ← single skill hang-tag SVG
│   ├── Medallion.tsx        ← award rosette SVG
│   ├── DeskScene.tsx        ← table surface + clutter layer
│   ├── spreads/
│   │   ├── ExperiencesSpread.tsx
│   │   ├── ProjectsSpread.tsx
│   │   ├── ClubsSpread.tsx
│   │   └── LinksSpread.tsx
│   └── desk/                ← one file per desk prop type
│       ├── TerminalWindow.tsx
│       ├── BlueprintScroll.tsx
│       ├── StickerSheet.tsx
│       ├── CableDoodle.tsx
│       ├── VinylRecord.tsx
│       ├── Cassette.tsx
│       ├── GameController.tsx
│       ├── PaperBook.tsx
│       ├── PoemPaper.tsx
│       ├── CoffeeMug.tsx
│       ├── MoviePoster.tsx
│       └── Dice.tsx
├── App.tsx
├── main.tsx
└── index.css
```
