type Theme =
  | "dark"
  | "light"
  | "ocean"
  | "sunset"
  | "forest"
  | "purple"
  | "midnight"
  | "rose"
  | "custom";

type CustomThemePalette = {
  backgroundStart: string;
  backgroundMiddle: string;
  backgroundEnd: string;
  accent: string;
  arcadePoints: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  text?: string;
};

const DARK_BASELINE: CustomThemePalette = {
  backgroundStart: "#0f172a",
  backgroundMiddle: "#581c87",
  backgroundEnd: "#0f172a",
  accent: "#a855f7",
  arcadePoints: "#ffffff",
  textPrimary: "#ffffff",
  textSecondary: "#b3b3b3",
  textMuted: "#999999",
};

const themeStorage = storage.defineItem<Theme>("local:popupTheme", {
  defaultValue: "dark",
});

const customThemeStorage = storage.defineItem<CustomThemePalette>(
  "local:popupCustomTheme",
  {
    defaultValue: DARK_BASELINE,
  },
);

const themeClassList = [
  "theme-dark",
  "theme-light",
  "theme-ocean",
  "theme-sunset",
  "theme-forest",
  "theme-purple",
  "theme-midnight",
  "theme-rose",
  "theme-custom",
];

const previewFrameId = "popup-preview-frame";

/** Returns true if the given string is a valid 6-digit hex color (e.g. `#a855f7`). */
function isValidHexColor(color: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(color.trim());
}

/** Converts a hex color string to a comma-separated RGB channel string (e.g. `"168, 85, 247"`). */
function toRgbChannels(hexColor: string): string {
  const normalized = hexColor.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return "168, 85, 247";
  }

  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

/** Normalizes a CSS color value (hex or rgb/rgba) to a lowercase 6-digit hex string. Returns `""` on failure. */
function colorToHex(color: string): string {
  const trimmed = color.trim();
  if (isValidHexColor(trimmed)) {
    return trimmed.toLowerCase();
  }

  const match = trimmed.match(/^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (!match) return "";

  /** Converts a numeric string to a two-digit lowercase hex string (e.g. `"255"` → `"ff"`). */
  const toHex = (value: string) => Number(value).toString(16).padStart(2, "0");
  return `#${toHex(match[1])}${toHex(match[2])}${toHex(match[3])}`;
}

/** Extracts all hex/rgb color values from a CSS `background-image` gradient string and returns them as hex strings. */
function extractGradientColors(backgroundImage: string): string[] {
  const colorMatches =
    backgroundImage.match(/#[0-9a-fA-F]{6}|rgba?\([^)]+\)/g) || [];
  return colorMatches
    .map((value) => colorToHex(value))
    .filter((value) => isValidHexColor(value));
}

/** Returns the `contentDocument` of the popup preview iframe, or `null` if unavailable. */
function getPreviewDocument(): Document | null {
  const previewFrame = document.getElementById(
    previewFrameId,
  ) as HTMLIFrameElement | null;
  return previewFrame?.contentDocument || null;
}

/**
 * Reads a computed CSS color property from a DOM element inside the preview document.
 * @param previewDoc - The preview iframe's document.
 * @param selector - CSS selector for the target element.
 * @param cssProp - The computed style property to read (`"color"` or `"backgroundColor"`).
 * @returns The color as a hex string, or `""` if the element is not found.
 */
function getComputedColor(
  previewDoc: Document,
  selector: string,
  cssProp: "color" | "backgroundColor",
): string {
  const target = previewDoc.querySelector(selector) as HTMLElement | null;
  if (!target) return "";

  const styles = getComputedStyle(target);
  return colorToHex(styles[cssProp]);
}

/**
 * Validates and fills in missing or invalid fields in a partial palette using `DARK_BASELINE` as fallback.
 * Also handles the legacy `text` field by mapping it to `textPrimary`.
 */
function sanitizePalette(raw: Partial<CustomThemePalette>): CustomThemePalette {
  const legacyText = isValidHexColor(raw.text || "")
    ? (raw.text as string)
    : DARK_BASELINE.textPrimary;

  return {
    backgroundStart: isValidHexColor(raw.backgroundStart || "")
      ? (raw.backgroundStart as string)
      : DARK_BASELINE.backgroundStart,
    backgroundMiddle: isValidHexColor(raw.backgroundMiddle || "")
      ? (raw.backgroundMiddle as string)
      : DARK_BASELINE.backgroundMiddle,
    backgroundEnd: isValidHexColor(raw.backgroundEnd || "")
      ? (raw.backgroundEnd as string)
      : DARK_BASELINE.backgroundEnd,
    accent: isValidHexColor(raw.accent || "")
      ? (raw.accent as string)
      : DARK_BASELINE.accent,
    arcadePoints: isValidHexColor(raw.arcadePoints || "")
      ? (raw.arcadePoints as string)
      : DARK_BASELINE.arcadePoints,
    textPrimary: isValidHexColor(raw.textPrimary || "")
      ? (raw.textPrimary as string)
      : legacyText,
    textSecondary: isValidHexColor(raw.textSecondary || "")
      ? (raw.textSecondary as string)
      : DARK_BASELINE.textSecondary,
    textMuted: isValidHexColor(raw.textMuted || "")
      ? (raw.textMuted as string)
      : DARK_BASELINE.textMuted,
  };
}

/**
 * Applies a custom theme palette to a target document by setting CSS custom properties
 * and switching the body class to `theme-custom`.
 */
function applyPaletteToDocument(
  targetDocument: Document,
  palette: CustomThemePalette,
): void {
  const root = targetDocument.documentElement;
  root.style.setProperty("--custom-bg-start", palette.backgroundStart);
  root.style.setProperty("--custom-bg-middle", palette.backgroundMiddle);
  root.style.setProperty("--custom-bg-end", palette.backgroundEnd);
  root.style.setProperty("--custom-accent", palette.accent);
  root.style.setProperty("--custom-accent-rgb", toRgbChannels(palette.accent));
  root.style.setProperty("--custom-arcade-points", palette.arcadePoints);
  root.style.setProperty("--custom-text-primary", palette.textPrimary);
  root.style.setProperty("--custom-text-secondary", palette.textSecondary);
  root.style.setProperty("--custom-text-muted", palette.textMuted);

  const body = targetDocument.body;
  if (body) {
    for (const className of themeClassList) {
      body.classList.remove(className);
    }
    body.classList.add("theme-custom");
  }
}

/** Applies a custom theme palette to the popup preview iframe. No-op if the preview document is unavailable. */
function applyPaletteToPreview(palette: CustomThemePalette): void {
  const previewDoc = getPreviewDocument();
  if (!previewDoc) return;
  applyPaletteToDocument(previewDoc, palette);
}

/** Samples the current computed colors from the popup preview iframe and returns them as a `CustomThemePalette`. */
function samplePaletteFromPreview(): CustomThemePalette {
  const previewDoc = getPreviewDocument();
  if (!previewDoc) return { ...DARK_BASELINE };

  const popupContent = previewDoc.getElementById(
    "popup-content",
  ) as HTMLElement | null;

  const gradientColors = popupContent
    ? extractGradientColors(getComputedStyle(popupContent).backgroundImage)
    : [];

  const sampled: Partial<CustomThemePalette> = {
    backgroundStart: gradientColors[0],
    backgroundMiddle: gradientColors[1],
    backgroundEnd: gradientColors[2] || gradientColors[0],
    accent: getComputedColor(
      previewDoc,
      ".absolute.opacity-20 .bg-purple-500",
      "backgroundColor",
    ),
    arcadePoints: getComputedColor(previewDoc, "#arcade-points", "color"),
    textPrimary: getComputedColor(previewDoc, ".text-white", "color"),
    textSecondary:
      getComputedColor(previewDoc, ".text-white\\/70", "color") ||
      getComputedColor(previewDoc, ".text-gray-300", "color"),
    textMuted:
      getComputedColor(previewDoc, "#last-updated", "color") ||
      getComputedColor(previewDoc, ".text-gray-500", "color"),
  };

  return sanitizePalette(sampled);
}

/** Loads the popup HTML into the preview iframe and waits for it to finish loading. */
async function loadPopupPreview(): Promise<void> {
  const previewFrame = document.getElementById(
    previewFrameId,
  ) as HTMLIFrameElement | null;
  if (!previewFrame) return;

  await new Promise<void>((resolve) => {
    /** Resolves the promise once the preview iframe has finished loading. */
    const onLoad = () => {
      previewFrame.removeEventListener("load", onLoad);
      resolve();
    };
    previewFrame.addEventListener("load", onLoad);
    previewFrame.src = chrome.runtime.getURL("popup.html");
  });
}

/** Reads the current values from all color inputs in the studio form and returns them as a sanitized `CustomThemePalette`. */
function readPaletteFromInputs(): CustomThemePalette {
  /** Returns the current value of a color input by element ID, or `fallback` if the element is not found. */
  const getValue = (id: string, fallback: string) => {
    const input = document.getElementById(id) as HTMLInputElement | null;
    return input?.value || fallback;
  };

  return sanitizePalette({
    backgroundStart: getValue(
      "custom-theme-bg-start",
      DARK_BASELINE.backgroundStart,
    ),
    backgroundMiddle: getValue(
      "custom-theme-bg-middle",
      DARK_BASELINE.backgroundMiddle,
    ),
    backgroundEnd: getValue("custom-theme-bg-end", DARK_BASELINE.backgroundEnd),
    accent: getValue("custom-theme-accent", DARK_BASELINE.accent),
    arcadePoints: getValue(
      "custom-theme-arcade-points",
      DARK_BASELINE.arcadePoints,
    ),
    textPrimary: getValue(
      "custom-theme-text-primary",
      DARK_BASELINE.textPrimary,
    ),
    textSecondary: getValue(
      "custom-theme-text-secondary",
      DARK_BASELINE.textSecondary,
    ),
    textMuted: getValue("custom-theme-text-muted", DARK_BASELINE.textMuted),
  });
}

/** Writes a palette's color values into the corresponding color input elements in the studio form. */
function syncInputs(palette: CustomThemePalette): void {
  /** Sets the value of a color input element by ID. No-op if the element is not found. */
  const setValue = (id: string, value: string) => {
    const input = document.getElementById(id) as HTMLInputElement | null;
    if (input) input.value = value;
  };

  setValue("custom-theme-bg-start", palette.backgroundStart);
  setValue("custom-theme-bg-middle", palette.backgroundMiddle);
  setValue("custom-theme-bg-end", palette.backgroundEnd);
  setValue("custom-theme-accent", palette.accent);
  setValue("custom-theme-arcade-points", palette.arcadePoints);
  setValue("custom-theme-text-primary", palette.textPrimary);
  setValue("custom-theme-text-secondary", palette.textSecondary);
  setValue("custom-theme-text-muted", palette.textMuted);
}

/** Initializes the Theme Studio page: localizes strings, loads saved palette, wires up all button handlers. */
async function initialize(): Promise<void> {
  // Localize static strings in the studio HTML using chrome.i18n
  function localizeElements() {
    const elements = document.querySelectorAll("[data-i18n]");
    for (const element of elements) {
      const key = (element as HTMLElement).dataset.i18n;
      if (key && chrome?.i18n) {
        const message = chrome.i18n.getMessage(key);
        if (message) element.textContent = message;
      }
    }

    const titleElements = document.querySelectorAll("[data-i18n-title]");
    for (const element of titleElements) {
      const key = (element as HTMLElement).dataset.i18nTitle;
      if (key && chrome?.i18n) {
        const message = chrome.i18n.getMessage(key);
        if (message) element.setAttribute("title", message);
      }
    }
  }

  // perform localization before wiring up elements
  try {
    localizeElements();
  } catch (err) {
    // non-fatal
  }
  const savedPalette = sanitizePalette(await customThemeStorage.getValue());
  syncInputs(savedPalette);

  await loadPopupPreview();
  applyPaletteToPreview(readPaletteFromInputs());

  const liveInputs = document.querySelectorAll(
    '.studio-fields input[type="color"]',
  );
  liveInputs.forEach((input) => {
    input.addEventListener("input", () => {
      const draft = readPaletteFromInputs();
      applyPaletteToPreview(draft);
    });
  });

  const applyButton = document.getElementById("apply-custom-theme");
  applyButton?.addEventListener("click", async () => {
    const nextPalette = readPaletteFromInputs();
    await customThemeStorage.setValue(nextPalette);
    await themeStorage.setValue("custom");
    applyPaletteToPreview(nextPalette);
  });

  const resetButton = document.getElementById("reset-custom-theme");
  resetButton?.addEventListener("click", async () => {
    await customThemeStorage.setValue(DARK_BASELINE);
    await themeStorage.setValue("dark");
    syncInputs(DARK_BASELINE);
    applyPaletteToPreview(DARK_BASELINE);
  });

  const syncButton = document.getElementById("sync-from-popup");
  syncButton?.addEventListener("click", async () => {
    await loadPopupPreview();
    const sampledPalette = samplePaletteFromPreview();
    syncInputs(sampledPalette);
    applyPaletteToPreview(sampledPalette);
  });
}

initialize();
