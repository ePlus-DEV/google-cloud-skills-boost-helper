const BACK_TO_TOP_ID = "eplus-back-to-top-float";
const SCROLL_THRESHOLD = 300;
const HIDE_DELAY_MS = 210;
const RESCAN_DELAY_MS = 250;

interface BackToTopState {
  activeTarget: Element | Window;
  targets: Set<Element | Window>;
  listeners: Map<Element, EventListener>;
  frameRequested: boolean;
  rescanTimer: number | null;
  pendingRoots: Set<Document | ShadowRoot | Element>;
}

function getScrollTop(target: Element | Window): number {
  if (target === window) {
    return (
      window.scrollY ||
      window.pageYOffset ||
      document.scrollingElement?.scrollTop ||
      0
    );
  }

  return (target as Element).scrollTop || 0;
}

function isScrollable(element: Element): boolean {
  if (element.scrollHeight <= element.clientHeight + 8) return false;

  const overflowY = window.getComputedStyle(element).overflowY;
  return ["auto", "scroll", "overlay"].includes(overflowY);
}

function inspectElement(
  element: Element,
  targets: Set<Element | Window>,
): void {
  if (element.id === "lab-instructions" || isScrollable(element)) {
    targets.add(element);
  }

  if (element.shadowRoot) {
    inspectRoot(element.shadowRoot, targets);
  }
}

function inspectRoot(
  root: Document | ShadowRoot | Element,
  targets: Set<Element | Window>,
): void {
  if (root instanceof Element) {
    inspectElement(root, targets);
  }

  root.querySelectorAll("*").forEach((element) => {
    inspectElement(element, targets);
  });
}

function findInitialTargets(): Set<Element | Window> {
  const targets = new Set<Element | Window>([window]);

  if (document.scrollingElement) {
    targets.add(document.scrollingElement);
  }

  inspectRoot(document, targets);
  return targets;
}

function scrollTargetToTop(target: Element | Window): void {
  if (target === window) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const element = target as HTMLElement;
  if (typeof element.scrollTo === "function") {
    element.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    element.scrollTop = 0;
  }
}

const BackToTopService = {
  initialize(): void {
    if (typeof document === "undefined") return;

    if (!document.body) {
      document.addEventListener(
        "DOMContentLoaded",
        () => BackToTopService.initialize(),
        { once: true },
      );
      return;
    }

    if (document.getElementById(BACK_TO_TOP_ID)) return;

    const state: BackToTopState = {
      activeTarget: window,
      targets: new Set([window]),
      listeners: new Map(),
      frameRequested: false,
      rescanTimer: null,
      pendingRoots: new Set(),
    };

    const container = document.createElement("div");
    container.id = BACK_TO_TOP_ID;
    Object.assign(container.style, {
      position: "fixed",
      right: "24px",
      bottom: "60px",
      zIndex: "10",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "none",
      opacity: "0",
      transform: "scale(0.9)",
      transition: "opacity 200ms ease, transform 200ms ease",
      visibility: "hidden",
    });

    const label = browser.i18n.getMessage("backToTop");
    const button = document.createElement("button");
    button.type = "button";
    button.title = label;
    button.setAttribute("aria-label", label);
    button.innerHTML = '<span aria-hidden="true">↑</span>';
    Object.assign(button.style, {
      width: "44px",
      height: "44px",
      minWidth: "44px",
      minHeight: "44px",
      borderRadius: "50%",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      boxSizing: "border-box",
      padding: "0",
      cursor: "pointer",
      backgroundColor: "rgba(0, 0, 0, 0.12)",
      border: "1px solid rgba(0,0,0,0.12)",
      boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
      color: "#111",
      fontSize: "24px",
      lineHeight: "1",
    });
    container.appendChild(button);

    const show = () => {
      container.style.visibility = "visible";
      container.style.pointerEvents = "auto";
      container.style.opacity = "1";
      container.style.transform = "scale(1)";
    };

    const hide = () => {
      container.style.pointerEvents = "none";
      container.style.opacity = "0";
      container.style.transform = "scale(0.9)";
      window.setTimeout(() => {
        if (container.style.opacity === "0") {
          container.style.visibility = "hidden";
        }
      }, HIDE_DELAY_MS);
    };

    const updateVisibility = () => {
      state.frameRequested = false;

      let highestTarget: Element | Window = window;
      let highestPosition = getScrollTop(window);

      state.targets.forEach((target) => {
        const position = getScrollTop(target);
        if (position > highestPosition) {
          highestPosition = position;
          highestTarget = target;
        }
      });

      state.activeTarget = highestTarget;
      if (highestPosition > SCROLL_THRESHOLD) show();
      else hide();
    };

    const scheduleUpdate = () => {
      if (state.frameRequested) return;
      state.frameRequested = true;
      window.requestAnimationFrame(updateVisibility);
    };

    const syncListeners = () => {
      state.listeners.forEach((listener, element) => {
        if (!element.isConnected || !state.targets.has(element)) {
          element.removeEventListener("scroll", listener);
          state.listeners.delete(element);
        }
      });

      state.targets.forEach((target) => {
        if (target === window) return;

        const element = target as Element;
        if (state.listeners.has(element)) return;

        const listener: EventListener = scheduleUpdate;
        element.addEventListener("scroll", listener, { passive: true });
        state.listeners.set(element, listener);
      });
    };

    const scanPendingRoots = () => {
      state.rescanTimer = null;

      const nextTargets = new Set<Element | Window>(state.targets);
      nextTargets.add(window);

      if (document.scrollingElement) {
        nextTargets.add(document.scrollingElement);
      }

      state.pendingRoots.forEach((root) => inspectRoot(root, nextTargets));
      state.pendingRoots.clear();

      nextTargets.forEach((target) => {
        if (target !== window && !(target as Element).isConnected) {
          nextTargets.delete(target);
        }
      });

      state.targets = nextTargets;
      syncListeners();
      scheduleUpdate();
    };

    const scheduleRescan = (root: Document | ShadowRoot | Element) => {
      state.pendingRoots.add(root);
      if (state.rescanTimer !== null) return;

      state.rescanTimer = window.setTimeout(scanPendingRoots, RESCAN_DELAY_MS);
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const candidates = [...state.targets].sort(
        (left, right) => getScrollTop(right) - getScrollTop(left),
      );
      const target = candidates[0] || state.activeTarget || window;

      try {
        scrollTargetToTop(target);
      } catch {
        window.scrollTo(0, 0);
      }
    });

    document.body.appendChild(container);
    state.targets = findInitialTargets();
    syncListeners();
    scheduleUpdate();

    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            scheduleRescan(node);
          }
        });
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  },
};

export default BackToTopService;
