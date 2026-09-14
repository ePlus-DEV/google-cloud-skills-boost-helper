import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import { createRoot, type Root } from "react-dom/client";
import { browser } from "wxt/browser";
import {
  getBonusMilestoneControlState,
  setActiveBonusMilestoneCompleted,
  watchBonusMilestoneControlState,
  type BonusMilestoneControlState,
} from "../services/bonusMilestoneService";

const ROOT_ID = "facilitator-bonus-milestone-root";

const EMPTY_STATE: BonusMilestoneControlState = {
  completed: false,
  enabled: true,
  participating: false,
  points: 10,
  appliedPoints: 0,
  milestoneBonusPoints: 0,
  bonusIncludedInTotal: false,
  profileUrl: "",
};

/** Return a localized message while preserving a safe English fallback. */
function getMessage(key: string, fallback: string): string {
  try {
    return (
      browser.i18n.getMessage(
        key as Parameters<typeof browser.i18n.getMessage>[0],
      ) || fallback
    );
  } catch {
    return fallback;
  }
}

/** Format point values without unnecessary trailing decimals. */
function formatPoints(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/** Return the self-reported Bonus Milestone amount currently applied. */
function renderedManualBonus(state: BonusMilestoneControlState): number {
  if (!state.completed) return 0;
  return state.appliedPoints > 0 ? state.appliedPoints : state.points;
}

/** Parse a rendered point total into a safe numeric value. */
function parseDisplayedTotal(value: string | null | undefined): number {
  if (!value) return 0;
  const normalized = value.replace(/\s/gu, "").replace(/,/gu, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Keep the existing yellow bonus badge numeric-only. */
function syncBonusBadge(state: BonusMilestoneControlState): void {
  const badge = document.getElementById("arcade-facilitator-points");
  if (!badge) return;

  const manualBonus = renderedManualBonus(state);
  const totalBonus = state.participating
    ? state.milestoneBonusPoints + manualBonus
    : 0;

  badge.textContent = `+${formatPoints(totalBonus)}`;
}

/** Add only the self-reported bonus to the main total, without double counting it. */
function syncDisplayedTotal(state: BonusMilestoneControlState): void {
  const total = document.getElementById("arcade-points");
  if (!total) return;

  if (total.dataset.bonusMilestoneProfile !== state.profileUrl) {
    delete total.dataset.bonusMilestoneApplied;
    delete total.dataset.bonusMilestoneRenderedTotal;
    total.dataset.bonusMilestoneProfile = state.profileUrl;
  }

  const currentTotal = parseDisplayedTotal(total.textContent);
  const previousApplied =
    Number(total.dataset.bonusMilestoneApplied || "0") || 0;
  const previousRendered = Number(
    total.dataset.bonusMilestoneRenderedTotal || "NaN",
  );
  const stillContainsPreviousBonus =
    Number.isFinite(previousRendered) && currentTotal === previousRendered;
  const baseTotal = stillContainsPreviousBonus
    ? Math.max(0, currentTotal - previousApplied)
    : currentTotal;
  const nextApplied = state.bonusIncludedInTotal
    ? 0
    : renderedManualBonus(state);
  const nextTotal = baseTotal + nextApplied;

  total.textContent = formatPoints(nextTotal);
  total.dataset.bonusMilestoneApplied = String(nextApplied);
  total.dataset.bonusMilestoneRenderedTotal = String(nextTotal);
}

/** Render the existing Bonus Milestone self-confirmation control without changing its copy or layout. */
function BonusMilestoneControl() {
  const [state, setState] = useState<BonusMilestoneControlState>(EMPTY_STATE);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async function reloadControlState() {
    setState(await getBonusMilestoneControlState());
  }, []);

  useEffect(
    function subscribeToBonusMilestoneState() {
      reload().catch(() => null);
      return watchBonusMilestoneControlState(
        function reloadAfterAccountChange() {
          reload().catch(() => null);
        },
      );
    },
    [reload],
  );

  useEffect(
    function keepArcadeSummaryInSync() {
      syncBonusBadge(state);
      syncDisplayedTotal(state);
    },
    [state],
  );

  const handleChange = useCallback(async function persistBonusMilestoneChange(
    completed: boolean,
  ) {
    setSaving(true);

    try {
      const nextState = await setActiveBonusMilestoneCompleted(completed);
      setState({
        ...nextState,
        completed,
        appliedPoints:
          completed && nextState.appliedPoints <= 0
            ? nextState.points
            : nextState.appliedPoints,
      });

      // Reuse the existing refresh flow so Hub receives the self-report and
      // returns the season-owned applied Bonus Milestone amount.
      document.querySelector<HTMLButtonElement>(".refresh-button")?.click();
    } finally {
      setSaving(false);
    }
  }, []);

  const handleCheckboxChange = useCallback(
    function handleCheckboxEvent(event: ChangeEvent<HTMLInputElement>) {
      handleChange(event.currentTarget.checked).catch(() => null);
    },
    [handleChange],
  );

  if (!state.enabled || state.points <= 0) return null;

  const pointsWord = getMessage("textPoints", "points");
  const reward = `+${formatPoints(state.points)} ${pointsWord}`;
  const disabled = !state.participating || saving;

  return (
    <label
      className={`flex items-center justify-between gap-3 bg-emerald-500/10 backdrop-blur-md rounded-lg p-3 mb-3 border border-emerald-400/30 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <span className="flex items-center min-w-0">
        <i className="fa-solid fa-circle-check text-emerald-400 text-lg mr-2" />
        <span className="min-w-0">
          <strong className="block text-white text-sm">Bonus Milestone</strong>
          <small className="block text-emerald-300/70 text-xs">{reward}</small>
        </span>
      </span>
      <input
        type="checkbox"
        className="h-5 w-5 accent-emerald-500"
        aria-label={`Bonus Milestone: ${reward}`}
        checked={state.completed}
        disabled={disabled}
        onChange={handleCheckboxChange}
      />
    </label>
  );
}

let root: Root | null = null;
let host: HTMLElement | null = null;

/** Mount exactly one React root into the existing popup milestone section. */
export function mountBonusMilestoneControl(): void {
  const section = document.getElementById("milestones-section");
  if (!section) return;

  if (!host?.isConnected) {
    const existing = document.getElementById(ROOT_ID);
    if (existing) existing.remove();

    host = document.createElement("div");
    host.id = ROOT_ID;

    const milestoneGrid =
      section.querySelector(".milestone-card")?.parentElement;
    if (milestoneGrid) milestoneGrid.before(host);
    else section.appendChild(host);

    root = createRoot(host);
  }

  root?.render(<BonusMilestoneControl />);
}
