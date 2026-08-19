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

/** Render the profile-scoped Bonus Milestone self-confirmation control. */
function BonusMilestoneControl() {
  const [state, setState] = useState<BonusMilestoneControlState>(EMPTY_STATE);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(
    /** Reload the control state from the active profile and API snapshot. */
    async function reloadControlState() {
      setState(await getBonusMilestoneControlState());
    },
    [],
  );

  useEffect(
    /** Load the initial state and subscribe to active-account changes. */
    function subscribeToBonusMilestoneState() {
      void reload();
      return watchBonusMilestoneControlState(
        function reloadAfterAccountChange() {
          void reload();
        },
      );
    },
    [reload],
  );

  const handleChange = useCallback(
    /** Persist one checkbox change and then refresh the signed Arcade request. */
    async function persistBonusMilestoneChange(completed: boolean) {
      setSaving(true);

      try {
        setState(await setActiveBonusMilestoneCompleted(completed));

        // Reuse the existing refresh flow so the signed v3 request sends the
        // self-report and the API returns the season-owned applied bonus points.
        document.querySelector<HTMLButtonElement>(".refresh-button")?.click();
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const handleCheckboxChange = useCallback(
    /** Forward the checkbox state to the async persistence handler. */
    function handleCheckboxEvent(event: ChangeEvent<HTMLInputElement>) {
      void handleChange(event.currentTarget.checked);
    },
    [handleChange],
  );

  if (!state.enabled) return null;

  const title = getMessage("facilitatorBonus", "Facilitator Bonus").replace(
    /[:：]\s*$/u,
    "",
  );
  const pointsWord = getMessage("textPoints", "points");
  const reward = `+${state.points.toString()} ${pointsWord}`;
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
          <strong className="block text-white text-sm">{title}</strong>
          <small className="block text-emerald-300/70 text-xs">{reward}</small>
        </span>
      </span>
      <input
        type="checkbox"
        className="h-5 w-5 accent-emerald-500"
        aria-label={`${title}: ${reward}`}
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
