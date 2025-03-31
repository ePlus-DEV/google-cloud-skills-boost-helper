import type { ContentScriptContext } from "wxt/client";

export default defineContentScript({
  matches: [
    "https://www.cloudskillsboost.google/games/*/labs/*",
    "https://www.cloudskillsboost.google/my_account/profile*",
  ],
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
    onMount: handleUiMount,
  });
}

function handleUiMount() {
  removeElement(".js-lab-leaderboard");
  updateClassName(
    ".games-labs",
    "lab-show l-full no-nav application-new lab-show l-full no-nav"
  );

  if (isPublicProfilePage()) {
    scrollToElement("#public-profile");
    handlePublicProfileSettings();
  }
}

function removeElement(selector: string) {
  const element = document.querySelector(selector);
  element?.remove();
}

function updateClassName(selector: string, className: string) {
  const element = document.querySelector(selector);
  if (element) {
    element.className = className;
  }
}

function isPublicProfilePage() {
  return (
    window.location.hash === "#public-profile" &&
    window.location.pathname === "/my_account/profile"
  );
}

function scrollToElement(selector: string) {
  const element = document.querySelector(selector);
  element?.scrollIntoView({ behavior: "smooth" });
}

function handlePublicProfileSettings() {
  const publicProfileChecked = document.querySelector<HTMLInputElement>(
    "#public_profile_checked"
  );
  if (publicProfileChecked && !publicProfileChecked.checked) {
    publicProfileChecked.checked = true;
    addTooltipToUpdateButton();
    displaySaveNotification();
  }
}

function addTooltipToUpdateButton() {
  const updateSettingsButton = document.querySelector<HTMLElement>(
    'ql-button[type="submit"][name="commit"][data-disable-with="Update settings"]'
  );
  updateSettingsButton?.setAttribute("title", "Click to update your settings");
}

/**
 * Displays a notification on the screen to remind the user to click the 'Update settings' button.
 * 
 * The notification is styled as a fixed-position element at the bottom-right corner of the screen
 * with a red background and a message indicating the required action.
 * 
 * Styling details:
 * - Positioned at the bottom-right corner of the viewport.
 * - Styled with a red background (#f8d7da) and red border (#f5c6cb).
 * - Text color is dark red (#721c24).
 * - Includes padding, border radius, and a high z-index for visibility.
 * 
 * The notification is appended to the `document.body`.
 */
function displaySaveNotification() {
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
