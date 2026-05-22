# Thong Lor: Cafe Run

Browser-playable 3D driving prototype built with Vite, React, TypeScript, React Three Fiber, Drei, Zustand, and Tailwind.

## Goal

Drive a glacier-blue electric SUV through fictional sunny Thong Lor / Sukhumvit cafe traffic and find a scenic cafe with genuinely good coffee before the best table is gone.

## Controls

- `WASD` or arrow keys: drive and steer
- `Space`: brake
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

## Deploy To Vercel

```bash
npm install -g vercel
vercel
vercel --prod
```

Or push this folder to GitHub and import the repository in Vercel. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
