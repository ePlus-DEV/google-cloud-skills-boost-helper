import Fuse from "fuse.js";
import type {
  PostNode,
  SearchPostsOfPublicationData,
  FuseOptions,
} from "../types/api";

class SearchService {
  private static readonly DEFAULT_FUSE_OPTIONS: FuseOptions = {
    threshold: 0.4,
    keys: ["title"],
  };

  /**
   * Find the best matching post URL using fuzzy search
   */
  static findBestMatchUrl(
    postsData: SearchPostsOfPublicationData | null,
    searchQuery: string,
    fuseOptions: FuseOptions = this.DEFAULT_FUSE_OPTIONS
  ): string | null {
    if (!postsData) return null;

    const nodes = postsData.edges.map((edge) => edge.node);
    if (!nodes.length) return null;

    const fuse = new Fuse(nodes, fuseOptions);
    const [bestMatch] = fuse.search(searchQuery);

    if (!bestMatch) return null;

    const url = bestMatch.item.url;
    if (!url) return null;

    // Add timestamp parameter to prevent caching
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}t=${Date.now()}`;
  }

  /**
   * Extract query text from page elements
   */
  static extractQueryText(): string {
    const outlineContainer = document
      .querySelector(".lab-content__outline.js-lab-content-outline")
      ?.closest("ul");

    if (!outlineContainer) return "";

    const firstOutlineItem = outlineContainer.querySelector("li");
    if (!firstOutlineItem) return "";

    const firstItemText = firstOutlineItem.textContent?.trim();

    if (firstItemText === "Overview") {
      return (
        document
          .querySelector(".ql-display-large.lab-preamble__title")
          ?.textContent?.trim() || ""
      );
    }

    return firstItemText || "";
  }

  /**
   * Get lab title from page
   */
  static getLabTitle(): string {
    return (
      document
        .querySelector(".ql-display-large.lab-preamble__title")
        ?.textContent?.trim() || ""
    );
  }

  /**
   * Create combined query text for better search accuracy
   */
  static createCombinedQuery(): string {
    const labTitle = this.getLabTitle();
    const queryText = this.extractQueryText();
    return `${labTitle} - ${queryText}`.trim();
  }
}

export default SearchService;
