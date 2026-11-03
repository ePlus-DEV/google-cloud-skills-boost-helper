/**
 * Pure, source-aware game/access-code matching.
 * Never guess an access code, fuzzy-match a title, or bypass Google's Join flow.
 */
export type CrawlerGame = {
  title?: unknown;
  joinUrl?: unknown;
  accessCode?: unknown;
  deadline?: unknown;
  status?: unknown;
  reconstructed?: unknown;
};

export type ArcadeAccessCodeMatch = {
  gameId: string;
  title: string;
  code: string;
  deadline: string;
};

const SKILLS_HOSTS = new Set(["skills.google", "www.skills.google"]);
const CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{2,99}$/;

export function validArcadeAccessCode(value: unknown): value is string {
  return typeof value === "string" && CODE_PATTERN.test(value);
}

export function arcadeGameIdFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || !SKILLS_HOSTS.has(parsed.hostname)) {
      return null;
    }
    return /^\/games\/([0-9]{1,12})\/?$/.exec(parsed.pathname)?.[1] ?? null;
  } catch {
    return null;
  }
}

/**
 * Match by exact game ID, never by title or code substring.
 * A conflict or expired/non-active snapshot yields no suggestion.
 */
export function findCrawlerGameCode(
  snapshot: unknown,
  gameId: string,
  now = Date.now(),
): ArcadeAccessCodeMatch | null {
  if (!/^[0-9]{1,12}$/.test(gameId) || !Array.isArray(snapshot) || snapshot.length > 500) {
    return null;
  }

  let match: ArcadeAccessCodeMatch | null = null;
  for (const candidate of snapshot as CrawlerGame[]) {
    if (!candidate || typeof candidate !== "object") continue;
    if (typeof candidate.joinUrl !== "string" || arcadeGameIdFromUrl(candidate.joinUrl) !== gameId) continue;

    // Never surface a partial, fabricated, expired, or ambiguous code.
    if (
      candidate.status !== "active" ||
      candidate.reconstructed === true ||
      !validArcadeAccessCode(candidate.accessCode) ||
      typeof candidate.deadline !== "string" ||
      !Number.isFinite(Date.parse(candidate.deadline)) ||
      Date.parse(candidate.deadline) <= now
    ) {
      return null;
    }

    const title = typeof candidate.title === "string" ? candidate.title.trim().slice(0, 160) : "";
    const next = {
      gameId,
      title,
      code: candidate.accessCode,
      deadline: candidate.deadline,
    };
    if (match && match.code !== next.code) return null;
    match = next;
  }
  return match;
}

/** Only read user-supplied codes from the fragment, never from query params. */
export function codeFromUrlFragment(fragment: string): string | null {
  const parsed = new URLSearchParams(fragment.startsWith("#") ? fragment.slice(1) : fragment);
  const candidate = parsed.get("access_code");
  return validArcadeAccessCode(candidate) ? candidate : null;
}

/** The page can render the code field within multiple open Shadow Roots. */
export function findAccessCodeInput(root: Document | ShadowRoot): HTMLInputElement | null {
  const direct = root.querySelector<HTMLInputElement>('input[name="access_code"]');
  if (direct) return direct;
  for (const element of root.querySelectorAll("*")) {
    if (!element.shadowRoot) continue;
    const nested = findAccessCodeInput(element.shadowRoot);
    if (nested) return nested;
  }
  return null;
}

/**
 * Trigger native input/change events so custom elements and frameworks observe
 * the same change as a real user typing. Google alone validates submitted codes.
 */
export function fillAccessCodeInput(field: HTMLInputElement, code: string): boolean {
  if (!validArcadeAccessCode(code) || field.disabled || field.readOnly) return false;
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  if (!setter) return false;
  field.focus();
  setter.call(field, code);
  field.dispatchEvent(
    new InputEvent("input", { bubbles: true, composed: true, inputType: "insertText", data: code }),
  );
  field.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  return field.value === code;
}
