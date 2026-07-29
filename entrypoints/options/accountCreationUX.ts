import ArcadeApiService from "../../services/arcadeApiService";

const PROFILE_URL_EXAMPLE =
  "https://www.skills.google/public_profiles/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";

type MessageKey = Parameters<typeof browser.i18n.getMessage>[0];

function getMessage(key: MessageKey, fallback: string): string {
  try {
    return browser.i18n.getMessage(key) || fallback;
  } catch {
    return fallback;
  }
}

function ensureHelper(input: HTMLInputElement): HTMLElement {
  const existing = document.getElementById("account-url-helper");
  if (existing) return existing;

  const helper = document.createElement("div");
  helper.id = "account-url-helper";
  helper.setAttribute("role", "status");
  helper.setAttribute("aria-live", "polite");
  helper.className = "mt-2 text-xs text-gray-500";
  input.closest(".bg-white")?.appendChild(helper);
  input.setAttribute("aria-describedby", helper.id);
  return helper;
}

function setButtonState(
  button: HTMLButtonElement,
  enabled: boolean,
  busy = false,
): void {
  button.disabled = !enabled || busy;
  button.setAttribute("aria-disabled", String(!enabled || busy));
  button.classList.toggle("opacity-60", !enabled || busy);
  button.classList.toggle("cursor-not-allowed", !enabled || busy);
  button.classList.toggle("cursor-pointer", enabled && !busy);
}

function updateInputState(
  input: HTMLInputElement,
  button: HTMLButtonElement,
  helper: HTMLElement,
): void {
  const value = input.value.trim();
  const isEmpty = value.length === 0;
  const isValid = !isEmpty && ArcadeApiService.isValidProfileUrl(value);

  input.classList.toggle("border-red-400", !isEmpty && !isValid);
  input.classList.toggle("focus:border-red-500", !isEmpty && !isValid);
  input.classList.toggle("border-emerald-400", isValid);
  input.setAttribute("aria-invalid", String(!isEmpty && !isValid));

  if (isEmpty) {
    helper.textContent = getMessage(
      "accountCreationPasteHint" as MessageKey,
      `Paste your public profile URL, for example: ${PROFILE_URL_EXAMPLE}`,
    );
    helper.className = "mt-2 text-xs text-gray-500";
  } else if (isValid) {
    helper.textContent = getMessage(
      "accountCreationUrlReady" as MessageKey,
      "Profile URL looks valid. Press Enter or select Create account.",
    );
    helper.className = "mt-2 text-xs text-emerald-700";
  } else {
    helper.textContent = getMessage(
      "errorInvalidProfileUrl" as MessageKey,
      "Enter a valid Google Cloud Skills Boost public profile URL.",
    );
    helper.className = "mt-2 text-xs text-red-600";
  }

  setButtonState(button, isValid);
}

function enhanceModal(): void {
  const modal = document.getElementById("add-account-modal");
  const input = document.getElementById(
    "account-url-input",
  ) as HTMLInputElement | null;
  const button = document.getElementById(
    "create-account-btn",
  ) as HTMLButtonElement | null;
  const loading = document.getElementById("loading-profile");
  const nickname = document.getElementById("account-nickname-input");

  if (!modal || !input || !button || input.dataset.uxEnhanced === "true") {
    return;
  }

  input.dataset.uxEnhanced = "true";
  input.autocomplete = "url";
  input.inputMode = "url";
  input.spellcheck = false;
  input.placeholder = PROFILE_URL_EXAMPLE;

  const helper = ensureHelper(input);
  updateInputState(input, button, helper);

  input.addEventListener("input", () => {
    updateInputState(input, button, helper);
  });

  input.addEventListener("paste", () => {
    window.setTimeout(() => {
      input.value = input.value.trim();
      updateInputState(input, button, helper);
    }, 0);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || button.disabled) return;
    event.preventDefault();
    button.click();
  });

  button.addEventListener("click", () => {
    if (button.disabled) return;
    setButtonState(button, true, true);
    button.setAttribute("aria-busy", "true");
    helper.textContent = getMessage(
      "accountCreationCheckingProfile" as MessageKey,
      "Checking profile and creating account…",
    );
    helper.className = "mt-2 text-xs text-indigo-700";
  });

  const stateObserver = new MutationObserver(() => {
    const isLoading = Boolean(loading && !loading.classList.contains("hidden"));
    if (!isLoading) {
      button.removeAttribute("aria-busy");
      updateInputState(input, button, helper);
    }

    if (
      nickname &&
      !nickname.closest("#step-add-nickname")?.classList.contains("hidden")
    ) {
      (nickname as HTMLInputElement).focus();
    }
  });

  if (loading) {
    stateObserver.observe(loading, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  const nicknameStep = document.getElementById("step-add-nickname");
  if (nicknameStep) {
    stateObserver.observe(nicknameStep, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  const modalObserver = new MutationObserver(() => {
    if (!modal.classList.contains("hidden")) {
      window.setTimeout(() => input.focus(), 50);
    }
  });
  modalObserver.observe(modal, {
    attributes: true,
    attributeFilter: ["class"],
  });
}

export function initAccountCreationUX(): void {
  enhanceModal();

  const observer = new MutationObserver(() => enhanceModal());
  observer.observe(document.body, { childList: true, subtree: true });
}
