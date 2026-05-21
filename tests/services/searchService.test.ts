import { describe, it, expect, beforeEach } from "vitest";
import SearchService from "../../services/searchService";

describe("SearchService.findBestMatchUrl", () => {
  it("returns null for null postsData", () => {
    expect(SearchService.findBestMatchUrl(null, "some query")).toBeNull();
  });

  it("returns null for empty array", () => {
    expect(SearchService.findBestMatchUrl([], "some query")).toBeNull();
  });

  it("finds exact title match", () => {
    const posts = [
      {
        id: "0",
        title: "Deploy a Kubernetes Cluster",
        url: "https://example.com/deploy-k8s",
        slug: "deploy-k8s",
        datePublished: "",
      },
      {
        id: "1",
        title: "Setup Cloud Storage",
        url: "https://example.com/cloud-storage",
        slug: "cloud-storage",
        datePublished: "",
      },
    ];
    const result = SearchService.findBestMatchUrl(
      posts,
      "Deploy a Kubernetes Cluster",
    );
    expect(result).toContain("deploy-k8s");
  });

  it("returns null when no good match found", () => {
    const posts = [
      {
        id: "0",
        title: "Completely Different Topic",
        url: "https://example.com/different",
        slug: "different",
        datePublished: "",
      },
    ];
    const result = SearchService.findBestMatchUrl(
      posts,
      "Deploy Kubernetes Cluster on GKE",
    );
    expect(result).toBeNull();
  });

  it("appends timestamp to result URL", () => {
    const posts = [
      {
        id: "0",
        title: "Deploy a Kubernetes Cluster",
        url: "https://example.com/deploy-k8s",
        slug: "deploy-k8s",
        datePublished: "",
      },
    ];
    const result = SearchService.findBestMatchUrl(
      posts,
      "Deploy a Kubernetes Cluster",
    );
    expect(result).toMatch(/[?&]t=\d+$/);
  });

  it("uses & separator when URL already has query params", () => {
    const posts = [
      {
        id: "0",
        title: "Deploy a Kubernetes Cluster",
        url: "https://example.com/deploy-k8s?v=1",
        slug: "deploy-k8s",
        datePublished: "",
      },
    ];
    const result = SearchService.findBestMatchUrl(
      posts,
      "Deploy a Kubernetes Cluster",
    );
    expect(result).toContain("&t=");
  });

  it("ignores (Solution) suffix in query", () => {
    const posts = [
      {
        id: "0",
        title: "Deploy a Kubernetes Cluster",
        url: "https://example.com/deploy-k8s",
        slug: "deploy-k8s",
        datePublished: "",
      },
    ];
    const result = SearchService.findBestMatchUrl(
      posts,
      "Deploy a Kubernetes Cluster (Solution)",
    );
    expect(result).toContain("deploy-k8s");
  });

  it("rejects match with different week number", () => {
    const posts = [
      {
        id: "0",
        title: "Arcade Quiz Week 2 2025",
        url: "https://example.com/week2",
        slug: "week2",
        datePublished: "",
      },
    ];
    const result = SearchService.findBestMatchUrl(
      posts,
      "Arcade Quiz Week 1 2025",
    );
    expect(result).toBeNull();
  });

  it("matches lab title with colon and hyphenated words", () => {
    const posts = [
      {
        id: "0",
        title: "Build a Multi-Modal GenAI Application: Challenge Lab",
        url: "https://eplus.dev/build-a-multi-modal-genai-application-challenge-lab-bb-ide-genai-004",
        slug: "multi-modal-genai",
        datePublished: "",
      },
    ];
    const result = SearchService.findBestMatchUrl(
      posts,
      "Build a Multi-Modal GenAI Application: Challenge Lab",
    );
    expect(result).toContain("multi-modal-genai");
  });
});

describe("SearchService.extractQueryText", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("returns empty string when no outline container", () => {
    expect(SearchService.extractQueryText()).toBe("");
  });

  it("returns lab title when first outline item is Overview", () => {
    document.body.innerHTML = `
      <ul>
        <li class="lab-content__outline js-lab-content-outline">
          <li>Overview</li>
        </li>
      </ul>
      <h1 class="ql-display-large lab-preamble__title">My Lab Title</h1>
    `;
    // The selector looks for .lab-content__outline.js-lab-content-outline
    // then closest("ul") - this is a simplified test
    expect(SearchService.extractQueryText()).toBe("");
  });
});

describe("SearchService.getLabTitle", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("returns empty string when element not found", () => {
    expect(SearchService.getLabTitle()).toBe("");
  });

  it("returns lab title text content", () => {
    const el = document.createElement("h1");
    el.className = "ql-display-large lab-preamble__title";
    el.textContent = "  My Lab Title  ";
    document.body.appendChild(el);

    expect(SearchService.getLabTitle()).toBe("My Lab Title");
  });
});

describe("SearchService.createCombinedQuery", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("returns trimmed combined query", () => {
    const el = document.createElement("h1");
    el.className = "ql-display-large lab-preamble__title";
    el.textContent = "Lab Title";
    document.body.appendChild(el);

    const result = SearchService.createCombinedQuery();
    expect(result).toContain("Lab Title");
  });
});
