/**
 * UI Components for the extension
 */

import StorageService from "../services/storageService";

const UIComponents = {
  /**
   * Create a loading button element shown while searching
   */
  createLoadingElement(): HTMLLIElement {
    const el = document.createElement("li");
    Object.assign(el.style, {
      marginTop: "15px",
      padding: "10px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    });
    el.innerHTML = `
      <ql-button icon="psychology" disabled>
        ${browser.i18n.getMessage("labThinking")}
      </ql-button>
    `;
    return el;
  },

  /**
   * Create a solution button element
   */
  async createSolutionElement(url: string | null): Promise<HTMLLIElement> {
    const solutionElement = document.createElement("li");

    Object.assign(solutionElement.style, {
      marginTop: "15px",
      padding: "10px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    });

    if (url) {
      solutionElement.innerHTML = `
        <ql-button
          icon="check"
          type="button"
          title="${browser.i18n.getMessage("labSolutionTitle")}"
          data-aria-label="${browser.i18n.getMessage("labSolutionTitle")}"
          onclick="window.open('${url}', '_blank')"
        >
          ${browser.i18n.getMessage("labSolutionButton")}
        </ql-button>
      `;
    } else {
      // Check if search feature is enabled
      const isSearchEnabled = await StorageService.isSearchFeatureEnabled();

      if (isSearchEnabled) {
        // No solution found - show "No solution" and search options
        solutionElement.innerHTML = `
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
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
          </div>
        `;

        // Add event listeners after creating the HTML
        setTimeout(() => {
          const eplusBtn = solutionElement.querySelector("#eplus-search-btn");
          const googleBtn = solutionElement.querySelector("#google-search-btn");
          const youtubeBtn = solutionElement.querySelector(
            "#youtube-search-btn",
          );

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
        }, 100);
      } else {
        // Search feature disabled - show only "No solution"
        solutionElement.innerHTML = `
          <ql-button icon="close" disabled>
            ${browser.i18n.getMessage("labNoSolution")}
          </ql-button>
        `;
      }
    }

    return solutionElement;
  },

  /**
   * Search the current lab on ePlus.dev
   */
  searchOnEplus(): void {
    const labTitle =
      document
        .querySelector(".ql-display-large.lab-preamble__title")
        ?.textContent?.trim() || "";
    const encodedQuery = encodeURIComponent(labTitle);
    window.open(`https://eplus.dev/search?q=${encodedQuery}`, "_blank");
  },

  /**
   * Search the current lab on Google
   */
  searchOnGoogle(): void {
    try {
      // Get lab title
      const labTitle =
        document
          .querySelector(".ql-display-large.lab-preamble__title")
          ?.textContent?.trim() || "";

      // Use simple search with just the title
      const searchQuery = labTitle;

      const encodedQuery = encodeURIComponent(searchQuery);
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
      // Get lab title
      const labTitle =
        document
          .querySelector(".ql-display-large.lab-preamble__title")
          ?.textContent?.trim() || "";

      // Use simple search with just the title
      const searchQuery = labTitle;

      const encodedQuery = encodeURIComponent(searchQuery);
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
