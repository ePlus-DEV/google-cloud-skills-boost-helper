/**
 * Markdown Toggle Module
 * Handles show/hide functionality for markdown content with smooth transitions
 */

interface MarkdownToggleState {
  isExpanded: boolean;
  isAnimating: boolean;
  fullHeight: number;
  heightTimer: number;
}

const MAX_HEIGHT_PX = 500;
const EXPAND_TRANSITION_MS = 360;

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
    isAnimating: false,
    fullHeight: 0,
    heightTimer: 0,
  };

  /**
   * Update button label and icon for the current expanded state.
   */
  function updateToggleControl(): void {
    if (markdownToggleText) {
      markdownToggleText.textContent = state.isExpanded
        ? i18nMsg("markdownShowLess", "Show less")
        : i18nMsg("markdownShowMore", "Show more");
    }

    if (markdownToggleIcon) {
      markdownToggleIcon.classList.toggle("rotate-180", state.isExpanded);
    }

    btn.setAttribute("aria-expanded", String(state.isExpanded));
  }

  /**
   * Set collapsed/expanded classes that drive the edge fade and button state.
   */
  function updateVisualState(): void {
    mc.classList.toggle("is-expanded", state.isExpanded);
    mc.classList.toggle("is-collapsed", !state.isExpanded);
    btn.classList.toggle("is-expanded", state.isExpanded);
  }

  /**
   * Measure the full content height without leaving visible layout changes behind.
   */
  function measureFullHeight(): number {
    const prevMaxHeight = mc.style.maxHeight;
    const prevOverflow = mc.style.overflow;

    mc.style.maxHeight = "none";
    mc.style.overflow = "visible";
    const measuredHeight = mc.scrollHeight || MAX_HEIGHT_PX;

    mc.style.maxHeight = prevMaxHeight;
    mc.style.overflow = prevOverflow;

    return measuredHeight;
  }

  /**
   * Calculate and update content height
   */
  function checkContentHeight(): void {
    if (!mc || !btn) return;

    window.clearTimeout(state.heightTimer);

    state.heightTimer = window.setTimeout(() => {
      // Temporarily set to get full height
      const actualHeight = measureFullHeight();
      state.fullHeight = actualHeight;

      if (actualHeight > MAX_HEIGHT_PX) {
        // Content is taller than max height, show the toggle button
        btn.classList.remove("hidden");
        updateVisualState();
        updateToggleControl();

        if (state.isExpanded) {
          mc.style.maxHeight = `${actualHeight}px`;
          mc.style.overflow = state.isAnimating ? "hidden" : "visible";
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

    if (state.isAnimating) {
      return;
    }

    state.isExpanded = !state.isExpanded;
    state.isAnimating = true;
    btn.setAttribute("disabled", "true");
    updateVisualState();
    updateToggleControl();

    if (state.isExpanded) {
      // Ensure we have a measured fullHeight before expanding
      if (!state.fullHeight || state.fullHeight === 0) {
        state.fullHeight = measureFullHeight();
      }

      // Expand to full height
      mc.style.overflow = "hidden";
      mc.style.maxHeight = `${MAX_HEIGHT_PX}px`;
      window.requestAnimationFrame(() => {
        mc.style.maxHeight = `${state.fullHeight}px`;
      });
    } else {
      // Collapse to max height
      mc.style.overflow = "hidden";
      mc.style.maxHeight = `${state.fullHeight || mc.scrollHeight}px`;
      window.requestAnimationFrame(() => {
        mc.style.maxHeight = `${MAX_HEIGHT_PX}px`;
      });
    }

    window.setTimeout(() => {
      state.isAnimating = false;
      btn.removeAttribute("disabled");
      mc.style.overflow = state.isExpanded ? "visible" : "hidden";
    }, EXPAND_TRANSITION_MS);
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
    updateVisualState();
    updateToggleControl();
    checkContentHeight();
  });

  // Initial check
  // Do an immediate measurement to avoid an early click expanding to 0px.
  // Also schedule a follow-up measurement after a short delay to catch late images.
  checkContentHeight();
  setTimeout(checkContentHeight, 500);
}
