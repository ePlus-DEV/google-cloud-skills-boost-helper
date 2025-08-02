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

    marked.setOptions({
      gfm: finalConfig.gfm,
      breaks: finalConfig.breaks,
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
    contentSelector = ".prose"
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
      } else {
        console.error(
          `Content area with selector '${contentSelector}' not found in container`
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
};

export default MarkdownService;
