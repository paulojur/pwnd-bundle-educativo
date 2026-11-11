# PWNED Simulator: Cybersecurity Board Game Engine

PWNED Simulator is a web-based board game engine built to simulate, playtest, and balance a tactical cybersecurity card and board game. The project replicates tabletop mechanics in a responsive digital interface, allowing players to explore bug bounty hunting, program targets, vulnerability discovery, patch mechanics, and threat events.

The application serves both as a digital sandbox for rules validation and as the foundation for an online multiplayer edition.

## Architecture and Core Systems

* Runtime State: Centralized turn, action point (AP), alert tracker, and card lifecycle management in `src/context/BoardGameContext.tsx`.
* Canonical V14 Data: Fully synchronized data layer in `src/data/canonicalV14Data.ts` matching the physical card balance (80 vulnerabilities, 48 tools across 12 distinct cards, 36 programs, 24 chaos events, 12 safeguards, and 6 archetypes).
* Board and Mat Simulation: Interactive representations of the central market, player mats, dice roller, exploit zones, and server maps.
* Playtest Telemetry: Live observer metrics modal (`ObserverMetricsModal.tsx`) tracking action frequency, player progression, archetypes, and balance curves.
* Dual Language Support: Native Portuguese and English localization layer through `LanguageContext.tsx`.
* Game Modes: Hot-seat local multiplayer, solo sandbox playtesting, and peer/room networking scaffolds.

## Tech Stack

* Engine and UI: React 18, TypeScript, Tailwind-ready component styling
* Icons: Lucide React
* Build Tooling: Vite
* State and Persistence Scaffolding: Supabase client, local storage state persistence

## Running Locally

Prerequisites: Node.js (version 18 or above).

1. Clone the repository:
```bash
git clone https://github.com/paulojur/pwnd-bundle-educativo.git
cd pwnd-bundle-educativo
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Upcoming Milestones

Detailed development plans, engine decoupling tasks, and networking roadmap are documented in [ROADMAP.md](ROADMAP.md).

## License

This software is released under the MIT License. See the [LICENSE](LICENSE) file for terms.
