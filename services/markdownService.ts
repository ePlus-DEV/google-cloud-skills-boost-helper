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
    contentSelector = ".prose",
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
        append: true,
      };
    } else {
      options = {
        contentSelector: ".prose",
        append: true,
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
      const contentSelector = options.contentSelector || ".prose";
      const contentArea = container.querySelector(contentSelector);
      if (contentArea) {
        // Parse and render markdown
        const markdownHtml = await marked.parse(markdownText);

        if (options.append) {
          contentArea.innerHTML = contentArea.innerHTML + markdownHtml;
        } else {
          contentArea.innerHTML = markdownHtml;
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
   * Setup click handlers for links in markdown content
   * Opens links in new tab for extension popup
   * @param container - The container element with markdown content
   */
  setupLinkHandlers(container: Element): void {
    const links = container.querySelectorAll("a[href]");

    links.forEach((link) => {
      const anchorElement = link as HTMLAnchorElement;

      // Add click handler for extension context
      anchorElement.addEventListener("click", (event) => {
        event.preventDefault();

        const href = anchorElement.href;
        if (
          href &&
          (href.startsWith("http://") || href.startsWith("https://"))
        ) {
          // Use browser API to open in new tab (WXT provides polyfill)
          if (
            typeof browser !== "undefined" &&
            browser.tabs &&
            browser.tabs.create
          ) {
            browser.tabs.create({ url: href }).catch((error) => {
              console.error("Failed to open link via browser.tabs:", error);
              // Fallback to window.open
              window.open(href, "_blank", "noopener,noreferrer");
            });
          } else {
            // Fallback for cases where browser.tabs is not available
            window.open(href, "_blank", "noopener,noreferrer");
          }
        }
      });
    });
  },
};

export default MarkdownService;
