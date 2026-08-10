import axios from "axios";
import type { ArcadeData } from "../types";
import {
  FACILITATOR_MILESTONE_POINTS,
  FACILITATOR_MILESTONE_REQUIREMENTS,
  resetFacilitatorRulesToFallback,
  syncFacilitatorRulesFromApi,
} from "./facilitatorService";
import { canonicalizeProfileUrl, extractProfileId } from "../utils/profileUrl";

const FACILITATOR_BONUS_LABEL_KEYS: Record<string, string> = {
  1: "milestone1Bonus",
  2: "milestone2Bonus",
  3: "milestone3Bonus",
  ultimate: "milestoneUltimateBonus",
};

const ARCADE_API_TIMEOUT_MS = 15_000;

let facilitatorLabelObserver: MutationObserver | null = null;
let latestFacilitatorCounts = {
  games: 0,
  trivia: 0,
  skills: 0,
  labfree: 0,
};

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

/** Convert optional API values to a safe non-negative count. */
function normalizeBadgeCount(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

/**
 * Prefer the canonical v2 Facilitator counters and fall back to the compatibility
 * faciCounts shape when older cached data is loaded.
 */
function rememberFacilitatorCounts(data: ArcadeData): void {
  latestFacilitatorCounts = {
    games: normalizeBadgeCount(
      data.facilitator?.gameBadges ?? data.faciCounts?.faciGame,
    ),
    trivia: normalizeBadgeCount(
      data.facilitator?.triviaBadges ?? data.faciCounts?.faciTrivia,
    ),
    skills: normalizeBadgeCount(
      data.facilitator?.skillBadges ?? data.faciCounts?.faciSkill,
    ),
    labfree: normalizeBadgeCount(data.faciCounts?.faciCompletion),
  };
}

/**
 * Update one requirement row from the active API rule. Requirements set to zero
 * are not part of the 2026 program and are hidden instead of rendering 0/0.
 */
function syncRequirementRow(
  selector: string,
  current: number,
  required: number,
): void {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) return;

  const row = element.parentElement;
  const normalizedRequired = normalizeBadgeCount(required);
  const normalizedCurrent = normalizeBadgeCount(current);

  if (normalizedRequired === 0) {
    row?.classList.add("hidden");
    element.dataset.remaining = "0";
    return;
  }

  row?.classList.remove("hidden");
  const remaining = Math.max(0, normalizedRequired - normalizedCurrent);
  const completed = normalizedCurrent >= normalizedRequired;

  element.textContent = `${normalizedCurrent}/${normalizedRequired}${
    completed ? " ✓" : ""
  }`;
  element.dataset.remaining = String(remaining);
  element.title = completed
    ? "Requirement completed"
    : `${remaining} badge${remaining === 1 ? "" : "s"} remaining`;
}

/**
 * Keep milestone badge requirements synchronized with facilitator.milestones.
 * Shared rules are hydrated from the API before this function runs, so the UI
 * never depends on the legacy counts embedded in popup HTML.
 */
function syncFacilitatorRequirementLabels(): void {
  if (typeof document === "undefined") return;

  for (const [milestone, requirements] of Object.entries(
    FACILITATOR_MILESTONE_REQUIREMENTS,
  )) {
    syncRequirementRow(
      `.milestone-${milestone}-games`,
      latestFacilitatorCounts.games,
      requirements.games,
    );
    syncRequirementRow(
      `.milestone-${milestone}-trivia`,
      latestFacilitatorCounts.trivia,
      requirements.trivia,
    );
    syncRequirementRow(
      `.milestone-${milestone}-skills`,
      latestFacilitatorCounts.skills,
      requirements.skills,
    );
    syncRequirementRow(
      `.milestone-${milestone}-labfree`,
      latestFacilitatorCounts.labfree,
      requirements.labfree,
    );
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
 * Re-apply dynamic rule values after localization mutates the static HTML text.
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
      const response = await axios.post(
        endpoint,
        {
          url: canonical,
          profileId,
        },
        { timeout: ARCADE_API_TIMEOUT_MS },
      );

      if (response.status === 200) {
        const data = response.data as ArcadeData;

        // API v2 exposes Facilitator metadata only at the top level. The API is
        // the source of truth; if metadata is absent or invalid, reset to the
        // local compatibility fallback instead of keeping stale prior rules.
        if (!syncFacilitatorRulesFromApi(data.facilitator)) {
          resetFacilitatorRulesToFallback();
        }
        rememberFacilitatorCounts(data);
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
