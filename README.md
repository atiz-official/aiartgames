# Thong Lor: Cafe Run

Browser-playable 3D driving prototype built with Vite, React, TypeScript, React Three Fiber, Drei, Zustand, and Tailwind.

## Goal

Drive a glacier-blue electric SUV through a fictional sunny Thong Lor / Sukhumvit cafe street and choose a scenic cafe with genuinely good coffee. The current loop is a relaxed cruise, not an obstruction-dodging race.

## Controls

- `WASD` or arrow keys: drive and steer
- `Space`: brake
- Slow down near the scenic cafe zone to park and finish the cruise
- `R`: restart
- `Share shot`: export/share a screenshot
- `Record clip`: record an 8 second `.webm` canvas clip

## Recording Helpers

- Add `?autostart=1` to skip the briefing screen.
- Add `?autostart=1&demo=1` for an auto-driving capture pass.

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Current Asset Pass

- The playable car now uses a real GLB vehicle asset adapted from the three.js example `ferrari.glb`, recolored glacier blue and converted to an uncompressed local `real-car.glb` for reliable browser loading.
- The driver/passenger cabin uses real humanoid GLB assets from the three.js example set (`Xbot.glb`, `Michelle.glb`) instead of only procedural capsule figures.
- These are still proxy assets, not a licensed Tesla Model Y or final Thai character scans.

## Deploy To Vercel

```bash
npm install -g vercel
vercel
vercel --prod
```

Or push this folder to GitHub and import the repository in Vercel. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
