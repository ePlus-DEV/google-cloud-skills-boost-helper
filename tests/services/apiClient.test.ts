import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ApiClient from "../../services/apiClient";

describe("ApiClient.fetchPostsOfPublication", () => {
  beforeEach(() => {
    vi.stubEnv("WXT_API_URL", "https://solutions.example.com/posts");
    vi.stubEnv("WXT_ARCADE_POINT_URL", "https://hub.eplus.dev/api/v2/arcade");
    vi.spyOn(Date, "now").mockReturnValue(1786413245872);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("uses WXT_API_URL for solution posts and never the Arcade endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([
        {
          _id: "post-1",
          title: "Example Lab",
          slug: "https://eplus.dev/example-lab",
          datePublished: "2026-08-11T00:00:00.000Z",
        },
      ]),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await ApiClient.fetchPostsOfPublication({
      publicationId: "unused",
      query: "Example Lab",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://solutions.example.com/posts?time=1786413245872",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(fetchMock.mock.calls[0][0]).not.toContain("/api/v2/arcade");
    expect(result).toHaveLength(1);
    expect(result[0]?.url).toBe("https://eplus.dev/example-lab");
  });

  it("preserves an existing solution query string when adding the cache buster", async () => {
    vi.stubEnv("WXT_API_URL", "https://solutions.example.com/posts?source=ext");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([]),
    });
    vi.stubGlobal("fetch", fetchMock);

    await ApiClient.fetchPostsOfPublication({
      publicationId: "unused",
      query: "anything",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://solutions.example.com/posts?source=ext&time=1786413245872",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });
});
