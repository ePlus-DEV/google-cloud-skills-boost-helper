# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
yarn dev                 # Chrome dev server
yarn dev:firefox         # Firefox dev server

# Build
yarn build               # Production build (Chrome)
yarn build:firefox       # Production build (Firefox)
yarn zip                 # Package for distribution

# Type check
yarn compile             # TypeScript check, no emit

# Tests
yarn test                # Run once
yarn test:watch          # Watch mode
yarn test:coverage       # With coverage report
```

## Architecture

**Browser extension** for Google Cloud Skills Boost platform, built with WXT Framework + React + TypeScript.

### Entrypoints

| File                        | Role                                                           |
| --------------------------- | -------------------------------------------------------------- |
| `entrypoints/background.ts` | Service worker — lifecycle, badge updates, message routing     |
| `entrypoints/content.ts`    | Content script injected into Skills Boost pages                |
| `entrypoints/popup/`        | React popup — dashboard, arcade points, accounts, leaderboards |
| `entrypoints/options/`      | React options page — settings, data management                 |

### Service Layer (`services/`)

All business logic lives here. Key services:

- **ArcadeApiService** — fetches arcade points from external API
- **SearchService** — Fuse.js fuzzy search to match solutions to lab names
- **StorageService** — multi-account storage abstraction over WXT storage
- **AccountService** — multi-account CRUD and switching
- **FirebaseService** — Firebase Remote Config for dynamic countdown configuration
- **LabService** — processes lab pages, fetches solutions, injects UI
- **PopupService / PopupUIService** — popup initialization and UI refresh
- **BadgeService** — badge rendering
- **BrowserService** — cross-browser API abstractions

### Data Flow

**Content script (lab pages):**

1. `content.ts` → `LabService.isLabPage()` check
2. `SearchService.extractQueryText()` pulls lab name from DOM
3. `ApiClient.fetchPostsOfPublication()` hits external solutions API
4. `SearchService.findBestMatch()` finds closest solution
5. `UIComponents.createSolutionElement()` injects button into page (Shadow DOM)

**Popup:**

1. `PopupService.initialize()` loads active account from `StorageService`
2. `ArcadeApiService.fetchArcadeData()` hits arcade points API
3. `PopupUIService.updateMainUI()` renders badges, milestones, leaderboards

**Background:**

- Handles `runtime.onInstalled` / `onStartup`
- Routes messages between popup and content scripts
- Updates extension badge with arcade point count

### Multi-Account System

- Accounts stored in `local:accountsData` via WXT storage
- Active account tracked via `activeAccountId`
- Backward-compatible with legacy single-account storage shape
- Each account carries its own `arcadeData` snapshot

### Firebase Remote Config

- Countdown deadlines configurable remotely (no extension update needed)
- Gracefully falls back to `.env` values if Firebase unreachable
- `WXT_FORCE_REMOTE_CONFIG=true` forces remote fetch (dev/testing)

### Profile URL Canonicalization

Three accepted hosts all canonicalize to `www.skills.google`:

- `www.skills.google`
- `www.cloudskillsboost.google`
- `www.qwiklabs.com`

See `utils/profileUrl.ts` for extraction/canonicalization logic.

## Environment Variables

Copy `.env.example` → `.env.local`. Key vars:

```env
WXT_API_URL=                         # GraphQL solutions API endpoint
WXT_API_KEY=                         # Publication ID for solutions API
WXT_ARCADE_POINT_URL=                # Arcade points API endpoint

# Firebase Remote Config (optional)
WXT_FIREBASE_API_KEY=
WXT_FIREBASE_PROJECT_ID=
# ... other firebase vars

# Countdown config (overridden by Firebase Remote Config at runtime)
WXT_COUNTDOWN_DEADLINE_ARCADE=2026-06-30T23:59:59+05:30
WXT_COUNTDOWN_ENABLED_ARCADE=true
```

## Testing

- Framework: **Vitest** with jsdom environment
- Tests live in `tests/services/` and `tests/utils/`
- Setup file `tests/setup.ts` resets fake browser state before each test
- Coverage minimum: **60%** on lines/functions/branches/statements
- DOM-heavy services (`badgeService`, `labService`, `firebaseService`, etc.) are excluded from coverage targets

## Localization

13 languages in `public/_locales/*/messages.json`. Use `browser.i18n.getMessage()` — never hardcode user-visible strings.
