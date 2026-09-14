import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { createPortal } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { browser } from "wxt/browser";
import {
  getBonusMilestoneControlState,
  setActiveBonusMilestoneCompleted,
  watchBonusMilestoneControlState,
  type BonusMilestoneControlState,
} from "../services/bonusMilestoneService";

const CLAIM_BONUS_POINTS = 10;
const OFFICIAL_BONUS_MILESTONE_URL =
  "https://rsvp.withgoogle.com/events/arcade-facilitator/bonus-milestone";

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

type BonusMilestoneInfoProps = {
  completed: boolean;
};

/** Read one localized browser-extension message from public/_locales. */
function getMessage(key: string): string {
  try {
    return browser.i18n.getMessage(key as never) || "";
  } catch {
    return "";
  }
}

/** Format point values without unnecessary trailing decimals. */
function formatPoints(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/** Return the self-reported Bonus Milestone amount currently applied. */
function renderedManualBonus(state: BonusMilestoneControlState): number {
  if (!state.completed) return 0;
  return state.appliedPoints > 0 ? state.appliedPoints : CLAIM_BONUS_POINTS;
}

/** Parse a rendered point total into a safe numeric value. */
function parseDisplayedTotal(value: string | null | undefined): number {
  if (!value) return 0;
  const normalized = value.replace(/\s/gu, "").replace(/,/gu, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
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

/** Render the self-report disclaimer and the official task link before confirmation. */
function BonusMilestoneInfo({ completed }: BonusMilestoneInfoProps) {
  return (
    <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-300/20 bg-amber-400/10 px-3 py-2 text-[11px] leading-4 text-amber-100/90">
      <i
        className="fa-solid fa-circle-info mt-0.5 shrink-0"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p>{getMessage("bonusMilestoneDisclaimer")}</p>
        {!completed && (
          <a
            href={OFFICIAL_BONUS_MILESTONE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 font-semibold text-amber-200 underline decoration-amber-300/50 underline-offset-2 transition-colors hover:text-white"
          >
            <span>{getMessage("bonusMilestoneOfficialPage")}</span>
            <i
              className="fa-solid fa-arrow-up-right-from-square text-[10px]"
              aria-hidden="true"
            />
          </a>
        )}
      </div>
    </div>
  );
}

/** Render the profile/period-scoped Bonus Milestone confirmation from the top bonus chip. */
function BonusMilestoneControl() {
  const [state, setState] = useState<BonusMilestoneControlState>(EMPTY_STATE);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmedCheckbox, setConfirmedCheckbox] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
    function keepMainTotalInSync() {
      syncDisplayedTotal(state);
    },
    [state],
  );

  const manualBonus = renderedManualBonus(state);
  const canConfirm = state.participating && state.enabled && state.points > 0;

  const chipLabel = useMemo(() => {
    if (!state.participating || !state.enabled || state.points <= 0) {
      return "+0";
    }
    if (state.completed) {
      return `✓ +${formatPoints(manualBonus)}`;
    }
    return getMessage("bonusMilestoneClaim");
  }, [
    manualBonus,
    state.completed,
    state.enabled,
    state.participating,
    state.points,
  ]);

  const chipTitle = state.completed
    ? getMessage("bonusMilestoneAppliedTooltip")
    : getMessage("bonusMilestoneClaimTooltip");

  const openDialog = useCallback(() => {
    if (!canConfirm || saving) return;
    setConfirmedCheckbox(false);
    setErrorMessage("");
    setDialogOpen(true);
  }, [canConfirm, saving]);

  const persist = useCallback(async function persistBonusMilestoneChange(
    nextCompleted: boolean,
  ) {
    setSaving(true);
    setErrorMessage("");

    try {
      const nextState = await setActiveBonusMilestoneCompleted(nextCompleted);
      setState({
        ...nextState,
        completed: nextCompleted,
        appliedPoints:
          nextCompleted && nextState.appliedPoints <= 0
            ? CLAIM_BONUS_POINTS
            : nextState.appliedPoints,
      });
      setDialogOpen(false);
      setConfirmedCheckbox(false);

      // Existing refresh flow signs the v3 payload using the persisted
      // profile/period confirmation and lets Hub return the real point value.
      document.querySelector<HTMLButtonElement>(".refresh-button")?.click();
    } catch {
      setErrorMessage(getMessage("bonusMilestoneError"));
    } finally {
      setSaving(false);
    }
  }, []);

  const handleCheckboxChange = useCallback(function handleCheckboxEvent(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setConfirmedCheckbox(event.currentTarget.checked);
  }, []);

  return (
    <>
      <button
        type="button"
        className="appearance-none border-0 bg-transparent p-0 text-inherit font-inherit font-bold whitespace-nowrap disabled:cursor-default"
        title={canConfirm ? chipTitle : undefined}
        aria-label={canConfirm ? chipTitle : chipLabel}
        disabled={!canConfirm || saving}
        onClick={openDialog}
      >
        {saving ? getMessage("bonusMilestoneUpdating") : chipLabel}
      </button>

      {dialogOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !saving) {
                setDialogOpen(false);
              }
            }}
          >
            <div
              className="w-full max-w-[340px] rounded-2xl border border-white/15 bg-slate-900 p-4 text-white shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="bonus-milestone-dialog-title"
            >
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-lg text-white shadow-lg">
                <i
                  className={`fa-solid ${
                    state.completed ? "fa-circle-check" : "fa-gift"
                  }`}
                  aria-hidden="true"
                />
              </div>

              <h2
                id="bonus-milestone-dialog-title"
                className="text-center text-base font-bold text-white"
              >
                {getMessage(
                  state.completed
                    ? "bonusMilestoneConfirmedTitle"
                    : "bonusMilestoneConfirmTitle",
                )}
              </h2>
              <p className="mt-2 text-center text-xs leading-5 text-white/70">
                {getMessage(
                  state.completed
                    ? "bonusMilestoneConfirmedMessage"
                    : "bonusMilestoneConfirmMessage",
                )}
              </p>

              <BonusMilestoneInfo completed={state.completed} />

              {!state.completed && (
                <label className="mt-4 flex cursor-pointer items-start gap-2 rounded-xl border border-yellow-300/20 bg-yellow-400/10 p-3 text-xs leading-5 text-white/85">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 shrink-0 accent-orange-500"
                    checked={confirmedCheckbox}
                    disabled={saving}
                    onChange={handleCheckboxChange}
                  />
                  <span>{getMessage("bonusMilestoneConfirmCheckbox")}</span>
                </label>
              )}

              {errorMessage && (
                <p className="mt-3 text-center text-xs text-rose-300">
                  {errorMessage}
                </p>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white/90 transition-colors hover:bg-white/15 disabled:opacity-50"
                  disabled={saving}
                  onClick={() => setDialogOpen(false)}
                >
                  {getMessage("cancelButton")}
                </button>

                {state.completed ? (
                  <button
                    type="button"
                    className="flex-1 rounded-lg bg-gradient-to-r from-rose-500 to-red-500 px-3 py-2 text-xs font-bold text-white transition-transform hover:scale-[1.02] disabled:opacity-50"
                    disabled={saving}
                    onClick={() => {
                      persist(false).catch(() => null);
                    }}
                  >
                    {saving
                      ? getMessage("bonusMilestoneUpdating")
                      : getMessage("bonusMilestoneUndo")}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="flex-1 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-2 text-xs font-bold text-white transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!confirmedCheckbox || saving}
                    onClick={() => {
                      persist(true).catch(() => null);
                    }}
                  >
                    {saving
                      ? getMessage("bonusMilestoneUpdating")
                      : getMessage("bonusMilestoneConfirmButton")}
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

let root: Root | null = null;
let host: HTMLElement | null = null;

/** Mount the control directly into the existing yellow bonus chip beside Arcade Points. */
export function mountBonusMilestoneControl(): void {
  const nextHost = document.getElementById("arcade-facilitator-points");
  if (!nextHost) return;

  if (host !== nextHost) {
    root?.unmount();
    host = nextHost;
    host.classList.add("cursor-pointer", "select-none", "transition-transform");
    root = createRoot(host);
  }

  root?.render(<BonusMilestoneControl />);
}
