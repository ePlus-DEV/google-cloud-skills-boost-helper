/**
 * UI Components for the extension
 */

import StorageService from "../services/storageService";

class UIComponents {
  /**
   * Create a solution button element
   */
  static async createSolutionElement(
    url: string | null
  ): Promise<HTMLLIElement> {
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
          title="Click to open the solution"
          data-aria-label="Click to open the solution"
          onclick="window.open('${url}', '_blank')"
        >
          Solution this lab
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
              No solution
            </ql-button>
            <ql-button
              icon="search"
              type="button"
              title="Search for this lab on Google"
              data-aria-label="Search for this lab on Google"
              id="google-search-btn"
            >
              Google Search
            </ql-button>
            <ql-button
              icon="video_library"
              type="button"
              title="Search for video tutorials on YouTube"
              data-aria-label="Search for video tutorials on YouTube"
              id="youtube-search-btn"
            >
              YouTube
            </ql-button>
          </div>
        `;

        // Add event listeners after creating the HTML
        setTimeout(() => {
          const googleBtn = solutionElement.querySelector("#google-search-btn");
          const youtubeBtn = solutionElement.querySelector(
            "#youtube-search-btn"
          );

          if (googleBtn) {
            googleBtn.addEventListener("click", (e) => {
              console.log("Google Search button clicked");
              e.preventDefault();
              e.stopPropagation();
              this.searchOnGoogle();
            });
          }

          if (youtubeBtn) {
            youtubeBtn.addEventListener("click", (e) => {
              console.log("YouTube Search button clicked");
              e.preventDefault();
              e.stopPropagation();
              this.searchOnYouTube();
            });
          }
        }, 100);
      } else {
        // Search feature disabled - show only "No solution"
        solutionElement.innerHTML = `
          <ql-button icon="close" disabled>
            No solution
          </ql-button>
        `;
      }
    }

    return solutionElement;
  }

  /**
   * Search the current lab on Google
   */
  static searchOnGoogle(): void {
    console.log("UIComponents.searchOnGoogle() called");
    try {
      // Get lab title
      const labTitle =
        document
          .querySelector(".ql-display-large.lab-preamble__title")
          ?.textContent?.trim() || "";

      console.log("Lab title found:", labTitle);

      // Use simple search with just the title
      const searchQuery = labTitle;

      const encodedQuery = encodeURIComponent(searchQuery);
      const googleSearchUrl = `https://www.google.com/search?q=${encodedQuery}`;

      console.log("Opening Google search with query:", searchQuery);
      console.log("URL:", googleSearchUrl);
      window.open(googleSearchUrl, "_blank");
    } catch (error) {
      console.error("Error opening Google search:", error);
      // Fallback to simple search
      const fallbackQuery = encodeURIComponent("Google Cloud lab tutorial");
      window.open(`https://www.google.com/search?q=${fallbackQuery}`, "_blank");
    }
  }

  /**
   * Search the current lab on YouTube
   */
  static searchOnYouTube(): void {
    console.log("UIComponents.searchOnYouTube() called");
    try {
      // Get lab title
      const labTitle =
        document
          .querySelector(".ql-display-large.lab-preamble__title")
          ?.textContent?.trim() || "";

      console.log("Lab title found:", labTitle);

      // Use simple search with just the title
      const searchQuery = labTitle;

      const encodedQuery = encodeURIComponent(searchQuery);
      const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodedQuery}`;

      console.log("Opening YouTube search with query:", searchQuery);
      console.log("URL:", youtubeSearchUrl);
      window.open(youtubeSearchUrl, "_blank");
    } catch (error) {
      console.error("Error opening YouTube search:", error);
      // Fallback to simple search
      const fallbackQuery = encodeURIComponent("Google Cloud lab tutorial");
      window.open(
        `https://www.youtube.com/results?search_query=${fallbackQuery}`,
        "_blank"
      );
    }
  }

  /**
   * Create a copy button for profile links
   */
  static createCopyButton(linkElement: HTMLAnchorElement): HTMLButtonElement {
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
      this.handleCopyLink(linkElement.href);
    });

    return copyButton;
  }

  /**
   * Handle copy link functionality
   */
  private static async handleCopyLink(href: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(href);

      const publicProfileElement = document.querySelector(
        ".ql-body-medium.public-profile.public"
      );

      if (publicProfileElement) {
        publicProfileElement.insertAdjacentHTML(
          "afterend",
          `<ql-infobox id="clipboard" class="l-mtl"> ${browser.i18n.getMessage(
            "messageLinkCopiedToClipboard"
          )} </ql-infobox>`
        );
      }

      setTimeout(() => {
        const clipboardElement = document.querySelector("#clipboard");
        clipboardElement?.remove();
      }, 4000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  }
}

export default UIComponents;
