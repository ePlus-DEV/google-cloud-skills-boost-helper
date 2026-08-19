import { mountBonusMilestoneControl } from "../../components/BonusMilestoneControl";

/** Mount the Bonus Milestone React control after the popup DOM is available. */
function initializeBonusMilestoneControl(): void {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountBonusMilestoneControl, {
      once: true,
    });
    return;
  }

  mountBonusMilestoneControl();
}

initializeBonusMilestoneControl();
