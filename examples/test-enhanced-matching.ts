import Fuse from "fuse.js";

// Test the enhanced SearchService logic
class TestSearchService {
  private static readonly DEFAULT_FUSE_OPTIONS = {
    threshold: 0.15, // Enhanced threshold
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
   * Check if key technical terms match exactly (e.g., NPM vs Node)
   */
  private static hasExactTechnicalMatch(query: string, title: string): boolean {
    const technicalTerms = [
      "npm",
      "node",
      "docker",
      "python",
      "java",
      "golang",
      "kubernetes",
      "terraform",
    ];

    const queryLower = query.toLowerCase();
    const titleLower = title.toLowerCase();

    for (const term of technicalTerms) {
      const queryHasTerm = queryLower.includes(term);
      const titleHasTerm = titleLower.includes(term);

      // If query has a technical term, title must have the same term
      if (queryHasTerm && !titleHasTerm) {
        return false;
      }
    }

    return true;
  }

  static findBestMatchUrl(posts: any[], searchQuery: string): string | null {
    const fuse = new Fuse(posts, this.DEFAULT_FUSE_OPTIONS);
    const results = fuse.search(searchQuery);

    // Enhanced filtering with multiple criteria
    const validResults = results.filter((result: any) => {
      const title = result.item.title;

      console.log(`\n--- Checking: "${title}" ---`);

      // 1. Must have exact technical term match
      const technicalMatch = this.hasExactTechnicalMatch(searchQuery, title);
      console.log(`Technical match: ${technicalMatch}`);
      if (!technicalMatch) {
        return false;
      }

      // 2. Must have high word matching score for very similar titles
      const wordMatchScore = this.calculateExactWordMatch(searchQuery, title);
      console.log(`Word match score: ${(wordMatchScore * 100).toFixed(1)}%`);
      if (wordMatchScore < 0.7) {
        return false;
      }

      console.log(`✅ PASSED all filters`);
      return true;
    });

    return validResults.length > 0 ? validResults[0].item.url : null;
  }
}

// Test data
const testPosts = [
  {
    id: "1",
    title: "Create an NPM Artifact Registry and Upload Code",
    url: "https://example.com/npm-registry",
  },
  {
    id: "2",
    title: "Create an Node Artifact Registry and Upload Code",
    url: "https://example.com/node-registry",
  },
  {
    id: "3",
    title: "Create a Docker Artifact Registry and Upload Code",
    url: "https://example.com/docker-registry",
  },
];

console.log("=== Testing Enhanced Matching ===");

const testQueries = [
  "Create an NPM Artifact Registry and Upload Code",
  "Create an Node Artifact Registry and Upload Code",
];

testQueries.forEach((query) => {
  console.log(`\n🔍 QUERY: "${query}"`);
  const result = TestSearchService.findBestMatchUrl(testPosts, query);

  if (result) {
    console.log(`✅ RESULT: ${result}`);
  } else {
    console.log(`❌ NO VALID MATCH FOUND`);
  }
  console.log("=".repeat(50));
});
