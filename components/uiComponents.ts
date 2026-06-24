/**
 * UI Components for the extension
 */

import StorageService from "../services/storageService";
import SearchService from "../services/searchService";
import { addSolutionUtmParams } from "../utils/trackingUrl";

const TELEGRAM_SUPPORT_URL = "https://t.me/eplus_google";

/**
 * Return a localized label for a search engine, falling back to '<Engine> Search'.
 */
function getEngineLabel(engine: string): string {
  const keyMap = {
    google: "labGoogleSearch",
    bing: "labBingSearch",
    yandex: "labYandexSearch",
    brave: "labBraveSearch",
    duckduckgo: "labDuckDuckGoSearch",
    baidu: "labBaiduSearch",
    yahoo: "labYahooSearch",
    coccoc: "labCoccocSearch",
  } as const;

  if (engine in keyMap) {
    const key = keyMap[engine as keyof typeof keyMap];
    const msg = browser.i18n.getMessage(key);
    if (msg) return msg;
  }

  const searchWord = browser.i18n.getMessage("labelSearch") || "Search";
  // Capitalize engine name for fallback
  const name = engine.charAt(0).toUpperCase() + engine.slice(1);
  return `${name} ${searchWord}`;
}

const UIComponents = {
  /**
   * Create a loading button element shown while searching
   */
  createLoadingElement(): HTMLDivElement {
    const el = document.createElement("div");
    Object.assign(el.style, {
      padding: "10px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    });
    el.innerHTML = `
      <ql-infobox>
        <ql-button icon="psychology" disabled>
          ${browser.i18n.getMessage("labThinking")}
        </ql-button>
      </ql-infobox>
    `;
    return el;
  },

  /**
   * Ensure a floating back-to-top icon exists at the bottom-right corner
   */
  createFloatingBackToTop(): void {
    try {
      if (typeof document === "undefined") return;

      if (document.getElementById("eplus-back-to-top-float")) return;

      const container = document.createElement("div");
      container.id = "eplus-back-to-top-float";
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
      } as Partial<CSSStyleDeclaration>);

      const backToTopLabel =
        browser.i18n.getMessage("backToTop") || "Back to top";
      container.innerHTML = `
        <ql-button
          icon="arrow_upward"
          type="button"
          title="${backToTopLabel}"
          data-aria-label="${backToTopLabel}"
        ></ql-button>
      `;

      const qbtn = container.querySelector("ql-button") as HTMLElement | null;
      if (qbtn?.style) {
        Object.assign(qbtn.style, {
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
        } as Partial<CSSStyleDeclaration>);
      }

      const THRESHOLD = 300; // px scrolled before showing button

      /**
       * Show the back-to-top floating button.
       */
      const show = () => {
        container.style.visibility = "visible";
        container.style.pointerEvents = "auto";
        container.style.opacity = "1";
        container.style.transform = "scale(1)";
      };

      /**
       * Hide the back-to-top floating button.
       */
      const hide = () => {
        container.style.pointerEvents = "none";
        container.style.opacity = "0";
        container.style.transform = "scale(0.9)";
        // keep visibility hidden after transition to avoid tab stops
        setTimeout(() => {
          if (container.style.opacity === "0")
            container.style.visibility = "hidden";
        }, 210);
      };

      const scrollTargets: Array<Element | Window> = [];

      // prefer the lab drawer content if present
      const labInstructions = document.getElementById("lab-instructions");
      if (labInstructions) scrollTargets.push(labInstructions);
      // always include window as a fallback
      scrollTargets.push(window);

      let lastActiveTarget: Element | Window = window;

      /**
       * Handle scroll events for a given target and toggle visibility.
       * @param {Element|Window} target Element or Window to inspect scroll position on
       */
      function onScrollFor(target: Element | Window) {
        try {
          const pos =
            target === window
              ? window.scrollY || window.pageYOffset || 0
              : (target as Element).scrollTop || 0;
          if (pos > THRESHOLD) {
            lastActiveTarget = target;
            show();
          } else if (lastActiveTarget === target) {
            // only hide if this was the active target and it's now above threshold
            hide();
          }
        } catch (err) {
          // ignore
        }
      }

      // attach listeners to each target, avoid duplicate handlers
      scrollTargets.forEach((t) => {
        if (t === window) {
          window.addEventListener("scroll", () => onScrollFor(window), {
            passive: true,
          });
        } else {
          (t as Element).addEventListener(
            "scroll",
            () => onScrollFor(t as Element),
            { passive: true },
          );
        }
      });

      container.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          if (lastActiveTarget && lastActiveTarget !== window) {
            (lastActiveTarget as Element).scrollTo({
              top: 0,
              behavior: "smooth",
            });
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        } catch (err) {
          try {
            window.scrollTo(0, 0);
          } catch {
            // Intentionally ignore fallback scroll errors.
          }
        }
      });

      // run initial check for all targets
      setTimeout(() => {
        scrollTargets.forEach((t) => onScrollFor(t));
      }, 50);

      document.body.appendChild(container);
    } catch (err) {
      // ignore failures in exotic environments
    }
  },

  /**
   * Create a solution button element
   */
  async createSolutionElement(url: string | null): Promise<HTMLDivElement> {
    const solutionElement = document.createElement("div");
    Object.assign(solutionElement.style, {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    });

    if (url) {
      const safeUrl = addSolutionUtmParams(url);

      if (safeUrl) {
        // Use the same innerHTML-based insertion as the "No solution" branch
        solutionElement.innerHTML = `
          <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap; row-gap:6px;">
            <ql-infobox style="display:flex; gap:6px; flex-wrap:wrap; row-gap:6px;">
              <ql-button id="lab-solution-btn" icon="check" type="button" title="${browser.i18n.getMessage(
                "labSolutionTitle",
              )}" data-aria-label="${browser.i18n.getMessage("labSolutionTitle")}">
                ${browser.i18n.getMessage("labSolutionButton")}
              </ql-button>
              <ql-button id="telegram-support-btn" icon="help" type="button" outlined href="${TELEGRAM_SUPPORT_URL}" title="${browser.i18n.getMessage(
                "labSupportTitle",
              )}" data-aria-label="${browser.i18n.getMessage("labSupportTitle")}">
                ${browser.i18n.getMessage("labSupportButton")}
              </ql-button>
            </ql-infobox>
          </div>
        `;

        // Attach listeners and normalize styles similar to the No-solution branch
        setTimeout(() => {
          const solBtn = solutionElement.querySelector("#lab-solution-btn");
          const telegramBtn = solutionElement.querySelector(
            "#telegram-support-btn",
          );

          [solBtn, telegramBtn].forEach((el) => {
            if ((el as HTMLElement)?.style) {
              (el as HTMLElement).style.cssText +=
                ";display:inline-flex;align-items:center;gap:6px;padding:3px 3px;border-radius:999px;box-sizing:border-box";
            }
          });

          if (solBtn) {
            solBtn.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(safeUrl as string, "_blank");
            });
          }

          if (telegramBtn) {
            telegramBtn.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(TELEGRAM_SUPPORT_URL, "_blank");
            });
          }

          // ensure a floating back-to-top icon exists on the page
          UIComponents.createFloatingBackToTop();
        }, 50);
      } else {
        // If URL is invalid, show nothing or fallback UI
        solutionElement.textContent = browser.i18n.getMessage("labNoSolution");
      }
    } else {
      // Check if search feature is enabled
      const isSearchEnabled = await StorageService.isSearchFeatureEnabled();

      if (isSearchEnabled) {
        // No solution found - show "No solution" and search options
        const showEplus = await StorageService.isEplusSearchEnabled();

        solutionElement.innerHTML = `
          <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap; row-gap:6px;">
            <ql-infobox style="display:flex; gap:6px; flex-wrap:wrap; row-gap:6px;">
              <ql-button icon="close" disabled>
                ${browser.i18n.getMessage("labNoSolution")}
              </ql-button>
              <ql-button
                icon="search"
                type="button"
                id="configured-search-btn"
              >
                ${browser.i18n.getMessage("labGoogleSearch")}
              </ql-button>
              ${
                showEplus
                  ? `
              <ql-button
                icon="search"
                type="button"
                title="${browser.i18n.getMessage("labEplusSearch")}" 
                data-aria-label="${browser.i18n.getMessage("labEplusSearch")}" 
                id="eplus-search-btn"
              >
                ${browser.i18n.getMessage("labEplusSearch")}
              </ql-button>
              `
                  : ""
              }
              <ql-button
                icon="video_library"
                type="button"
                title="${browser.i18n.getMessage("labYouTube")}"
                data-aria-label="${browser.i18n.getMessage("labYouTube")}"
                id="youtube-search-btn"
              >
                ${browser.i18n.getMessage("labYouTube")}
              </ql-button>
              <ql-button
                icon="help"
                type="button"
                outlined=""
                href="${TELEGRAM_SUPPORT_URL}"
                title="${browser.i18n.getMessage("labSupportTitle")}"
                data-aria-label="${browser.i18n.getMessage("labSupportTitle")}"
                id="telegram-support-btn"
              >
                ${browser.i18n.getMessage("labSupportButton")}
              </ql-button>
          </ql-infobox>
        </div>
        `;

        // Add event listeners after creating the HTML
        setTimeout(() => {
          const eplusBtn = solutionElement.querySelector("#eplus-search-btn");
          const configuredBtn = solutionElement.querySelector(
            "#configured-search-btn",
          );
          const youtubeBtn = solutionElement.querySelector(
            "#youtube-search-btn",
          );
          const telegramBtn = solutionElement.querySelector(
            "#telegram-support-btn",
          );

          // Normalize ql-button visuals created via innerHTML
          [eplusBtn, configuredBtn, youtubeBtn, telegramBtn].forEach((el) => {
            if ((el as HTMLElement)?.style) {
              (el as HTMLElement).style.cssText +=
                ";display:inline-flex;align-items:center;gap:6px;padding:3px 3px;border-radius:999px;box-sizing:border-box";
            }
          });

          // ensure a floating back-to-top icon exists on the page
          UIComponents.createFloatingBackToTop();

          if (eplusBtn) {
            eplusBtn.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              UIComponents.searchOnEplus();
            });
          }

          // configurable search engine (button only; preference stored in options)

          (async () => {
            try {
              const preferred = await StorageService.getPreferredSearchEngine();
              if (configuredBtn) {
                configuredBtn.textContent = getEngineLabel(preferred);
              }
            } catch (err) {
              // ignore
            }

            if (configuredBtn) {
              configuredBtn.addEventListener("click", async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const engine =
                  (await StorageService.getPreferredSearchEngine()) || "google";
                UIComponents.searchOnEngine(engine);
              });
            }
          })();

          if (youtubeBtn) {
            youtubeBtn.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              UIComponents.searchOnYouTube();
            });
          }

          if (telegramBtn) {
            telegramBtn.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(TELEGRAM_SUPPORT_URL, "_blank");
            });
          }

          // no inline back-to-top in this branch; floating button used instead
        }, 100);
      } else {
        // Search feature disabled - show only "No solution"
        solutionElement.innerHTML = `
          <ql-infobox style="display:flex; gap:6px; flex-wrap:wrap; row-gap:6px;">
            <ql-button icon="close" disabled>
              ${browser.i18n.getMessage("labNoSolution")}
            </ql-button>
            <ql-button
              icon="help"
              type="button"
              outlined=""
              href="${TELEGRAM_SUPPORT_URL}"
              title="${browser.i18n.getMessage("labSupportTitle")}"
              data-aria-label="${browser.i18n.getMessage("labSupportTitle")}"
              id="telegram-support-btn"
            >
              ${browser.i18n.getMessage("labSupportButton")}
            </ql-button>
          </ql-infobox>
        `;

        // Add event listener for telegram button in search-disabled case
        setTimeout(() => {
          const telegramBtn = solutionElement.querySelector(
            "#telegram-support-btn",
          );
          if (telegramBtn) {
            telegramBtn.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(TELEGRAM_SUPPORT_URL, "_blank");
            });
          }
          // ensure floating back-to-top exists
          UIComponents.createFloatingBackToTop();
        }, 100);
      }
    }

    return solutionElement;
  },

  /**
   * Search the current lab on ePlus.dev
   */
  searchOnEplus(): void {
    const combined = SearchService.createCombinedQuery();
    const encodedQuery = encodeURIComponent(
      combined || "Google Cloud lab tutorial",
    );
    window.open(`https://eplus.dev/?q=${encodedQuery}`, "_blank");
  },

  /**
   * Search the current lab on YouTube
   */
  searchOnYouTube(): void {
    try {
      const combined = SearchService.createCombinedQuery();
      const encodedQuery = encodeURIComponent(
        combined ||
          browser.i18n.getMessage("labFallbackQuery") ||
          "Google Cloud lab tutorial",
      );
      const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodedQuery}`;
      window.open(youtubeSearchUrl, "_blank");
    } catch (error) {
      // Fallback to simple search
      const fallbackQuery = encodeURIComponent(
        browser.i18n.getMessage("labFallbackQuery") ||
          "Google Cloud lab tutorial",
      );
      window.open(
        `https://www.youtube.com/results?search_query=${fallbackQuery}`,
        "_blank",
      );
    }
  },

  /**
   * Search the current lab on Google
   */
  searchOnGoogle(): void {
    UIComponents.searchOnEngine("google");
  },

  /**
   * Search the current lab on a selected engine
   */
  searchOnEngine(engine: string): void {
    try {
      const combined = SearchService.createCombinedQuery();
      const encodedQuery = encodeURIComponent(
        combined ||
          browser.i18n.getMessage("labFallbackQuery") ||
          "Google Cloud lab tutorial",
      );
      let url: string;
      switch ((engine || "").toLowerCase()) {
        case "bing":
          url = `https://www.bing.com/search?q=${encodedQuery}`;
          break;
        case "baidu":
          url = `https://www.baidu.com/s?wd=${encodedQuery}`;
          break;
        case "yahoo":
          url = `https://search.yahoo.com/search?p=${encodedQuery}`;
          break;
        case "coccoc":
          url = `https://coccoc.com/search?query=${encodedQuery}`;
          break;
        case "yandex":
          url = `https://yandex.com/search/?text=${encodedQuery}`;
          break;
        case "brave":
          // Brave uses the standard search endpoint
          url = `https://search.brave.com/search?q=${encodedQuery}`;
          break;
        case "duckduckgo":
          url = `https://duckduckgo.com/?q=${encodedQuery}`;
          break;
        case "google":
        default:
          url = `https://www.google.com/search?q=${encodedQuery}`;
      }
      window.open(url, "_blank");
    } catch (error) {
      const fallbackQuery = encodeURIComponent(
        browser.i18n.getMessage("labFallbackQuery") ||
          "Google Cloud lab tutorial",
      );
      window.open(`https://www.google.com/search?q=${fallbackQuery}`, "_blank");
    }
  },

  /**
   * Create a copy button for profile links
   */
  createCopyButton(linkElement: HTMLAnchorElement): HTMLButtonElement {
    const copyButton = document.createElement("button");
    copyButton.textContent =
      browser.i18n.getMessage("labelCopyLink") || "Copy Link";

    Object.assign(copyButton.style, {
      marginLeft: "10px",
      padding: "5px 10px",
      fontSize: "14px",
      cursor: "pointer",
      backgroundColor: "#007bff",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
    });

    copyButton.addEventListener("click", (event) => {
      event.preventDefault();
      UIComponents.handleCopyLink(linkElement.href);
    });

    return copyButton;
  },

  /**
   * Handle copy link functionality
   */
  async handleCopyLink(href: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(href);

      const publicProfileElement = document.querySelector(
        ".ql-body-medium.public-profile.public",
      );

      if (publicProfileElement) {
        publicProfileElement.insertAdjacentHTML(
          "afterend",
          `<ql-infobox id="clipboard" class="l-mtl"> ${browser.i18n.getMessage(
            "messageLinkCopiedToClipboard",
          )} </ql-infobox>`,
        );
      }

      setTimeout(() => {
        const clipboardElement = document.querySelector("#clipboard");
        clipboardElement?.remove();
      }, 4000);
    } catch (err) {
      // Failed to copy link - silently continue
    }
  },
};

export default UIComponents;

// Listen for runtime messages to update configured search UI in-place
try {
  if (
    typeof browser !== "undefined" &&
    browser.runtime &&
    browser.runtime.onMessage
  ) {
    browser.runtime.onMessage.addListener((msg: any) => {
      try {
        if (!msg || !msg.type) return;

        if (msg.type === "preferredSearchEngineChanged") {
          const engine = String(msg.engine || "google");

          document
            .querySelectorAll<HTMLSelectElement>("#search-engine-select")
            .forEach((sel) => {
              try {
                sel.value = engine;
              } catch (e) {
                // Ignore errors if element doesn't support value property
              }
            });

          document
            .querySelectorAll<HTMLElement>("#configured-search-btn")
            .forEach((btn) => {
              try {
                btn.textContent = getEngineLabel(engine);
              } catch (e) {
                // Ignore errors if element doesn't exist or update fails
              }
            });
          return;
        }

        if (msg.type === "searchFeatureChanged") {
          const enabled = Boolean(msg.enabled);
          // Disable/enable ePlus button(s) when main search feature toggles
          document
            .querySelectorAll<HTMLElement>("#eplus-search-btn")
            .forEach((btn) => {
              try {
                if (!enabled) {
                  btn.setAttribute("disabled", "true");
                  Object.assign(btn.style, {
                    opacity: "0.6",
                    pointerEvents: "none",
                    cursor: "not-allowed",
                    filter: "grayscale(40%)",
                  });
                } else {
                  btn.removeAttribute("disabled");
                  Object.assign(btn.style, {
                    opacity: "",
                    pointerEvents: "auto",
                    cursor: "pointer",
                    filter: "",
                  });
                }
              } catch (e) {
                // Ignore errors if style assignment fails
              }
            });
          return;
        }

        if (msg.type === "enableEplusSearchChanged") {
          const enabled = Boolean(msg.enabled);
          // Show or hide ePlus button(s) based on setting
          document
            .querySelectorAll<HTMLElement>("#eplus-search-btn")
            .forEach((btn) => {
              try {
                btn.style.display = enabled ? "inline-flex" : "none";
              } catch (e) {
                // Ignore errors if element doesn't exist
              }
            });
          return;
        }
      } catch (e) {
        // ignore
      }
    });
  }
} catch (e) {
  // ignore environments without runtime
}
