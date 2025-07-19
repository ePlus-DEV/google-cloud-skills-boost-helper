import {
  LabService,
  ProfileService,
  ProfileDetectionService,
} from "../services";

export default defineContentScript({
  matches: [
    "https://www.cloudskillsboost.google/games/*/labs/*",
    "https://www.cloudskillsboost.google/course_templates/*/labs/*",
    "https://www.cloudskillsboost.google/focuses/*",
    "https://www.cloudskillsboost.google/my_account/profile*",
  ],
  cssInjectionMode: "ui",

  async main(ctx) {
    const { pathname, hash } = window.location;

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

        // Initialize profile detection for arcade data scraping
        ProfileDetectionService.initialize();
      },
    });
    ui.mount();
  },
});
