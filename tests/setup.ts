import { vi, beforeEach } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";

// Reset fake browser state between tests
beforeEach(() => {
  fakeBrowser.reset();
  vi.clearAllMocks();
});
