import type { ContentScriptContext } from "wxt/client";

export default defineContentScript({
  matches: [
    "https://www.cloudskillsboost.google/games/*/labs/*",
    "https://www.cloudskillsboost.google/my_account/profile*",
  ],
  cssInjectionMode: "ui",

  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: "tailwind-shadow-root-example",
      position: "inline",
      anchor: "body",
      onMount() {
        document.querySelector(".js-lab-leaderboard")?.remove();

        const gamesLabsElement = document.querySelector(".games-labs");
        if (gamesLabsElement) {
          gamesLabsElement.className =
            "lab-show l-full no-nav application-new lab-show l-full no-nav";
        }

        if (
          window.location.hash === "#public-profile" &&
          window.location.pathname === "/my_account/profile"
        ) {
          const publicProfileElement =
            document.querySelector("#public-profile");
          publicProfileElement?.scrollIntoView({ behavior: "smooth" });

          const publicProfileChecked = document.querySelector<HTMLInputElement>(
            "#public_profile_checked",
          );
          if (publicProfileChecked && !publicProfileChecked.checked) {
            publicProfileChecked.checked = true;

            const updateSettingsButton = document.querySelector<HTMLElement>(
              'ql-button[type="submit"][name="commit"][data-disable-with="Update settings"]',
            );
            updateSettingsButton?.setAttribute(
              "title",
              "Click to update your settings",
            );

            const saveNotification = document.createElement("div");
            Object.assign(saveNotification.style, {
              position: "fixed",
              bottom: "10px",
              right: "10px",
              backgroundColor: "#f8d7da",
              color: "#721c24",
              padding: "10px",
              border: "1px solid #f5c6cb",
              borderRadius: "5px",
              zIndex: "1000",
            });
            saveNotification.textContent =
              "Please click the 'Update settings' button above.";
            document.body.appendChild(saveNotification);
          }
        }
      },
    });
    ui.mount();
  },
});
