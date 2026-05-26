import ApiClient from "./apiClient";
import SearchService from "./searchService";
import UIComponents from "../components/uiComponents";
import type { SearchPostsParams } from "../types/api";

/**
 * Service to handle lab page functionality
 */
const LabService = {
  /**
   * Use only h2#step1 as the anchor for UI injection
   */
  validateOutlineContainer(): HTMLElement | null {
    return document.querySelector("h2#step1");
  },

  /**
   * Process lab page and add solution button
   */
  async processLabPage(): Promise<void> {
    if (import.meta.env.DEV) {
      console.info("[LabService] Starting processLabPage");
    }
    const anchor = this.validateOutlineContainer();
    if (!anchor) {
      if (import.meta.env.DEV) {
        console.info("[LabService] No valid anchor found");
      }
      return;
    }

    // Extract search parameters
    const queryText = SearchService.extractQueryText();
    const combinedQueryText = SearchService.createCombinedQuery();
    if (import.meta.env.DEV) {
      console.info("[LabService] Query text:", queryText);
      console.info("[LabService] Combined query text:", combinedQueryText);
    }

    const searchQuery = queryText || combinedQueryText;
    if (!searchQuery) {
      if (import.meta.env.DEV) {
        console.info("[LabService] No query text found, exiting");
      }
      return;
    }

    // Show loading button immediately, insert after anchor
    const loadingElement = UIComponents.createLoadingElement();
    anchor.insertAdjacentElement("afterend", loadingElement);

    // Fetch posts data ONCE (no paging)
    if (import.meta.env.DEV) {
      console.info("[LabService] Fetching posts (single fetch)");
    }
    const postsData = await ApiClient.fetchPostsOfPublication({
      publicationId: import.meta.env.WXT_API_KEY,
      query: searchQuery,
    });

    let bestMatchUrl: string | null = null;
    if (postsData && postsData.length > 0) {
      if (import.meta.env.DEV) {
        console.info(`[LabService] Received ${postsData.length} posts`);
      }
      bestMatchUrl = SearchService.findBestMatchUrl(
        postsData,
        combinedQueryText,
      );
      if (bestMatchUrl && import.meta.env.DEV) {
        console.info("[LabService] Found best match URL:", bestMatchUrl);
      }
    } else {
      if (import.meta.env.DEV) {
        console.info("[LabService] No posts data received");
      }
    }

    // If the result points to hoangit.hashnode.dev, rewrite to eplus.dev
    if (bestMatchUrl) {
      try {
        const parsed = new URL(bestMatchUrl);
        if (parsed.hostname === "hoangit.hashnode.dev") {
          parsed.hostname = "eplus.dev";
          bestMatchUrl = parsed.toString();
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn(
            "[LabService] Malformed bestMatchUrl:",
            bestMatchUrl,
            err,
          );
        }
      }
    }

    // Replace loading with actual result
    const solutionElement =
      await UIComponents.createSolutionElement(bestMatchUrl);
    loadingElement.replaceWith(solutionElement);

    if (bestMatchUrl) {
      this.injectSolutionIntoDrawer(bestMatchUrl);
    }
  },

  /**
   * Dynamically injects and maintains the solution button inside the nested shadow DOM drawer
   */
  injectSolutionIntoDrawer(bestMatchUrl: string): void {
    /**
     * Locate the drawer credential container inside nested shadow DOMs.
     * Returns the element or null if not found.
     */
    function getContainer(): HTMLElement | null {
      try {
        const labHeader = document.querySelector<HTMLElement>(
          "#lab-instructions > div > div.lab-content__renderable-instructions.js-lab-content > ql-lab-header",
        );

        const sideSheet = labHeader?.shadowRoot?.querySelector<HTMLElement>(
          "#lab-sticky-controls > ql-lab-control-side-sheet",
        );

        const container = sideSheet?.shadowRoot?.querySelector<HTMLElement>(
          "ql-drawer-container > ql-drawer > div.content > div.credential-container",
        );

        return container ?? null;
      } catch (e) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn("[LabService] getContainer threw:", e);
        }
        return null;
      }
    }

    /**
     * Attempt to inject the solution element into the drawer.
     * Returns true if injection was performed or already present.
     */
    async function inject(): Promise<boolean> {
      const container = getContainer();
      if (!container) return false;

      // Avoid duplicates
      if (container.querySelector(".eplus-drawer-solution")) return true;

      // Create a fresh solution element for the drawer
      const drawerSolutionEl =
        await UIComponents.createSolutionElement(bestMatchUrl);
      drawerSolutionEl.classList.add("eplus-drawer-solution");

      // Additional styling for the drawer container
      drawerSolutionEl.style.marginTop = "16px";
      drawerSolutionEl.style.marginBottom = "8px";
      drawerSolutionEl.style.width = "100%";

      container.appendChild(drawerSolutionEl);
      return true;
    }

    // Initial injection attempt
    inject();

    // Check periodically to handle dynamic setup changes or starting the lab
    const interval = setInterval(async () => {
      const container = getContainer();
      if (container && !container.querySelector(".eplus-drawer-solution")) {
        await inject();
      }
    }, 1500);

    // Clear interval after 30 minutes just to be safe with memory
    setTimeout(() => clearInterval(interval), 30 * 60 * 1000);
  },

  /**
   * Check if current page is a lab page
   */
  isLabPage(): boolean {
    const { href } = window.location;
    return (
      href.startsWith("https://www.skills.google/games/") ||
      href.startsWith("https://www.skills.google/course_templates/") ||
      href.startsWith("https://www.skills.google/focuses/") ||
      href.startsWith("https://www.skills.google/paths/")
    );
  },
};

export default LabService;
