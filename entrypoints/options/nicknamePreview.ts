/**
 * Live nickname preview initializer
 * - Mirrors `#account-nickname-input` into `#preview-nickname-text`
 * - Shows or hides `#preview-nickname-display` depending on value
 */
export function initNicknamePreview(): void {
  const input = document.getElementById(
    "account-nickname-input",
  ) as HTMLInputElement | null;
  const previewDisplay = document.getElementById(
    "preview-nickname-display",
  ) as HTMLElement | null;
  const previewText = document.getElementById(
    "preview-nickname-text",
  ) as HTMLElement | null;

  if (!input || !previewDisplay || !previewText) return;
  // Create non-null locals so TS understands these are safe to use below
  const inputEl = input as HTMLInputElement;
  const previewDisplayEl = previewDisplay as HTMLElement;
  const previewTextEl = previewText as HTMLElement;

  // Use the current text content as the localized default (localizeElements
  // runs before this initializer in main.tsx)
  const defaultText = previewTextEl.textContent || "";

  function updatePreview(): void {
    const val = inputEl.value.trim();
    if (val) {
      previewTextEl.textContent = val;
      previewDisplayEl.classList.remove("hidden");
    } else {
      previewTextEl.textContent = defaultText;
      previewDisplayEl.classList.add("hidden");
    }
  }

  inputEl.addEventListener("input", updatePreview);
  // Initialize once to reflect any existing value
  updatePreview();
}
