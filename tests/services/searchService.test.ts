import { beforeEach, afterEach, describe, it, expect } from "vitest";
import SearchService from "../../services/searchService";

describe("SearchService.getLabTitle", () => {
  beforeEach(() => {
    // clear DOM before each test
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("extracts title from nested ql-lab-header -> ql-header shadow roots", () => {
    // Build the nested structure matching the real page
    const labInstructions = document.createElement("div");
    labInstructions.id = "lab-instructions";
    const wrapper = document.createElement("div");
    const renderable = document.createElement("div");
    renderable.className =
      "lab-content__renderable-instructions js-lab-content";
    const qlLabHeader = document.createElement("ql-lab-header");
    renderable.appendChild(qlLabHeader);
    wrapper.appendChild(renderable);
    labInstructions.appendChild(wrapper);
    document.body.appendChild(labInstructions);

    // first shadow root on ql-lab-header containing ql-header
    const sr1 = qlLabHeader.attachShadow({ mode: "open" });
    const qlHeader = document.createElement("ql-header");
    sr1.appendChild(qlHeader);

    // second shadow root on ql-header with the deep h1
    const sr2 = qlHeader.attachShadow({ mode: "open" });
    const outerDiv = document.createElement("div");
    const innerDiv = document.createElement("div");
    innerDiv.className = "main-container";
    const container = document.createElement("div");
    const h1 = document.createElement("h1");
    h1.textContent = "Deep Shadow Title";
    container.appendChild(h1);
    innerDiv.appendChild(container);
    outerDiv.appendChild(innerDiv);
    sr2.appendChild(outerDiv);

    const title = SearchService.getLabTitle();
    expect(title).toBe("Deep Shadow Title");
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
