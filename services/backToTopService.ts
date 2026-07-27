const BACK_TO_TOP_ID = "eplus-back-to-top-float";
const SCROLL_THRESHOLD = 300;
const HIDE_DELAY_MS = 210;

interface BackToTopState {
  activeTarget: Element | Window;
  targets: Set<Element | Window>;
  observedElements: WeakSet<Element>;
  frameRequested: boolean;
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

function collectShadowRoots(root: Document | ShadowRoot, roots: ShadowRoot[]): void {
  root.querySelectorAll("*").forEach((element) => {
    if (element.shadowRoot) {
      roots.push(element.shadowRoot);
      collectShadowRoots(element.shadowRoot, roots);
    }
  });
}

function findScrollableTargets(): Set<Element | Window> {
  const targets = new Set<Element | Window>([window]);
  const roots: Array<Document | ShadowRoot> = [document];
  const shadowRoots: ShadowRoot[] = [];

  collectShadowRoots(document, shadowRoots);
  roots.push(...shadowRoots);

  roots.forEach((root) => {
    const labInstructions = root.querySelector("#lab-instructions");
    if (labInstructions) targets.add(labInstructions);

    root.querySelectorAll("*").forEach((element) => {
      if (isScrollable(element)) targets.add(element);
    });
  });

  if (document.scrollingElement) targets.add(document.scrollingElement);
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
    if (typeof document === "undefined" || !document.body) return;
    if (document.getElementById(BACK_TO_TOP_ID)) return;

    const state: BackToTopState = {
      activeTarget: window,
      targets: new Set([window]),
      observedElements: new WeakSet(),
      frameRequested: false,
    };

    const container = document.createElement("div");
    container.id = BACK_TO_TOP_ID;
    Object.assign(container.style, {
      position: "fixed",
      right: "16px",
      bottom: "24px",
      zIndex: "2147483647",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "none",
      opacity: "0",
      transform: "scale(0.9)",
      transition: "opacity 200ms ease, transform 200ms ease",
      visibility: "hidden",
    });

    const label = browser.i18n.getMessage("backToTop") || "Back to top";
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
      backgroundColor: "#ffffff",
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

    const registerTargets = () => {
      state.targets = findScrollableTargets();
      state.targets.forEach((target) => {
        if (target === window) return;
        const element = target as Element;
        if (state.observedElements.has(element)) return;
        state.observedElements.add(element);
        element.addEventListener("scroll", scheduleUpdate, { passive: true });
      });
      scheduleUpdate();
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
    registerTargets();

    const observer = new MutationObserver(() => registerTargets());
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  },
};

export default BackToTopService;
