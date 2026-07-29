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
  let initialized = false;
  let pendingValue: boolean | undefined;

  compactModeStorage.watch((nextValue) => {
    if (!initialized) {
      pendingValue = nextValue;
      return;
    }

    persistMirror(nextValue);
    applyDocumentState(nextValue);
  });

  const initialValue = await getValue();
  const compact = pendingValue ?? initialValue;
  persistMirror(compact);
  applyDocumentState(compact);
  initialized = true;

  return compact;
}

const CompactModePreferenceService = {
  getValue,
  setValue,
  initializeMirrorSync,
};

export default CompactModePreferenceService;
