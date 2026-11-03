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

function t(key: string): string {
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

  async main(ctx) {
    const gameId = arcadeGameIdFromUrl(window.location.href);
    if (!gameId) return; // Never run on lab pages or non-game routes.

    let crawler: ArcadeCodeSuggestion | null = null;
    let urlCode = codeFromUrlFragment(window.location.hash);
    let currentInput: HTMLInputElement | null = null;
    let card: HTMLElement | null = null;
    let codeLabel: HTMLElement | null = null;
    let titleLabel: HTMLElement | null = null;
    let sourceLabel: HTMLElement | null = null;
    let statusLabel: HTMLElement | null = null;
    let fillButton: HTMLButtonElement | null = null;
    let scanTimeout: number | undefined;
    const attempted = new WeakSet<HTMLInputElement>();

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

    function codeField(): HTMLInputElement | null {
      if (arcadeGameIdFromUrl(location.href) !== gameId) return null;
      const field = findAccessCodeInput(document);
      if (
        !field ||
        !field.isConnected ||
        field.disabled ||
        field.getClientRects().length === 0
      )
        return null;
      return field;
    }

    function applyCode(input: HTMLInputElement, code: string) {
      if (!fillAccessCodeInput(input, code)) return;
      attempted.add(input);
      if (urlCode) {
        // Do not leave a shared access code visible in the address bar.
        window.history.replaceState(
          history.state,
          "",
          location.pathname + location.search,
        );
      }
      if (statusLabel) statusLabel.textContent = t("arcadeCodeFilled");
    }

    function scan() {
      scanTimeout = undefined;
      const active = activeCode();
      const input = active ? codeField() : null;
      currentInput = input;
      if (!card) return;

      if (!active || !input) {
        card.hidden = true;
        return;
      }

      card.hidden = false;
      if (codeLabel) codeLabel.textContent = active.code;
      if (titleLabel) {
        titleLabel.textContent = active.title || t("arcadeCodeTitle");
      }
      if (sourceLabel) {
        sourceLabel.textContent = active.fromLink
          ? t("arcadeCodeFromLink")
          : active.cached
            ? t("arcadeCodeFromCache")
            : t("arcadeCodeFromCrawler");
      }
      if (fillButton) fillButton.disabled = false;

      // Autofill empty fields only once. Never overwrite a user's typed code.
      if (!attempted.has(input)) {
        attempted.add(input);
        if (!input.value.trim()) applyCode(input, active.code);
      }
    }

    function scheduleScan(delay = 120) {
      if (scanTimeout !== undefined) window.clearTimeout(scanTimeout);
      scanTimeout = window.setTimeout(scan, delay);
    }

    const onClick = () => {
      // Google may insert its dialog and nested fields across multiple render ticks.
      // Two bounded checks avoid a permanent polling loop on every game page.
      scheduleScan(150);
      window.setTimeout(() => {
        if (!currentInput) scheduleScan(0);
      }, 650);
    };
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
        box.setAttribute("aria-label", t("arcadeCodeTitle"));

        const eyebrow = document.createElement("div");
        eyebrow.className = "eplus-code-eyebrow";
        eyebrow.textContent = t("arcadeCodeTitle");

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
        fillButton.textContent = t("arcadeCodeFill");
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
        monthlyLabsLink.textContent = t("arcadeCodeViewMonthlyLabs");

        actions.append(fillButton, monthlyLabsLink);
        statusLabel = document.createElement("p");
        statusLabel.className = "eplus-code-status";
        statusLabel.setAttribute("aria-live", "polite");
        statusLabel.textContent = t("arcadeCodeReview");

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
    document.addEventListener("keyup", onClick, true);
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("pageshow", onHashChange);
    ctx.onInvalidated(() => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keyup", onClick, true);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("pageshow", onHashChange);
      if (scanTimeout !== undefined) window.clearTimeout(scanTimeout);
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
