import { describe, it, expect, vi } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";
import sendRuntimeMessage from "../../services/runtimeMessage";

describe("sendRuntimeMessage", () => {
  it("sends message via browser.runtime and returns response", async () => {
    vi.spyOn(fakeBrowser.runtime, "sendMessage").mockResolvedValueOnce({
      ok: true,
    });

    const result = await sendRuntimeMessage({ type: "ping" });
    expect(result).toEqual({ ok: true });
  });

  it("returns null and logs when sendMessage throws", async () => {
    vi.spyOn(fakeBrowser.runtime, "sendMessage").mockRejectedValueOnce(
      new Error("no receiver"),
    );

    const result = await sendRuntimeMessage({ type: "ping" });
    expect(result).toBeNull();
  });
});
