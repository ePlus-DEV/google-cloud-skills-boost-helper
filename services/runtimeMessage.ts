/**
 * Lightweight runtime messaging helper.
 *
 * Avoids casting to `any` when calling browser/runtime sendMessage by
 * providing a small typed wrapper. Messages and responses are typed as
 * unknown so callers must validate the response shape.
 */
export type RuntimeMessage = Record<string, unknown>;

export async function sendRuntimeMessage(
  message: RuntimeMessage,
): Promise<unknown | null> {
  try {
    // Prefer WebExtension `browser.runtime.sendMessage` which returns a Promise
    if (typeof browser !== "undefined" && browser.runtime?.sendMessage) {
      return await browser.runtime.sendMessage(message);
    }

    // Fallback to chrome-style callback API
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      return await new Promise<unknown>((resolve, reject) => {
        try {
          chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
              // forward the lastError if present
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          });
        } catch (err) {
          reject(err);
        }
      });
    }

    // No runtime messaging available in this environment
    return null;
  } catch (err) {
    console.debug("sendRuntimeMessage failed:", err);
    return null;
  }
}

export default sendRuntimeMessage;
