import { UI_COLORS } from "../utils/config";
import UpdateNotificationService from "../services/updateNotificationService";

export default defineBackground(() => {
  type BadgeAction = {
    setBadgeText: (details: { text: string }) => void | Promise<void>;
    setBadgeBackgroundColor?: (details: {
      color: string;
    }) => void | Promise<void>;
  };

  function getAction(): BadgeAction | null {
    const root = globalThis as unknown as {
      browser?: { action?: BadgeAction };
      chrome?: { action?: BadgeAction };
    };
    return root.browser?.action ?? root.chrome?.action ?? null;
  }

  async function clearBadge(): Promise<void> {
    try {
      await getAction()?.setBadgeText({ text: "" });
    } catch (error) {
      console.debug("Failed to clear extension badge:", error);
    }
  }

  async function refreshBadge(): Promise<void> {
    try {
      const StorageService = (await import("../services/storageService")).default;
      await StorageService.refreshBadgeForActiveAccount();
    } catch (error) {
      console.debug("Failed to refresh badge:", error);
    }
  }

  async function broadcast(message: Record<string, unknown>): Promise<void> {
    try {
      const tabs = await browser.tabs.query({});
      await Promise.all(
        tabs.map(async (tab) => {
          if (typeof tab.id !== "number") return;
          try {
            await browser.tabs.sendMessage(tab.id, message);
          } catch {
            // Tabs without the content script are expected to reject the message.
          }
        }),
      );
    } catch (error) {
      console.debug("Failed to broadcast runtime message:", error);
    }
  }

  try {
    if (browser.runtime.setUninstallURL) {
      const version = browser.runtime.getManifest()?.version || "unknown";
      const formId =
        "1FAIpQLSc_IYKM_q4_WW0S-t-sQgsHdeRwLYbDMxD-BrR68tkdjx8aqg";
      const versionEntryId = "1223799012";
      const uninstallUrl = `https://docs.google.com/forms/d/e/${formId}/viewform?entry.${versionEntryId}=v${encodeURIComponent(version)}`;
      browser.runtime.setUninstallURL(uninstallUrl);
    }
  } catch (error) {
    console.debug("Failed to set uninstall URL:", error);
  }

  browser.runtime.onInstalled.addListener(
    async (details: { reason: string; previousVersion?: string }) => {
      const { reason, previousVersion } = details;

      if (reason === "install") {
        try {
          await browser.tabs.create({
            url: browser.runtime.getURL("/options.html"),
            active: true,
          });
        } catch (error) {
          console.debug("Failed to open options tab on install:", error);
        }
      }

      if (reason === "update") {
        try {
          const currentVersion = browser.runtime.getManifest()?.version || "";
          const shouldOpenChangelog =
            await UpdateNotificationService.isEnabled();

          if (!shouldOpenChangelog) {
            console.debug(
              "Skipped changelog after update because update notifications are disabled.",
            );
          } else if (previousVersion && previousVersion === currentVersion) {
            console.debug(
              "Skipped changelog because the reported previous version matches the current version.",
              { previousVersion, currentVersion },
            );
          } else {
            const path = `/changelog.html?version=${encodeURIComponent(
              currentVersion,
            )}&from=${encodeURIComponent(previousVersion || "")}`;
            await browser.tabs.create({
              url: browser.runtime.getURL(path as any),
              active: true,
            });
            console.debug("Opened changelog after extension update.", {
              previousVersion: previousVersion || "unknown",
              currentVersion,
            });
          }
        } catch (error) {
          console.debug("Failed to handle extension update:", error);
        }
      }

      await refreshBadge();
    },
  );

  browser.runtime.onStartup.addListener(() => {
    void refreshBadge();
  });

  browser.runtime.onMessage.addListener(async (message) => {
    try {
      if (!message?.type) return;

      switch (message.type) {
        case "setBadge": {
          const action = getAction();
          if (!action) return;
          await action.setBadgeText({ text: message.text || "0" });
          await action.setBadgeBackgroundColor?.({
            color: message.color || UI_COLORS?.BADGE || "#155dfc",
          });
          break;
        }
        case "clearBadge":
          await clearBadge();
          break;
        case "refreshBadge":
          await refreshBadge();
          break;
        case "preferredSearchEngineChanged":
          await broadcast({
            type: "preferredSearchEngineChanged",
            engine: message.engine || "google",
          });
          break;
        case "searchFeatureChanged":
          await broadcast({
            type: "searchFeatureChanged",
            enabled: Boolean(message.enabled),
          });
          break;
        case "enableEplusSearchChanged":
          await broadcast({
            type: "enableEplusSearchChanged",
            enabled: Boolean(message.enabled),
          });
          break;
        default:
          return;
      }
    } catch (error) {
      console.debug("Error handling runtime message in background:", error);
    }
  });

  browser.runtime.onMessage.addListener(async (message) => {
    if (!message?._openChangelogTest) return;

    try {
      const path = `/changelog.html?version=${encodeURIComponent(
        message.version || "",
      )}&from=${encodeURIComponent(message.from || "")}`;
      await browser.tabs.create({
        url: browser.runtime.getURL(path as any),
        active: true,
      });
    } catch (error) {
      console.debug("Failed to open changelog test tab:", error);
    }
  });
});