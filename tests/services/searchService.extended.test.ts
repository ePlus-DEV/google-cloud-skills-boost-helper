import { describe, it, expect, beforeEach } from "vitest";
import SearchService from "../../services/searchService";

describe("SearchService.findBestMatchUrl - extended", () => {
  it("rejects match with different month/year", () => {
    const posts = [
      {
        id: "0",
        title: "Arcade Quiz July 2025",
        url: "https://example.com/july",
        slug: "july",
        datePublished: "",
      },
    ];
    const result = SearchService.findBestMatchUrl(
      posts,
      "Arcade Quiz August 2025",
    );
    expect(result).toBeNull();
  });

  it("accepts match with same month/year", () => {
    const posts = [
      {
        id: "0",
        title: "Arcade Quiz July 2025",
        url: "https://example.com/july",
        slug: "july",
        datePublished: "",
      },
    ];
    const result = SearchService.findBestMatchUrl(
      posts,
      "Arcade Quiz July 2025",
    );
    expect(result).toContain("july");
  });

  it("handles (Solution) suffix in post title", () => {
    const posts = [
      {
        id: "0",
        title: "Deploy a Kubernetes Cluster (Solution)",
        url: "https://example.com/k8s",
        slug: "k8s",
        datePublished: "",
      },
    ];
    const result = SearchService.findBestMatchUrl(
      posts,
      "Deploy a Kubernetes Cluster",
    );
    expect(result).toContain("k8s");
  });

  it("returns null when URL is missing from best match", () => {
    const posts = [
      {
        id: "0",
        title: "Deploy a Kubernetes Cluster",
        slug: "k8s",
        datePublished: "",
      },
    ];
    const result = SearchService.findBestMatchUrl(
      posts,
      "Deploy a Kubernetes Cluster",
    );
    expect(result).toBeNull();
  });

  it("uses custom fuseOptions when provided", () => {
    const posts = [
      {
        id: "0",
        title: "Deploy a Kubernetes Cluster",
        url: "https://example.com/k8s",
        slug: "k8s",
        datePublished: "",
      },
    ];
    const result = SearchService.findBestMatchUrl(
      posts,
      "Deploy a Kubernetes Cluster",
      { threshold: 0.3, keys: ["title"] },
    );
    expect(result).toContain("k8s");
  });

  it("rejects low similarity match", () => {
    const posts = [
      {
        id: "0",
        title: "Introduction to Machine Learning",
        url: "https://example.com/ml",
        slug: "ml",
        datePublished: "",
      },
    ];
    // Completely different topic
    const result = SearchService.findBestMatchUrl(
      posts,
      "Deploy Kubernetes on GKE Advanced",
    );
    expect(result).toBeNull();
  });
});

describe("SearchService.extractQueryText - extended", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("returns first outline item text when not Overview", () => {
    document.body.innerHTML = `
      <ul>
        <li class="lab-content__outline js-lab-content-outline">Task 1: Setup</li>
      </ul>
    `;
    const result = SearchService.extractQueryText();
    expect(result).toBe("Task 1: Setup");
  });

  it("returns lab title when first item is Overview", () => {
    document.body.innerHTML = `
      <ul>
        <li class="lab-content__outline js-lab-content-outline">Overview</li>
      </ul>
      <h1 class="ql-display-large lab-preamble__title">My Lab</h1>
    `;
    const result = SearchService.extractQueryText();
    expect(result).toBe("My Lab");
  });
});

describe("SearchService.createCombinedQuery - extended", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("combines lab title and query text", () => {
    document.body.innerHTML = `
      <h1 class="ql-display-large lab-preamble__title">Lab Title</h1>
      <ul>
        <li class="lab-content__outline js-lab-content-outline">Task 1</li>
      </ul>
    `;
    const result = SearchService.createCombinedQuery();
    expect(result).toContain("Lab Title");
    expect(result).toContain("Task 1");
  });

  it("returns trimmed result when no elements found", () => {
    const result = SearchService.createCombinedQuery();
    expect(result).toBe("");
  });
});
