import Fuse from "fuse.js";

// Test data to simulate the matching behavior
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

// Fuse.js options from SearchService
const fuseOptions = {
  threshold: 0.2,
  keys: ["title"],
  includeScore: true, // Add score to see matching quality
};

function testMatching() {
  const fuse = new Fuse(testPosts, fuseOptions);

  console.log("=== Testing Matching Behavior ===");

  // Test search queries
  const queries = [
    "Create an NPM Artifact Registry and Upload Code",
    "Create an Node Artifact Registry and Upload Code",
    "Create NPM Artifact Registry",
    "Create Node Artifact Registry",
    "NPM Artifact Registry",
    "Node Artifact Registry",
  ];

  queries.forEach((query) => {
    console.log(`\n--- Query: "${query}" ---`);
    const results = fuse.search(query);

    if (results.length === 0) {
      console.log("No matches found");
    } else {
      results.forEach((result, index) => {
        console.log(
          `${index + 1}. "${result.item.title}" (Score: ${result.score?.toFixed(
            3,
          )})`,
        );
      });
    }
  });
}

function testWithDifferentThresholds() {
  console.log("\n=== Testing Different Thresholds ===");

  const thresholds = [0.1, 0.2, 0.3, 0.4, 0.5];
  const testQuery = "Create an NPM Artifact Registry and Upload Code";

  thresholds.forEach((threshold) => {
    console.log(`\n--- Threshold: ${threshold} ---`);
    const fuse = new Fuse(testPosts, {
      ...fuseOptions,
      threshold,
      includeScore: true,
    });

    const results = fuse.search(testQuery);
    console.log(`Query: "${testQuery}"`);

    if (results.length === 0) {
      console.log("No matches found");
    } else {
      results.forEach((result, index) => {
        console.log(
          `${index + 1}. "${result.item.title}" (Score: ${result.score?.toFixed(
            3,
          )})`,
        );
      });
    }
  });
}

// Enhanced matching with word-level comparison
function enhancedMatching() {
  console.log("\n=== Enhanced Word-Level Matching ===");

  function calculateWordSimilarity(query: string, title: string): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const titleWords = title.toLowerCase().split(/\s+/);

    let matches = 0;
    let totalWords = queryWords.length;

    queryWords.forEach((queryWord) => {
      if (
        titleWords.some(
          (titleWord) =>
            titleWord.includes(queryWord) || queryWord.includes(titleWord),
        )
      ) {
        matches++;
      }
    });

    return matches / totalWords;
  }

  const testQuery = "Create an NPM Artifact Registry and Upload Code";

  console.log(`Query: "${testQuery}"`);
  testPosts.forEach((post) => {
    const similarity = calculateWordSimilarity(testQuery, post.title);
    console.log(
      `"${post.title}" - Similarity: ${(similarity * 100).toFixed(1)}%`,
    );
  });
}

// Run tests
testMatching();
testWithDifferentThresholds();
enhancedMatching();
