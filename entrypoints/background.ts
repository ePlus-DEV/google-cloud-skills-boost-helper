import { UI_COLORS } from "../utils/config";
import { notificationService } from "../services/notificationService";

export default defineBackground(() => {
  // Setup notification listeners
  notificationService.setupListeners();

  // Set uninstall URL to open Google Form when extension is uninstalled
  try {
    if (browser.runtime.setUninstallURL) {
      const manifest = browser.runtime.getManifest();
      const version = manifest?.version || "unknown";

      // Google Forms pre-fill format: entry.ENTRY_ID=value
      // To get entry ID:
      // 1. Open your Google Form in preview mode
      // 2. Open Developer Tools (F12)
      // 3. Inspect the version field and find name="entry.XXXXXXXX"
      // 4. Replace ENTRY_ID below with that number

      const FORM_ID =
        "1FAIpQLSc_IYKM_q4_WW0S-t-sQgsHdeRwLYbDMxD-BrR68tkdjx8aqg"; // Replace with your form ID
      const VERSION_ENTRY_ID = "1223799012"; // Replace with actual entry ID for version field

      // Full Google Form URL with pre-filled version
      const UNINSTALL_SURVEY_URL = `https://docs.google.com/forms/d/e/${FORM_ID}/viewform?entry.${VERSION_ENTRY_ID}=v${encodeURIComponent(
        version
      )}`;

      browser.runtime.setUninstallURL(UNINSTALL_SURVEY_URL);
      console.debug("Uninstall survey URL set with version:", version);
    }
  } catch (e) {
    console.debug("Failed to set uninstall URL:", e);
  }

  // Lightweight typed accessors for extension action APIs (avoid `as any` cast)
  type BadgeAction = {
    setBadgeText: (details: { text: string }) => void;
    setBadgeBackgroundColor?: (details: { color: string }) => void;
  };

  function getBrowserAction(): BadgeAction | null {
    const globalObj = globalThis as unknown as Record<string, unknown>;
    try {
      const maybeBrowser = globalObj.browser;
      if (maybeBrowser && typeof maybeBrowser === "object") {
        const mb = maybeBrowser as Record<string, unknown>;
        if ("action" in mb && typeof mb.action === "object") {
          return mb.action as unknown as BadgeAction;
        }
      }
    } catch {
      // ignore
    }
    return null;
  }

  function getChromeAction(): BadgeAction | null {
    const globalObj = globalThis as unknown as Record<string, unknown>;
    try {
      const maybeChrome = globalObj.chrome;
      if (maybeChrome && typeof maybeChrome === "object") {
        const mc = maybeChrome as Record<string, unknown>;
        if ("action" in mc && typeof mc.action === "object") {
          return mc.action as unknown as BadgeAction;
        }
      }
    } catch {
      // ignore
    }
    return null;
  }

  // Helper to set badge text/color in a robust way
  function setBadge(totalPoints: number) {
    const num = Math.floor(Number(totalPoints) || 0);
    let text: string;
    if (num <= 999) text = String(num);
    else if (num <= 9999) text = `${Math.floor(num / 1000)}k`;
    else text = "999+";
    // use shared badge color from config
    const color = UI_COLORS?.BADGE || "#155dfc";

    try {
      const browserAction = getBrowserAction();
      if (browserAction) {
        try {
          browserAction.setBadgeText({ text });
          if (browserAction.setBadgeBackgroundColor)
            browserAction.setBadgeBackgroundColor({ color });
          return;
        } catch (e) {
          console.debug("browser.action.setBadgeText failed:", e);
        }
      }

      const chromeAction = getChromeAction();
      if (chromeAction) {
        try {
          chromeAction.setBadgeText({ text });
          if (chromeAction.setBadgeBackgroundColor)
            chromeAction.setBadgeBackgroundColor({ color });
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

  // On install/update, open options or changelog and update badge
  browser.runtime.onInstalled.addListener(
    async (details: { reason: string; previousVersion?: string }) => {
      const { reason, previousVersion } = details;
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

      if (reason === "update") {
        try {
          const manifest = browser.runtime.getManifest();
          const currentVersion = manifest?.version || "";
          if (previousVersion && previousVersion !== currentVersion) {
            // Hiển thị notification khi extension được update
            await notificationService.show(
              {
                title: "Extension Updated!",
                message: `Google Cloud Skills Boost Helper has been updated to version ${currentVersion}`,
                requireInteraction: false,
              },
              () => {
                // Khi click vào notification, mở changelog
                const path = `/changelog.html?version=${encodeURIComponent(
                  currentVersion
                )}&from=${encodeURIComponent(previousVersion)}`;
                const url = browser.runtime.getURL(path as any);
                browser.tabs.create({ url, active: true });
              }
            );

            // build the path as a string and assert `any` to avoid narrow typing on getURL
            const path = `/changelog.html?version=${encodeURIComponent(
              currentVersion
            )}&from=${encodeURIComponent(previousVersion)}`;
            const url = browser.runtime.getURL(path as any);
            await browser.tabs.create({ url, active: true });
          } else {
            // fallback to options page
            await browser.tabs.create({
              url: browser.runtime.getURL("/options.html"),
              active: true,
            });
          }
        } catch (e) {
          console.debug("Failed to open changelog/options tab on update:", e);
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
    }
  );

  // On startup, update the badge as well
  browser.runtime.onStartup.addListener(async () => {
    // No runtime remote config for profile hosts: accepted hosts are read
    // from PROFILE_CONFIG via profileConfigService and both cloudskillsboost
    // and skills.google are accepted by default.
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
  async function handleSetBadge(message: Record<string, any>) {
    const text = message.text || "0";
    const color = message.color || UI_COLORS?.BADGE || "#155dfc";

    try {
      const browserAction = getBrowserAction();
      if (browserAction) {
        browserAction.setBadgeText({ text });
        if (browserAction.setBadgeBackgroundColor)
          browserAction.setBadgeBackgroundColor({ color });
        return;
      }
    } catch (err) {
      console.debug("browser.action set via message failed:", err);
    }

    try {
      const chromeAction = getChromeAction();
      if (chromeAction) {
        chromeAction.setBadgeText({ text });
        if (chromeAction.setBadgeBackgroundColor)
          chromeAction.setBadgeBackgroundColor({ color });
      }
    } catch (err) {
      console.debug("chrome.action set via message failed:", err);
    }
  }

  async function handleClearBadge() {
    try {
      const browserAction = getBrowserAction();
      if (browserAction) {
        browserAction.setBadgeText({ text: "" });
        return;
      }
    } catch (err) {
      console.debug("browser.action clear failed:", err);
    }

    try {
      const chromeAction = getChromeAction();
      if (chromeAction) {
        chromeAction.setBadgeText({ text: "" });
      }
    } catch (err) {
      console.debug("chrome.action clear failed:", err);
    }
  }

  async function handleRefreshBadge() {
    try {
      const StorageService = (await import("../services/storageService"))
        .default;
      const { calculateFacilitatorBonus } = await import(
        "../services/facilitatorService"
      );
      const enabled = await StorageService.isBadgeDisplayEnabled();
      if (!enabled) {
        // clear
        const browserAction = getBrowserAction();
        if (browserAction) {
          browserAction.setBadgeText({ text: "" });
          return;
        }
        const chromeAction = getChromeAction();
        if (chromeAction) {
          chromeAction.setBadgeText({ text: "" });
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

  // Listen for messages (from popup/options) requesting badge updates
  browser.runtime.onMessage.addListener(async (message) => {
    try {
      if (!message?.type) return;

      switch (message.type) {
        case "setBadge":
          await handleSetBadge(message);
          break;

        case "clearBadge":
          await handleClearBadge();
          break;
        case "refreshBadge":
          await handleRefreshBadge();
          break;
        default:
          return;
      }
    } catch (e) {
      console.debug("Error handling runtime message in background:", e);
    }
  });

  // Dev/test: respond to explicit test message to open changelog
  browser.runtime.onMessage.addListener(async (msg: Record<string, any>) => {
    try {
      if (msg?._openChangelogTest) {
        const from = msg.from || "";
        const version = msg.version || "";
        const path = `/changelog.html?version=${encodeURIComponent(
          version
        )}&from=${encodeURIComponent(from)}`;
        const url = browser.runtime.getURL(path as any);
        try {
          await browser.tabs.create({ url, active: true });
        } catch (e) {
          console.debug("Failed to open changelog test tab:", e);
        }
      }

      // Test notifications
      if (msg?._testNotifications) {
        console.log("Testing notifications...");

        // Test 1: Simple notification
        await notificationService.showSimple(
          "🧪 Test Notification",
          "This is a simple test notification"
        );

        // Test 2: Notification with click handler
        setTimeout(async () => {
          await notificationService.show(
            {
              title: "🧪 Test with Click",
              message: "Click this notification to open options page",
              requireInteraction: false,
            },
            () => {
              browser.tabs.create({
                url: browser.runtime.getURL("/options.html"),
              });
            }
          );
        }, 2000);

        // Test 3: Notification with action buttons
        setTimeout(async () => {
          await notificationService.showWithActions(
            "🧪 Test with Buttons",
            "Choose an option:",
            [{ title: "Open Popup" }, { title: "Dismiss" }],
            (buttonIndex) => {
              if (buttonIndex === 0) {
                browser.tabs.create({
                  url: browser.runtime.getURL("/popup.html"),
                });
              }
              console.log(`Button ${buttonIndex} clicked`);
            }
          );
        }, 4000);

        // Test 4: Important notification
        setTimeout(async () => {
          await notificationService.showImportant(
            "🧪 Important Test",
            "This is an important notification (won't auto-close)",
            () => {
              console.log("Important notification clicked!");
            }
          );
        }, 6000);

        console.log("Notification tests queued!");
      }
    } catch (e) {
      console.debug("Error in test message handler:", e);
    }
  });
});
