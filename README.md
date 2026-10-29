# Daevik Jain — Portfolio

DaevikOS: a small desktop in the browser. Work is shown through console hardware (Projects launch console, Career fader, Contact comms panel), with a Résumé document, a Terminal, media players and a Sword boss rush alongside. Built with Vite, React and TypeScript.

## Local development

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # production build → dist/
npm run preview # preview the production build locally
```

## Updating content

Projects, roles, contact links and wallpapers live in [`src/os/content.ts`](src/os/content.ts). The résumé PDF is [`public/resume/swe_resume.pdf`](public/resume/swe_resume.pdf).

## Project structure

```
src/os/
├── Os.tsx              ← menubar, desktop, window manager, dock, context menu
├── Window.tsx          ← draggable, resizable window frame
├── DesktopItems.tsx    ← desktop icons, mug and sticky notes
├── desktop-state.ts    ← saved wallpaper, positions, notes and Trash
├── content.ts          ← all portfolio content
└── apps/               ← one file per app, registered in apps/index.ts
```
