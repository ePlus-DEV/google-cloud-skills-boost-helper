import AccountService from "./accountService";
import { canonicalizeProfileUrl, extractProfileId } from "../utils/profileUrl";

const STORAGE_PREFIX = "local:facilitatorBonusMilestone";
const CONTROL_ID = "facilitator-bonus-milestone-control";

type FacilitatorScoringContext = {
  participating: boolean;
  bonusMilestoneCompleted: boolean;
};

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

/**
 * Resolve the score context for the account matching a requested profile URL.
 * This works for active-account refreshes and for updating a non-active account
 * from the options page. Tests/background startup may not expose WXT storage yet,
 * so unavailable account state safely falls back to no Facilitator bonus.
 */
export async function getFacilitatorScoringContext(
  profileUrl: string,
): Promise<FacilitatorScoringContext> {
  try {
    const canonical = canonicalizeProfileUrl(profileUrl) || profileUrl;
    const account = await AccountService.isAccountExists(canonical);
    const participating = Boolean(account?.facilitatorProgram);
    const bonusMilestoneCompleted = participating
      ? await isBonusMilestoneCompleted(canonical)
      : false;

    return { participating, bonusMilestoneCompleted };
  } catch {
    return { participating: false, bonusMilestoneCompleted: false };
  }
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
          <small class="block text-emerald-300/70 text-xs">+10</small>
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

      // Reuse the existing refresh flow so the signed API recalculates the total
      // immediately instead of maintaining a second scoring implementation here.
      const refreshButton =
        document.querySelector<HTMLButtonElement>(".refresh-button");
      refreshButton?.click();
    });
  }

  const checkbox = control.querySelector<HTMLInputElement>(
    'input[type="checkbox"]',
  );
  if (!checkbox) return;

  const participating = Boolean(activeAccount?.facilitatorProgram);
  checkbox.disabled = !participating;
  control.classList.toggle("opacity-50", !participating);
  control.classList.toggle("cursor-not-allowed", !participating);

  checkbox.checked =
    participating && Boolean(activeAccount?.profileUrl)
      ? await isBonusMilestoneCompleted(activeAccount?.profileUrl || "")
      : false;
}

/** Install the popup-only control without affecting background/options pages. */
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
