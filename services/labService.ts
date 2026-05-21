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
    if (import.meta.env.DEV) {
      console.info("[LabService] Starting processLabPage");
    }
    const outlineContainer = this.validateOutlineContainer();
    if (!outlineContainer) {
      if (import.meta.env.DEV) {
        console.info("[LabService] No outline container found");
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

    // Show loading button immediately
    const loadingElement = UIComponents.createLoadingElement();
    outlineContainer.appendChild(loadingElement);

    // Fetch posts data ONCE (no paging)
    if (import.meta.env.DEV) {
      console.info(`[LabService] Fetching posts (single fetch)`);
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
