(() => {
  try {
    const mirrored = localStorage.getItem("eplus:popupCompactMode");
    if (mirrored === "1" || mirrored === "0") {
      document.documentElement.dataset.popupCompact =
        mirrored === "1" ? "true" : "false";
    }
  } catch {
    // The regular popup initialization restores the canonical state.
  }
})();
