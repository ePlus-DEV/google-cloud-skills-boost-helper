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

    // Fetch posts data
    const searchParams: SearchPostsParams = {
      publicationId: import.meta.env.WXT_API_KEY,
      query: queryText,
      first: 20,
      after: null,
      sortBy: "DATE_PUBLISHED_DESC",
    };

    const postsData = await ApiClient.fetchPostsOfPublication(searchParams);

    // Find best matching URL
    const bestMatchUrl = SearchService.findBestMatchUrl(
      postsData,
      combinedQueryText
    );

    // Create and append solution element
    const solutionElement = await UIComponents.createSolutionElement(
      bestMatchUrl
    );
    outlineContainer.appendChild(solutionElement);
  },

  /**
   * Check if current page is a lab page
   */
  isLabPage(): boolean {
    const { href } = window.location;
    return (
      href.startsWith("https://www.cloudskillsboost.google/games/") ||
      href.startsWith(
        "https://www.cloudskillsboost.google/course_templates/"
      ) ||
      href.startsWith("https://www.cloudskillsboost.google/focuses/") ||
      href.startsWith("https://www.cloudskillsboost.google/paths/")
    );
  },
};

export default LabService;
