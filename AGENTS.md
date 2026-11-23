# Construction Vehicles & Trucks - Mobile Web Game

## Overview
Interactive, kid-friendly mobile web game inspired by "Construction Vehicles & Trucks" (com.trochoi.constructionvehicles).
Provides a multi-viewport sandbox (Phone Portrait 390x844, Phone Landscape 844x390, Tablet 768x1024, Fullscreen) with trilingual support (en, ms, zh), Web Audio synthesis sound effects, and 4-stage vehicle lifecycle gameplay:
1. **Assembly Puzzle**: Drag-and-drop snapping pieces onto the vehicle blueprint with haptic feedback and snap sounds.
2. **Fueling Station**: Drag fuel pump nozzle into the vehicle tank, hold to pump with bubbling liquid audio and meter gauge.
3. **Site Action**: Drive and operate the machinery at the building site (Excavator digging dirt/rocks into the dump truck, Dump truck unloading stone/gravel foundation).
4. **Car Wash & Polish**: Clean muddy vehicle with soap sponge, spray wash with high-pressure hose, dry with blower, and trigger star polish sparkles and fanfare.

## Architecture
- **Framework**: Vite + Vanilla Modern Web (ES Modules, HTML5 Canvas, SVG vectors, Web Audio API).
- **Zero external runtime dependencies**: Super fast loading (<1s), runs smoothly at 60 FPS on iOS Safari and Android Chrome touch screens.
- **Multi-Viewport Architecture**:
  - Device Simulator wrapper allows instant switching between:
    - iPhone / Mobile Portrait (`390px × 844px`)
    - Mobile Landscape (`844px × 390px`)
    - iPad / Tablet (`768px × 1024px`)
    - Fullscreen Fluid (`100vw × 100vh`)
  - Auto-responsive game stage canvas with aspect ratio preservation and touch/drag coordinate remapping.
- **i18n Translation**: Central dictionary `t(key, lang)` supporting English (`en`), Bahasa Melayu (`ms`), and Chinese (`zh`).

## Development & Verification
- `npm run dev`: starts local dev server
- `npm run build`: builds static assets into `dist/`
- `npm run preview`: previews production build
