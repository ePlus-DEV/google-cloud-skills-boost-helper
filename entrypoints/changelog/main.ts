import MarkdownService from "../../services/markdownService";
import UpdateNotificationService from "../../services/updateNotificationService";
import { MARKDOWN_CONFIG } from "../../utils/config";
import { isFirefox } from "../../services/browserService";

function getMessage(key: string): string {
  try {
    const lookupMessage = browser.i18n.getMessage as unknown as (
      messageName: string,
    ) => string;
    return lookupMessage(key) || key;
  } catch {
    return key;
  }
}

document.title = getMessage("changelogPageTitle");

function localizeElements(): void {
  for (const element of document.querySelectorAll<HTMLElement>("[data-i18n]")) {
    const key = element.dataset.i18n;
    if (!key) continue;
    const message = getMessage(key);
    if (message) element.textContent = message;
  }
}

function getQueryParam(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function addHeadingIds(): void {
  const markdownContent = document.querySelector(".markdown-content");
  if (!markdownContent) return;

  const usedIds = new Map<string, number>();
  const headings = markdownContent.querySelectorAll<HTMLElement>("h2, h3");

  for (const heading of headings) {
    const text = heading.textContent || "";
    const baseId = slugify(text) || "section";
    const seen = usedIds.get(baseId) ?? 0;
    usedIds.set(baseId, seen + 1);
    heading.id = seen === 0 ? baseId : `${baseId}-${seen + 1}`;
    heading.style.cursor = "pointer";
    heading.style.position = "relative";
    heading.style.scrollMarginTop = "100px";

    heading.addEventListener("click", async () => {
      const url = new URL(window.location.href);
      const versionMatch = text.match(/version\s+([\d.]+)/i);
      if (versionMatch) {
        url.searchParams.set("version", versionMatch[1]);
        url.searchParams.set("scroll", versionMatch[1]);
      } else {
        url.searchParams.set("scroll", heading.id);
      }
      window.history.pushState({}, "", url.toString());
      heading.scrollIntoView({ behavior: "smooth", block: "start" });
      try {
        await navigator.clipboard.writeText(url.toString());
      } catch (error) {
        console.debug("Copy changelog link failed:", error);
      }
    });
  }

  const scrollParam = getQueryParam("scroll");
  const versionParam = getQueryParam("version");
  const hashParam = window.location.hash
    ? decodeURIComponent(window.location.hash.slice(1))
    : null;
  const requested = scrollParam || versionParam || hashParam;
  if (!requested) return;

  window.setTimeout(() => {
    let target = document.getElementById(requested);
    if (!target && versionParam) {
      target =
        Array.from(headings).find((heading) =>
          heading.textContent?.includes(versionParam),
        ) ?? null;
    }
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 400);
}

function createUpdatePreferenceCard(): HTMLElement {
  const card = document.createElement("section");
  card.id = "changelog-update-preference";
  card.className =
    "mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm";
  card.innerHTML = `
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-start gap-3 min-w-0">
        <div class="rounded-lg bg-blue-100 p-2.5 shrink-0">
          <i class="fa-solid fa-bell text-blue-600" aria-hidden="true"></i>
        </div>
        <div>
          <h2 id="changelog-preference-heading" class="font-semibold text-gray-900">
            ${getMessage("labelEnableNotifications")}
          </h2>
          <p class="mt-1 text-sm text-gray-600">
            ${getMessage("changelogLatestUpdates")}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3 shrink-0">
        <label class="relative inline-flex cursor-pointer items-center">
          <input id="changelog-preference-toggle" type="checkbox" class="sr-only peer" aria-labelledby="changelog-preference-heading" />
          <span class="h-7 w-12 rounded-full bg-gray-300 transition peer-checked:bg-blue-600"></span>
          <span class="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"></span>
        </label>
        <span id="changelog-preference-status" class="text-sm font-medium text-gray-700" aria-live="polite"></span>
      </div>
    </div>
  `;
  return card;
}

function renderPreference(enabled: boolean): void {
  const toggle = document.getElementById(
    "changelog-preference-toggle",
  ) as HTMLInputElement | null;
  const status = document.getElementById("changelog-preference-status");
  if (toggle) toggle.checked = enabled;
  if (status) {
    status.textContent = enabled
      ? getMessage("labelEnabled")
      : getMessage("labelDisabled");
  }
}

async function initializeUpdatePreference(): Promise<void> {
  const configuredContainer = document.getElementById(
    MARKDOWN_CONFIG.DEFAULT_CONTAINER_ID,
  );
  const container =
    configuredContainer ?? document.getElementById("changelog-content");
  const parent = container?.parentElement;
  if (!parent || !container || document.getElementById("changelog-update-preference")) {
    return;
  }

  const card = createUpdatePreferenceCard();
  parent.insertBefore(card, container);
  renderPreference(await UpdateNotificationService.isEnabled());

  const toggle = document.getElementById(
    "changelog-preference-toggle",
  ) as HTMLInputElement | null;
  toggle?.addEventListener("change", async () => {
    toggle.disabled = true;
    try {
      await UpdateNotificationService.setEnabled(toggle.checked);
      renderPreference(toggle.checked);
    } catch (error) {
      console.debug("Failed to save changelog preference:", error);
      renderPreference(await UpdateNotificationService.isEnabled());
    } finally {
      toggle.disabled = false;
    }
  });
}

async function loadChangelog(): Promise<void> {
  const preferredId = MARKDOWN_CONFIG.DEFAULT_CONTAINER_ID;
  const containerId =
    preferredId && document.getElementById(preferredId)
      ? preferredId
      : "changelog-content";
  const success = await MarkdownService.renderUrlToContainer(
    MARKDOWN_CONFIG.CHANGELOG_URL,
    containerId,
    ".markdown-content",
  );

  if (!success) {
    const container = document.getElementById(containerId);
    if (container) {
      container.textContent = getMessage("errorLoadingData");
      container.classList.add("text-sm", "text-red-600");
    }
    return;
  }

  window.setTimeout(addHeadingIds, 100);
}

function initializeNavigation(): void {
  const backButton = document.getElementById("back-button");
  const backLabel = backButton?.querySelector("span");
  if (backLabel) backLabel.textContent = getMessage("labelBack");

  backButton?.addEventListener("click", () => {
    window.location.href = browser.runtime.getURL("/options.html");
  });

  const version = getQueryParam("version");
  const versionBadge = document.getElementById("version-number");
  if (versionBadge) versionBadge.textContent = version ? `v${version}` : "";
  if (version) document.title = `${getMessage("changelogWhatsNew")} - v${version}`;
}

async function showBrowserStoreBadge(): Promise<void> {
  const firefox = await isFirefox();
  document
    .getElementById("chrome-web-store-badge")
    ?.classList.toggle("hidden", firefox);
  document
    .getElementById("firefox-addon-store")
    ?.classList.toggle("hidden", !firefox);
}

localizeElements();
initializeNavigation();
void initializeUpdatePreference();
void loadChangelog();
void showBrowserStoreBadge();
