import { beforeEach, afterEach, describe, it, expect } from "vitest";
import SearchService from "../../services/searchService";

describe("SearchService.getLabTitle (shadow DOM)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
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

    const title = SearchService.getLabTitle();
    expect(title).toBe("Deep Shadow Title");
  });

  it("prefers h1.ql-title-large when present", () => {
    const h = document.createElement("h1");
    h.className = "ql-title-large";
    h.textContent = "Title Large";
    document.body.appendChild(h);

    const title = SearchService.getLabTitle();
    expect(title).toBe("Title Large");
  });

  it("falls back to first h1 when no special selectors exist", () => {
    const h = document.createElement("h1");
    h.textContent = "Simple H1";
    document.body.appendChild(h);

    const title = SearchService.getLabTitle();
    expect(title).toBe("Simple H1");
  });
});
