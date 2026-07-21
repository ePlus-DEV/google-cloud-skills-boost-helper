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
      .flatMap((word) => {
        const cleaned = word.replaceAll(/[^a-z0-9]/g, "");
        return cleaned ? [cleaned] : [];
      });
    const titleWordsSet = new Set(
      normalizedTitle
        .toLowerCase()
        .split(/[\s-]+/)
        .flatMap((word) => {
          const cleaned = word.replaceAll(/[^a-z0-9]/g, "");
          return cleaned ? [cleaned] : [];
        }),
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
    const processed = text.replace(/\[\d{4}\]\s*/g, "");

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
      .flatMap((word) => {
        const cleaned = word.replaceAll(/[^a-z0-9]/g, "");
        return cleaned ? [cleaned] : [];
      });
    const titleWords = normalizedTitle
      .toLowerCase()
      .split(/[\s-]+/)
      .flatMap((word) => {
        const cleaned = word.replaceAll(/[^a-z0-9]/g, "");
        return cleaned ? [cleaned] : [];
      });
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

    const normalizedQuery = this.normalizeTitle(searchQuery);
    if (import.meta.env.DEV) {
      console.info("[SearchService] Normalized query:", normalizedQuery);
    }

    const queryCourseId = this.extractCourseId(normalizedQuery);
    if (import.meta.env.DEV && queryCourseId) {
      console.info(
        "[SearchService] Extracted course ID from query:",
        queryCourseId,
      );
    }

    // If query contains a course ID, prefer searching only among posts with that ID first
    if (queryCourseId) {
      const postsWithCourse = posts.filter(
        (post) => this.extractCourseId(post.title) === queryCourseId,
      );

      if (postsWithCourse.length > 0) {
        if (import.meta.env.DEV) {
          console.info(
            "[SearchService] Searching within posts matching course ID:",
            queryCourseId,
            postsWithCourse.length,
          );
        }

        const courseResults = this.getFuseResults(
          postsWithCourse,
          normalizedQuery,
          fuseOptions,
        );
        this.sortResultsByCourseId(courseResults, queryCourseId);
        const validCourseResults = this.filterValidResults(
          courseResults,
          normalizedQuery,
          queryCourseId,
        );

        if (validCourseResults.length) {
          const best = validCourseResults[0];
          const url = best.item.url;
          if (url) {
            const separator = url.includes("?") ? "&" : "?";
            return `${url}${separator}t=${Date.now()}`;
          }
        }
        // otherwise fallthrough to searching all posts by title
      }
    }

    const results = this.getFuseResults(posts, normalizedQuery, fuseOptions);
    this.sortResultsByCourseId(results, queryCourseId);

    const validResults = this.filterValidResults(
      results,
      normalizedQuery,
      queryCourseId,
    );

    if (!validResults.length) {
      const fallback = this.getFallbackUrl(posts, queryCourseId);
      if (fallback) return fallback;
      return null;
    }

    const bestMatch = validResults[0];
    const url = bestMatch.item.url;
    if (!url) return null;

    if (import.meta.env.DEV) {
      console.info("[SearchService] Best match URL:", url);
    }

    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}t=${Date.now()}`;
  }
  /**
   * Run Fuse.js search on the provided posts using the given options
   * and return Fuse search results for the normalized query.
   * @param posts Array of post objects with `title` and `url` fields
   * @param normalizedQuery Pre-normalized query string to search for
   * @param fuseOptions Fuse.js configuration options
   * @returns Fuse search results array
   */
  private static getFuseResults(
    posts: Array<{ title: string; url: string }>,
    normalizedQuery: string,
    fuseOptions: FuseOptions,
  ) {
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
    return results;
  }

  /**
   * Find the best match and return both URL and title when available.
   * This wraps the existing `findBestMatchUrl` logic and resolves the
   * corresponding post title from the posts array.
   * @param posts Posts array to search
   * @param searchQuery Query string to use for matching
   */
  static findBestMatch(
    posts: Array<{
      id: string;
      title: string;
      slug: string;
      url: string;
      datePublished: string;
    }> | null,
    searchQuery: string,
    fuseOptions: FuseOptions = this.DEFAULT_FUSE_OPTIONS,
  ): { url: string; title: string } | null {
    const url = this.findBestMatchUrl(posts, searchQuery, fuseOptions);
    if (!url) return null;

    try {
      const parsed = new URL(url);
      // remove timestamp param for matching against original post URLs
      const searchParams = parsed.searchParams;
      searchParams.delete("t");
      const stripped = `${parsed.origin}${parsed.pathname}${
        searchParams.toString() ? `?${searchParams.toString()}` : ""
      }`;

      const match = (posts || []).find((p) => {
        if (!p.url) return false;
        try {
          const pUrl = new URL(p.url);
          const pStripped = `${pUrl.origin}${pUrl.pathname}${
            pUrl.search ? pUrl.search : ""
          }`;
          return (
            pStripped === stripped || url.startsWith(pStripped) || p.url === url
          );
        } catch (e) {
          return p.url === url || url.startsWith(p.url);
        }
      });

      return { url, title: match ? match.title : "" };
    } catch (e) {
      return { url, title: "" };
    }
  }

  /**
   * Sort search results to prioritize items matching the query course ID.
   * This reorders the results array in-place.
   * @param results Fuse search results to sort
   * @param queryCourseId Course ID extracted from the query, or null
   */
  private static sortResultsByCourseId(
    results: Array<{ item: { title: string } }>,
    queryCourseId: string | null,
  ) {
    results.sort((a, b) => {
      const aCourseId = this.extractCourseId(a.item.title);
      const bCourseId = this.extractCourseId(b.item.title);

      if (queryCourseId) {
        const aMatches = aCourseId === queryCourseId ? 1 : 0;
        const bMatches = bCourseId === queryCourseId ? 1 : 0;
        if (aMatches !== bMatches) {
          return bMatches - aMatches;
        }
      }
      return 0;
    });
  }

  /**
   * Filter Fuse results with additional compatibility and similarity checks.
   * Returns only results that meet identifier, distinctive-word and similarity thresholds.
   * @param results Fuse.js results to filter
   * @param normalizedQuery Normalized query string used for similarity checks
   * @param queryCourseId Optional course ID extracted from the query
   */
  private static filterValidResults(
    results: Array<{ item: { title: string; url?: string } }>,
    normalizedQuery: string,
    queryCourseId: string | null,
  ) {
    return results.filter((result) => {
      const title = result.item.title;
      const postCourseId = this.extractCourseId(title);

      if (queryCourseId && postCourseId && queryCourseId === postCourseId) {
        if (import.meta.env.DEV) {
          console.info("[SearchService] ✓ Accepted (course ID match):", title);
        }
        return true;
      }

      if (!this.hasCompatibleIdentifiers(normalizedQuery, title)) {
        if (import.meta.env.DEV) {
          console.info(
            "[SearchService] ✗ Rejected (incompatible identifiers):",
            title,
          );
        }
        return false;
      }

      if (!this.hasMatchingDistinctiveWords(normalizedQuery, title)) {
        if (import.meta.env.DEV) {
          console.info(
            "[SearchService] ✗ Rejected (no matching distinctive words):",
            title,
          );
        }
        return false;
      }

      const similarityScore = this.calculateAdvancedSimilarity(
        normalizedQuery,
        title,
      );
      if (similarityScore < 0.6) {
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
  }

  /**
   * Attempt fallback strategies when no valid Fuse results are found.
   * Tries direct course ID match first, then returns the first post if it contains a course ID.
   * @param posts Original posts array
   * @param queryCourseId Optional course ID extracted from the query
   * @returns A URL string with timestamp or null if none found
   */
  private static getFallbackUrl(
    posts: Array<{ title: string; url: string }>,
    queryCourseId: string | null,
  ): string | null {
    if (import.meta.env.DEV) {
      console.info(
        "[SearchService] No valid results after filtering. All posts rejected.",
      );
    }

    if (queryCourseId && posts.length > 0) {
      if (import.meta.env.DEV) {
        console.info(
          "[SearchService] Attempting fallback: direct course ID match",
        );
      }
      const courseIdMatch = posts.find((p) => p.title.includes(queryCourseId));
      if (courseIdMatch?.url) {
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

    if (posts.length > 0 && this.extractCourseId(posts[0].title)) {
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

    // Priority: some lab pages (e.g., /focuses/62711) render title inside nested
    // shadow roots under ql-lab-header -> ql-header. Try the explicit path first.
    try {
      const labHeader = document.querySelector(
        "#lab-instructions > div > div.lab-content__renderable-instructions.js-lab-content > ql-lab-header",
      ) as Element | null;
      if (labHeader?.shadowRoot) {
        const qlHeader = labHeader.shadowRoot.querySelector(
          "ql-header",
        ) as Element | null;
        if (qlHeader?.shadowRoot) {
          const deepH1 = qlHeader.shadowRoot.querySelector(
            "div > div.main-container > div > h1",
          );
          if (deepH1) {
            const title = deepH1.textContent?.trim() || "";
            if (import.meta.env.MODE === "development") {
              console.info(
                "[LabService] ✓ Extracted title from nested shadow path:",
                title,
              );
            }
            return title;
          }
        }
      }
    } catch (e) {
      // ignore and continue with other heuristics
    }

    // Try selector h1.ql-title-large (search including shadow DOM)
    const titleElement =
      this.querySelectorDeep("h1.ql-title-large") ||
      document.querySelector("h1.ql-title-large");
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

    // Try just h1 element as fallback (search including shadow DOM)
    const h1Element =
      this.querySelectorDeep("h1") || document.querySelector("h1");
    if (h1Element) {
      const title = h1Element.textContent?.trim() || "";
      if (import.meta.env.MODE === "development") {
        console.info("[LabService] ✓ Extracted title from first h1:", title);
      }
      return title;
    }

    // Fallback to old selector (search including shadow DOM)
    const fallbackEl =
      this.querySelectorDeep(".ql-display-large.lab-preamble__title") ||
      document.querySelector(".ql-display-large.lab-preamble__title");
    const fallbackTitle = fallbackEl?.textContent?.trim() || "";
    if (import.meta.env.MODE === "development") {
      console.info(
        "[LabService] Extracted title from fallback selector:",
        fallbackTitle,
      );
    }
    return fallbackTitle;
  }

  /** Collect all accessible shadow roots, including nested roots. */
  private static collectOpenShadowRoots(
    root: Document | ShadowRoot = document,
  ): ShadowRoot[] {
    const shadowRoots: ShadowRoot[] = [];
    const visited = new Set<ShadowRoot>();

    const visit = (searchRoot: Document | ShadowRoot): void => {
      for (const element of Array.from(searchRoot.querySelectorAll("*"))) {
        try {
          const shadowRoot = element.shadowRoot;
          if (!shadowRoot || visited.has(shadowRoot)) continue;

          visited.add(shadowRoot);
          shadowRoots.push(shadowRoot);
          visit(shadowRoot);
        } catch {
          // Ignore inaccessible or browser-managed shadow roots.
        }
      }
    };

    visit(root);
    return shadowRoots;
  }

  /**
   * Query selector that searches into shadow roots recursively.
   * Returns the first matching Element or null.
   */
  private static querySelectorDeep(selector: string): Element | null {
    try {
      const direct = document.querySelector(selector);
      if (direct) return direct;

      for (const shadowRoot of this.collectOpenShadowRoots()) {
        const found = shadowRoot.querySelector(selector);
        if (found) return found;
      }
    } catch {
      // Ignore malformed selectors and inaccessible roots.
    }
    return null;
  }

  /**
   * Get GSP ID from page (e.g., GSP344, GSP1164)
   */
  static getGspId(): string {
    // Attempt 1: Check h2 element
    const h2Element = document.querySelector("h2");
    if (h2Element) {
      const text = h2Element.textContent?.trim() || "";
      const match = text.match(/GSP\d+/);
      if (match) {
        if (import.meta.env.MODE === "development") {
          console.info("[LabService] ✓ Extracted GSP ID from h2:", match[0]);
        }
        return match[0];
      }
    }

    // Attempt 2: Check URL for GSP ID pattern
    const urlMatch = window.location.href.match(/GSP\d+/);
    if (urlMatch) {
      if (import.meta.env.MODE === "development") {
        console.info("[LabService] ✓ Extracted GSP ID from URL:", urlMatch[0]);
      }
      return urlMatch[0];
    }

    // Attempt 3: Broad search through visible page text (including shadow DOM)
    const allText = this.getPageText();
    const pageMatch = allText.match(/GSP\d+/);
    if (pageMatch) {
      if (import.meta.env.MODE === "development") {
        console.info(
          "[LabService] ✓ Extracted GSP ID from page text:",
          pageMatch[0],
        );
      }
      return pageMatch[0];
    }

    if (import.meta.env.MODE === "development") {
      console.info("[LabService] ✗ No GSP ID found in h2, URL, or page text");
    }
    return "";
  }

  /**
   * Get all text from page including nested shadow DOM
   */
  private static getPageText(): string {
    const texts = [document.body.textContent || ""];

    try {
      for (const shadowRoot of this.collectOpenShadowRoots()) {
        texts.push(shadowRoot.textContent || "");
      }
    } catch {
      // Ignore inaccessible roots and return the text collected so far.
    }

    return texts.join(" ");
  }

  /**
   * Create combined query text for better search accuracy
   */
  static createCombinedQuery(): string {
    const labTitle = this.getLabTitle();
    const gspId = this.getGspId();
    const queryText = this.extractQueryText();

    // Use queryText as fallback for lab title if title is empty
    const primaryTitle =
      labTitle || (queryText && queryText !== "Overview" ? queryText : "");

    // Build query with title first, then GSP ID and query text
    // Include queryText even if we have a title, as it provides additional context
    const parts = [primaryTitle, gspId].filter(Boolean);
    if (queryText && queryText !== primaryTitle) {
      parts.push(queryText);
    }
    const combinedQuery = parts.join(" - ").trim();
    if (import.meta.env.MODE === "development") {
      console.info("[LabService] Lab title:", labTitle);
      console.info("[LabService] GSP ID:", gspId);
      console.info("[LabService] Query text:", queryText);
      console.info("[LabService] Combined query for search:", combinedQuery);
    }
    return combinedQuery;
  }
}

export default SearchService;
