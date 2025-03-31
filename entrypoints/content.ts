import type { ContentScriptContext } from "wxt/client";
import "~/assets/tailwind.css";

export default defineContentScript({
  matches: ["https://www.cloudskillsboost.google/games/*/labs/*"],
  cssInjectionMode: "ui",

  async main(ctx) {
    const ui = await createUi(ctx);
    ui.mount();
  },
});

function createUi(ctx: ContentScriptContext) {
  return createShadowRootUi(ctx, {
    name: "tailwind-shadow-root-example",
    position: "inline",
    anchor: "body",
    onMount: () => {
      const removeLeaderboard = document.querySelector(".js-lab-leaderboard");
      const showScore = document.querySelector(".games-labs");
      if (removeLeaderboard) {
        removeLeaderboard.remove();
      }
      if (showScore) {
        showScore.className =
          "lab-show l-full no-nav application-new lab-show l-full no-nav";
      }
    },
  });
}
