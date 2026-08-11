import axios from "axios";
import type { ArcadeData } from "../types";
import {
  FACILITATOR_MILESTONE_POINTS,
  FACILITATOR_MILESTONE_REQUIREMENTS,
  resetFacilitatorRulesToFallback,
  syncFacilitatorRulesFromApi,
} from "./facilitatorService";
import { canonicalizeProfileUrl, extractProfileId } from "../utils/profileUrl";
import { buildArcadeSignatureHeaders } from "../utils/arcadeRequestSignature";

const FACILITATOR_BONUS_LABEL_KEYS: Record<string, string> = {
  1: "milestone1Bonus",
  2: "milestone2Bonus",
  3: "milestone3Bonus",
  ultimate: "milestoneUltimateBonus",
};

const ARCADE_API_TIMEOUT_MS = 15_000;

let facilitatorLabelObserver: MutationObserver | null = null;

/**
 * Resolve the stable Arcade API v2 endpoint.
 *
 * WXT_ARCADE_POINT_V2_URL is preferred when configured. For existing release
 * environments we can derive `/api/v2/arcade` from the legacy `/api/arcade`
 * URL so a new secret is not required immediately. We never send a request to
 * the legacy endpoint from this client.
 */
function getArcadeV2Endpoint(): string {
  const explicit = String(import.meta.env.WXT_ARCADE_POINT_V2_URL || "").trim();
  if (explicit) return explicit;

  const legacy = String(import.meta.env.WXT_ARCADE_POINT_URL || "").trim();
  if (!legacy) return "";

  if (/\/v2\/arcade\/?$/i.test(legacy)) return legacy;

  const derived = legacy.replace(/\/arcade(?:-public)?\/?$/i, "/v2/arcade");
  return derived !== legacy ? derived : "";
}

/** Format a bonus value without unnecessary trailing decimals. */
function formatBonusPoints(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/** Replace only the numeric bonus prefix while preserving localized text. */
function replaceBonusValue(text: string, points: number): string {
  const formatted = `+${formatBonusPoints(points)}`;
  const pattern = /\+\s*-?\d+(?:[.,]\d+)?/u;

  return pattern.test(text)
    ? text.replace(pattern, formatted)
    : `${formatted} Bonus Points`;
}

/** Convert optional values to a safe non-negative badge count. */
function normalizeBadgeCount(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.trunc(parsed) : 0;
}

/**
 * Hide requirements that are not part of the active ruleset without modifying
 * the current count rendered by PopupUIService. The popup owns count rendering;
 * this synchronizer only controls which requirement rows are active.
 */
function syncRequirementRow(selector: string, required: number): void {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) return;

  const row = element.parentElement;
  const normalizedRequired = normalizeBadgeCount(required);
  row?.classList.toggle("hidden", normalizedRequired === 0);
}

/** Read the current badge count rendered by PopupUIService (for example 7/10). */
function readDisplayedCount(selector: string): number | null {
  const text = document.querySelector<HTMLElement>(selector)?.textContent ?? "";
  const match = /^\s*(\d+)\s*\//u.exec(text);
  if (!match) return null;

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Match the facilitator progress formula used by arcade.eplus.dev: completed
 * badges across active requirements divided by the total badge requirement.
 */
function syncMilestoneProgress(
  milestone: string,
  requirements: {
    games: number;
    trivia: number;
    skills: number;
    labfree: number;
  },
): void {
  const requirementEntries = [
    {
      label: "Games",
      selector: `.milestone-${milestone}-games`,
      required: normalizeBadgeCount(requirements.games),
    },
    {
      label: "Trivia",
      selector: `.milestone-${milestone}-trivia`,
      required: normalizeBadgeCount(requirements.trivia),
    },
    {
      label: "Skills",
      selector: `.milestone-${milestone}-skills`,
      required: normalizeBadgeCount(requirements.skills),
    },
    {
      label: "Lab-free",
      selector: `.milestone-${milestone}-labfree`,
      required: normalizeBadgeCount(requirements.labfree),
    },
  ].filter((entry) => entry.required > 0);

  if (requirementEntries.length === 0) return;

  let completed = 0;
  let total = 0;
  const details: string[] = [];

  for (const entry of requirementEntries) {
    const current = readDisplayedCount(entry.selector);
    if (current === null) return;

    const cappedCurrent = Math.min(current, entry.required);
    completed += cappedCurrent;
    total += entry.required;
    details.push(`${entry.label}: ${cappedCurrent}/${entry.required}`);
  }

  if (total <= 0) return;

  const percent = Math.floor(
    Math.min(100, Math.max(0, (completed / total) * 100)),
  );
  const progressElement = document.querySelector<HTMLElement>(
    `.milestone-${milestone}-progress`,
  );
  if (!progressElement) return;

  const nextText = `${percent}%`;
  if (progressElement.textContent !== nextText) {
    progressElement.textContent = nextText;
  }

  progressElement.dataset.completedBadges = String(completed);
  progressElement.dataset.totalBadges = String(total);
  progressElement.setAttribute(
    "title",
    `Progress: ${percent}% (${completed}/${total} badges completed)\n\n${details.join("\n")}`,
  );
}

/**
 * Keep milestone requirements synchronized with facilitator.milestones. Shared
 * rules are hydrated from the API, while current counts remain owned by the
 * popup so cached and freshly fetched data behave identically.
 */
function syncFacilitatorRequirementLabels(): void {
  if (typeof document === "undefined") return;

  for (const [milestone, requirements] of Object.entries(
    FACILITATOR_MILESTONE_REQUIREMENTS,
  )) {
    syncRequirementRow(`.milestone-${milestone}-games`, requirements.games);
    syncRequirementRow(`.milestone-${milestone}-trivia`, requirements.trivia);
    syncRequirementRow(`.milestone-${milestone}-skills`, requirements.skills);
    syncRequirementRow(`.milestone-${milestone}-labfree`, requirements.labfree);
    syncMilestoneProgress(milestone, requirements);
  }
}

/**
 * Keep Facilitator card labels synchronized with the active API rules.
 * The text after the numeric bonus value stays localized; only the number is replaced.
 */
function syncFacilitatorRuleLabels(): void {
  if (typeof document === "undefined") return;

  for (const [milestone, i18nKey] of Object.entries(
    FACILITATOR_BONUS_LABEL_KEYS,
  )) {
    const element = document.querySelector<HTMLElement>(
      `[data-i18n="${i18nKey}"]`,
    );
    if (!element) continue;

    const points = Number(FACILITATOR_MILESTONE_POINTS[milestone] ?? 0);
    const currentText = element.textContent?.trim() || "";
    const nextText = replaceBonusValue(currentText, points);

    if (currentText !== nextText) {
      element.textContent = nextText;
    }
  }

  const maximumNote = document.querySelector<HTMLElement>(
    '[data-i18n="maxPossibleNote"]',
  );
  if (maximumNote) {
    const maximumPoints = Math.max(
      0,
      ...Object.values(FACILITATOR_MILESTONE_POINTS).map((value) =>
        Number.isFinite(Number(value)) ? Number(value) : 0,
      ),
    );
    const currentText = maximumNote.textContent?.trim() || "";
    const nextText = /\d+(?:[.,]\d+)?/u.test(currentText)
      ? currentText.replace(
          /\d+(?:[.,]\d+)?/u,
          formatBonusPoints(maximumPoints),
        )
      : `Maximum possible: ${formatBonusPoints(maximumPoints)} points (highest milestone only)`;

    if (currentText !== nextText) {
      maximumNote.textContent = nextText;
    }
  }

  syncFacilitatorRequirementLabels();
}

/**
 * Re-apply dynamic rule values after localization or popup rendering mutates the
 * milestone text. Positive current counts are never overwritten here.
 */
function initializeFacilitatorRuleLabelSync(): void {
  if (
    typeof document === "undefined" ||
    typeof MutationObserver === "undefined" ||
    facilitatorLabelObserver
  ) {
    return;
  }

  /** Start label synchronization once the popup DOM is ready. */
  const start = (): void => {
    syncFacilitatorRuleLabels();
    if (!document.body || facilitatorLabelObserver) return;

    facilitatorLabelObserver = new MutationObserver(() => {
      syncFacilitatorRuleLabels();
    });
    facilitatorLabelObserver.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
}

initializeFacilitatorRuleLabelSync();

/**
 * Service to handle Arcade API operations.
 */
const ArcadeApiService = {
  /**
   * Fetch Arcade data from the stable API v2 endpoint.
   */
  async fetchArcadeData(url: string): Promise<ArcadeData | null> {
    try {
      const endpoint = getArcadeV2Endpoint();
      if (!endpoint) return null;

      // Ensure we send the canonical host to the backend. If canonicalization
      // fails, still send the original URL (backend may handle it), but we
      // prefer canonical.
      const canonical = canonicalizeProfileUrl(url) || url;
      const profileId = extractProfileId(url);
      const payload = {
        url: canonical,
        profileId,
      };
      const signatureHeaders = await buildArcadeSignatureHeaders(
        endpoint,
        payload,
      );
      const requestConfig = signatureHeaders
        ? { timeout: ARCADE_API_TIMEOUT_MS, headers: signatureHeaders }
        : { timeout: ARCADE_API_TIMEOUT_MS };
      const response = await axios.post(endpoint, payload, requestConfig);

      if (response.status === 200) {
        const data = response.data as ArcadeData;

        // API v2 exposes Facilitator metadata only at the top level. The API is
        // the source of truth; if metadata is absent or invalid, reset to the
        // local compatibility fallback instead of keeping stale prior rules.
        if (!syncFacilitatorRulesFromApi(data.facilitator)) {
          resetFacilitatorRulesToFallback();
        }
        syncFacilitatorRuleLabels();

        data.lastUpdated = new Date().toISOString();
        return data;
      }

      return null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Validate profile URL format.
   */
  isValidProfileUrl(url: string): boolean {
    const canonical = canonicalizeProfileUrl(url);
    if (!canonical) return false;

    try {
      const parsedUrl = new URL(canonical);
      return /\/public_profiles\//.test(parsedUrl.pathname);
    } catch {
      return false;
    }
  },
};

export default ArcadeApiService;
