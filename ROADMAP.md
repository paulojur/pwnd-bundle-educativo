# Development Roadmap

This roadmap outlines targeted engineering milestones for transitioning the PWNED simulation environment into a modular, production-ready web game engine.

## Phase 1: Engine Core Decoupling and State Machine (Estimated: 12 to 16 hours)

* Extract turn state and game loop logic out of React contexts into a framework-agnostic finite state machine.
* Standardize action dispatching for core player turns: Recon, Scan, Infiltrate, Exploit, and Report.
* Implement deterministic dice resolution (Noisy 2D6 vs Stealth 3D6 drop highest) with replayable seeds.
* Add automated test coverage for round termination, victory thresholds ($40,000 bounty mark), and 8th round score tie-breakers.

## Phase 2: Live Room Synchronization and Persistence (Estimated: 14 to 18 hours)

* Complete the Supabase real-time channel layer (`src/utils/supabaseSync.ts`) to enable seamless remote peer rooms.
* Introduce server-side or host-authoritative state validation to guard against illegal card plays and action point desyncs.
* Implement reconnect persistence so players can reload their browser tab without dropping active match state.
* Expand the Observer telemetry module (`ObserverMetricsModal.tsx`) to stream match metrics and game balance logs to storage.

## Phase 3: Interface Polishing and Responsive Viewports (Estimated: 10 to 14 hours)

* Modernize the board layout for mobile and tablet touch viewports (responsive player mats and card inspection trays).
* Implement hotkeys for frequent tabletop actions (draw card, inspect active program, end turn).
* Clean up legacy Print-and-Play components, repointing all asset rendering to the canonical V14 data pipeline.
* Complete English localization strings across all event cards, tool descriptions, and error prompts.
