import { useCallback, useEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
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

function BonusMilestoneControl() {
  const [state, setState] = useState<BonusMilestoneControlState>(EMPTY_STATE);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    setState(await getBonusMilestoneControlState());
  }, []);

  useEffect(() => {
    void reload();
    return watchBonusMilestoneControlState(() => {
      void reload();
    });
  }, [reload]);

  const handleChange = async (completed: boolean) => {
    setState((current) => ({ ...current, completed }));
    setSaving(true);

    try {
      setState(await setActiveBonusMilestoneCompleted(completed));

      // Reuse the existing refresh flow so the signed v3 request sends the
      // self-report and the API returns the season-owned applied bonus points.
      document.querySelector<HTMLButtonElement>(".refresh-button")?.click();
    } finally {
      setSaving(false);
    }
  };

  if (!state.enabled) return null;

  const title = getMessage("facilitatorBonus", "Facilitator Bonus").replace(
    /[:：]\s*$/u,
    "",
  );
  const pointsWord = getMessage("textPoints", "points");
  const reward = `+${state.points} ${pointsWord}`;
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
        onChange={(event) => void handleChange(event.currentTarget.checked)}
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
