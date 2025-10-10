import MarkdownService from "../../services/markdownService";
import { MARKDOWN_CONFIG } from "../../utils/config";

// Use the single configured CHANGELOG_URL (remote gist). No local fallback.
const CHANGELOG_URL = MARKDOWN_CONFIG.CHANGELOG_URL;

// Determine which container ID actually exists on the page. Prefer configured ID
const preferredId = MARKDOWN_CONFIG.DEFAULT_CONTAINER_ID;
const containerId =
  preferredId && document.getElementById(preferredId)
    ? preferredId
    : "changelog-content";

async function loadChangelog() {
  const success = await MarkdownService.renderUrlToContainer(
    CHANGELOG_URL,
    containerId,
    ".markdown-content",
  );

  if (!success) {
    const container = document.getElementById(containerId);
    if (container)
      container.innerHTML =
        '<p class="text-sm text-red-600">Unable to load changelog.</p>';
  }
}

loadChangelog();
