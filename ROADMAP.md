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

## Next — AI / Agent for Arcade Calculator

AI and Agent features should be built **on top of the existing Arcade Calculator**, not replace its scoring logic. The Calculator remains the deterministic source of truth for points, milestone rules, and API-derived status; AI is responsible for explanation and planning, while Agent actions orchestrate existing extension capabilities with explicit user intent.

### Current Arcade Calculator foundation

The extension already exposes the structured data needed for a useful AI/Agent layer:

- Signed Arcade API v3 requests using the normalized public profile URL/profile ID.
- Total Arcade points plus structured point fields such as Game, Trivia, Skill, Special, and Completion points when returned by the API.
- Facilitator metadata, including current badge counts, milestone requirements, Regular Arcade/base points, and Facilitator bonus values.
- Milestone progress displayed as both percentage and completed/required badge counts.
- API-provided Facilitator rules as the primary source of truth, with local rules used only as compatibility fallback.
- Bonus Milestone availability and self-reported completion state, kept separate from the standard Facilitator milestone bonus.
- Per-account Arcade snapshots, active-account switching, and `lastUpdated` freshness metadata.
- Extension badge display using the active account's calculated total.
- Existing localization infrastructure for all 13 shipped locales.

There is **no AI scoring engine today**. Current totals and milestone progress are calculated from deterministic API/rule data. The roadmap must preserve that behavior.

### 1. AI Arcade Insights

Add an optional AI explanation layer that consumes the normalized Calculator result.

Example questions:

- **Why do I have this many Arcade points?**
- **What contributes to my current total?**
- **How far am I from the next Facilitator milestone?**
- **Which requirement is currently blocking the next milestone?**
- **What changed since my previous score refresh?**
- **Is this result stale or incomplete?**

Planned work:

- [ ] Define a typed, read-only `ArcadeInsightContext` derived from the Calculator result.
- [ ] Include current total, point breakdown, badge counts, active Facilitator rules, milestone progress, Bonus Milestone state, selected period, and freshness metadata.
- [ ] Generate natural-language explanations from those facts without recalculating the authoritative total in the model.
- [ ] Calculate exact "remaining to milestone" values in deterministic code before passing them to AI.
- [ ] Clearly distinguish **official/API data**, **self-reported Bonus Milestone state**, **local fallback rules**, and **AI explanation**.
- [ ] Warn when data is stale, incomplete, using fallback rules, or missing fields required for a confident answer.
- [ ] Support the same 13 locales as the rest of the extension.

**Example:**

```text
User: How far am I from the next Facilitator milestone?

Calculator:
- Games: 7 / 8
- Skill Badges: 31 / 34
- Current milestone progress: 38 / 42

AI:
You need 1 more Game badge and 3 more Skill Badges to satisfy the next
milestone requirements. This explanation is based on the active rules returned
by the Arcade API.
```

The arithmetic in the example must come from deterministic Calculator helpers, not from free-form model math.

### 2. Goal planner

Allow users to choose a target such as a Facilitator milestone and receive a plan grounded in the Calculator state.

- [ ] Select a target milestone from the active API rules.
- [ ] Show exact remaining Games / Skill Badges / other active requirements.
- [ ] Show the Regular Arcade/base points and Facilitator bonus associated with that milestone when provided by the API.
- [ ] Build a simple ordered checklist from unmet requirements.
- [ ] Re-plan automatically after a score refresh.
- [ ] Keep recommendations descriptive; do not claim that future rewards or points are guaranteed until the authoritative data confirms them.

Potential UI:

```text
AI Arcade Advisor

Target: Milestone 3

Current
Games        8 / 10
Skill Badges 41 / 50

Remaining
2 Games
9 Skill Badges

[Explain my score] [Refresh & re-plan]
```

### 3. Agent actions

The Agent layer may orchestrate existing extension functions, but it should not bypass their validation, permissions, or confirmation flows.

Initial actions:

- [ ] **Refresh my Arcade score** — invoke the existing Calculator fetch flow for the active profile.
- [ ] **Explain the refreshed result** — compare the previous and new snapshots, then summarize the change.
- [ ] **Switch profile and inspect score** — use existing multi-account state.
- [ ] **Switch Arcade period** — after multi-season/session support from #215 is available.
- [ ] **Open the relevant Arcade/Facilitator information page** when the user asks for the official source.
- [ ] **Open a matching lab/solution search** only when the user explicitly requests help finding relevant learning content.
- [ ] Reuse existing loading/error/rate-limit behavior instead of creating a second network path.

Agent actions that modify state must be explicit. In particular:

- Never auto-confirm or auto-claim the self-reported Bonus Milestone.
- Never change profile settings, selected period, or account state silently.
- Never repeatedly force-refresh in the background to chase a target score.
- Never present a locally predicted point total as an official Arcade result.

### 4. Calculator tools for AI/Agent

Expose a small internal tool layer instead of letting AI read or mutate popup DOM directly.

Suggested read tools:

```text
get_active_arcade_snapshot()
get_arcade_breakdown()
get_facilitator_progress()
get_next_milestone_gap()
get_arcade_data_freshness()
get_available_arcade_periods()
```

Suggested user-triggered actions:

```text
refresh_arcade_score()
select_arcade_period(period_id)
switch_active_profile(profile_id)
open_arcade_source(resource)
```

Implementation principles:

- [ ] Tool outputs use typed JSON, not rendered HTML.
- [ ] Deterministic services perform all point/milestone arithmetic.
- [ ] AI receives the resulting facts and explains them.
- [ ] Read operations can be low-friction; state-changing operations require clear user intent/confirmation.
- [ ] Every Agent action returns a structured success/error result that can be shown without guessing.
- [ ] Keep tools reusable by popup UI, future side panel, and other approved assistant surfaces.

### 5. Privacy and security

AI/Agent integration must not expand the data boundary silently.

- [ ] Make AI features opt-in until the data flow is clearly documented.
- [ ] Send only the minimum normalized Calculator context required for the requested explanation.
- [ ] Do not send browser cookies, Skills Boost session tokens, HMAC signing values, extension secrets, or unrelated account data to an AI provider.
- [ ] Do not expose signed Arcade request headers or raw authentication material to the model.
- [ ] Make it clear when an explanation is produced by AI versus returned by the Arcade API.
- [ ] Preserve existing server validation, rate limiting, and replay protection for Agent-triggered refreshes.
- [ ] Provide a non-AI Calculator experience with no feature loss for users who keep AI disabled.

### 6. Acceptance scenarios

#### Scenario A — Explain current total

```text
User asks: "Why is my score 118?"
=> Agent reads the current Calculator snapshot.
=> Deterministic breakdown is used as source data.
=> AI explains the returned components.
=> AI does not invent missing point categories.
```

#### Scenario B — Plan for the next milestone

```text
User asks: "What do I still need for the next milestone?"
=> Calculator helper resolves the next milestone from active API rules.
=> Deterministic code calculates remaining requirements.
=> AI converts the result into a short actionable explanation.
```

#### Scenario C — Refresh and compare

```text
User asks: "Refresh my score and tell me what changed."
=> Agent performs one user-requested refresh through the existing Arcade flow.
=> Previous and new snapshots are compared deterministically.
=> AI summarizes added/removed points, progress, and freshness.
```

#### Scenario D — Stale or incomplete data

```text
Calculator snapshot is old or required fields are missing.
=> AI explicitly reports the limitation.
=> Agent offers a refresh action.
=> No estimated official score is fabricated.
```

#### Scenario E — Bonus Milestone

```text
Bonus Milestone is available but not confirmed.
=> AI may explain what the control means.
=> Agent may open the existing confirmation UI when requested.
=> Agent never checks/confirms the self-reported completion box automatically.
```

**Done when:** a user can ask natural-language questions about their Arcade Calculator state, receive explanations fully grounded in deterministic Calculator data, and request safe Agent actions without creating a second scoring implementation.

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
