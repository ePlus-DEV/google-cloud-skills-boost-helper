const MIRROR_KEY = "eplus:popupCompactMode";
const STORAGE_KEY = "local:compactMode" as const;

const compactModeStorage = storage.defineItem<boolean>(STORAGE_KEY, {
  defaultValue: false,
});

function applyDocumentState(compact: boolean): void {
  document.documentElement.dataset.popupCompact = compact ? "true" : "false";
}

function persistMirror(compact: boolean): void {
  try {
    localStorage.setItem(MIRROR_KEY, compact ? "1" : "0");
  } catch {
    // localStorage may be unavailable in hardened browser contexts.
  }
}

async function getValue(): Promise<boolean> {
  return compactModeStorage.getValue();
}

async function setValue(compact: boolean): Promise<void> {
  await compactModeStorage.setValue(compact);
  persistMirror(compact);
  applyDocumentState(compact);
}

async function initializeMirrorSync(): Promise<boolean> {
  const compact = await getValue();
  persistMirror(compact);
  applyDocumentState(compact);

  compactModeStorage.watch((nextValue) => {
    persistMirror(nextValue);
    applyDocumentState(nextValue);
  });

  return compact;
}

const CompactModePreferenceService = {
  getValue,
  setValue,
  initializeMirrorSync,
};

export default CompactModePreferenceService;
