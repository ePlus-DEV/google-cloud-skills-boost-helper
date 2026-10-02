# Architecture & Current Capabilities

This document is the canonical overview of the **current implemented state** of Google Cloud Skills Boost Helper.

Use it to answer:

- What does the extension do today?
- Which part of the code owns each feature?
- How does data move between Skills Boost pages, the popup, storage, and external services?
- Which rules are authoritative and which are compatibility fallbacks?
- Where should a new feature be implemented?

For planned work, see [ROADMAP.md](ROADMAP.md). A roadmap item is **not** a current feature unless it is also documented here and implemented in source.

---

## 1. Project overview

Google Cloud Skills Boost Helper is a browser extension built with:

- **WXT Framework**
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **WXT Storage**
- **Vitest + jsdom**
- **Firebase Remote Config**
- **Fuse.js** for solution matching
- **Axios** for HTTP requests

Supported browser targets include Chrome and Firefox, with Chromium builds also used for manual Edge/Opera installation.

The extension has four main runtime surfaces:

1. **Content script** on supported Skills Boost pages.
2. **Popup** for Arcade data, profiles, milestones, settings, and related UI.
3. **Options page** for account/settings/data management.
4. **Background service worker** for lifecycle events, badge updates, and cross-tab messages.

---

## 2. Current feature inventory

### 2.1 Arcade Points Calculator

**Primary owners**

- `services/arcadeApiService.ts`
- `services/popupService.ts`
- `services/popupUIService.ts`
- `services/storageService.ts`
- `types/popup.ts`
- `utils/arcadeRequestSignature.ts`

The Arcade Calculator is the central scoring feature.

Current behavior:

- Reads the active Skills Boost public profile URL.
- Canonicalizes supported legacy/current profile hosts.
- Extracts the public profile ID.
- Calls the configured **Arcade API v3** endpoint.
- Builds the v3 request payload before signing.
- Adds request-signature headers when the signing configuration is available.
- Preserves successful API data even if non-critical post-processing fails.
- Stores a `lastUpdated` timestamp with the snapshot.
- Renders total Arcade points in the popup.
- Stores Arcade data per active account.
- Updates the extension action badge with the active account total.
- Falls back to legacy single-account storage where required for backward compatibility.

The normalized Arcade response can contain:

- total Arcade points
- Game points
- Trivia points
- Skill points
- Special points
- Completion points
- badge history
- user/profile details
- Facilitator metadata
- freshness metadata

### Source-of-truth rule

The extension does **not** use an AI model to calculate Arcade points.

Authoritative score data comes from the Arcade API response plus deterministic extension logic required to combine supported local/account state. Future AI/Agent features described in the roadmap must consume Calculator results instead of implementing a second scoring engine.

---

### 2.2 Facilitator Program support

**Primary owners**

- `services/facilitatorService.ts`
- `services/arcadeApiService.ts`
- `services/popupUIService.ts`

Current behavior:

- Supports Facilitator badge counts and milestone progress.
- Reads milestone definitions returned by the API.
- Uses API-provided milestone metadata as the preferred source of truth.
- Keeps local milestone values only as a compatibility fallback for old/incomplete responses.
- Shows active requirement counts such as Games and Skill Badges.
- Hides requirements whose active rule is zero.
- Shows milestone progress as percentage plus completed/required counts.
- Shows Regular Arcade/base points for a milestone.
- Shows the Facilitator bonus separately.
- Calculates/normalizes standard Facilitator bonus values through deterministic helpers.

Important invariant:

> A new API ruleset must not be duplicated as a second hardcoded UI ruleset when the API already supplies the rule data.

---

### 2.3 Bonus Milestone

**Primary owners**

- `components/BonusMilestoneControl.tsx`
- `services/bonusMilestoneService.ts`
- `entrypoints/popup/bonusMilestoneControl.tsx`

Current behavior:

- Shows the Bonus Milestone control when the active season/API state allows it.
- Uses a fixed self-reported **+10** claim flow in the current implementation.
- Opens a confirmation dialog before applying local self-reported completion.
- Links users to the official Bonus Milestone page.
- Requires explicit user confirmation.
- Keeps Bonus Milestone separate from the normal Facilitator milestone bonus.
- Avoids double counting when the API says the bonus is already included.
- Persists confirmation using a profile/period-scoped storage key.
- Supports undo.
- Ignores stale confirmation for periods where the bonus is unavailable.

Important invariant:

> Bonus Milestone completion is self-reported extension state unless explicitly verified by an authoritative upstream source. The extension must not describe local confirmation as Google verification.

---

### 2.4 Multi-account management

**Primary owners**

- `services/accountService.ts`
- `services/storageService.ts`
- `services/popupService.ts`
- `entrypoints/options/`
- `types/popup.ts`

Current behavior:

- Stores multiple Skills Boost public profiles.
- Tracks one `activeAccountId`.
- Supports account names and optional nicknames.
- Keeps an Arcade snapshot on each account.
- Supports account switching from the popup.
- Supports account management from the options page.
- Stores whether an account participates in the Facilitator Program.
- Migrates legacy single-account data into the multi-account structure.
- Keeps compatibility reads for legacy storage when necessary.

Primary storage namespace:

```text
local:accountsData
```

Conceptual shape:

```text
accountsData
├── activeAccountId
├── accounts
│   └── <accountId>
│       ├── id
│       ├── name
│       ├── nickname
│       ├── profileUrl
│       ├── facilitatorProgram
│       ├── arcadeData
│       ├── createdAt
│       └── lastUsed
└── settings
```

---

### 2.5 Extension badge

**Primary owners**

- `services/storageService.ts`
- `entrypoints/background.ts`

Current behavior:

- Displays the active account's current calculated total on the extension action badge.
- Supports disabling badge display.
- Uses compact text for large values.
- Refreshes after account/data changes and browser startup.
- Uses background messaging first, with direct browser action APIs as fallback.

---

### 2.6 Arcade / Facilitator countdown and dynamic config

**Primary owner**

- `services/firebaseService.ts`

Firebase Remote Config currently supports runtime-configurable values such as:

- Arcade countdown deadline
- Facilitator countdown deadline
- countdown enabled/disabled state
- Arcade milestone configuration

Behavior:

- Remote values can update without publishing a new extension version.
- Development can use local/default values.
- Production gracefully falls back to configured defaults if Firebase is unavailable.
- Fetches are memoized/throttled to avoid unnecessary Remote Config traffic.

---

### 2.7 Leaderboard / scoreboard UI

**Primary owners**

- Popup HTML/UI services
- related popup rendering code

Current behavior includes leaderboard/scoreboard surfaces in the popup and visibility controls used by the extension UI.

This feature is presentation-oriented; Arcade point correctness remains owned by Calculator/services rather than leaderboard rendering.

---

### 2.8 Lab Solution Search

**Primary owners**

- `entrypoints/content.ts`
- `services/labService.ts`
- `services/searchService.ts`
- `services/apiClient.ts`
- `components/uiComponents.ts`

Supported content-script routes include:

```text
/games/*/labs/*
/course_templates/*/labs/*
/focuses/*
/paths/*/course_templates/*/labs/*
/my_account/profile*
```

Main flow:

```text
Skills Boost lab page
    ↓
content.ts
    ↓
LabService.isLabPage()
    ↓
SearchService extracts/normalizes current lab text
    ↓
ApiClient requests solution content
    ↓
SearchService ranks matches
    ↓
UIComponents renders the Solution action
```

Current behavior:

- Detects supported lab pages.
- Extracts the lab title/query from the page.
- Queries the configured solutions API.
- Uses exact/normalized/fuzzy matching logic.
- Uses Fuse.js where fuzzy matching is appropriate.
- Renders an in-page Solution action.
- Provides Google/YouTube fallback search when needed.
- Supports configurable preferred search engine behavior.

Known matching/layout edge cases are tracked in the roadmap/issues and should not be confused with fully solved behavior.

---

### 2.9 Skills Boost profile helper

**Primary owners**

- `services/profileService.ts`
- `entrypoints/content.ts`

On the Skills Boost profile page the extension initializes profile-related helper behavior, including public-profile setup assistance used by the rest of the extension.

Supported profile hosts are canonicalized through `utils/profileUrl.ts`.

Current canonical target:

```text
www.skills.google
```

Legacy/current accepted hosts include:

- `www.skills.google`
- `www.cloudskillsboost.google`
- `www.qwiklabs.com`

---

### 2.10 Back to Top

**Primary owner**

- `services/backToTopService.ts`

The content script initializes a Back to Top helper on supported pages. It is designed to work with Skills Boost pages that use dynamic/internal scroll containers rather than assuming only `window` scroll.

---

### 2.11 Themes, custom Theme Studio, and compact popup

**Primary owners**

- `entrypoints/popup/main.tsx`
- `entrypoints/popup/index.html`
- `entrypoints/theme-studio/`
- `wxt.config.ts`

Current UI capabilities include:

- built-in popup themes
- custom theme palette
- Theme Studio
- live popup preview
- custom color controls
- compact popup mode
- early compact-mode bootstrap to reduce layout flash

Popup compact mode hides selected non-essential sections before normal app startup when compact mode is active.

---

### 2.12 Data export

**Primary owners**

- `services/exportService.ts`
- `services/optionsService.ts`
- `entrypoints/options/`

Current export capabilities include:

- Arcade data as **JSON**
- badge data as **CSV**

Exports operate on the active account's stored/current data.

---

### 2.13 Settings

Account/global settings currently include or support concepts such as:

- enable/disable Solution search
- enable/disable ePlus search action
- preferred search engine
- extension action badge visibility
- notification preference/state

Settings are stored through the account/storage service layer rather than directly coupling every UI control to raw browser storage.

---

### 2.14 Update / changelog flow

**Primary owners**

- `entrypoints/background.ts`
- `services/updateNotificationService.ts`
- changelog entrypoint/page

Current behavior:

- Opens the options page after first install.
- Can open the extension changelog after an update.
- Respects the update-notification preference.
- Refreshes the extension action badge on install/update/startup.
- Configures an uninstall feedback URL.

---

### 2.15 Internationalization

Locales live under:

```text
public/_locales/<locale>/messages.json
```

The extension currently ships 13 locales:

- English
- Vietnamese
- Japanese
- Korean
- Simplified Chinese
- French
- German
- Spanish
- Portuguese (Brazil)
- Italian
- Russian
- Arabic
- Hindi

Rule:

> New user-facing extension text should use `browser.i18n.getMessage()` / existing localization helpers rather than introducing hardcoded English UI.

---

## 3. Runtime architecture

### 3.1 High-level view

```text
┌───────────────────────────────────────────────────────────────┐
│                  Google Cloud Skills Boost                   │
└─────────────────────────────┬─────────────────────────────────┘
                              │
                    content script injection
                              │
                 ┌────────────▼────────────┐
                 │ entrypoints/content.ts │
                 └───────┬─────────┬──────┘
                         │         │
                  LabService   ProfileService
                         │
              Search/API/UI components

┌───────────────────────────────────────────────────────────────┐
│                        Extension Popup                        │
│                                                             │
│ PopupService → Account/Storage → ArcadeApiService            │
│       │                            │                          │
│       └────────────→ PopupUIService│                          │
│                                    ▼                          │
│                             Arcade API v3                     │
└───────────────────────────────────────────────────────────────┘

                 Shared local extension storage
                              │
                 ┌────────────▼────────────┐
                 │ WXT/browser.storage    │
                 └────────────┬────────────┘
                              │
                    background service worker
                              │
            badge / lifecycle / cross-tab messages

                 Firebase Remote Config
                              │
                countdown / dynamic config
```

---

## 4. Project structure

### Core directories

| Path           | Responsibility                                  |
| -------------- | ----------------------------------------------- |
| `entrypoints/` | WXT runtime entrypoints and extension pages     |
| `services/`    | Business/domain logic                           |
| `components/`  | UI components and injected UI helpers           |
| `utils/`       | Pure/shared utilities                           |
| `types/`       | Shared TypeScript contracts                     |
| `assets/`      | CSS and static styling assets                   |
| `public/`      | Public files and browser locale catalogs        |
| `tests/`       | Vitest regression/unit tests                    |
| `.github/`     | CI/release/dependency automation                |
| `.claude/`     | Claude-specific development skills/instructions |

### Important entrypoints

| Path                        | Role                                              |
| --------------------------- | ------------------------------------------------- |
| `entrypoints/background.ts` | service worker, lifecycle, badge/message handling |
| `entrypoints/content.ts`    | Skills Boost page integration                     |
| `entrypoints/popup/`        | main popup UI                                     |
| `entrypoints/options/`      | settings/account/data management                  |
| `entrypoints/theme-studio/` | custom popup-theme editor                         |
| changelog entrypoint        | update/release information                        |

### Important services

| Service                        | Responsibility                                              |
| ------------------------------ | ----------------------------------------------------------- |
| `arcadeApiService.ts`          | Arcade v3 request and Arcade/Facilitator metadata sync      |
| `facilitatorService.ts`        | Facilitator rules/progress/bonus helpers                    |
| `bonusMilestoneService.ts`     | self-reported Bonus Milestone state                         |
| `accountService.ts`            | account CRUD, switching, migration                          |
| `storageService.ts`            | account-aware storage compatibility layer and badge refresh |
| `popupService.ts`              | popup orchestration                                         |
| `popupUIService.ts`            | popup rendering/update logic                                |
| `searchService.ts`             | lab solution matching                                       |
| `labService.ts`                | lab-page workflow                                           |
| `apiClient.ts`                 | solution-content API client                                 |
| `profileService.ts`            | Skills Boost profile-page helpers                           |
| `firebaseService.ts`           | Remote Config                                               |
| `exportService.ts`             | JSON/CSV export                                             |
| `browserService.ts`            | browser detection/compatibility helpers                     |
| `backToTopService.ts`          | page scroll helper                                          |
| `updateNotificationService.ts` | changelog/update notification preference                    |

---

## 5. Main data flows

### 5.1 Arcade refresh

```text
User opens popup / presses refresh
        ↓
PopupService
        ↓
active Account + profile URL
        ↓
ArcadeApiService.fetchArcadeData()
        ↓
canonicalize profile URL
        ↓
build API v3 payload
        ↓
build signature headers
        ↓
Arcade API v3
        ↓
validate successful response
        ↓
sync Facilitator rules from API
        ↓
StorageService.saveArcadeData()
        ↓
active account Arcade snapshot
        ↓
PopupUIService + BadgeService
        ↓
popup total / milestones / badges / extension action badge
```

Failure behavior:

- request/invalid response → return no new snapshot
- cached data can remain available
- Facilitator metadata sync failure must not discard an otherwise successful Arcade response
- extension badge failure is non-fatal

---

### 5.2 Bonus Milestone

```text
Arcade snapshot + active account
        ↓
BonusMilestoneService
        ↓
check participating + enabled + available points + period
        ↓
read profile/period-scoped local confirmation
        ↓
BonusMilestoneControl
        ↓
explicit user confirmation
        ↓
persist local self-reported state
        ↓
next Arcade v3 request includes completion flag
```

---

### 5.3 Lab solution

```text
Supported Skills Boost lab route
        ↓
content.ts
        ↓
LabService
        ↓
SearchService.extractQueryText()
        ↓
ApiClient
        ↓
SearchService ranking
        ↓
matched solution or fallback
        ↓
UIComponents injected into page
```

---

### 5.4 Account switching

```text
User selects account
        ↓
AccountService changes activeAccountId
        ↓
Popup reloads account snapshot/profile
        ↓
Popup UI rerenders
        ↓
StorageService refreshes action badge
```

---

## 6. Storage model

Primary modern storage:

```text
local:accountsData
```

Other storage namespaces exist for compatibility and feature-specific state, including:

- legacy Arcade/profile storage
- popup theme/custom theme state
- Bonus Milestone profile/period-scoped confirmation
- feature/settings values

Rules:

1. New account-specific data should normally live with or be keyed by the account/profile.
2. Period-specific Arcade state must also include period identity when multi-season support lands.
3. Do not silently overwrite historical period data with current-period data.
4. Backward compatibility should be handled in the service layer, not duplicated throughout UI code.

---

## 7. External systems

### Arcade API

Used for current Arcade scoring and Facilitator metadata.

The extension should treat API data as the preferred source for season/rule-specific score metadata.

### Solutions API

Used to retrieve candidate lab solution content for SearchService matching.

### Firebase Remote Config

Used for remotely adjustable countdown/config values.

### Google Cloud Skills Boost pages

The content script integrates with supported `skills.google` routes and therefore must be resilient to upstream DOM changes.

---

## 8. Security and privacy boundaries

Current architecture principles:

- Do not log secrets/signature values.
- Do not treat extension-embedded build-time values as truly confidential.
- Keep server validation/rate limiting/replay protection on the trusted server side.
- Sanitize untrusted profile/display data before injecting HTML.
- Restrict browser permissions to what a feature actually requires.
- Notifications remain an optional permission.
- A failure to update the action badge, telemetry-like metadata, or secondary UI must not corrupt/block score data.

### Future AI/Agent boundary

AI/Agent is currently a **roadmap direction**, not a current scoring/runtime subsystem.

When implemented:

- Calculator remains authoritative for points.
- AI consumes normalized read-only Calculator facts.
- deterministic code performs score/milestone arithmetic.
- AI explains/plans from those facts.
- state-changing Agent actions require explicit user intent.
- cookies, session tokens, HMAC secrets/signatures, and unrelated account data must not be exposed to a model.

See [ROADMAP.md](ROADMAP.md#next--ai--agent-for-arcade-calculator).

---

## 9. Testing and release contract

Before merging code changes:

```bash
yarn compile
yarn test:coverage
yarn build
```

Also build Firefox for release validation when relevant:

```bash
yarn build:firefox
```

Current test stack:

- Vitest
- jsdom
- fake browser/WXT state
- service/util-focused regression tests
- coverage gate configured by the project

Changes to scoring, Facilitator rules, Bonus Milestone, solution matching, storage migration, or request signing should include regression coverage.

---

## 10. Documentation ownership

Use these files for different purposes:

| File              | Purpose                                                       |
| ----------------- | ------------------------------------------------------------- |
| `README.md`       | public project introduction and installation                  |
| `ARCHITECTURE.md` | **current features, structure, ownership, and runtime flows** |
| `ROADMAP.md`      | planned/future work                                           |
| `CONTRIBUTING.md` | contribution workflow and PR requirements                     |
| `CLAUDE.md`       | Claude Code-specific working instructions                     |
| `CHANGELOG.md`    | released changes by version                                   |

When a feature becomes real:

1. implement it,
2. test it,
3. update `ARCHITECTURE.md` if ownership/flow/current capabilities changed,
4. remove or mark completed roadmap wording as appropriate,
5. include it in release notes/changelog.

This keeps **current state** and **future state** from drifting into the same document.
