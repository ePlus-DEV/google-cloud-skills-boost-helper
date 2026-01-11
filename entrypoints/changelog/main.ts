import MarkdownService from "../../services/markdownService";
import { MARKDOWN_CONFIG } from "../../utils/config";
import { isFirefox } from "../../services/browserService";

// Use the single configured CHANGELOG_URL (remote gist). No local fallback.
const CHANGELOG_URL = MARKDOWN_CONFIG.CHANGELOG_URL;

// Determine which container ID actually exists on the page. Prefer configured ID
const preferredId = MARKDOWN_CONFIG.DEFAULT_CONTAINER_ID;
const containerId =
  preferredId && document.getElementById(preferredId)
    ? preferredId
    : "changelog-content";

// Function to add IDs to headings and make them scrollable
function addHeadingIds() {
  const markdownContent = document.querySelector(".markdown-content");
  if (!markdownContent) return;

  // Get all h2 and h3 headings
  const headings = markdownContent.querySelectorAll("h2, h3");

  headings.forEach((heading) => {
    // Create ID from heading text
    const text = heading.textContent || "";
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Extract version number from heading (e.g., "Version 1.2.5" -> "1.2.5")
    const versionMatch = text.match(/version\s+([\d.]+)/i);
    const versionNumber = versionMatch ? versionMatch[1] : null;

    // Set the ID
    heading.id = id;

    // Add anchor link icon
    const headingElement = heading as HTMLElement;
    headingElement.style.cursor = "pointer";
    headingElement.style.position = "relative";
    headingElement.style.scrollMarginTop = "100px"; // Offset for fixed headers

    // Add click handler for copying link
    heading.addEventListener("click", () => {
      const url = new URL(window.location.href);

      // If this is a version heading, update the version parameter
      if (versionNumber) {
        url.searchParams.set("version", versionNumber);
        url.searchParams.set("scroll", versionNumber);
      } else {
        // For non-version headings, just set scroll
        url.searchParams.set("scroll", id);
      }

      window.history.pushState({}, "", url.toString());

      // ScroElementll to element smoothly
      heading.scrollIntoView({ behavior: "smooth", block: "start" });

      // Optional: Copy link to clipboard
      navigator.clipboard
        .writeText(url.toString())
        .then(() => {
          // Show a brief tooltip/notification
          const tooltip = document.createElement("span");
          tooltip.textContent = "📋 Link copied!";
          tooltip.style.cssText = `
            position: absolute;
            left: -10px;
            top: 50%;
            transform: translateY(-50%);
            background: #10b981;
            color: white;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap;
            z-index: 1000;
            animation: fadeOut 2s ease-out forwards;
          `;
          heading.appendChild(tooltip);

          setTimeout(() => {
            tooltip.remove();
          }, 2000);
        })
        .catch((err) => console.debug("Copy failed:", err));
    });

    // Add hover effect to show it's clickable
    heading.addEventListener("mouseenter", () => {
      // Add a link icon on hover
      const linkIcon = document.createElement("span");
      linkIcon.className = "heading-link-icon";
      linkIcon.innerHTML = ' <i class="fa-solid fa-link"></i>';
      linkIcon.style.cssText = `
        color: #6366f1;
        font-size: 0.7em;
        margin-left: 8px;
        opacity: 0;
        transition: opacity 0.2s;
      `;
      heading.appendChild(linkIcon);

      setTimeout(() => {
        linkIcon.style.opacity = "0.6";
      }, 10);
    });

    heading.addEventListener("mouseleave", () => {
      const icon = heading.querySelector(".heading-link-icon");
      if (icon) icon.remove();
    });
  });

  // Auto-scroll to the current version if specified in URL
  const versionParam = getQueryParam("version");
  const scrollParam = getQueryParam("scroll");

  if (scrollParam) {
    // If scroll parameter exists, scroll to that ID
    setTimeout(() => {
      const target = document.getElementById(scrollParam);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 500);
  } else if (versionParam) {
    // If version parameter exists (e.g., from update), scroll to that version
    setTimeout(() => {
      // Try to find heading with this version number
      const versionId = `version-${versionParam.replace(/\./g, "-")}`;
      let target = document.getElementById(versionId);

      // If not found, try alternative formats
      if (!target) {
        const alternativeId = `version-${versionParam.replace(/\./g, "")}`;
        target = document.getElementById(alternativeId);
      }

      // If still not found, search through all headings
      if (!target) {
        const allHeadings = markdownContent.querySelectorAll("h2, h3");
        for (const h of allHeadings) {
          const text = h.textContent || "";
          if (text.includes(versionParam)) {
            target = h as HTMLElement;
            break;
          }
        }
      }

      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 500);
  }

  // Also support hash for backward compatibility
  if (!scrollParam && !versionParam && window.location.hash) {
    setTimeout(() => {
      const targetId = window.location.hash.substring(1);
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 500);
  }
}

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
  } else {
    // Add IDs to headings after content is loaded
    setTimeout(() => {
      addHeadingIds();
    }, 100);
  }
}

// Wire up UI controls: back and settings
function getQueryParam(name: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

const backButton = document.getElementById("back-button");
const versionBadge = document.getElementById("version-number");

// Get version from query param and update badge + title
const versionParam = getQueryParam("version");
if (versionParam) {
  // Update version badge
  if (versionBadge) {
    versionBadge.textContent = `v${versionParam}`;
  }

  // Update page title
  try {
    document.title = `Changelog - v${versionParam}`;
  } catch (err) {
    console.debug("changelog: set title failed", err);
  }
} else {
  // Clear version badge if no version param
  if (versionBadge) {
    versionBadge.textContent = "";
  }
}

// Localize static UI texts if browser.i18n is available
try {
  if (typeof browser !== "undefined" && browser.i18n) {
    const backEl = document.getElementById("back-button");

    if (backEl) {
      const backSpan = backEl.querySelector("span");
      if (backSpan) {
        backSpan.textContent =
          browser.i18n.getMessage("labelBack") || backSpan.textContent;
      }
    }
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

// Show browser-specific store badge
async function showBrowserStoreBadge() {
  const isFirefoxBrowser = await isFirefox();
  const chromeStoreBadge = document.getElementById("chrome-web-store-badge");
  const firefoxAddonStore = document.getElementById("firefox-addon-store");

  if (isFirefoxBrowser) {
    // Firefox browser - show Firefox badge
    if (firefoxAddonStore) firefoxAddonStore.classList.remove("hidden");
    if (chromeStoreBadge) chromeStoreBadge.classList.add("hidden");
  } else {
    // Chrome/Edge/Brave browser - show Chrome badge
    if (chromeStoreBadge) chromeStoreBadge.classList.remove("hidden");
    if (firefoxAddonStore) firefoxAddonStore.classList.add("hidden");
  }
}

loadChangelog();
showBrowserStoreBadge();
