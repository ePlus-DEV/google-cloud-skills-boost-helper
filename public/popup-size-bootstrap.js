(() => {
  const MIRROR_KEY = "eplus:popupCompactMode";
  const STORAGE_KEYS = ["compactMode", "local:compactMode"];

  const applyCompactState = (compact) => {
    document.documentElement.dataset.popupCompact = compact ? "true" : "false";
  };

  const persistMirror = (compact) => {
    try {
      localStorage.setItem(MIRROR_KEY, compact ? "1" : "0");
    } catch {
      // localStorage can be unavailable in hardened browser contexts.
    }
  };

  let hasMirror = false;
  try {
    const mirrored = localStorage.getItem(MIRROR_KEY);
    if (mirrored === "1" || mirrored === "0") {
      hasMirror = true;
      applyCompactState(mirrored === "1");
    }
  } catch {
    // Continue with extension storage as the fallback source.
  }

  const extensionStorage = globalThis.browser?.storage ?? globalThis.chrome?.storage;
  const localArea = extensionStorage?.local;

  if (localArea?.get) {
    try {
      const result = localArea.get(STORAGE_KEYS, (values) => {
        const compact = values?.compactMode ?? values?.["local:compactMode"];
        if (typeof compact !== "boolean") return;

        persistMirror(compact);
        if (!hasMirror) applyCompactState(compact);
      });

      if (result && typeof result.then === "function") {
        result
          .then((values) => {
            const compact = values?.compactMode ?? values?.["local:compactMode"];
            if (typeof compact !== "boolean") return;

            persistMirror(compact);
            if (!hasMirror) applyCompactState(compact);
          })
          .catch(() => undefined);
      }
    } catch {
      // The regular popup initialization still restores the canonical state.
    }
  }

  extensionStorage?.onChanged?.addListener?.((changes, areaName) => {
    if (areaName !== "local") return;

    const change = changes.compactMode ?? changes["local:compactMode"];
    if (typeof change?.newValue !== "boolean") return;

    persistMirror(change.newValue);
    applyCompactState(change.newValue);
  });
})();
