import { marked } from "marked";
import type { MarkdownLoadOptions, MarkdownConfig } from "../types";

/**
 * Service to handle markdown content loading and rendering
 */
const MarkdownService = {
  /**
   * Default markdown configuration
   */
  defaultConfig: {
    gfm: true, // GitHub Flavored Markdown
    breaks: true, // Convert line breaks to <br>
  } as MarkdownConfig,

  /**
   * Initialize markdown parser with options
   * @param config - Custom configuration options
   */
  initialize(config?: MarkdownConfig): void {
    const finalConfig = { ...MarkdownService.defaultConfig, ...config };

    // Set up custom renderer for links
    const renderer = new marked.Renderer();

    // Override link rendering to add target="_blank"
    renderer.link = function ({ href, title, tokens }): string {
      const titleAttr = title ? ` title="${title}"` : "";
      const text = this.parser.parseInline(tokens);
      return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
    };

    marked.setOptions({
      gfm: finalConfig.gfm,
      breaks: finalConfig.breaks,
      renderer,
    });
  },

  /**
   * Load and render markdown content from a URL
   * @param urlOrOptions - URL string or configuration options
   * @param containerId - The ID of the container element (when using URL string)
   * @param contentSelector - The selector for the content area (when using URL string)
   */
  async loadAndRender(
    urlOrOptions: string | MarkdownLoadOptions,
    containerId?: string,
    contentSelector = ".markdown-content",
  ): Promise<void> {
    let options: MarkdownLoadOptions;

    // Handle both function signatures
    if (typeof urlOrOptions === "string") {
      if (!containerId) {
        console.error("Container ID is required when using URL string");
        return;
      }

      options = {
        url: urlOrOptions,
        containerId,
        contentSelector,
        append: false, // Changed to false to replace content instead of appending
      };
    } else {
      options = {
        contentSelector: ".markdown-content",
        append: false, // Changed to false to replace content instead of appending
        ...urlOrOptions,
      };
    }

    const container = document.getElementById(options.containerId);
    if (!container) {
      console.error(`Container with ID '${options.containerId}' not found`);
      return;
    }

    try {
      // Add cache busting parameter to prevent cached content
      const fetchUrl = `${options.url}?t=${Date.now()}`;
      const response = await fetch(fetchUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const markdownText = await response.text();

      // Find the content area within the container
      const contentSelector = options.contentSelector || ".markdown-content";
      const contentArea = container.querySelector(contentSelector);
      if (contentArea) {
        // Parse and render markdown
        const markdownHtml = await marked.parse(markdownText);

        if (options.append) {
          contentArea.innerHTML = contentArea.innerHTML + markdownHtml;
        } else {
          contentArea.innerHTML = markdownHtml;
        }

        // Rewrite relative image srcs to absolute URLs based on source URL
        try {
          const imgs = contentArea.querySelectorAll("img[src]");
          imgs.forEach((img) => {
            const src = img.getAttribute("src") || "";
            if (!src) return;
            if (
              /^https?:\/\//i.test(src) ||
              /^data:\//i.test(src) ||
              /^blob:\//i.test(src)
            )
              return;
            try {
              const base = options.url;
              const baseNoQuery = base.split("?")[0];
              const resolved = new URL(src, baseNoQuery).toString();
              img.setAttribute("src", resolved);
            } catch (e) {
              console.debug(
                "MarkdownService: failed to resolve image src",
                src,
                e,
              );
            }
          });
        } catch (e) {
          console.debug("MarkdownService: error rewriting image srcs", e);
        }

        // Handle links in popup context
        MarkdownService.setupLinkHandlers(contentArea);
      } else {
        console.error(
          `Content area with selector '${contentSelector}' not found in container`,
        );
      }
    } catch (error) {
      const contentSelector = options.contentSelector || ".prose";
      MarkdownService.showError(container, contentSelector, error);
    }
  },

  /**
   * Show error message in the content area
   * @param container - The container element
   * @param contentSelector - The selector for the content area
   * @param error - The error that occurred
   */
  showError(container: Element, contentSelector: string, error: unknown): void {
    const contentArea = container.querySelector(contentSelector);
    if (contentArea) {
      const errorDiv = document.createElement("div");
      errorDiv.className = "text-red-600 mt-2";
      errorDiv.innerHTML = `
        <i class="fa-solid fa-exclamation-triangle mr-2"></i>
        ❌ Could not load announcement content. Please check your internet connection.
      `;
      contentArea.appendChild(errorDiv);
    }

    console.error("MarkdownService: Failed to load content:", error);
  },

  /**
   * Parse markdown text to HTML
   * @param markdownText - The markdown text to parse
   * @returns Promise<string> - The parsed HTML
   */
  async parseMarkdown(markdownText: string): Promise<string> {
    return await marked.parse(markdownText);
  },

  /**
   * Fetch markdown content from URL without rendering
   * @param url - The URL to fetch markdown content from
   * @returns Promise<string> - The raw markdown text
   */
  async fetchMarkdown(url: string): Promise<string> {
    const fetchUrl = `${url}?t=${Date.now()}`;
    const response = await fetch(fetchUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text();
  },

  /**
   * Fetch a markdown URL and render it into a container element.
   * Returns true on success, false on failure so callers can try fallbacks.
   */
  async renderUrlToContainer(
    url: string,
    containerId: string,
    contentSelector = ".markdown-content",
  ): Promise<boolean> {
    const container = document.getElementById(containerId);
    if (!container) return false;

    try {
      const fetchUrl = `${url}?t=${Date.now()}`;
      const response = await fetch(fetchUrl, { cache: "no-store" });
      if (!response.ok) return false;

      const markdownText = await response.text();
      const markdownHtml = await marked.parse(markdownText);

      const contentArea = container.querySelector(contentSelector);
      if (!contentArea) return false;

      (contentArea as HTMLElement).innerHTML = markdownHtml;

      // Rewrite relative image srcs based on the source URL
      try {
        const imgs = contentArea.querySelectorAll("img[src]");
        const baseNoQuery = url.split("?")[0];
        imgs.forEach((img) => {
          const src = img.getAttribute("src") || "";
          if (!src) return;
          if (
            /^https?:\/\//i.test(src) ||
            /^data:\//i.test(src) ||
            /^blob:\//i.test(src)
          )
            return;
          try {
            const resolved = new URL(src, baseNoQuery).toString();
            img.setAttribute("src", resolved);
          } catch (e) {
            console.debug(
              "MarkdownService: failed to resolve image src",
              src,
              e,
            );
          }
        });
      } catch (e) {
        console.debug("MarkdownService: error rewriting image srcs", e);
      }

      // Setup link handlers
      MarkdownService.setupLinkHandlers(contentArea);

      return true;
    } catch (error) {
      console.debug("MarkdownService.renderUrlToContainer failed:", error);
      return false;
    }
  },

  /**
   * Setup click handlers for links in markdown content
   * Opens links in new tab for extension popup
   * @param container - The container element with markdown content
   */
  setupLinkHandlers(container: Element): void {
    const links = container.querySelectorAll("a[href]");

    for (const link of links) {
      const anchorElement = link as HTMLAnchorElement;

      // Add click handler for extension context
      anchorElement.addEventListener("click", async (event) => {
        event.preventDefault();

        const href = anchorElement.href;
        if (
          href &&
          (href.startsWith("http://") || href.startsWith("https://"))
        ) {
          await MarkdownService.openLink(href);
        }
      });
    }
  },

  /**
   * Open a URL using the most appropriate method for the extension context
   * @param url - The URL to open
   */
  async openLink(url: string): Promise<void> {
    try {
      // First attempt: Use browser.tabs.create if available (most reliable in extensions)
      if (typeof browser !== "undefined" && browser.tabs?.create) {
        await browser.tabs.create({ url });
        return;
      }
    } catch (error) {
      console.warn("Failed to open link via browser.tabs:", error);
    }

    try {
      // Second attempt: Use chrome.tabs.create if available (Chromium browsers)
      if (typeof chrome !== "undefined" && chrome.tabs?.create) {
        chrome.tabs.create({ url });
        return;
      }
    } catch (error) {
      console.warn("Failed to open link via chrome.tabs:", error);
    }

    try {
      // Third attempt: Use window.open (may not work in all extension contexts)
      const newWindow = window.open(url, "_blank", "noopener,noreferrer");
      if (newWindow) {
        return;
      }
      throw new Error("window.open returned null");
    } catch (error) {
      console.warn("Failed to open link via window.open:", error);
    }

    // Final fallback: Copy URL to clipboard and notify user
    try {
      await navigator.clipboard.writeText(url);
      console.info(
        `Link could not be opened automatically. URL copied to clipboard: ${url}`,
      );

      // Show a user-friendly notification if possible
      MarkdownService.showLinkFallbackMessage(url);
    } catch (clipboardError) {
      console.error("All link opening methods failed:", {
        url,
        clipboardError,
      });

      // Last resort: show the URL to the user
      alert(
        `Unable to open link automatically. Please copy and paste this URL into your browser:\n\n${url}`,
      );
    }
  },

  /**
   * Show a user-friendly message when link opening fails
   * @param url - The URL that was copied to the clipboard
   */
  showLinkFallbackMessage(url: string): void {
    if (typeof url !== "string") {
      console.warn("Invalid URL type for fallback message");
      return;
    }

    let sanitizedUrl: string;
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        throw new Error("Unsupported protocol");
      }
      sanitizedUrl = parsedUrl.toString();
    } catch (e) {
      console.warn("Invalid URL provided for fallback message", e);
      return;
    }

    // Create a temporary notification element
    const notification = document.createElement("div");
    notification.className =
      "fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50";

    const content = document.createElement("div");
    content.className = "flex items-center";

    const icon = document.createElement("i");
    icon.className = "fa-solid fa-link mr-2";

    const message = document.createElement("span");
    message.textContent = `Link copied to clipboard: ${sanitizedUrl}`;

    content.appendChild(icon);
    content.appendChild(message);
    notification.appendChild(content);

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  },
};

export default MarkdownService;
