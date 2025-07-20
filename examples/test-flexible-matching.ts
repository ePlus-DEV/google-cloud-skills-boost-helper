import Fuse from "fuse.js";

// Test the new flexible SearchService logic
class FlexibleSearchService {
  private static readonly DEFAULT_FUSE_OPTIONS = {
    threshold: 0.15,
    keys: ["title"],
  };

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
        word.length > 2 && !commonWords.has(word) && /^[a-zA-Z0-9]+$/.test(word) // Only alphanumeric words
    );
  }

  /**
   * Check if distinctive words match between query and title
   */
  private static hasMatchingDistinctiveWords(
    query: string,
    title: string
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
    title: string
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

  static testMatching(posts: any[], searchQuery: string): any {
    const fuse = new Fuse(posts, this.DEFAULT_FUSE_OPTIONS);
    const results = fuse.search(searchQuery);

    console.log(`\n🔍 QUERY: "${searchQuery}"`);
    console.log(`Found ${results.length} initial results from Fuse.js\n`);

    const analysis = results.map((result: any) => {
      const title = result.item.title;

      console.log(`--- Analyzing: "${title}" ---`);

      // Extract distinctive words
      const queryDistinctive = this.extractDistinctiveWords(searchQuery);
      const titleDistinctive = this.extractDistinctiveWords(title);

      console.log(`Query distinctive words: [${queryDistinctive.join(", ")}]`);
      console.log(`Title distinctive words: [${titleDistinctive.join(", ")}]`);

      // Check distinctive word matching
      const distinctiveMatch = this.hasMatchingDistinctiveWords(
        searchQuery,
        title
      );
      console.log(`Distinctive words match: ${distinctiveMatch}`);

      // Calculate advanced similarity
      const similarity = this.calculateAdvancedSimilarity(searchQuery, title);
      console.log(`Advanced similarity: ${(similarity * 100).toFixed(1)}%`);

      const passes = distinctiveMatch && similarity >= 0.75;
      console.log(`Final result: ${passes ? "✅ PASS" : "❌ FAIL"}\n`);

      return {
        title,
        url: result.item.url,
        queryDistinctive,
        titleDistinctive,
        distinctiveMatch,
        similarity,
        passes,
      };
    });

    const validResults = analysis.filter((a) => a.passes);

    if (validResults.length > 0) {
      console.log(`🎯 FINAL MATCH: "${validResults[0].title}"`);
      return validResults[0].url;
    } else {
      console.log(`❌ NO VALID MATCHES FOUND`);
      return null;
    }
  }
}

// Test data with diverse scenarios
const diverseTestPosts = [
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
  {
    id: "4",
    title: "Build Kubernetes Cluster with Terraform",
    url: "https://example.com/k8s-terraform",
  },
  {
    id: "5",
    title: "Deploy Machine Learning Model on Google Cloud",
    url: "https://example.com/ml-deploy",
  },
  {
    id: "6",
    title: "Setup CI/CD Pipeline with GitHub Actions",
    url: "https://example.com/cicd-github",
  },
];

console.log("=== Testing Flexible Matching System ===");

const testQueries = [
  "Create an NPM Artifact Registry and Upload Code",
  "Create an Node Artifact Registry and Upload Code",
  "Build Kubernetes Cluster with Terraform",
  "Deploy Machine Learning Model",
  "Setup CI/CD Pipeline GitHub",
  "Create Python Application", // This should return null
];

testQueries.forEach((query) => {
  FlexibleSearchService.testMatching(diverseTestPosts, query);
  console.log("=".repeat(60));
});
