import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { createPortal } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import {
  getBonusMilestoneControlState,
  setActiveBonusMilestoneCompleted,
  watchBonusMilestoneControlState,
  type BonusMilestoneControlState,
} from "../services/bonusMilestoneService";
import {
  getBonusMilestoneCancelLabel,
  getBonusMilestoneMessage,
} from "../services/bonusMilestoneI18n";

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
  const totalFacilitatorBonus = state.milestoneBonusPoints + manualBonus;
  const canConfirm = state.participating && state.enabled && state.points > 0;
  const pointsLabel = formatPoints(state.points);

  const chipLabel = useMemo(() => {
    if (!state.participating) return "+0";
    if (!state.enabled || state.points <= 0) {
      return `+${formatPoints(state.milestoneBonusPoints)}`;
    }
    if (state.completed) {
      return `✓ +${formatPoints(totalFacilitatorBonus)}`;
    }

    const claim = getBonusMilestoneMessage("claim", pointsLabel);
    return state.milestoneBonusPoints > 0
      ? `+${formatPoints(state.milestoneBonusPoints)} · ${claim}`
      : claim;
  }, [pointsLabel, state, totalFacilitatorBonus]);

  const chipTitle = state.completed
    ? getBonusMilestoneMessage("appliedTooltip", formatPoints(manualBonus))
    : getBonusMilestoneMessage("claimTooltip", pointsLabel);

  const openDialog = useCallback(() => {
    if (!canConfirm || saving) return;
    setConfirmedCheckbox(false);
    setErrorMessage("");
    setDialogOpen(true);
  }, [canConfirm, saving]);

  const persist = useCallback(
    async function persistBonusMilestoneChange(nextCompleted: boolean) {
      setSaving(true);
      setErrorMessage("");

      try {
        const nextState = await setActiveBonusMilestoneCompleted(nextCompleted);
        setState({
          ...nextState,
          completed: nextCompleted,
          appliedPoints:
            nextCompleted && nextState.appliedPoints <= 0
              ? nextState.points
              : nextState.appliedPoints,
        });
        setDialogOpen(false);
        setConfirmedCheckbox(false);

        // Existing refresh flow signs the v3 payload using the persisted
        // profile/period confirmation and lets Hub return the real point value.
        document.querySelector<HTMLButtonElement>(".refresh-button")?.click();
      } catch {
        setErrorMessage(getBonusMilestoneMessage("error", pointsLabel));
      } finally {
        setSaving(false);
      }
    },
    [pointsLabel],
  );

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
        {saving ? getBonusMilestoneMessage("updating", pointsLabel) : chipLabel}
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
                {getBonusMilestoneMessage(
                  state.completed ? "confirmedTitle" : "confirmTitle",
                  pointsLabel,
                )}
              </h2>
              <p className="mt-2 text-center text-xs leading-5 text-white/70">
                {getBonusMilestoneMessage(
                  state.completed ? "confirmedMessage" : "confirmMessage",
                  state.completed ? formatPoints(manualBonus) : pointsLabel,
                )}
              </p>

              {!state.completed && (
                <label className="mt-4 flex cursor-pointer items-start gap-2 rounded-xl border border-yellow-300/20 bg-yellow-400/10 p-3 text-xs leading-5 text-white/85">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 shrink-0 accent-orange-500"
                    checked={confirmedCheckbox}
                    disabled={saving}
                    onChange={handleCheckboxChange}
                  />
                  <span>
                    {getBonusMilestoneMessage("confirmCheckbox", pointsLabel)}
                  </span>
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
                  {getBonusMilestoneCancelLabel()}
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
                      ? getBonusMilestoneMessage("updating", pointsLabel)
                      : getBonusMilestoneMessage("removeButton", pointsLabel)}
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
                      ? getBonusMilestoneMessage("updating", pointsLabel)
                      : getBonusMilestoneMessage("confirmButton", pointsLabel)}
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
