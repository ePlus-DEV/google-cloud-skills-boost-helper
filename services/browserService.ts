/**
 * Detect the current browser
 * @returns The browser name: "firefox", "edge", "opera", "chrome", "brave", or "unknown"
 */
export async function getBrowser(): Promise<string> {
  // Firefox-specific detection
  if (typeof browser !== "undefined" && browser.runtime?.getBrowserInfo) {
    try {
      const info = await browser.runtime.getBrowserInfo();
      return "firefox";
    } catch (e) {
      // If getBrowserInfo fails, continue to user agent detection
    }
  }

  // Chromium browsers detection via user agent
  const ua = navigator.userAgent;
  if (ua.includes("Edg/")) return "edge";
  if (ua.includes("OPR/")) return "opera";
  if (ua.includes("Brave/") || (navigator as any).brave) return "brave";
  if (ua.includes("Chrome/")) return "chrome";

  return "unknown";
}

/**
 * Check if current browser is Firefox
 * @returns true if Firefox, false otherwise
 */
export async function isFirefox(): Promise<boolean> {
  const browserName = await getBrowser();
  return browserName === "firefox";
}
