import { describe, it, expect, vi, beforeEach } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";
import sendRuntimeMessage from "../../services/runtimeMessage";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("sendRuntimeMessage - extended", () => {
  it("returns null when sendMessage rejects", async () => {
    vi.spyOn(fakeBrowser.runtime, "sendMessage").mockRejectedValueOnce(
      new Error("Extension context invalidated"),
    );

    const result = await sendRuntimeMessage({ type: "test" });
    expect(result).toBeNull();
  });

  it("returns response when sendMessage resolves with data", async () => {
    vi.spyOn(fakeBrowser.runtime, "sendMessage").mockResolvedValueOnce({
      pong: true,
    });

    const result = await sendRuntimeMessage({ type: "ping" });
    expect(result).toEqual({ pong: true });
  });

  it("returns null when sendMessage throws synchronously", async () => {
    vi.spyOn(fakeBrowser.runtime, "sendMessage").mockImplementationOnce(() => {
      throw new Error("sync error");
    });

    const result = await sendRuntimeMessage({ type: "test" });
    expect(result).toBeNull();
  });

  it("returns null when sendMessage resolves to undefined", async () => {
    vi.spyOn(fakeBrowser.runtime, "sendMessage").mockResolvedValueOnce(
      undefined,
    );

    const result = await sendRuntimeMessage({ type: "test" });
    expect(result).toBeUndefined();
  });
});
