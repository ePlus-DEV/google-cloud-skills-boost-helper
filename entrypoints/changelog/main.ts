import MarkdownService from "../../services/markdownService";
import { MARKDOWN_CONFIG } from "../../utils/config";

// Use the single configured CHANGELOG_URL (remote gist). No local fallback.
const CHANGELOG_URL = MARKDOWN_CONFIG.CHANGELOG_URL;

// Determine which container ID actually exists on the page. Prefer configured ID
const preferredId = MARKDOWN_CONFIG.DEFAULT_CONTAINER_ID;
const containerId =
  preferredId && document.getElementById(preferredId)
    ? preferredId
    : "changelog-content";

async function loadChangelog() {
  const success = await MarkdownService.renderUrlToContainer(
    CHANGELOG_URL,
    containerId,
    ".markdown-content"
  );

  if (!success) {
    const container = document.getElementById(containerId);
    if (container)
      container.innerHTML =
        '<p class="text-sm text-red-600">Unable to load changelog.</p>';
  }
}

// Wire up UI controls: back and settings
function getQueryParam(name: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

const backButton = document.getElementById("back-button");
const settingsButton = document.getElementById("settings-button");
const settingsHeroButton = document.getElementById("settings-button-hero");
const versionBadge = document.getElementById("version-number");

if (versionBadge) {
  const version = getQueryParam("version");
  versionBadge.textContent = version ? `v${version}` : "";
}

// Localize static UI texts if browser.i18n is available
try {
  if (typeof browser !== "undefined" && browser.i18n) {
    const backEl = document.getElementById("back-button");
    const settingsEl = document.getElementById("settings-button");
    const heroEl = document.getElementById("settings-button-hero");

    if (backEl)
      backEl.textContent =
        browser.i18n.getMessage("labelBack") || backEl.textContent;
    if (settingsEl)
      settingsEl.textContent =
        browser.i18n.getMessage("labelSettings") || settingsEl.textContent;
    if (heroEl)
      heroEl.querySelectorAll("span")[0].textContent =
        browser.i18n.getMessage("labelReturnToSettings") || heroEl.textContent;
  }
} catch (err) {
  console.debug("changelog: i18n load failed", err);
}

if (backButton) {
  backButton.addEventListener("click", () => {
    // Always open options in a new tab (user requested)
    try {
      const url =
        typeof browser !== "undefined" &&
        browser.runtime &&
        browser.runtime.getURL
          ? browser.runtime.getURL("/options.html")
          : "/options.html";
      window.open(url, "_blank");
    } catch (err) {
      console.debug("changelog: open options in new tab failed", err);
      // Fallback: navigate in current tab
      window.location.href = "/options.html";
    }
  });
}

if (settingsButton) {
  settingsButton.addEventListener("click", () => {
    try {
      const url =
        typeof browser !== "undefined" &&
        browser.runtime &&
        browser.runtime.getURL
          ? browser.runtime.getURL("/options.html")
          : "/options.html";
      window.open(url, "_blank");
    } catch (err) {
      console.debug("changelog: open options in new tab failed", err);
      window.location.href = "/options.html";
    }
  });
}

if (settingsHeroButton) {
  settingsHeroButton.addEventListener("click", () => {
    try {
      const url =
        typeof browser !== "undefined" &&
        browser.runtime &&
        browser.runtime.getURL
          ? browser.runtime.getURL("/options.html")
          : "/options.html";
      window.open(url, "_blank");
    } catch (err) {
      console.debug("changelog: open options in new tab failed", err);
      window.location.href = "/options.html";
    }
  });
}

loadChangelog();
