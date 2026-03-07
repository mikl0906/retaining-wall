# Retaining Wall

A web app for structural calculation of retaining walls. Define geometry, soil materials, and loads — then instantly check stability against overturning and sliding.

**[Live app](https://retainingwall.fly.dev)**

## Features

- Interactive 3D model canvas built with React Three Fiber
- Define wall and foundation geometry (height, thickness, toe/heel lengths, base slab angle)
- Configure soil layers on both sides of the wall with custom material properties (unit weight, angle of internal friction)
- Apply dead and live surcharge loads with customisable partial safety factors
- Real-time stability checks for overturning and sliding
- Model state persisted in the URL (shareable links)
- Save model to a JSON file and reload it later
- Generate and print a PDF report from an Eta template

## Tech Stack

- **React 19** + **TypeScript** — UI framework
- **Vite** — build tool
- **React Three Fiber / Three.js** — 3D visualisation
- **Manifold** — 3D geometry / CSG operations
- **Zustand** — state management
- **Zod** — runtime schema validation
- **Tailwind CSS v4** + **shadcn/ui** — styling
- **Eta** — report templating

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Other scripts

| Command | Description |
|---|---|
| `npm run build` | Production build (`tsc` + Vite) |
| `npm run preview` | Locally preview the production build |
| `npm run lint` | Run ESLint |
