import type { ArcadeData } from "../types";
import { canonicalizeProfileUrl, extractProfileId } from "../utils/profileUrl";
import AccountService from "./accountService";

const STORAGE_PREFIX = "local:facilitatorBonusMilestone";
const CONTROL_ID = "facilitator-bonus-milestone-control";
export const DEFAULT_BONUS_MILESTONE_POINTS = 10;

function storageKey(profileUrl: string): `local:${string}` {
  const canonical = canonicalizeProfileUrl(profileUrl) || profileUrl.trim();
  const profileId = extractProfileId(canonical);
  const identity = profileId || encodeURIComponent(canonical.toLowerCase());
  return `${STORAGE_PREFIX}:${identity}` as `local:${string}`;
}

export async function isBonusMilestoneCompleted(
  profileUrl: string,
): Promise<boolean> {
  if (!profileUrl) return false;
  try {
    return Boolean(await storage.getItem<boolean>(storageKey(profileUrl)));
  } catch {
    return false;
  }
}

export async function setBonusMilestoneCompleted(
  profileUrl: string,
  completed: boolean,
): Promise<void> {
  if (!profileUrl) return;
  await storage.setItem(storageKey(profileUrl), Boolean(completed));
}

/** Read the API-owned Bonus Milestone amount, with +10 only for old responses. */
export function getBonusMilestoneAvailablePoints(
  arcadeData?: ArcadeData | null,
): number {
  const value = Number(arcadeData?.facilitator?.bonusMilestoneAvailablePoints);
  return Number.isFinite(value) && value >= 0
    ? value
    : DEFAULT_BONUS_MILESTONE_POINTS;
}

/** Old API responses did not expose availability, so keep the current control visible. */
export function isBonusMilestoneEnabled(
  arcadeData?: ArcadeData | null,
): boolean {
  const value = arcadeData?.facilitator?.bonusMilestoneEnabled;
  return typeof value === "boolean" ? value : true;
}

async function syncPopupControl(): Promise<void> {
  if (typeof document === "undefined") return;
  const section = document.getElementById("milestones-section");
  if (!section) return;

  const activeAccount = await AccountService.getActiveAccount();
  let control = document.getElementById(CONTROL_ID) as HTMLLabelElement | null;

  if (!control) {
    control = document.createElement("label");
    control.id = CONTROL_ID;
    control.className =
      "flex items-center justify-between gap-3 bg-emerald-500/10 backdrop-blur-md rounded-lg p-3 mb-3 border border-emerald-400/30 cursor-pointer";
    control.innerHTML = `
      <span class="flex items-center min-w-0">
        <i class="fa-solid fa-circle-check text-emerald-400 text-lg mr-2"></i>
        <span class="min-w-0">
          <strong class="block text-white text-sm">Bonus Milestone</strong>
          <small class="block text-emerald-300/70 text-xs bonus-milestone-points">+10</small>
        </span>
      </span>
      <input type="checkbox" class="h-5 w-5 accent-emerald-500" aria-label="Bonus Milestone +10" />
    `;

    const milestoneGrid =
      section.querySelector(".milestone-card")?.parentElement;
    if (milestoneGrid) milestoneGrid.before(control);
    else section.appendChild(control);

    const checkbox = control.querySelector<HTMLInputElement>(
      'input[type="checkbox"]',
    );
    checkbox?.addEventListener("change", async () => {
      const current = await AccountService.getActiveAccount();
      if (!current?.profileUrl || !checkbox) return;

      await setBonusMilestoneCompleted(current.profileUrl, checkbox.checked);

      // The API owns season availability and point values. Reuse the normal
      // refresh flow so the signed request sends only the self-report flag and
      // faciCounts.bonusMilestonePoints comes back from the API response.
      const refreshButton =
        document.querySelector<HTMLButtonElement>(".refresh-button");
      if (refreshButton) refreshButton.click();
      else await syncPopupControl();
    });
  }

  const checkbox = control.querySelector<HTMLInputElement>(
    'input[type="checkbox"]',
  );
  if (!checkbox) return;

  const enabled = isBonusMilestoneEnabled(activeAccount?.arcadeData);
  const points = getBonusMilestoneAvailablePoints(activeAccount?.arcadeData);
  const pointsLabel = control.querySelector<HTMLElement>(
    ".bonus-milestone-points",
  );
  if (pointsLabel) pointsLabel.textContent = `+${points}`;
  checkbox.setAttribute("aria-label", `Bonus Milestone +${points}`);

  const participating = Boolean(activeAccount?.facilitatorProgram);
  const completed =
    participating && enabled && Boolean(activeAccount?.profileUrl)
      ? await isBonusMilestoneCompleted(activeAccount?.profileUrl || "")
      : false;

  control.hidden = !enabled;
  checkbox.disabled = !participating || !enabled;
  checkbox.checked = completed;
  control.classList.toggle("opacity-50", !participating);
  control.classList.toggle("cursor-not-allowed", !participating || !enabled);
}

/** Install the popup-only self-confirmation control. */
export function initializeBonusMilestoneControl(): void {
  if (typeof document === "undefined") return;

  const install = () => {
    if (!document.getElementById("popup-content")) return;
    void syncPopupControl();

    const observer = new MutationObserver(() => {
      void syncPopupControl();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }
}

initializeBonusMilestoneControl();
