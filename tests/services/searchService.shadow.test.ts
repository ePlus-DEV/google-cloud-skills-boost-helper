import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SearchService from "../../services/searchService";

describe("SearchService.getLabTitle (shadow DOM)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("extracts title from nested ql-lab-header -> ql-header shadow roots", () => {
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

    const sr1 = qlLabHeader.attachShadow({ mode: "open" });
    const qlHeader = document.createElement("ql-header");
    sr1.appendChild(qlHeader);

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

    expect(SearchService.getLabTitle()).toBe("Deep Shadow Title");
  });

  it("prefers h1.ql-title-large when present", () => {
    const headingElement = document.createElement("h1");
    headingElement.className = "ql-title-large";
    headingElement.textContent = "Title Large";
    document.body.appendChild(headingElement);

    expect(SearchService.getLabTitle()).toBe("Title Large");
  });

  it("falls back to first h1 when no special selectors exist", () => {
    const headingElement = document.createElement("h1");
    headingElement.textContent = "Simple H1";
    document.body.appendChild(headingElement);

    expect(SearchService.getLabTitle()).toBe("Simple H1");
  });

  it("finds a GSP ID inside deeply nested shadow roots", () => {
    const outerHost = document.createElement("div");
    document.body.appendChild(outerHost);
    const outerRoot = outerHost.attachShadow({ mode: "open" });

    const innerHost = document.createElement("section");
    outerRoot.appendChild(innerHost);
    const innerRoot = innerHost.attachShadow({ mode: "open" });

    const idText = document.createElement("span");
    idText.textContent = "Lab identifier: GSP9999";
    innerRoot.appendChild(idText);

    expect(SearchService.getGspId()).toBe("GSP9999");
  });

  it("does not duplicate query text used as the fallback title", () => {
    vi.spyOn(SearchService, "getLabTitle").mockReturnValue("");
    vi.spyOn(SearchService, "getGspId").mockReturnValue("GSP123");
    vi.spyOn(SearchService, "extractQueryText").mockReturnValue(
      "Configure a Cloud Lab",
    );

    expect(SearchService.createCombinedQuery()).toBe(
      "Configure a Cloud Lab - GSP123",
    );
  });
});
