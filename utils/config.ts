/**
 * Configuration constants for the application
 */

export const MARKDOWN_CONFIG = {
  // Announcement markdown URL
  ANNOUNCEMENT_URL:
    "https://gist.githubusercontent.com/hoangsvit/1c301a327161b8baf8dd867b1d5ec866/raw/ANNOUNCEMENT.md",
  // Changelog markdown URL
  CHANGELOG_URL:
    "https://gist.githubusercontent.com/hoangsvit/1c301a327161b8baf8dd867b1d5ec866/raw/CHANGELOG.md",

  // Default markdown container settings
  DEFAULT_CONTAINER_ID: "markdown-container",
  DEFAULT_CONTENT_SELECTOR: ".markdown-content",

  // Markdown parser options
  PARSER_OPTIONS: {
    gfm: true,
    breaks: true,
  },
} as const;
// UI color tokens used across the extension. Keep badge color here so it's
// consistent between background and services that update the badge.
export const UI_COLORS = {
  BADGE: "#155dfc",
} as const;
