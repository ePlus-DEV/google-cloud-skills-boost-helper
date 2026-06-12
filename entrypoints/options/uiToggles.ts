/**
 * Search Feature Toggle Module
 * Handles search feature toggle state synchronization
 */

/**
 * Helper function to get i18n messages
 */
function i18nMsg(key: string, fallback: string): string {
  try {
    // Support both chrome and browser APIs
    const i18nAPI =
      (typeof chrome !== "undefined" && chrome.i18n) ||
      (typeof browser !== "undefined" && (browser as any).i18n);
    if (i18nAPI && typeof i18nAPI.getMessage === "function") {
      const msg = i18nAPI.getMessage(key);
      return msg || fallback;
    }
  } catch (_) {
    // ignored
  }
  return fallback;
}

/**
 * Initialize badge display toggle status sync
 */
function initBadgeDisplayToggle(): void {
  const badgeToggle = document.getElementById("badge-display-toggle") as HTMLInputElement | null;
  const badgeStatus = document.getElementById("badge-display-status");

  if (!badgeToggle || !badgeStatus) return;

    // Create non-null references after the guard so nested functions can use them
    const badgeToggleEl = badgeToggle as HTMLInputElement;
    const badgeStatusEl = badgeStatus as HTMLElement;

    /**
     * Update the badge display status text based on the toggle's checked state.
     */
    function updateBadgeStatus(): void {
      const checked = badgeToggleEl.checked;
      badgeStatusEl.textContent = checked
        ? i18nMsg("labelEnabled", "Enabled")
        : i18nMsg("labelDisabled", "Disabled");
    }

    updateBadgeStatus();
    badgeToggleEl.addEventListener("change", updateBadgeStatus);
}

/**
 * Initialize search feature toggle status sync
 */
function initSearchFeatureToggle(): void {
  const searchToggle = document.getElementById("search-feature-toggle") as HTMLInputElement | null;
  const searchStatus = document.getElementById("search-feature-status");

  if (!searchToggle || !searchStatus) return;

    // Create non-null references for nested use
    const searchToggleEl = searchToggle as HTMLInputElement;
    const searchStatusEl = searchStatus as HTMLElement;

    /**
     * Update the search feature status text and sync dependent controls.
     */
    function updateSearchStatus(): void {
      const checked = searchToggleEl.checked;
      searchStatusEl.textContent = checked
        ? i18nMsg("labelEnabled", "Enabled")
        : i18nMsg("labelDisabled", "Disabled");

      // Sync dependent controls
      updateDependentControls(checked);
    }

  /**
   * Enable or disable UI controls that depend on the search feature.
   * @param isSearchEnabled - Whether the main search feature is enabled
   */
  function updateDependentControls(isSearchEnabled: boolean): void {
    try {
      // Update preferred search engine
      const preferredSearch = document.getElementById("preferred-search-engine") as HTMLSelectElement | null;
      if (preferredSearch) {
        preferredSearch.disabled = !isSearchEnabled;
        preferredSearch.setAttribute("aria-disabled", String(!isSearchEnabled));
        preferredSearch.style.opacity = !isSearchEnabled ? "0.6" : "";
        preferredSearch.style.cursor = !isSearchEnabled ? "not-allowed" : "";
      }

      // Update eplus search toggle
      const eplusToggle = document.getElementById("enable-eplus-search") as HTMLInputElement | null;
      if (eplusToggle) {
        eplusToggle.disabled = !isSearchEnabled;
        eplusToggle.setAttribute("aria-disabled", String(!isSearchEnabled));

        // Update parent label styling
        const parentLabel = eplusToggle.closest("label");
        if (parentLabel) {
          parentLabel.style.opacity = !isSearchEnabled ? "0.6" : "";
          parentLabel.style.pointerEvents = !isSearchEnabled ? "none" : "";
          parentLabel.style.cursor = !isSearchEnabled ? "not-allowed" : "";
        }

        // Update text block styling
        const parentContainer = eplusToggle.closest(".flex.items-center");
        const textBlock = parentContainer?.querySelector(".text-right");
        if (textBlock instanceof HTMLElement) {
          textBlock.style.opacity = !isSearchEnabled ? "0.6" : "";
        }
      }
    } catch (e) {
      // Silently ignore if elements don't exist
    }
  }

  updateSearchStatus();
  searchToggleEl.addEventListener("change", updateSearchStatus);

  // Prevent toggling eplus when parent search feature is off
  const eplusInput = document.getElementById("enable-eplus-search") as HTMLInputElement | null;
  if (eplusInput) {
    if (eplusInput) {
      const label = eplusInput.closest("label");
      if (label) {
        label.addEventListener("click", (ev: Event) => {
          const parentChecked = searchToggleEl.checked;
          if (!parentChecked) {
            ev.preventDefault();
            ev.stopImmediatePropagation();
          }
        });
      }

      eplusInput.addEventListener("change", () => {
        const parentChecked = searchToggleEl.checked;
        if (!parentChecked) {
          eplusInput.disabled = true;
          updateSearchStatus();
        }
      });
    }
}

/**
 * Initialize all toggle functionality
 */
export function initUIToggles(): void {
  initBadgeDisplayToggle();
  initSearchFeatureToggle();
}
