/**
 * Markdown Toggle Module
 * Handles show/hide functionality for markdown content with smooth transitions
 */

interface MarkdownToggleState {
  isExpanded: boolean;
  fullHeight: number;
  heightTimer: number;
}

const MAX_HEIGHT_PX = 500;

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
      const m = i18nAPI.getMessage(key);
      return m || fallback;
    }
  } catch (_) {
    // ignored
  }
  return fallback;
}

/**
 * Initialize markdown toggle functionality
 */
export function initMarkdownToggle(): void {
  const markdownContent = document.getElementById(
    "markdown-content-collapsible"
  );
  const markdownToggleBtn = document.getElementById("markdown-toggle-btn");
  const markdownToggleText = document.getElementById("markdown-toggle-text");
  const markdownToggleIcon = document.getElementById("markdown-toggle-icon");

  if (!markdownContent || !markdownToggleBtn) {
    return;
  }

  const state: MarkdownToggleState = {
    isExpanded: false,
    fullHeight: 0,
    heightTimer: 0,
  };

  /**
   * Calculate and update content height
   */
  function checkContentHeight(): void {
    if (!markdownContent || !markdownToggleBtn) return;

    window.clearTimeout(state.heightTimer);

    state.heightTimer = window.setTimeout(() => {
      // Temporarily set to get full height
      markdownContent.style.maxHeight = "none";
      markdownContent.style.overflow = "visible";
      const actualHeight = markdownContent.scrollHeight;
      state.fullHeight = actualHeight;

      if (actualHeight > MAX_HEIGHT_PX) {
        // Content is taller than max height, show the toggle button
        markdownToggleBtn.classList.remove("hidden");
        if (state.isExpanded) {
          markdownContent.style.maxHeight = actualHeight + "px";
          markdownContent.style.overflow = "visible";
        } else {
          markdownContent.style.overflow = "hidden";
          markdownContent.style.maxHeight = MAX_HEIGHT_PX + "px";
        }
      } else {
        // Content fits, hide the toggle button
        markdownToggleBtn.classList.add("hidden");
        markdownContent.style.overflow = "visible";
        markdownContent.style.maxHeight = "none";
      }
    }, 50);
  }

  /**
   * Toggle expand/collapse state
   */
  function toggleExpand(e: Event): void {
    e.preventDefault();
    e.stopPropagation();

    state.isExpanded = !state.isExpanded;

    if (state.isExpanded) {
      // Expand to full height
      markdownContent.style.maxHeight = state.fullHeight + "px";
      markdownContent.style.overflow = "visible";
      if (markdownToggleText) {
        markdownToggleText.textContent = i18nMsg(
          "markdownShowLess",
          "Show less"
        );
      }
      if (markdownToggleIcon) {
        markdownToggleIcon.classList.add("rotate-180");
      }
    } else {
      // Collapse to max height
      markdownContent.style.maxHeight = MAX_HEIGHT_PX + "px";
      markdownContent.style.overflow = "hidden";
      if (markdownToggleText) {
        markdownToggleText.textContent = i18nMsg(
          "markdownShowMore",
          "Show more"
        );
      }
      if (markdownToggleIcon) {
        markdownToggleIcon.classList.remove("rotate-180");
      }
    }
  }

  // Attach click event listener
  markdownToggleBtn.addEventListener("click", toggleExpand);

  // Observe changes to markdown content
  const observer = new MutationObserver(() => {
    setTimeout(checkContentHeight, 100);
  });

  observer.observe(markdownContent, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  // Handle image loading
  markdownContent.addEventListener(
    "load",
    (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLImageElement) {
        checkContentHeight();
      }
    },
    true
  );

  // Listen for markdown content render completion
  window.addEventListener("markdown-content-rendered", () => {
    state.isExpanded = false;
    if (markdownToggleText) {
      markdownToggleText.textContent = i18nMsg("markdownShowMore", "Show more");
    }
    if (markdownToggleIcon) {
      markdownToggleIcon.classList.remove("rotate-180");
    }
    checkContentHeight();
  });

  // Initial check
  setTimeout(checkContentHeight, 500);
}
