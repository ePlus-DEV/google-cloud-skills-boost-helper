import { vi, beforeEach } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";

// Reset fake browser state and release-only signing credentials between tests.
beforeEach(() => {
  fakeBrowser.reset();
  vi.clearAllMocks();
  vi.stubEnv("WXT_ARCADE_CLIENT_KEY", "");
  vi.stubEnv("WXT_ARCADE_CLIENT_SECRET", "");
});
