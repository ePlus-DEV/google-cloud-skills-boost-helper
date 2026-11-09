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

/**
 * Check whether a crawler or user-supplied value has a safe Access Code format.
 *
 * @param value - Untrusted value to validate.
 * @returns Whether the value is a syntactically valid Arcade Access Code.
 */
export function validArcadeAccessCode(value: unknown): value is string {
  return typeof value === "string" && CODE_PATTERN.test(value);
}

/**
 * Extract an exact numeric game ID from a trusted HTTPS Google Skills URL.
 *
 * @param url - Candidate game URL, which may contain query parameters.
 * @returns The game ID, or null for unsupported hosts and paths.
 */
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
/**
 * Resolve a code only when the public snapshot matches the exact game ID.
 * Reject conflicting, inactive, reconstructed, malformed or expired records.
 *
 * @param snapshot - Untrusted crawler records.
 * @param gameId - Numeric Google Skills game ID.
 * @param now - Timestamp in milliseconds used for deadline validation.
 * @returns Trusted code metadata, or null when no unambiguous match exists.
 */
export function findCrawlerGameCode(
  snapshot: unknown,
  gameId: string,
  now = Date.now(),
): ArcadeAccessCodeMatch | null {
  if (
    !/^[0-9]{1,12}$/.test(gameId) ||
    !Array.isArray(snapshot) ||
    snapshot.length > 500
  ) {
    return null;
  }

  let match: ArcadeAccessCodeMatch | null = null;
  for (const candidate of snapshot as CrawlerGame[]) {
    if (!candidate || typeof candidate !== "object") continue;
    if (
      typeof candidate.joinUrl !== "string" ||
      arcadeGameIdFromUrl(candidate.joinUrl) !== gameId
    )
      continue;

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

    const title =
      typeof candidate.title === "string"
        ? candidate.title.trim().slice(0, 160)
        : "";
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
/**
 * Read exactly one user-supplied access code from a URL fragment.
 * Query strings and duplicate access_code parameters are intentionally ignored.
 *
 * @param fragment - URL hash, including or excluding the leading #.
 * @returns Valid code or null when missing, invalid or ambiguous.
 */
export function codeFromUrlFragment(fragment: string): string | null {
  const parsed = new URLSearchParams(
    fragment.startsWith("#") ? fragment.slice(1) : fragment,
  );
  const codes = parsed.getAll("access_code");
  // Ambiguous fragments must not choose an arbitrary code.
  return codes.length === 1 && validArcadeAccessCode(codes[0])
    ? codes[0]
    : null;
}

/** The page can render the code field within multiple open Shadow Roots. */
/**
 * Locate the first eligible Access Code input across nested open Shadow Roots.
 *
 * @param root - Document or ShadowRoot to search.
 * @param isEligible - Optional predicate for rejecting hidden or stale inputs.
 * @returns An eligible input, or null if none can be reached.
 */
export function findAccessCodeInput(
  root: Document | ShadowRoot,
  isEligible: (input: HTMLInputElement) => boolean = () => true,
): HTMLInputElement | null {
  // The page can leave hidden, stale dialogs in the DOM. Do not stop at
  // the first matching field if the caller needs a visible, enabled one.
  for (const field of root.querySelectorAll<HTMLInputElement>(
    'input[name="access_code"]',
  )) {
    if (isEligible(field)) return field;
  }
  for (const element of root.querySelectorAll("*")) {
    if (!element.shadowRoot) continue;
    const nested = findAccessCodeInput(element.shadowRoot, isEligible);
    if (nested) return nested;
  }
  return null;
}

/**
 * Trigger native input/change events so custom elements and frameworks observe
 * the same change as a real user typing. Google alone validates submitted codes.
 */
/**
 * Fill an enabled field through its native setter and dispatch composed events.
 * This never submits the form or clicks Google's Join button.
 *
 * @param field - Access Code field to populate.
 * @param code - Valid code to insert.
 * @returns Whether the field contains the requested code after dispatch.
 */
export function fillAccessCodeInput(
  field: HTMLInputElement,
  code: string,
): boolean {
  if (!validArcadeAccessCode(code) || field.disabled || field.readOnly)
    return false;
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set;
  if (!setter) return false;
  field.focus();
  setter.call(field, code);
  field.dispatchEvent(
    new InputEvent("input", {
      bubbles: true,
      composed: true,
      inputType: "insertText",
      data: code,
    }),
  );
  field.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  return field.value === code;
}
