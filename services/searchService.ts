import Fuse from "fuse.js";
import type { FuseOptions } from "../types/api";

class SearchService {
  private static readonly DEFAULT_FUSE_OPTIONS: FuseOptions = {
    threshold: 0.2, // Very lenient threshold to find matches
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
  private static readonly COURSE_ID_PATTERN = /GSP\d+/;

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
   * Extract course ID from title (e.g., GSP016)
   */
  private static extractCourseId(text: string): string | null {
    const match = text.match(this.COURSE_ID_PATTERN);
    return match ? match[0] : null;
  }

  /**
   * Normalize title by removing "(Solution)" suffix and year prefixes like [2025]
   */
  private static normalizeTitle(title: string): string {
    return title
      .replace(this.SOLUTION_PATTERN, "") // Remove (Solution)
      .replace(/\[\d{4}\]\s*/g, "") // Remove [2025] style year prefixes
      .trim();
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

    if (queryWords.length === 0) return 0;

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
    // Remove year prefixes like [2025], [2024], etc. before processing
    let processed = text.replace(/\[\d{4}\]\s*/g, "");

    // Split on whitespace and hyphens to handle "multi-modal" → ["multi", "modal"]
    const words = processed.toLowerCase().split(/[\s-]+/);

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
    posts: Array<{
      id: string;
      title: string;
      slug: string;
      url: string;
      datePublished: string;
    }> | null,
    searchQuery: string,
    fuseOptions: FuseOptions = this.DEFAULT_FUSE_OPTIONS,
  ): string | null {
    if (!posts || posts.length === 0) {
      if (import.meta.env.DEV) {
        console.info("[SearchService] No posts provided, returning null");
      }
      return null;
    }

    if (import.meta.env.DEV) {
      console.info("[SearchService] Posts received:", posts.length);
      console.info(
        "[SearchService] Post titles:",
        posts.map((p) => p.title),
      );
      console.info("[SearchService] Search query:", searchQuery);
    }

    // Normalize search query once to avoid repeated normalization
    const normalizedQuery = this.normalizeTitle(searchQuery);
    if (import.meta.env.DEV) {
      console.info("[SearchService] Normalized query:", normalizedQuery);
    }

    // Extract course ID early for direct matching
    const queryCourseId = this.extractCourseId(normalizedQuery);
    if (import.meta.env.DEV && queryCourseId) {
      console.info(
        "[SearchService] Extracted course ID from query:",
        queryCourseId,
      );
    }

    // First priority: Try direct course ID match (most reliable)
    if (queryCourseId) {
      const courseIdMatch = posts.find((post) => {
        const postCourseId = this.extractCourseId(post.title);
        return postCourseId === queryCourseId;
      });
      if (courseIdMatch && courseIdMatch.url) {
        if (import.meta.env.DEV) {
          console.info(
            "[SearchService] ✓ Direct course ID match:",
            courseIdMatch.title,
          );
        }
        const separator = courseIdMatch.url.includes("?") ? "&" : "?";
        return `${courseIdMatch.url}${separator}t=${Date.now()}`;
      }
    }

    // Use Fuse.js directly on the posts array
    const fuse = new Fuse(posts, fuseOptions);
    const results = fuse.search(normalizedQuery);
    if (import.meta.env.DEV) {
      console.info(
        "[SearchService] Fuse.js returned",
        results.length,
        "results",
      );
      if (results.length > 0) {
        console.info(
          "[SearchService] Fuse results:",
          results.map((r) => ({ score: r.score, title: r.item.title })),
        );
      }
    }

    // Sort results: prioritize course ID matches
    results.sort((a, b) => {
      const aCourseId = this.extractCourseId(a.item.title);
      const bCourseId = this.extractCourseId(b.item.title);

      // If query has a course ID, prioritize matching items
      if (queryCourseId) {
        const aMatches = aCourseId === queryCourseId ? 1 : 0;
        const bMatches = bCourseId === queryCourseId ? 1 : 0;
        if (aMatches !== bMatches) {
          return bMatches - aMatches; // Higher priority first
        }
      }

      return 0; // Keep original order from Fuse
    });

    // Enhanced filtering with flexible matching criteria
    const validResults = results.filter((result) => {
      const title = result.item.title;
      const postCourseId = this.extractCourseId(title);

      // If both query and post have the same course ID, this is a strong signal
      if (queryCourseId && postCourseId && queryCourseId === postCourseId) {
        if (import.meta.env.DEV) {
          console.info("[SearchService] ✓ Accepted (course ID match):", title);
        }
        return true;
      }

      // 1. Must have compatible identifiers
      if (!this.hasCompatibleIdentifiers(normalizedQuery, title)) {
        if (import.meta.env.DEV) {
          console.info(
            "[SearchService] ✗ Rejected (incompatible identifiers):",
            title,
          );
        }
        return false;
      }

      // 2. Must have matching distinctive words
      if (!this.hasMatchingDistinctiveWords(normalizedQuery, title)) {
        if (import.meta.env.DEV) {
          console.info(
            "[SearchService] ✗ Rejected (no matching distinctive words):",
            title,
          );
        }
        return false;
      }

      // 3. Must meet advanced similarity threshold (relaxed to 0.6)
      const similarityScore = this.calculateAdvancedSimilarity(
        normalizedQuery,
        title,
      );
      if (similarityScore < 0.6) {
        // 60% similarity threshold (relaxed from 75%)
        if (import.meta.env.DEV) {
          console.info(
            "[SearchService] ✗ Rejected (low similarity:",
            similarityScore.toFixed(2),
            "):",
            title,
          );
        }
        return false;
      }

      if (import.meta.env.DEV) {
        console.info(
          "[SearchService] ✓ Accepted (similarity:",
          similarityScore.toFixed(2),
          "):",
          title,
        );
      }
      return true;
    });

    // If no valid results after filtering, return null
    if (!validResults.length) {
      if (import.meta.env.DEV) {
        console.info(
          "[SearchService] No valid results after filtering. All posts rejected.",
        );
      }

      // Fallback: if we have course ID, try direct match
      if (queryCourseId && posts.length > 0) {
        if (import.meta.env.DEV) {
          console.info(
            "[SearchService] Attempting fallback: direct course ID match",
          );
        }
        const courseIdMatch = posts.find((p) =>
          p.title.includes(queryCourseId),
        );
        if (courseIdMatch && courseIdMatch.url) {
          if (import.meta.env.DEV) {
            console.info(
              "[SearchService] ✓ Fallback matched by course ID:",
              courseIdMatch.title,
            );
          }
          const separator = courseIdMatch.url.includes("?") ? "&" : "?";
          return `${courseIdMatch.url}${separator}t=${Date.now()}`;
        }
      }

      // Final fallback: return first post if it has course ID
      if (posts && posts.length > 0 && this.extractCourseId(posts[0].title)) {
        if (import.meta.env.DEV) {
          console.info(
            "[SearchService] ✓ Final fallback: returning first post:",
            posts[0].title,
          );
        }
        const separator = posts[0].url.includes("?") ? "&" : "?";
        return `${posts[0].url}${separator}t=${Date.now()}`;
      }

      return null;
    }

    const bestMatch = validResults[0];
    const url = bestMatch.item.url;
    if (!url) return null;

    if (import.meta.env.DEV) {
      console.info("[SearchService] Best match URL:", url);
    }

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
    if (import.meta.env.MODE === "development") {
      console.info("[LabService] Looking for lab title...");
    }

    // Try selector h1.ql-title-large (direct, no shadow DOM)
    const titleElement = document.querySelector("h1.ql-title-large");
    if (titleElement) {
      const title = titleElement.textContent?.trim() || "";
      if (import.meta.env.MODE === "development") {
        console.info(
          "[LabService] ✓ Extracted title from h1.ql-title-large:",
          title,
        );
      }
      return title;
    }
    if (import.meta.env.MODE === "development") {
      console.info("[LabService] ✗ h1.ql-title-large not found");
    }

    // Try just h1 element as fallback
    const h1Element = document.querySelector("h1");
    if (h1Element) {
      const title = h1Element.textContent?.trim() || "";
      if (import.meta.env.MODE === "development") {
        console.info("[LabService] ✓ Extracted title from first h1:", title);
      }
      return title;
    }

    // Fallback to old selector
    const fallbackTitle =
      document
        .querySelector(".ql-display-large.lab-preamble__title")
        ?.textContent?.trim() || "";
    if (import.meta.env.MODE === "development") {
      console.info(
        "[LabService] Extracted title from fallback selector:",
        fallbackTitle,
      );
    }
    return fallbackTitle;
  }

  /**
   * Get GSP ID from page (e.g., GSP344)
   */
  static getGspId(): string {
    const h2Element = document.querySelector("h2");
    if (h2Element) {
      const text = h2Element.textContent?.trim() || "";
      // Extract GSP ID pattern (GSP followed by numbers)
      const match = text.match(/GSP\d+/);
      if (match) {
        if (import.meta.env.MODE === "development") {
          console.info("[LabService] Extracted GSP ID:", match[0]);
        }
        return match[0];
      }
    }
    if (import.meta.env.MODE === "development") {
      console.info("[LabService] No GSP ID found");
    }
    return "";
  }

  /**
   * Create combined query text for better search accuracy
   */
  static createCombinedQuery(): string {
    const labTitle = this.getLabTitle();
    const gspId = this.getGspId();
    const queryText = this.extractQueryText();

    // Build query with GSP ID first (more specific) then title
    const parts = [gspId, labTitle, queryText].filter(Boolean);
    const combinedQuery = parts.join(" - ").trim();
    if (import.meta.env.MODE === "development") {
      console.info("[LabService] Combined query for search:", combinedQuery);
    }
    return combinedQuery;
  }
}

export default SearchService;
