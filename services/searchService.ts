import Fuse from "fuse.js";
import type { SearchPostsOfPublicationData, FuseOptions } from "../types/api";

class SearchService {
  private static readonly DEFAULT_FUSE_OPTIONS: FuseOptions = {
    threshold: 0.15, // Even more strict threshold to avoid false positives
    keys: ["title"],
  };

  // Cache Fuse instance to avoid re-creating on every search
  private static readonly _fuseCache: WeakMap<
    object,
    Fuse<{ title: string; url?: string }>
  > = new WeakMap();

  /**
   * Get or create a cached Fuse instance for the given posts data
   */
  private static getFuseInstance(
    nodes: { title: string; url?: string }[],
    postsData: object,
    fuseOptions: FuseOptions,
  ): Fuse<{ title: string; url?: string }> {
    if (!this._fuseCache.has(postsData)) {
      this._fuseCache.set(postsData, new Fuse(nodes, fuseOptions));
    }
    const cached = this._fuseCache.get(postsData);
    if (!cached) {
      const instance = new Fuse(nodes, fuseOptions);
      this._fuseCache.set(postsData, instance);
      return instance;
    }
    return cached;
  }

  // Compile regex patterns once for better performance
  private static readonly SOLUTION_PATTERN = /\s*\(Solution\)\s*$/i;
  private static readonly WEEK_PATTERN = /Week\s+(\d+)/i;
  private static readonly MONTH_YEAR_PATTERN = /([A-Za-z]+)\s+(\d{4})/;
  private static readonly MONTH_YEAR_ID_PATTERN = /^[a-z]+\d{4}$/;
  private static readonly ALPHANUMERIC_PATTERN = /^[a-zA-Z0-9]+$/;

  // Common words to filter out (cached as Set)
  private static readonly COMMON_WORDS = new Set([
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

  /**
   * Normalize title by removing "(Solution)" suffix
   */
  private static normalizeTitle(title: string): string {
    return title.replace(this.SOLUTION_PATTERN, "").trim();
  }

  /**
   * Calculate exact word matching score between two strings
   */
  private static calculateExactWordMatch(query: string, title: string): number {
    const normalizedQuery = this.normalizeTitle(query);
    const normalizedTitle = this.normalizeTitle(title);
    const queryWords = normalizedQuery
      .toLowerCase()
      .split(/[\s-]+/)
      .map((w) => w.replaceAll(/[^a-z0-9]/g, ""))
      .filter(Boolean);
    const titleWordsSet = new Set(
      normalizedTitle
        .toLowerCase()
        .split(/[\s-]+/)
        .map((w) => w.replaceAll(/[^a-z0-9]/g, ""))
        .filter(Boolean),
    );

    let exactMatches = 0;
    for (const queryWord of queryWords) {
      if (titleWordsSet.has(queryWord)) {
        exactMatches++;
      }
    }

    return exactMatches / queryWords.length;
  }

  /**
   * Extract distinctive words that are likely important for matching
   */
  private static extractDistinctiveWords(text: string): Set<string> {
    // Split on whitespace and hyphens to handle "multi-modal" → ["multi", "modal"]
    const words = text.toLowerCase().split(/[\s-]+/);

    const distinctive = new Set<string>();
    for (const word of words) {
      // Strip leading/trailing non-alphanumeric chars (e.g. "Application:" → "application")
      const cleaned = word.replaceAll(/[^a-z0-9]/g, "");
      if (
        cleaned.length > 2 &&
        !this.COMMON_WORDS.has(cleaned) &&
        this.ALPHANUMERIC_PATTERN.test(cleaned)
      ) {
        distinctive.add(cleaned);
      }
    }

    return distinctive;
  }

  /**
   * Check if distinctive words match between query and title
   */
  private static hasMatchingDistinctiveWords(
    query: string,
    title: string,
  ): boolean {
    const normalizedQuery = this.normalizeTitle(query);
    const normalizedTitle = this.normalizeTitle(title);
    const queryDistinctive = this.extractDistinctiveWords(normalizedQuery);
    const titleDistinctive = this.extractDistinctiveWords(normalizedTitle);

    if (queryDistinctive.size === 0) return true;

    // Calculate how many distinctive words from query appear in title
    let matches = 0;
    for (const queryWord of queryDistinctive) {
      if (titleDistinctive.has(queryWord)) {
        matches++;
      }
    }

    // Require at least 80% of distinctive words to match
    const matchRatio = matches / queryDistinctive.size;
    return matchRatio >= 0.8;
  }

  /**
   * Advanced word similarity scoring
   */
  private static calculateAdvancedSimilarity(
    query: string,
    title: string,
  ): number {
    const normalizedQuery = this.normalizeTitle(query);
    const normalizedTitle = this.normalizeTitle(title);
    const queryWords = normalizedQuery
      .toLowerCase()
      .split(/[\s-]+/)
      .map((w) => w.replaceAll(/[^a-z0-9]/g, ""))
      .filter(Boolean);
    const titleWords = normalizedTitle
      .toLowerCase()
      .split(/[\s-]+/)
      .map((w) => w.replaceAll(/[^a-z0-9]/g, ""))
      .filter(Boolean);
    const titleWordsSet = new Set(titleWords);

    let totalScore = 0;
    const maxPossibleScore = queryWords.length;

    for (const queryWord of queryWords) {
      // Exact match gets full score
      if (titleWordsSet.has(queryWord)) {
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
    const weekMatch = this.WEEK_PATTERN.exec(title);
    if (weekMatch) {
      identifiers.push(`week${weekMatch[1]}`);
    }

    // Extract month and year (July 2025, etc.)
    const monthYearMatch = this.MONTH_YEAR_PATTERN.exec(title);
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
    const normalizedTitle1 = this.normalizeTitle(title1);
    const normalizedTitle2 = this.normalizeTitle(title2);
    const identifiers1 = this.extractKeyIdentifiers(normalizedTitle1);
    const identifiers2 = this.extractKeyIdentifiers(normalizedTitle2);

    // If both have week identifiers, they must match
    const week1 = identifiers1.find((id) => id.startsWith("week"));
    const week2 = identifiers2.find((id) => id.startsWith("week"));

    if (week1 && week2 && week1 !== week2) {
      return false; // Different weeks are not compatible
    }

    // If both have month/year identifiers, they must match
    const monthYear1 = identifiers1.find((id) =>
      this.MONTH_YEAR_ID_PATTERN.test(id),
    );
    const monthYear2 = identifiers2.find((id) =>
      this.MONTH_YEAR_ID_PATTERN.test(id),
    );

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

    // Normalize search query once to avoid repeated normalization
    const normalizedQuery = this.normalizeTitle(searchQuery);

    const fuse = this.getFuseInstance(nodes, postsData, fuseOptions);
    const results = fuse.search(normalizedQuery);

    // Enhanced filtering with flexible matching criteria
    const validResults = results.filter((result) => {
      const title = result.item.title;

      // 1. Must have compatible identifiers
      if (!this.hasCompatibleIdentifiers(normalizedQuery, title)) {
        return false;
      }

      // 2. Must have matching distinctive words
      if (!this.hasMatchingDistinctiveWords(normalizedQuery, title)) {
        return false;
      }

      // 3. Must meet advanced similarity threshold
      const similarityScore = this.calculateAdvancedSimilarity(
        normalizedQuery,
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

    // Append timestamp to bypass page-level cache on the solution site
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
