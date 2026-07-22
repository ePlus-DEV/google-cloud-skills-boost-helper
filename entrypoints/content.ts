import LabService from "../services/labService";
import ProfileService from "../services/profileService";
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
    "https://www.skills.google/games/*/labs/*",
    "https://www.skills.google/course_templates/*/labs/*",
    "https://www.skills.google/focuses/*",
    "https://www.skills.google/my_account/profile*",
    "https://www.skills.google/paths/*/course_templates/*/labs/*",
  ],
  cssInjectionMode: "ui",

  async main(ctx) {
    const { pathname } = window.location;

    UIComponents.createFloatingBackToTop();

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
        // Button check scores element
        // const gamesLabsElement = document.querySelector(".games-labs");

        // const totalScoreElement = document.querySelector(
        //   "#main-wrapper > div.lab-assessment__tab.js-open-lab-assessment-panel",
        // );
        // if (totalScoreElement) {
        //   // logic xóa style display none của totalScoreElement
        //   totalScoreElement.style.display = "block";
        // }

        // Handle profile page functionality
        if (pathname === "/my_account/profile") {
          ProfileService.initialize();
        }
      },
    });
    ui.mount();
  },
});
