# Roadmap

This roadmap describes the planned direction for **Google Cloud Skills Boost Helper** after v1.3.3.

It is intentionally organized by outcome rather than fixed dates. GitHub issues and pull requests remain the source of truth for implementation status, and priorities may change when Google Cloud Skills Boost changes its UI or Arcade program behavior.

## Status legend

- **Now** — reliability and compatibility work that should be addressed first.
- **Next** — the next product-level capabilities after the current baseline is stable.
- **Later** — planned improvements that depend on the earlier foundations.
- **Continuous** — quality work that applies to every release.

---

## Now — Platform reliability and compatibility

### 1. Keep core features working across Skills Boost UI changes

Google Cloud Skills Boost regularly changes routes, markup, and page structure. The extension should become less dependent on one exact DOM layout.

Planned work:

- [ ] Repair and harden the Solution button against the current `skills.google` UI ([#139](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/issues/139)).
- [ ] Repair score detection when assessment markup changes ([#140](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/issues/140)).
- [ ] Add representative HTML/DOM fixtures for supported lab and assessment layouts.
- [ ] Prefer small page adapters/selectors with explicit fallbacks instead of scattered DOM queries.
- [ ] Add regression tests for old and current Skills Boost layouts where practical.
- [ ] Fail gracefully when a page layout is unknown instead of rendering broken controls.

**Done when:** the extension can detect supported lab/assessment pages through tested adapters, and a Google markup change can usually be fixed in one isolated place.

### 2. Improve Solution matching accuracy

Known search failures include incorrect prefix matches and pages whose title, lab code, or route shape differs from the indexed solution title.

Planned work:

- [ ] Prefer an exact lab code match before fuzzy title matching ([#30](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/issues/30)).
- [ ] Normalize alternate lab URL formats and route aliases ([#63](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/issues/63)).
- [ ] Prevent partial-code collisions such as `ARC120` matching `ARC1206`.
- [ ] Add deterministic ranking rules: exact code → normalized title → fuzzy title → external fallback.
- [ ] Add regression fixtures for known mismatches before changing ranking logic.
- [ ] Keep Google/YouTube fallback available when no trusted solution match exists.

**Done when:** known lab-code collisions are covered by tests and the matching result can explain why a solution was selected.

### 3. UI consistency

- [ ] Fix remaining browser/theme dark-mode inconsistencies ([#104](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/issues/104)).
- [ ] Verify popup/options/changelog surfaces in both light and dark browser themes.
- [ ] Keep new user-facing strings in all 13 shipped locales.
- [ ] Preserve keyboard focus, tooltips, and disabled states for interactive controls.

---

## Next — Arcade season/session architecture

The extension currently has a working Arcade v3 flow, including Facilitator and Bonus Milestone support. The next major foundation is making Arcade data explicitly period-aware.

Tracked in [#215 — Support multi-season/session Arcade scoring across Hub, Web, and Extension](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/issues/215).

### 1. Hub-owned period metadata

The extension must not hardcode future Arcade seasons or session dates.

- [ ] Load available periods and the current period from Hub metadata.
- [ ] Support a stable period identifier such as `2027-s1`, `2027-s2`, etc.
- [ ] Treat the Hub current period as the source of truth.
- [ ] Keep old periods queryable after a new session starts.

### 2. Current vs pinned period

- [ ] Add a **Current season** mode that follows the Hub automatically.
- [ ] Add a manual period selector for users who want to inspect an older session.
- [ ] Persist the selected mode and explicit period.
- [ ] Do not silently move users who deliberately pinned an older period.

### 3. Period-aware API and cache

- [ ] Add optional `period` to the Arcade API v3 request.
- [ ] Keep existing v3 requests valid when `period` is omitted.
- [ ] Ensure HMAC signing remains correct when the new field is present.
- [ ] Make local Arcade cache/snapshots period-aware.
- [ ] Prevent data from one period from overwriting or appearing as another period.

### 4. Transition regression coverage

Required scenarios:

- [ ] Existing clients with no period still resolve the current period.
- [ ] Current mode follows a Hub transition such as `2027-s1 → 2027-s2`.
- [ ] A pinned `2027-s1` selection stays on `2027-s1`.
- [ ] Historical snapshots remain separate.
- [ ] Opening a future period does not require an extension release just to hardcode its label/date.

**Done when:** the Hub can open a new Arcade session and current-mode extension users follow it without an extension update, while historical sessions remain selectable and isolated.

---

## Next — Safer automatic score refresh

Tracked in [#38 — Auto check score](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/issues/38).

The goal is useful freshness without creating noisy requests or bypassing Hub cache/rate-limit behavior.

Planned work:

- [ ] Add an explicit opt-in/opt-out control for automatic score refresh.
- [ ] Refresh only known profiles and only when the relevant period is selected.
- [ ] Use cached data for passive refresh where possible.
- [ ] Reserve force refresh for explicit user actions.
- [ ] Apply backoff after API/network failures.
- [ ] Expose last-updated/stale state so users know whether displayed points are fresh.
- [ ] Keep refresh state isolated per profile and per Arcade period.
- [ ] Add tests preventing duplicate concurrent refreshes.

**Done when:** users can enable automatic freshness without excessive API traffic, and the UI clearly distinguishes cached, refreshed, and failed states.

---

## Later — Productivity and account UX

### 1. Keyboard shortcuts

Tracked in [#126 — Thêm tính năng: tự cài đặt phím tắt](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/issues/126).

- [ ] Define a small set of useful extension commands.
- [ ] Prefer browser-native command APIs instead of custom global key listeners.
- [ ] Provide a discoverable shortcut settings/help entry.
- [ ] Avoid conflicts with Google Cloud Skills Boost and browser shortcuts.
- [ ] Localize shortcut descriptions where supported by the browser.

Potential commands:

- Open/toggle the helper popup.
- Refresh the active profile score.
- Open the current lab solution when a confident match exists.
- Toggle selected optional UI surfaces.

### 2. Multi-account improvements

- [ ] Show clearer snapshot freshness per profile.
- [ ] Make active-profile switching resilient to stale/missing profile data.
- [ ] Keep profile settings, Arcade period selection, and cached results correctly scoped.
- [ ] Add import/export only if it can be done without exposing sensitive account/session data.

---

## Later — Search and learning workflow

### 1. Broader content detection

- [ ] Support quiz/assessment solution discovery where the source data is reliable ([#58](https://github.com/ePlus-DEV/google-cloud-skills-boost-helper/issues/58)).
- [ ] Normalize course-template, game, path, lab, and quiz route variants into one internal page model.
- [ ] Keep matching logic independent from the content-script rendering layer.

### 2. Search confidence and transparency

- [ ] Attach an internal confidence/reason to solution matches.
- [ ] Prefer hiding a weak automatic match over presenting a confidently wrong result.
- [ ] Show external search fallbacks when confidence is below the trusted threshold.
- [ ] Add regression cases whenever a false-positive solution is reported.

---

## Continuous — Engineering, security, and releases

These requirements apply to every roadmap phase.

### Test and build quality

- [ ] Keep `yarn compile` passing.
- [ ] Keep `yarn test:coverage` passing the project coverage gate.
- [ ] Keep production Chrome and Firefox builds passing.
- [ ] Add regression tests for every fixed scoring/search bug when practical.
- [ ] Keep business logic in `services/` or `utils/` instead of page-specific UI code.

### Cross-browser support

- [ ] Validate Chrome and Firefox behavior for every release.
- [ ] Keep Edge/Opera manual packages compatible where the Chromium build supports them.
- [ ] Avoid adding browser permissions unless a feature clearly requires them.

### Security and privacy

- [ ] Never log API secrets, request signatures, profile session data, or sensitive payloads.
- [ ] Treat build-time extension secrets as inspectable public-client material.
- [ ] Keep server-side validation, rate limiting, replay protection, and key rotation as the real enforcement boundary.
- [ ] Keep telemetry best-effort and non-blocking for score calculation.

### Internationalization

- [ ] Keep all user-facing features compatible with the 13 shipped locales.
- [ ] Avoid introducing hardcoded English UI copy.
- [ ] Include localization regression coverage for important score/Arcade actions.

### Release discipline

- [ ] Develop feature/fix PRs against `dev`.
- [ ] Keep release PRs focused and reviewable.
- [ ] Update changelog/release notes for user-visible behavior.
- [ ] Preserve backward compatibility for older extension/API clients when feasible.

---

## Prioritization principles

When deciding what moves first, use this order:

1. **Broken core behavior** — score calculation, profile handling, Solution detection, extension startup.
2. **Data correctness** — Arcade totals, period/session isolation, cache correctness.
3. **Compatibility** — Skills Boost markup changes, API contract changes, cross-browser behavior.
4. **User clarity** — stale state, match confidence, loading/error states, accessible interaction.
5. **Convenience features** — shortcuts, workflow acceleration, optional visual enhancements.

A feature should not ship if it makes score correctness, privacy, or core page compatibility harder to reason about.
