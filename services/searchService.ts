import Fuse from "fuse.js";
import type {
  SearchPostsOfPublicationData,
  FuseOptions,
} from "../types/api";

class SearchService {
  private static readonly DEFAULT_FUSE_OPTIONS: FuseOptions = {
    threshold: 0.15, // Even more strict threshold to avoid false positives
    keys: ["title"],
  };

  /**
   * Calculate exact word matching score between two strings
   */
  private static calculateExactWordMatch(query: string, title: string): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const titleWords = title.toLowerCase().split(/\s+/);

    let exactMatches = 0;
    queryWords.forEach((queryWord) => {
      if (titleWords.includes(queryWord)) {
        exactMatches++;
      }
    });

    return exactMatches / queryWords.length;
  }

  /**
   * Extract distinctive words that are likely important for matching
   */
  private static extractDistinctiveWords(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/);

    // Filter out common words that don't affect meaning
    const commonWords = new Set([
      "a",
      "an",
      "the",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "create",
      "build",
      "setup",
      "configure",
      "deploy",
      "upload",
      "download",
      "install",
      "code",
      "project",
      "application",
      "service",
      "system",
      "using",
      "how",
      "what",
      "where",
    ]);

    return words.filter(
      (word) =>
        word.length > 2 &&
        !commonWords.has(word) &&
        /^[a-zA-Z0-9]+$/.test(word), // Only alphanumeric words
    );
  }

  /**
   * Check if distinctive words match between query and title
   */
  private static hasMatchingDistinctiveWords(
    query: string,
    title: string,
  ): boolean {
    const queryDistinctive = this.extractDistinctiveWords(query);
    const titleDistinctive = this.extractDistinctiveWords(title);

    if (queryDistinctive.length === 0) return true;

    // Calculate how many distinctive words from query appear in title
    let matches = 0;
    for (const queryWord of queryDistinctive) {
      if (titleDistinctive.includes(queryWord)) {
        matches++;
      }
    }

    // Require at least 80% of distinctive words to match
    const matchRatio = matches / queryDistinctive.length;
    return matchRatio >= 0.8;
  }

  /**
   * Advanced word similarity scoring
   */
  private static calculateAdvancedSimilarity(
    query: string,
    title: string,
  ): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const titleWords = title.toLowerCase().split(/\s+/);

    let totalScore = 0;
    let maxPossibleScore = 0;

    for (const queryWord of queryWords) {
      maxPossibleScore += 1;

      // Exact match gets full score
      if (titleWords.includes(queryWord)) {
        totalScore += 1;
        continue;
      }

      // Partial match for words that contain each other
      let bestPartialScore = 0;
      for (const titleWord of titleWords) {
        if (queryWord.includes(titleWord) || titleWord.includes(queryWord)) {
          const similarity =
            Math.min(queryWord.length, titleWord.length) /
            Math.max(queryWord.length, titleWord.length);
          bestPartialScore = Math.max(bestPartialScore, similarity * 0.5);
        }
      }
      totalScore += bestPartialScore;
    }

    return maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0;
  }

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
   * Find the best matching post URL using fuzzy search with enhanced filtering
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

    // Enhanced filtering with flexible matching criteria
    const validResults = results.filter((result) => {
      const title = result.item.title;

      // 1. Must have compatible identifiers (existing logic)
      if (!this.hasCompatibleIdentifiers(searchQuery, title)) {
        return false;
      }

      // 2. Must have matching distinctive words (new flexible approach)
      if (!this.hasMatchingDistinctiveWords(searchQuery, title)) {
        return false;
      }

      // 3. Must meet advanced similarity threshold
      const similarityScore = this.calculateAdvancedSimilarity(
        searchQuery,
        title,
      );
      if (similarityScore < 0.75) {
        // 75% similarity threshold
        return false;
      }

      return true;
    });

    // If no valid results after filtering, return null
    if (!validResults.length) return null;

    const bestMatch = validResults[0];
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
