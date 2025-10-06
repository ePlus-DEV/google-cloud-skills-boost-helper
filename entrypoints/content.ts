import { LabService, ProfileService } from "../services";
import UIComponents from "../components/uiComponents";
// Import styles for content script so wxt emits content-scripts/content.css
import "../assets/tailwind.css";

// Extend Window interface for custom properties
declare global {
  interface Window {
    UIComponentsSearchGoogle: () => void;
    UIComponentsSearchYouTube: () => void;
  }
}

// Expose UIComponents search functions globally for onclick handlers
window.UIComponentsSearchGoogle = () => UIComponents.searchOnGoogle();
window.UIComponentsSearchYouTube = () => UIComponents.searchOnYouTube();

export default defineContentScript({
  matches: [
    "https://www.cloudskillsboost.google/games/*/labs/*",
    "https://www.cloudskillsboost.google/course_templates/*/labs/*",
    "https://www.cloudskillsboost.google/focuses/*",
    "https://www.cloudskillsboost.google/my_account/profile*",
    "https://www.cloudskillsboost.google/paths/*/course_templates/*/labs/*",
  ],
  cssInjectionMode: "ui",

  async main(ctx) {
    const { pathname } = window.location;

    // Handle lab pages
    if (LabService.isLabPage()) {
      await LabService.processLabPage();
    }

    const ui = await createShadowRootUi(ctx, {
      name: "tailwind-extension",
      position: "inline",
      anchor: "body",
      onMount() {
        document.querySelector(".js-lab-leaderboard")?.remove();

        const gamesLabsElement = document.querySelector(".games-labs");
        if (gamesLabsElement) {
          gamesLabsElement.className =
            "lab-show l-full no-nav application-new lab-show l-full no-nav";
        }

        // Handle profile page functionality
        if (pathname === "/my_account/profile") {
          ProfileService.initialize();
        }
      },
    });
    ui.mount();
  },
});
