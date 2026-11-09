import "../assets/arcade-access-code.css";
import type { ArcadeCodeSuggestion } from "../services/arcadeAccessCodeService";
import {
  arcadeGameIdFromUrl,
  codeFromUrlFragment,
  fillAccessCodeInput,
  findAccessCodeInput,
  validArcadeAccessCode,
} from "../utils/arcadeAccessCode";

const MONTHLY_LABS_URL = "https://arcade.eplus.dev/#monthly-games";

/**
 * Resolve a translated label for the extension UI.
 *
 * @param key - Message key in the browser's active locale.
 * @returns Localized text, or the key when translation is unavailable.
 */
function translateArcadeMessage(key: string): string {
  return browser.i18n.getMessage(key) || key;
}

/**
 * Suggest and optionally prefill one EXACT-match game code.
 * This content script never clicks Join or sends the code to Google itself.
 */
export default defineContentScript({
  matches: [
    "https://skills.google/games/*",
    "https://www.skills.google/games/*",
  ],
  cssInjectionMode: "ui",

  /**
   * Install the Arcade code helper on a supported Google Skills game page.
   *
   * @param ctx - WXT lifecycle context used to mount and clean up the UI.
   */
  async main(ctx) {
    const gameId = arcadeGameIdFromUrl(window.location.href);
    if (!gameId) return; // Never run on lab pages or non-game routes.

    let crawler: ArcadeCodeSuggestion | null = null;
    let urlCode = codeFromUrlFragment(window.location.hash);
    let card: HTMLElement | null = null;
    let codeLabel: HTMLElement | null = null;
    let titleLabel: HTMLElement | null = null;
    let sourceLabel: HTMLElement | null = null;
    let statusLabel: HTMLElement | null = null;
    let fillButton: HTMLButtonElement | null = null;
    let scanTimeout: number | undefined;
    const retryTimers = new Set<number>();
    const attempted = new WeakSet<HTMLInputElement>();

    /**
     * Prefer a valid explicit link code over an unexpired crawler suggestion.
     *
     * @returns The currently eligible suggestion or null.
     */
    function activeCode(): {
      code: string;
      title: string;
      fromLink: boolean;
      cached: boolean;
    } | null {
      if (urlCode)
        return { code: urlCode, title: "", fromLink: true, cached: false };
      if (
        !crawler ||
        crawler.gameId !== gameId ||
        !validArcadeAccessCode(crawler.code)
      )
        return null;
      if (Date.parse(crawler.deadline) <= Date.now()) return null;
      return {
        code: crawler.code,
        title: crawler.title,
        fromLink: false,
        cached: crawler.cached,
      };
    }

    /**
     * Find the currently visible, editable code field on this game page.
     *
     * @returns The eligible field or null when the dialog is not available.
     */
    function codeField(): HTMLInputElement | null {
      if (arcadeGameIdFromUrl(location.href) !== gameId) return null;
      return findAccessCodeInput(
        document,
        (field) =>
          field.isConnected &&
          !field.disabled &&
          !field.readOnly &&
          field.getClientRects().length > 0,
      );
    }

    /**
     * Insert a code and consume a matching URL fragment after successful fill.
     *
     * @param input - Target field that Google will validate on manual Join.
     * @param code - Suggested code to apply.
     */
    function applyCode(input: HTMLInputElement, code: string) {
      if (!fillAccessCodeInput(input, code)) return;
      attempted.add(input);
      if (urlCode === code) {
        // Do not leave a shared access code visible in the address bar.
        window.history.replaceState(
          history.state,
          "",
          location.pathname + location.search,
        );
        urlCode = null;
      }
      if (statusLabel) statusLabel.textContent = translateArcadeMessage("arcadeCodeFilled");
    }

    /**
     * Update the suggestion panel and fill a newly available empty field.
     * Existing user-entered values are never overwritten automatically.
     */
    function scanForAccessCodeField() {
      scanTimeout = undefined;
      const active = activeCode();
      const input = active ? codeField() : null;
      if (!card) return;

      if (!active || !input) {
        card.hidden = true;
        return;
      }

      card.hidden = false;
      if (codeLabel) codeLabel.textContent = active.code;
      if (titleLabel) {
        titleLabel.textContent = active.title || translateArcadeMessage("arcadeCodeTitle");
      }
      if (sourceLabel) {
        sourceLabel.textContent = active.fromLink
          ? translateArcadeMessage("arcadeCodeFromLink")
          : active.cached
            ? translateArcadeMessage("arcadeCodeFromCache")
            : translateArcadeMessage("arcadeCodeFromCrawler");
      }
      if (fillButton) fillButton.disabled = false;

      // Autofill empty fields only once. Never overwrite a user's typed code.
      if (!attempted.has(input)) {
        if (input.value.trim()) {
          // A user-entered value must remain untouched on future scans.
          attempted.add(input);
        } else {
          // A failed fill must stay retryable when the dialog settles.
          applyCode(input, active.code);
        }
      }
    }

    /**
     * Debounce a pending DOM scan to avoid repeated traversal.
     *
     * @param delay - Milliseconds before checking for a code field.
     */
    function scheduleScan(delay = 120) {
      if (scanTimeout !== undefined) window.clearTimeout(scanTimeout);
      scanTimeout = window.setTimeout(scanForAccessCodeField, delay);
    }

    /** Retry a bounded set of scans after the Google Join dialog is opened. */
    const onClick = () => {
      if (!activeCode()) return;
      // The Join modal may mount asynchronously or replace a previously
      // rendered input. Retry a small, bounded number of times, even if an
      // earlier dialog's field was already found.
      for (const timer of retryTimers) window.clearTimeout(timer);
      retryTimers.clear();
      for (const delay of [150, 450, 900, 1800]) {
        const timer = window.setTimeout(() => {
          retryTimers.delete(timer);
          scheduleScan(0);
        }, delay);
        retryTimers.add(timer);
      }
    };
    /**
     * Handle keyboard activation without scanning on every typed character.
     *
     * @param event - Keyup event from the game page.
     */
    const onKeyup = (event: KeyboardEvent) => {
      // Ordinary typing must not trigger four DOM scans per keystroke.
      if (event.key === "Enter" || event.key === " ") onClick();
    };
    /** Refresh an explicit code supplied via navigation or hash updates. */
    const onHashChange = () => {
      urlCode = codeFromUrlFragment(window.location.hash);
      scheduleScan(150);
    };

    const ui = await createShadowRootUi(ctx, {
      name: "eplus-arcade-code-assistant",
      position: "inline",
      anchor: "body",
      onMount(container) {
        const box = document.createElement("aside");
        box.className = "eplus-arcade-code";
        box.hidden = true;
        box.setAttribute("aria-label", translateArcadeMessage("arcadeCodeTitle"));

        const eyebrow = document.createElement("div");
        eyebrow.className = "eplus-code-eyebrow";
        eyebrow.textContent = translateArcadeMessage("arcadeCodeTitle");

        titleLabel = document.createElement("div");
        titleLabel.className = "eplus-code-title";

        codeLabel = document.createElement("code");
        codeLabel.className = "eplus-code-value";

        sourceLabel = document.createElement("div");
        sourceLabel.className = "eplus-code-source";

        const actions = document.createElement("div");
        actions.className = "eplus-code-actions";

        fillButton = document.createElement("button");
        fillButton.type = "button";
        fillButton.className = "eplus-code-fill";
        fillButton.textContent = translateArcadeMessage("arcadeCodeFill");
        fillButton.addEventListener("click", () => {
          const active = activeCode();
          const input = codeField();
          if (!active || !input) return;
          applyCode(input, active.code);
        });

        const monthlyLabsLink = document.createElement("a");
        monthlyLabsLink.className = "eplus-code-link";
        monthlyLabsLink.href = MONTHLY_LABS_URL;
        monthlyLabsLink.target = "_blank";
        monthlyLabsLink.rel = "noopener noreferrer";
        monthlyLabsLink.textContent = translateArcadeMessage("arcadeCodeViewMonthlyLabs");

        actions.append(fillButton, monthlyLabsLink);
        statusLabel = document.createElement("p");
        statusLabel.className = "eplus-code-status";
        statusLabel.setAttribute("aria-live", "polite");
        statusLabel.textContent = translateArcadeMessage("arcadeCodeReview");

        box.append(
          eyebrow,
          titleLabel,
          codeLabel,
          sourceLabel,
          actions,
          statusLabel,
        );
        container.append(box);
        card = box;
      },
    });
    ui.mount();
    scheduleScan(0);

    document.addEventListener("click", onClick, true);
    document.addEventListener("keyup", onKeyup, true);
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("pageshow", onHashChange);
    ctx.onInvalidated(() => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keyup", onKeyup, true);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("pageshow", onHashChange);
      if (scanTimeout !== undefined) window.clearTimeout(scanTimeout);
      for (const timer of retryTimers) window.clearTimeout(timer);
      retryTimers.clear();
    });

    try {
      const reply: unknown = await browser.runtime.sendMessage({
        type: "arcadeAccessCodeLookup",
        gameId,
      });
      if (reply && typeof reply === "object") {
        const candidate = reply as Partial<ArcadeCodeSuggestion>;
        if (
          candidate.gameId === gameId &&
          validArcadeAccessCode(candidate.code) &&
          typeof candidate.deadline === "string" &&
          Number.isFinite(Date.parse(candidate.deadline)) &&
          Date.parse(candidate.deadline) > Date.now()
        ) {
          crawler = {
            gameId,
            code: candidate.code,
            title:
              typeof candidate.title === "string"
                ? candidate.title.slice(0, 160)
                : "",
            deadline: candidate.deadline,
            cached: candidate.cached === true,
            sourceUrl:
              candidate.sourceUrl ||
              "https://github.com/hoangsvit/arcade-crawler/blob/main/data/arcade_monthly_games.json",
          };
        }
      }
      scheduleScan(0);
    } catch {
      // Do not interfere with the official page when the crawler is unavailable.
    }
  },
});
