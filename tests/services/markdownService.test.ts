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

  it("removes obfuscated schemes, event handlers, and non-allowlisted URL elements", async () => {
    const markdown = [
      '<a class="unsafe-link" href="java&#10;script:alert(1)">Unsafe</a>',
      '<map><area class="unsafe-area" href="javascript:alert(1)"></map>',
      '<img class="safe-image" src="https://example.com/image.png" onerror="alert(1)">',
      '<a class="safe-link" href="https://example.com/docs">Safe</a>',
    ].join("\n");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => markdown,
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
    expect(
      document.querySelector(".safe-image")?.hasAttribute("onerror"),
    ).toBe(false);
    expect(document.querySelector(".safe-image")?.getAttribute("src")).toBe(
      "https://example.com/image.png",
    );
    expect(document.querySelector(".safe-link")?.getAttribute("href")).toBe(
      "https://example.com/docs",
    );
  });
});
