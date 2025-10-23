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

/**
 * Profile domain configuration.
 *
 * Use this to support both the legacy cloudskillsboost domain and the
 * new skills.google domain. The idea is to have a single place to update
 * hosts — later we can make these values remotely configurable (e.g. a
 * remote JSON hosted somewhere) and the extension can fetch that at runtime.
 */
export const PROFILE_CONFIG = {
  // canonical host we prefer to use when sending the full url to backend
  CANONICAL_HOST: "www.skills.google",

  // list of accepted hostnames (in order of preference)
  // typed as string[] to avoid overly strict literal union types
  ACCEPTED_HOSTS: [
    // new canonical host
    "www.skills.google",
    // legacy host
    "www.cloudskillsboost.google",
    // qwiklabs sometimes used
    "www.qwiklabs.com",
  ] as string[],
};
