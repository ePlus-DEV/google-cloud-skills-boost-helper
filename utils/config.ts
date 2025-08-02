/**
 * Configuration constants for the application
 */

export const MARKDOWN_CONFIG = {
  // Announcement markdown URL
  ANNOUNCEMENT_URL:
    "https://gist.githubusercontent.com/hoangsvit/1c301a327161b8baf8dd867b1d5ec866/raw/",

  // Default markdown container settings
  DEFAULT_CONTAINER_ID: "markdown-container",
  DEFAULT_CONTENT_SELECTOR: ".prose",

  // Markdown parser options
  PARSER_OPTIONS: {
    gfm: true,
    breaks: true,
  },
} as const;

export const APP_CONFIG = {
  // Extension information
  NAME: "Google Cloud Skills Boost - Helper",
  AUTHOR: "ePlus.DEV",

  // External URLs
  CHROME_STORE_URL:
    "https://chromewebstore.google.com/detail/google-cloud-skills-boost/lmbhjioadhcoebhgapaidogodllonbgg/?utm_source=webext&utm_medium=options_page",
  FIREFOX_ADDON_URL:
    "https://addons.mozilla.org/addon/cloud-skills-boost-helper?utm_source=webext&utm_medium=options_page",
  DEVELOPER_URL: "https://eplus.dev",
} as const;
