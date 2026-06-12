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
    // Support both chrome and browser APIs via globalThis to avoid TS 'chrome' name errors.
    const gh: any = globalThis as any;
    const i18nAPI = gh.chrome?.i18n || gh.browser?.i18n;
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
 * Initialize markdown toggle functionality
 */
export function initMarkdownToggle(): void {
  const markdownContent: HTMLElement | null = document.getElementById(
    "markdown-content-collapsible",
  );
  const markdownToggleBtn: HTMLElement | null = document.getElementById(
    "markdown-toggle-btn",
  );
  const markdownToggleText: HTMLElement | null = document.getElementById(
    "markdown-toggle-text",
  );
  const markdownToggleIcon: HTMLElement | null = document.getElementById(
    "markdown-toggle-icon",
  );

  if (!markdownContent || !markdownToggleBtn) {
    return;
  }

  // Capture non-null references to satisfy TypeScript in async callbacks
  const mc = markdownContent as HTMLElement;
  const btn = markdownToggleBtn as HTMLElement;

  const state: MarkdownToggleState = {
    isExpanded: false,
    fullHeight: 0,
    heightTimer: 0,
  };

  /**
   * Calculate and update content height
   */
  function checkContentHeight(): void {
    if (!mc || !btn) return;

    window.clearTimeout(state.heightTimer);

    state.heightTimer = window.setTimeout(() => {
      // Temporarily set to get full height
      mc.style.maxHeight = "none";
      mc.style.overflow = "visible";
      const actualHeight = mc.scrollHeight;
      state.fullHeight = actualHeight;

      if (actualHeight > MAX_HEIGHT_PX) {
        // Content is taller than max height, show the toggle button
        btn.classList.remove("hidden");
        if (state.isExpanded) {
          mc.style.maxHeight = `${actualHeight}px`;
          mc.style.overflow = "visible";
        } else {
          mc.style.overflow = "hidden";
          mc.style.maxHeight = `${MAX_HEIGHT_PX}px`;
        }
      } else {
        // Content fits, hide the toggle button
        btn.classList.add("hidden");
        mc.style.overflow = "visible";
        mc.style.maxHeight = "none";
      }
    }, 50);
  }

  /**
   * Toggle expand/collapse state
   */
  function toggleExpand(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    state.isExpanded = !state.isExpanded;

    if (state.isExpanded) {
      // Expand to full height
      mc.style.maxHeight = `${state.fullHeight}px`;
      mc.style.overflow = "visible";
      if (markdownToggleText) {
        markdownToggleText.textContent = i18nMsg(
          "markdownShowLess",
          "Show less",
        );
      }
      if (markdownToggleIcon) {
        markdownToggleIcon.classList.add("rotate-180");
      }
    } else {
      // Collapse to max height
      mc.style.maxHeight = `${MAX_HEIGHT_PX}px`;
      mc.style.overflow = "hidden";
      if (markdownToggleText) {
        markdownToggleText.textContent = i18nMsg(
          "markdownShowMore",
          "Show more",
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

  observer.observe(mc, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  // Handle image loading
  mc.addEventListener(
    "load",
    (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLImageElement) {
        checkContentHeight();
      }
    },
    true,
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
