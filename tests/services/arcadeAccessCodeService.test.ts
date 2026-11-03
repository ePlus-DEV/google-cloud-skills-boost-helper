import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";
import {
  ARCADE_CRAWLER_URL,
  lookupArcadeAccessCode,
} from "../../services/arcadeAccessCodeService";

const TIME = Date.parse("2026-11-03T00:00:00Z");
const game = {
  title: "Arcade Base Camp November 2026",
  joinUrl: "https://www.skills.google/games/7564?utm_source=hoangsvit",
  accessCode: "1q-basecamp-02108",
  status: "active",
  deadline: "2026-11-24T18:29:50.000Z",
};

beforeEach(() => {
  fakeBrowser.reset();
  vi.spyOn(Date, "now").mockReturnValue(TIME);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("public crawler access-code service", () => {
  it("fetches exact code without credentials and caches the snapshot", async () => {
    const fetcher = vi.fn(async (_url: string, options: RequestInit) => {
      expect(options.credentials).toBe("omit");
      expect(options.redirect).toBe("error");
      return {
        ok: true,
        headers: new Headers({ "content-length": "1024" }),
        text: async () => JSON.stringify([game]),
      };
    });
    vi.stubGlobal("fetch", fetcher);
    const setSpy = vi.spyOn(fakeBrowser.storage.local, "set");
    expect(await lookupArcadeAccessCode("7564")).toMatchObject({
      gameId: "7564",
      code: "1q-basecamp-02108",
      cached: false,
    });
    expect(fetcher).toHaveBeenCalledWith(
      ARCADE_CRAWLER_URL,
      expect.any(Object),
    );
    expect(setSpy).toHaveBeenCalledTimes(1);
    expect(await lookupArcadeAccessCode("7564")).toMatchObject({
      code: game.accessCode,
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("does not leak an access code for unrelated or expired games", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        headers: new Headers(),
        text: async () => JSON.stringify([game]),
      })),
    );
    expect(await lookupArcadeAccessCode("9999")).toBeNull();
    expect(await lookupArcadeAccessCode("7564")).not.toBeNull();
    vi.spyOn(Date, "now").mockReturnValue(Date.parse("2026-11-25T00:00:00Z"));
    expect(await lookupArcadeAccessCode("7564")).toBeNull();
  });

  it("uses only previously cached active codes if the crawler is offline", async () => {
    await fakeBrowser.storage.local.set({ arcadeAccessCodesCrawlerV1: {
      fetchedAt: TIME - 60 * 60 * 1000,
      games: [game],
    } });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      }),
    );
    expect(await lookupArcadeAccessCode("7564")).toMatchObject({
      code: game.accessCode,
      cached: true,
    });
  });

  it("refuses unsupported IDs and responses that exceed the size limit", async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      headers: new Headers({ "content-length": "300000" }),
      text: async () => JSON.stringify([game]),
    }));
    vi.stubGlobal("fetch", fetcher);
    expect(await lookupArcadeAccessCode("bad-id")).toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
    expect(await lookupArcadeAccessCode("7564")).toBeNull();
  });
});
