import ApiClient from "./apiClient";
import SearchService from "./searchService";
import UIComponents from "../components/uiComponents";
import type { SearchPostsParams } from "../types/api";

/**
 * Service to handle lab page functionality
 */
const LabService = {
  /**
   * Check if the outline container exists and is valid
   */
  validateOutlineContainer(): HTMLElement | null {
    return document.querySelector("h2#step1");
  },

  /**
   * Process lab page and add solution button
   */
  async processLabPage(): Promise<void> {
    console.log("[LabService] Starting processLabPage");
    const outlineContainer = this.validateOutlineContainer();
    if (!outlineContainer) {
      console.log("[LabService] No outline container found");
      return;
    }

    // Extract search parameters
    const queryText = SearchService.extractQueryText();
    const combinedQueryText = SearchService.createCombinedQuery();
    console.log("[LabService] Query text:", queryText);
    console.log("[LabService] Combined query text:", combinedQueryText);

    const searchQuery = queryText || combinedQueryText;
    if (!searchQuery) {
      console.log("[LabService] No query text found, exiting");
      return;
    }

    // Show loading button immediately
    const loadingElement = UIComponents.createLoadingElement();
    outlineContainer.appendChild(loadingElement);

    // Fetch posts data with pagination fallback
    const searchParams: SearchPostsParams = {
      publicationId: import.meta.env.WXT_API_KEY,
      query: searchQuery,
      first: 20,
      after: null,
    };

    let bestMatchUrl: string | null = null;
    let after: string | null = null;
    const MAX_PAGES = 5;

    for (let page = 0; page < MAX_PAGES; page++) {
      console.log(`[LabService] Fetching posts (no paging)`);
      const postsData = await ApiClient.fetchPostsOfPublication({
        ...searchParams,
        after,
      });

      if (!postsData || postsData.length === 0) {
        console.log("[LabService] No posts data received");
        break;
      }

      console.log(`[LabService] Received ${postsData.length} posts`);
      bestMatchUrl = SearchService.findBestMatchUrl(
        postsData,
        combinedQueryText,
      );
      if (bestMatchUrl) {
        console.log("[LabService] Found best match URL:", bestMatchUrl);
        break;
      }

      // No paging, break after first fetch
      break;
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
        // ignore malformed URLs
      }
    }

    // Replace loading with actual result
    const solutionElement =
      await UIComponents.createSolutionElement(bestMatchUrl);
    loadingElement.replaceWith(solutionElement);
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
