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

function isValidHexColor(color: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(color.trim());
}

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

function applyPaletteToPreview(palette: CustomThemePalette): void {
  const previewFrame = document.getElementById(
    "popup-preview-frame",
  ) as HTMLIFrameElement | null;
  if (!previewFrame?.contentDocument) return;

  applyPaletteToDocument(previewFrame.contentDocument, palette);
}

function readPaletteFromInputs(): CustomThemePalette {
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

function syncInputs(palette: CustomThemePalette): void {
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

async function initialize(): Promise<void> {
  const savedPalette = sanitizePalette(await customThemeStorage.getValue());
  syncInputs(savedPalette);

  const previewFrame = document.getElementById(
    "popup-preview-frame",
  ) as HTMLIFrameElement | null;
  if (previewFrame) {
    previewFrame.src = chrome.runtime.getURL("popup.html");
    previewFrame.addEventListener("load", () => {
      applyPaletteToPreview(readPaletteFromInputs());
    });
  }

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
    await themeStorage.setValue("custom");
    syncInputs(DARK_BASELINE);
    applyPaletteToPreview(DARK_BASELINE);
  });
}

initialize();
