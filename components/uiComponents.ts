/**
 * UI Components for the extension
 */

import StorageService from "../services/storageService";
import SearchService from "../services/searchService";

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

      container.innerHTML = `<ql-button icon="arrow_upward" type="button" title="Back to top" data-aria-label="Back to top"></ql-button>`;

      const qbtn = container.querySelector("ql-button") as HTMLElement | null;
      if (qbtn && qbtn.style) {
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

      const onScrollFor = (target: Element | Window) => {
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
      };

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
          } catch {}
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
      // Validate and normalize the URL
      let safeUrl: string | null = null;
      try {
        const parsedUrl = new URL(url, "https://eplus.dev");
        if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
          safeUrl = parsedUrl.toString();
        }
      } catch (e) {
        // Invalid URL, do not render button
      }

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
              <ql-button id="telegram-support-btn" icon="help" type="button" outlined href="https://t.me/eplus_google" title="${browser.i18n.getMessage(
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
            if (el && (el as HTMLElement).style) {
              const b = el as HTMLElement;
              b.style.display = "inline-flex";
              b.style.alignItems = "center";
              b.style.gap = "6px";
              b.style.padding = "3px 3px";
              b.style.borderRadius = "999px";
              b.style.boxSizing = "border-box";
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
              window.open("https://t.me/eplus_google", "_blank");
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
        solutionElement.innerHTML = `
          <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap; row-gap:6px;">
            <ql-infobox style="display:flex; gap:6px; flex-wrap:wrap; row-gap:6px;">
              <ql-button icon="close" disabled>
                ${browser.i18n.getMessage("labNoSolution")}
              </ql-button>
              <ql-button
              icon="search"
              type="button"
              title="${browser.i18n.getMessage("labEplusSearch")}"
              data-aria-label="${browser.i18n.getMessage("labEplusSearch")}"
              id="eplus-search-btn"
            >
              ${browser.i18n.getMessage("labEplusSearch")}
            </ql-button>
            <ql-button
              icon="search"
              type="button"
              title="${browser.i18n.getMessage("labGoogleSearch")}"
              data-aria-label="${browser.i18n.getMessage("labGoogleSearch")}"
              id="google-search-btn"
            >
              ${browser.i18n.getMessage("labGoogleSearch")}
            </ql-button>
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
              href="https://t.me/eplus_google"
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
          const googleBtn = solutionElement.querySelector("#google-search-btn");
          const youtubeBtn = solutionElement.querySelector(
            "#youtube-search-btn",
          );
          const telegramBtn = solutionElement.querySelector(
            "#telegram-support-btn",
          );

          // Normalize ql-button visuals created via innerHTML
          [eplusBtn, googleBtn, youtubeBtn, telegramBtn].forEach((el) => {
            if (el && (el as HTMLElement).style) {
              const b = el as HTMLElement;
              b.style.display = "inline-flex";
              b.style.alignItems = "center";
              b.style.gap = "6px";
              b.style.padding = "3px 3px";
              b.style.borderRadius = "999px";
              b.style.boxSizing = "border-box";
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

          if (googleBtn) {
            googleBtn.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              UIComponents.searchOnGoogle();
            });
          }

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
              window.open("https://t.me/eplus_google", "_blank");
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
              href="https://t.me/eplus_google"
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
              window.open("https://t.me/eplus_google", "_blank");
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
    const labTitle = SearchService.getLabTitle();
    const encodedQuery = encodeURIComponent(labTitle);
    window.open(`https://eplus.dev/?q=${encodedQuery}`, "_blank");
  },

  /**
   * Search the current lab on Google
   */
  searchOnGoogle(): void {
    try {
      const labTitle = SearchService.getLabTitle();
      const encodedQuery = encodeURIComponent(labTitle);
      const googleSearchUrl = `https://www.google.com/search?q=${encodedQuery}`;
      window.open(googleSearchUrl, "_blank");
    } catch (error) {
      // Fallback to simple search
      const fallbackQuery = encodeURIComponent("Google Cloud lab tutorial");
      window.open(`https://www.google.com/search?q=${fallbackQuery}`, "_blank");
    }
  },

  /**
   * Search the current lab on YouTube
   */
  searchOnYouTube(): void {
    try {
      const labTitle = SearchService.getLabTitle();
      const encodedQuery = encodeURIComponent(labTitle);
      const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodedQuery}`;
      window.open(youtubeSearchUrl, "_blank");
    } catch (error) {
      // Fallback to simple search
      const fallbackQuery = encodeURIComponent("Google Cloud lab tutorial");
      window.open(
        `https://www.youtube.com/results?search_query=${fallbackQuery}`,
        "_blank",
      );
    }
  },

  /**
   * Create a copy button for profile links
   */
  createCopyButton(linkElement: HTMLAnchorElement): HTMLButtonElement {
    const copyButton = document.createElement("button");
    copyButton.textContent = "Copy Link";

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
