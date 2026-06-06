const SOLUTION_UTM_PARAMS = {
  utm_source: "google-cloud-skill-boost",
  utm_medium: "extension",
} as const;

const DEFAULT_SOLUTION_URL_BASE = "https://eplus.dev";

/**
 * Add extension tracking UTM parameters to a solution URL.
 *
 * Existing query parameters (including cache-busting timestamps) and hash
 * fragments are preserved. UTM values are overwritten so solution clicks from
 * the extension are consistently attributed.
 */
export function addSolutionUtmParams(url: string): string | null {
  try {
    const parsedUrl = new URL(url, DEFAULT_SOLUTION_URL_BASE);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return null;
    }

    Object.entries(SOLUTION_UTM_PARAMS).forEach(([key, value]) => {
      parsedUrl.searchParams.set(key, value);
    });

    return parsedUrl.toString();
  } catch {
    return null;
  }
}
