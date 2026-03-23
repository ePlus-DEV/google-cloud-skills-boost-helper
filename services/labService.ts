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
  validateOutlineContainer(): HTMLUListElement | null {
    const outlineContainer = document
      .querySelector(".lab-content__outline.js-lab-content-outline")
      ?.closest("ul") as HTMLUListElement | null;

    if (!outlineContainer) {
      return null;
    }

    const firstOutlineItem = outlineContainer.querySelector("li");
    if (!firstOutlineItem) {
      return null;
    }

    return outlineContainer;
  },

  /**
   * Process lab page and add solution button
   */
  async processLabPage(): Promise<void> {
    const outlineContainer = this.validateOutlineContainer();
    if (!outlineContainer) return;

    // Extract search parameters
    const queryText = SearchService.extractQueryText();
    const combinedQueryText = SearchService.createCombinedQuery();

    if (!queryText) {
      return;
    }

    // Show loading button immediately
    const loadingElement = UIComponents.createLoadingElement();
    outlineContainer.appendChild(loadingElement);

    // Fetch posts data with pagination fallback
    const searchParams: SearchPostsParams = {
      publicationId: import.meta.env.WXT_API_KEY,
      query: queryText,
      first: 20,
      after: null,
    };

    let bestMatchUrl: string | null = null;
    let after: string | null = null;
    const MAX_PAGES = 5;

    for (let page = 0; page < MAX_PAGES; page++) {
      const postsData = await ApiClient.fetchPostsOfPublication({
        ...searchParams,
        after,
      });

      if (!postsData) break;

      bestMatchUrl = SearchService.findBestMatchUrl(
        postsData,
        combinedQueryText,
      );
      if (bestMatchUrl) break;

      if (!postsData.pageInfo?.hasNextPage || !postsData.pageInfo.endCursor)
        break;
      after = postsData.pageInfo.endCursor;
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
