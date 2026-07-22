from pathlib import Path

path = Path("services/searchService.ts")
text = path.read_text()

old_deep_search = '''  private static querySelectorDeep(selector: string): Element | null {
    try {
      // Quick check on document
      const direct = document.querySelector(selector);
      if (direct) return direct;

      // BFS through all elements to look into shadowRoots
      const nodes = Array.from(document.querySelectorAll("*"));
      for (const el of nodes) {
        try {
          const sr = (el as Element).shadowRoot;
          if (sr) {
            const found = sr.querySelector(selector);
            if (found) return found;

            // also search one level deeper inside nested shadow roots
            const nested = Array.from(sr.querySelectorAll("*"));
            for (const nestedElement of nested) {
              try {
                const nestedShadowRoot = (nestedElement as Element).shadowRoot;
                if (nestedShadowRoot) {
                  const foundElement = nestedShadowRoot.querySelector(selector);
                  if (foundElement) return foundElement;
                }
              } catch {
                // ignore errors from accessing shadow roots
              }
            }
          }
        } catch {
          // ignore errors from accessing shadow roots
        }
      }
    } catch (e) {
      // ignore
    }
    return null;
  }'''

new_deep_search = '''  private static searchInRoot(
    root: Document | ShadowRoot,
    selector: string,
  ): Element | null {
    const direct = root.querySelector(selector);
    if (direct) return direct;

    for (const element of Array.from(root.querySelectorAll("*"))) {
      try {
        const shadowRoot = (element as Element).shadowRoot;
        if (!shadowRoot) continue;

        const found = this.searchInRoot(shadowRoot, selector);
        if (found) return found;
      } catch {
        // Ignore inaccessible shadow roots and continue searching.
      }
    }

    return null;
  }

  private static querySelectorDeep(selector: string): Element | null {
    try {
      return this.searchInRoot(document, selector);
    } catch {
      return null;
    }
  }'''

if old_deep_search not in text:
    raise RuntimeError("Expected querySelectorDeep implementation not found")
text = text.replace(old_deep_search, new_deep_search, 1)

old_query = '''    // Build query with title first, then GSP ID (preferred format: "title - id")
    const parts = [labTitle, gspId, queryText].filter(Boolean);
    const combinedQuery = parts.join(" - ").trim();'''
new_query = '''    // Build query with title first, then GSP ID (preferred format: "title - id")
    const parts = [labTitle, gspId].filter(Boolean);
    if (queryText && queryText !== labTitle) {
      parts.push(queryText);
    }
    const combinedQuery = parts.join(" - ").trim();'''

if old_query not in text:
    raise RuntimeError("Expected combined query implementation not found")
path.write_text(text.replace(old_query, new_query, 1))
