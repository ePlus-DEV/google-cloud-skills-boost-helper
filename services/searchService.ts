import Fuse from "fuse.js";
import type {
  PostNode,
  SearchPostsOfPublicationData,
  FuseOptions,
} from "../types/api";

class SearchService {
  private static readonly DEFAULT_FUSE_OPTIONS: FuseOptions = {
    threshold: 0.2, // More strict threshold for better matching
    keys: ["title"],
  };

  /**
   * Extract key identifiers from a title (like week numbers, dates)
   */
  private static extractKeyIdentifiers(title: string): string[] {
    const identifiers: string[] = [];

    // Extract week numbers (Week 1, Week 2, etc.)
    const weekMatch = title.match(/Week\s+(\d+)/i);
    if (weekMatch) {
      identifiers.push(`week${weekMatch[1]}`);
    }

    // Extract month and year (July 2025, etc.)
    const monthYearMatch = title.match(/([A-Za-z]+)\s+(\d{4})/);
    if (monthYearMatch) {
      identifiers.push(
        `${monthYearMatch[1].toLowerCase()}${monthYearMatch[2]}`,
      );
    }

    return identifiers;
  }

  /**
   * Check if two titles have compatible key identifiers
   */
  private static hasCompatibleIdentifiers(
    title1: string,
    title2: string,
  ): boolean {
    const identifiers1 = this.extractKeyIdentifiers(title1);
    const identifiers2 = this.extractKeyIdentifiers(title2);

    // If both have week identifiers, they must match
    const week1 = identifiers1.find((id) => id.startsWith("week"));
    const week2 = identifiers2.find((id) => id.startsWith("week"));

    if (week1 && week2 && week1 !== week2) {
      return false; // Different weeks are not compatible
    }

    // If both have month/year identifiers, they must match
    const monthYear1 = identifiers1.find((id) => id.match(/[a-z]+\d{4}/));
    const monthYear2 = identifiers2.find((id) => id.match(/[a-z]+\d{4}/));

    if (monthYear1 && monthYear2 && monthYear1 !== monthYear2) {
      return false; // Different month/year are not compatible
    }

    return true;
  }

  /**
   * Find the best matching post URL using fuzzy search
   */
  static findBestMatchUrl(
    postsData: SearchPostsOfPublicationData | null,
    searchQuery: string,
    fuseOptions: FuseOptions = this.DEFAULT_FUSE_OPTIONS,
  ): string | null {
    if (!postsData) return null;

    const nodes = postsData.edges.map((edge) => edge.node);
    if (!nodes.length) return null;

    const fuse = new Fuse(nodes, fuseOptions);
    const results = fuse.search(searchQuery);

    // Filter results to only include compatible matches
    const compatibleResults = results.filter((result) =>
      this.hasCompatibleIdentifiers(searchQuery, result.item.title),
    );

    // If no compatible results, return null
    if (!compatibleResults.length) return null;

    const bestMatch = compatibleResults[0];
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
