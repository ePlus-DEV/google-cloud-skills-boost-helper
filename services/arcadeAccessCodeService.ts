import {
  findCrawlerGameCode,
  type ArcadeAccessCodeMatch,
  type CrawlerGame,
} from "../utils/arcadeAccessCode";

export const ARCADE_CRAWLER_URL =
  "https://raw.githubusercontent.com/hoangsvit/arcade-crawler/refs/heads/main/data/arcade_monthly_games.json";
export const ARCADE_CRAWLER_SOURCE =
  "https://github.com/hoangsvit/arcade-crawler/blob/main/data/arcade_monthly_games.json";

const CACHE_KEY = "arcadeAccessCodesCrawlerV1";
const CACHE_TTL_MS = 30 * 60 * 1000;
const FALLBACK_TTL_MS = 12 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8_000;
const MAX_PAYLOAD_SIZE = 200_000;

type CachedGames = { fetchedAt: number; games: CrawlerGame[] };
export type ArcadeCodeSuggestion = ArcadeAccessCodeMatch & {
  cached: boolean;
  sourceUrl: string;
};

let inFlight: Promise<CachedGames> | null = null;

function parseCache(raw: unknown, now: number): CachedGames | null {
  if (!raw || typeof raw !== "object") return null;
  const { fetchedAt, games } = raw as Partial<CachedGames>;
  if (
    typeof fetchedAt !== "number" ||
    !Number.isFinite(fetchedAt) ||
    fetchedAt > now ||
    now - fetchedAt > FALLBACK_TTL_MS ||
    !Array.isArray(games) ||
    games.length > 500
  ) return null;
  return { fetchedAt, games };
}

async function readCache(now: number): Promise<CachedGames | null> {
  try {
    const stored = await browser.storage.local.get(CACHE_KEY);
    return parseCache(stored[CACHE_KEY], now);
  } catch {
    return null;
  }
}

/** Public crawler data only; never forward Google cookies or auth tokens. */
async function refreshCrawler(now: number): Promise<CachedGames> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(ARCADE_CRAWLER_URL, {
      credentials: "omit",
      redirect: "error",
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("Arcade crawler unavailable");
    const size = Number(response.headers.get("content-length"));
    if (Number.isFinite(size) && size > MAX_PAYLOAD_SIZE) {
      throw new Error("Arcade crawler response too large");
    }
    const text = await response.text();
    if (text.length > MAX_PAYLOAD_SIZE) throw new Error("Arcade crawler response too large");
    const json: unknown = JSON.parse(text);
    if (!Array.isArray(json) || json.length > 500) throw new Error("Invalid Arcade crawler snapshot");
    const games: CrawlerGame[] = json
      .filter((item): item is Record<string, unknown> => item != null && typeof item === "object" && !Array.isArray(item))
      .map((item) => ({
        title: item.title,
        joinUrl: item.joinUrl,
        accessCode: item.accessCode,
        deadline: item.deadline,
        status: item.status,
        reconstructed: item.reconstructed,
      }));
    const snapshot = { fetchedAt: now, games };
    try {
      await browser.storage.local.set({ [CACHE_KEY]: snapshot });
    } catch {
      // Storage may be unavailable; return this fetched snapshot anyway.
    }
    return snapshot;
  } finally {
    clearTimeout(timer);
  }
}

function suggestion(
  snapshot: CachedGames,
  gameId: string,
  now: number,
  cached: boolean,
): ArcadeCodeSuggestion | null {
  const match = findCrawlerGameCode(snapshot.games, gameId, now);
  return match ? { ...match, cached, sourceUrl: ARCADE_CRAWLER_SOURCE } : null;
}

export async function lookupArcadeAccessCode(gameId: string): Promise<ArcadeCodeSuggestion | null> {
  if (!/^[0-9]{1,12}$/.test(gameId)) return null;
  const now = Date.now();
  const cache = await readCache(now);

  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return suggestion(cache, gameId, now, false);
  }

  try {
    if (!inFlight) {
      inFlight = refreshCrawler(now).finally(() => { inFlight = null; });
    }
    return suggestion(await inFlight, gameId, Date.now(), false);
  } catch {
    // A previously fetched public snapshot is safe to use only while the
    // exact game remains active and its deadline has not passed.
    return cache ? suggestion(cache, gameId, Date.now(), true) : null;
  }
}
