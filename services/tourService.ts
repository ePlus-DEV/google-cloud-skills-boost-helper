import introJs from "intro.js";
import "intro.js/introjs.css";

type TourStep = {
  selector: string;
  titleKey: string;
  contentKey: string;
  position: "top" | "bottom" | "left" | "right";
  contentHtml?: (message: (key: string) => string) => string;
};

const ACCOUNT_TOUR_STEPS: TourStep[] = [
  {
    selector: "#add-account-btn",
    titleKey: "tourAddAccountTitle",
    contentKey: "tourAddAccountContent",
    position: "bottom",
  },
  {
    selector: "#accounts-list",
    titleKey: "tourAccountListTitle",
    contentKey: "tourAccountListContent",
    position: "top",
  },
];

const MODAL_TOUR_STEPS: TourStep[] = [
  {
    selector: "#go-to-profile-page-btn",
    titleKey: "tourModalStep1Title",
    contentKey: "tourModalStep1Content",
    position: "bottom",
  },
  {
    selector: "#account-url-input",
    titleKey: "tourModalStep2Title",
    contentKey: "tourModalStep2Content",
    position: "bottom",
    contentHtml: (message) => `${message("tourModalStep2Content")}
      <div class="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <strong>${message("tourModalStep2Tip")}</strong>
      </div>`,
  },
  {
    selector: "#create-account-btn",
    titleKey: "tourModalStep3Title",
    contentKey: "tourModalStep3Content",
    position: "top",
  },
];

function getMessage(key: string, substitutions?: string[]): string {
  try {
    return browser.i18n.getMessage(key, substitutions) || key;
  } catch {
    return key;
  }
}

function getAvailableSteps(steps: TourStep[]) {
  return steps.flatMap((step) => {
    const element = document.querySelector<HTMLElement>(step.selector);
    if (!element || !element.isConnected) return [];

    return [
      {
        element,
        title: getMessage(step.titleKey),
        intro: step.contentHtml
          ? step.contentHtml((key) => getMessage(key))
          : getMessage(step.contentKey),
        position: step.position,
      },
    ];
  });
}

function showCompletionMessage(): void {
  const existing = document.getElementById("tour-completion-message");
  existing?.remove();

  const messageElement = document.createElement("div");
  messageElement.id = "tour-completion-message";
  messageElement.setAttribute("role", "status");
  messageElement.setAttribute("aria-live", "polite");
  messageElement.className =
    "fixed top-4 right-4 z-50 max-w-sm rounded-xl bg-emerald-600 px-5 py-4 text-white shadow-xl";

  const content = document.createElement("div");
  content.className = "flex items-start gap-3";

  const icon = document.createElement("i");
  icon.className = "fa-solid fa-check-circle mt-0.5 text-xl";
  icon.setAttribute("aria-hidden", "true");

  const text = document.createElement("div");
  const title = document.createElement("h4");
  title.className = "font-semibold";
  title.textContent = getMessage("tourCompletedTitle");

  const description = document.createElement("p");
  description.className = "mt-1 text-sm";
  description.textContent = getMessage("tourCompletedContent");

  const close = document.createElement("button");
  close.type = "button";
  close.className = "ml-auto rounded p-1 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white";
  close.setAttribute("aria-label", getMessage("tourCloseButton"));
  close.innerHTML = '<i class="fa-solid fa-times" aria-hidden="true"></i>';
  close.addEventListener("click", () => messageElement.remove());

  text.append(title, description);
  content.append(icon, text, close);
  messageElement.appendChild(content);
  document.body.appendChild(messageElement);

  window.setTimeout(() => messageElement.remove(), 5000);
}

async function markTourCompleted(): Promise<void> {
  try {
    await browser.storage.local.set({ tourCompleted: true });
  } catch (error) {
    console.error("Error marking tour as completed:", error);
  }
}

function startTour(steps: TourStep[], markCompleted: boolean): void {
  const availableSteps = getAvailableSteps(steps);
  if (availableSteps.length === 0) return;

  const tour = introJs.tour();
  let completed = false;

  tour.setOptions({
    steps: availableSteps,
    showProgress: true,
    showBullets: false,
    showStepNumbers: false,
    keyboardNavigation: true,
    exitOnEsc: true,
    exitOnOverlayClick: false,
    scrollToElement: true,
    scrollPadding: 24,
    disableInteraction: false,
    tooltipClass: "eplus-guided-tour",
    highlightClass: "eplus-guided-tour-highlight",
    nextLabel: getMessage("tourButtonNext"),
    prevLabel: getMessage("tourButtonPrevious"),
    skipLabel: getMessage("tourButtonSkip"),
    doneLabel: getMessage("tourButtonComplete"),
  });

  tour.onbeforechange((targetElement) => {
    targetElement?.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  tour.oncomplete(() => {
    completed = true;
    showCompletionMessage();
    if (markCompleted) void markTourCompleted();
  });

  tour.onexit(() => {
    if (!completed && markCompleted) void markTourCompleted();
  });

  void tour.start();
}

const TourService = {
  getMessage,

  startAccountCreationTour(): void {
    startTour(ACCOUNT_TOUR_STEPS, true);
  },

  startModalTour(): void {
    window.setTimeout(() => startTour(MODAL_TOUR_STEPS, false), 300);
  },

  async shouldShowTour(): Promise<boolean> {
    try {
      const result = await browser.storage.local.get(["tourCompleted"]);
      return !result.tourCompleted;
    } catch (error) {
      console.error("Error checking tour status:", error);
      return false;
    }
  },

  markTourCompleted,

  async resetTourStatus(): Promise<void> {
    try {
      await browser.storage.local.remove(["tourCompleted"]);
    } catch (error) {
      console.error("Error resetting tour status:", error);
    }
  },
};

export default TourService;
