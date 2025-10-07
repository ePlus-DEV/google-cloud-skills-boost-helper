export default defineBackground(() => {
  // Helper to set badge text/color in a robust way
  function setBadge(totalPoints: number) {
    const num = Math.floor(Number(totalPoints) || 0);
    let text = "0";
    if (num <= 999) text = String(num);
    else if (num <= 9999) text = `${Math.floor(num / 1000)}k`;
    else text = "999+";
    const color = "#155dfc";

    try {
      if (typeof browser !== "undefined" && (browser as any).action) {
        try {
          (browser as any).action.setBadgeText({ text });
          if ((browser as any).action.setBadgeBackgroundColor)
            (browser as any).action.setBadgeBackgroundColor({ color });
          return;
        } catch (e) {
          console.debug("browser.action.setBadgeText failed:", e);
        }
      }

      if (typeof chrome !== "undefined" && (chrome as any).action) {
        try {
          (chrome as any).action.setBadgeText({ text });
          if ((chrome as any).action.setBadgeBackgroundColor)
            (chrome as any).action.setBadgeBackgroundColor({ color });
          return;
        } catch (e) {
          console.debug("chrome.action.setBadgeText failed:", e);
        }
      }

      console.debug(
        "No action API available to set badge. Desired text:",
        text
      );
    } catch (e) {
      console.debug("Unexpected error setting badge:", e);
    }
  }

  // On install, open options and update badge
  browser.runtime.onInstalled.addListener(async ({ reason }) => {
    if (reason === "install") {
      try {
        await browser.tabs.create({
          url: browser.runtime.getURL("/options.html"),
          active: true,
        });
      } catch (e) {
        console.debug("Failed to open options tab on install:", e);
      }
    }

    // Try to set badge from stored data on install
    try {
      // dynamic import to avoid bundling issues
      const StorageService = (await import("../services/storageService"))
        .default;
      const { calculateFacilitatorBonus } = await import(
        "../services/facilitatorService"
      );
      const arcadeData = await StorageService.getArcadeData();
      if (arcadeData) {
        const base =
          arcadeData.arcadePoints?.totalPoints ||
          arcadeData.totalArcadePoints ||
          0;
        const bonus = arcadeData.faciCounts
          ? calculateFacilitatorBonus(arcadeData.faciCounts)
          : 0;
        setBadge(base + bonus);
      }
    } catch (e) {
      console.debug("Failed to set badge on install/start:", e);
    }
  });

  // On startup, update the badge as well
  browser.runtime.onStartup.addListener(async () => {
    try {
      const StorageService = (await import("../services/storageService"))
        .default;
      const { calculateFacilitatorBonus } = await import(
        "../services/facilitatorService"
      );
      const arcadeData = await StorageService.getArcadeData();
      if (arcadeData) {
        const base =
          arcadeData.arcadePoints?.totalPoints ||
          arcadeData.totalArcadePoints ||
          0;
        const bonus = arcadeData.faciCounts
          ? calculateFacilitatorBonus(arcadeData.faciCounts)
          : 0;
        setBadge(base + bonus);
      }
    } catch (e) {
      console.debug("Failed to set badge on startup:", e);
    }
  });

  // Listen for messages (from popup/options) requesting badge updates
  browser.runtime.onMessage.addListener(async (message) => {
    try {
      if (!message || !message.type) return;

      if (message.type === "setBadge") {
        const text = message.text || "0";
        const color = message.color || "#155dfc";
        try {
          if ((browser as any).action) {
            (browser as any).action.setBadgeText({ text });
            if ((browser as any).action.setBadgeBackgroundColor)
              (browser as any).action.setBadgeBackgroundColor({ color });
            return;
          }
        } catch (err) {
          console.debug("browser.action set via message failed:", err);
        }

        try {
          if ((chrome as any).action) {
            (chrome as any).action.setBadgeText({ text });
            if ((chrome as any).action.setBadgeBackgroundColor)
              (chrome as any).action.setBadgeBackgroundColor({ color });
          }
        } catch (err) {
          console.debug("chrome.action set via message failed:", err);
        }
      }

      if (message.type === "clearBadge") {
        try {
          if ((browser as any).action) {
            (browser as any).action.setBadgeText({ text: "" });
            return;
          }
        } catch (err) {
          console.debug("browser.action clear failed:", err);
        }

        try {
          if ((chrome as any).action) {
            (chrome as any).action.setBadgeText({ text: "" });
          }
        } catch (err) {
          console.debug("chrome.action clear failed:", err);
        }
      }

      if (message.type === "refreshBadge") {
        try {
          const StorageService = (await import("../services/storageService"))
            .default;
          const { calculateFacilitatorBonus } = await import(
            "../services/facilitatorService"
          );
          const enabled = await StorageService.isBadgeDisplayEnabled();
          if (!enabled) {
            // clear
            if ((browser as any).action) {
              (browser as any).action.setBadgeText({ text: "" });
              return;
            }
            if ((chrome as any).action) {
              (chrome as any).action.setBadgeText({ text: "" });
              return;
            }
            return;
          }

          const arcadeData = await StorageService.getArcadeData();
          if (!arcadeData) return;
          const base =
            arcadeData.arcadePoints?.totalPoints ||
            arcadeData.totalArcadePoints ||
            0;
          const bonus = arcadeData.faciCounts
            ? calculateFacilitatorBonus(arcadeData.faciCounts)
            : 0;
          setBadge(base + bonus);
        } catch (err) {
          console.debug("Failed to refresh badge:", err);
        }
      }
    } catch (e) {
      console.debug("Error handling runtime message in background:", e);
    }
  });
});
