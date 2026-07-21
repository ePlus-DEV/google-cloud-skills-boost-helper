from __future__ import annotations

import json
import re
from pathlib import Path


def replace_regex(
    path: str,
    pattern: str,
    replacement: str,
    *,
    marker: str,
    flags: int = re.MULTILINE | re.DOTALL,
) -> None:
    file_path = Path(path)
    text = file_path.read_text()
    if marker in text:
        return

    updated, count = re.subn(
        pattern,
        lambda _match: replacement,
        text,
        count=1,
        flags=flags,
    )
    if count != 1:
        raise RuntimeError(f"Expected one match in {path}, found {count}")
    file_path.write_text(updated)


markdown_path = Path("services/markdownService.ts")
markdown_text = markdown_path.read_text()
if 'import DOMPurify from "dompurify";' not in markdown_text:
    markdown_text = markdown_text.replace(
        'import { marked } from "marked";\n',
        'import DOMPurify from "dompurify";\nimport { marked } from "marked";\n',
        1,
    )
    markdown_path.write_text(markdown_text)

markdown_sanitizer = '''const MARKDOWN_ALLOWED_TAGS = [
  "a",
  "blockquote",
  "br",
  "code",
  "del",
  "details",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "strong",
  "summary",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "ul",
];

const MARKDOWN_ALLOWED_ATTRIBUTES = [
  "alt",
  "class",
  "height",
  "href",
  "rel",
  "src",
  "target",
  "title",
  "width",
];

const URL_CONTROL_OR_WHITESPACE = /[\\u0000-\\u0020\\u007f-\\u009f]/g;

function hasAllowedUrlScheme(
  value: string,
  allowedSchemes: ReadonlySet<string>,
): boolean {
  const normalized = value.replace(URL_CONTROL_OR_WHITESPACE, "").trim();
  const scheme = normalized.match(/^([a-z][a-z0-9+.-]*):/i)?.[1];
  return !scheme || allowedSchemes.has(scheme.toLowerCase());
}

/** Sanitizes rendered markdown with an explicit tag and attribute allowlist. */
function sanitizeMarkdownHtml(html: string): string {
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: MARKDOWN_ALLOWED_TAGS,
    ALLOWED_ATTR: MARKDOWN_ALLOWED_ATTRIBUTES,
    ALLOW_ARIA_ATTR: true,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });

  const template = document.createElement("template");
  template.innerHTML = sanitized;

  const linkSchemes = new Set(["http", "https", "mailto"]);
  template.content.querySelectorAll("a[href]").forEach((element) => {
    const href = element.getAttribute("href") || "";
    if (!hasAllowedUrlScheme(href, linkSchemes)) {
      element.removeAttribute("href");
    }
  });

  const imageSchemes = new Set(["http", "https"]);
  template.content.querySelectorAll("img[src]").forEach((element) => {
    const src = element.getAttribute("src") || "";
    if (!hasAllowedUrlScheme(src, imageSchemes)) {
      element.removeAttribute("src");
    }
  });

  return template.innerHTML;
}
'''
replace_regex(
    "services/markdownService.ts",
    r"/\*\* Strips dangerous tags and attributes from rendered markdown HTML\. \*/\n"
    r"function sanitizeMarkdownHtml\(html: string\): string \{.*?^\}\n",
    markdown_sanitizer,
    marker="const MARKDOWN_ALLOWED_TAGS",
)

replace_regex(
    "services/optionsService.ts",
    r"await Promise\.all\(\[\s*this\.loadAccounts\(\),\s*"
    r"this\.switchAccount\(newAccount\.id\),\s*\]\);",
    "await this.switchAccount(newAccount.id);\n      await this.loadAccounts();",
    marker="await this.switchAccount(newAccount.id);\n      await this.loadAccounts();",
)

shadow_helpers = '''  /** Collect all accessible shadow roots, including nested roots. */
  private static collectOpenShadowRoots(
    root: Document | ShadowRoot = document,
  ): ShadowRoot[] {
    const shadowRoots: ShadowRoot[] = [];
    const visited = new Set<ShadowRoot>();

    const visit = (searchRoot: Document | ShadowRoot): void => {
      for (const element of Array.from(searchRoot.querySelectorAll("*"))) {
        try {
          const shadowRoot = element.shadowRoot;
          if (!shadowRoot || visited.has(shadowRoot)) continue;

          visited.add(shadowRoot);
          shadowRoots.push(shadowRoot);
          visit(shadowRoot);
        } catch {
          // Ignore inaccessible or browser-managed shadow roots.
        }
      }
    };

    visit(root);
    return shadowRoots;
  }

  /**
   * Query selector that searches into shadow roots recursively.
   * Returns the first matching Element or null.
   */
  private static querySelectorDeep(selector: string): Element | null {
    try {
      const direct = document.querySelector(selector);
      if (direct) return direct;

      for (const shadowRoot of this.collectOpenShadowRoots()) {
        const found = shadowRoot.querySelector(selector);
        if (found) return found;
      }
    } catch {
      // Ignore malformed selectors and inaccessible roots.
    }
    return null;
  }
'''
replace_regex(
    "services/searchService.ts",
    r"  /\*\*\n   \* Query selector that searches into shadow roots recursively\.\n"
    r"   \* Returns the first matching Element or null\.\n   \*/\n"
    r"  private static querySelectorDeep\(selector: string\): Element \| null \{.*?^  \}\n",
    shadow_helpers,
    marker="private static collectOpenShadowRoots",
)

page_text_method = '''  /**
   * Get all text from page including nested shadow DOM
   */
  private static getPageText(): string {
    const texts = [document.body.textContent || ""];

    try {
      for (const shadowRoot of this.collectOpenShadowRoots()) {
        texts.push(shadowRoot.textContent || "");
      }
    } catch {
      // Ignore inaccessible roots and return the text collected so far.
    }

    return texts.join(" ");
  }
'''
replace_regex(
    "services/searchService.ts",
    r"  /\*\*\n   \* Get all text from page including shadow DOM\n   \*/\n"
    r"  private static getPageText\(\): string \{.*?^  \}\n",
    page_text_method,
    marker="Get all text from page including nested shadow DOM",
)

search_path = Path("services/searchService.ts")
search_text = search_path.read_text()
old_parts = '    const parts = [primaryTitle, gspId, queryText].filter(Boolean);\n'
new_parts = '''    const parts = [primaryTitle, gspId].filter(Boolean);
    if (queryText && queryText !== primaryTitle) {
      parts.push(queryText);
    }
'''
if old_parts in search_text:
    search_path.write_text(search_text.replace(old_parts, new_parts, 1))
elif new_parts not in search_text:
    raise RuntimeError("Combined-query construction was not found")

search_test = '''import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
'''
Path("tests/services/searchService.shadow.test.ts").write_text(search_test)

markdown_test = '''import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
    const markdown = `
      <a class="unsafe-link" href="java&#10;script:alert(1)">Unsafe</a>
      <map><area class="unsafe-area" href="javascript:alert(1)"></map>
      <img class="safe-image" src="https://example.com/image.png" onerror="alert(1)">
      <a class="safe-link" href="https://example.com/docs">Safe</a>
    `;

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
    expect(
      document.querySelector(".unsafe-link")?.hasAttribute("href"),
    ).toBe(false);
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
'''
Path("tests/services/markdownService.test.ts").write_text(markdown_test)

package_path = Path("package.json")
package_data = json.loads(package_path.read_text())
dependencies = package_data["dependencies"]
if dependencies.get("dompurify") != "^3.4.12":
    reordered_dependencies: dict[str, str] = {}
    for name, version in dependencies.items():
        reordered_dependencies[name] = version
        if name == "axios":
            reordered_dependencies["dompurify"] = "^3.4.12"
    if "dompurify" not in reordered_dependencies:
        reordered_dependencies["dompurify"] = "^3.4.12"
    package_data["dependencies"] = reordered_dependencies
    package_path.write_text(json.dumps(package_data, indent=2) + "\n")
