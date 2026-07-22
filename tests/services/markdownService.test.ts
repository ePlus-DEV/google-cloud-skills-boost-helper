import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MarkdownService from "../../services/markdownService";

describe("MarkdownService sanitization", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="markdown-container">
        <div class="markdown-content"></div>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("sanitizes links and preserves only supported image sources", async () => {
    const markdown = [
      '<a class="unsafe-link" href="java&#10;script:alert(1)">Unsafe</a>',
      '<map><area class="unsafe-area" href="javascript:alert(1)"></map>',
      '<img class="safe-image" src="https://example.com/image.png" onerror="alert(1)">',
      '<a class="safe-link" href="https://example.com/docs">Safe</a>',
      '<a class="blank-link" href="https://example.com/new" target="_blank">Blank</a>',
      '<a class="mail-link" href="mailto:dev@example.com">Mail</a>',
      '<img class="data-image" src="data:image/png;base64,iVBORw0KGgo=">',
      '<img class="blob-image" src="blob:https://example.com/image-id">',
      '<img class="svg-data-image" src="data:image/svg+xml;base64,PHN2Zz4=">',
    ].join("\n");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue(markdown),
      }),
    );

    const rendered = await MarkdownService.renderUrlToContainer(
      "https://example.com/readme.md",
      "markdown-container",
    );

    expect(rendered).toBe(true);
    expect(document.querySelector(".unsafe-area")).toBeNull();
    const unsafeLink = document.querySelector(".unsafe-link");
    expect(unsafeLink === null || !unsafeLink.hasAttribute("href")).toBe(true);
    expect(document.querySelector(".safe-image")?.hasAttribute("onerror")).toBe(
      false,
    );
    expect(document.querySelector(".safe-image")?.getAttribute("src")).toBe(
      "https://example.com/image.png",
    );
    expect(document.querySelector(".safe-link")?.getAttribute("href")).toBe(
      "https://example.com/docs",
    );
    expect(
      document.querySelector(".blank-link")?.getAttribute("rel")?.split(" "),
    ).toEqual(expect.arrayContaining(["noopener", "noreferrer"]));
    expect(document.querySelector(".mail-link")?.hasAttribute("href")).toBe(
      false,
    );
    expect(document.querySelector(".data-image")?.getAttribute("src")).toBe(
      "data:image/png;base64,iVBORw0KGgo=",
    );
    expect(document.querySelector(".blob-image")?.getAttribute("src")).toBe(
      "blob:https://example.com/image-id",
    );
    expect(document.querySelector(".svg-data-image")?.hasAttribute("src")).toBe(
      false,
    );
  });
});
