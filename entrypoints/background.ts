import { UI_COLORS } from "../utils/config";
import UpdateNotificationService from "../services/updateNotificationService";
import { lookupArcadeAccessCode } from "../services/arcadeAccessCodeService";

export default defineBackground(() => {
  type BadgeAction = {
    setBadgeText: (details: { text: string }) => void | Promise<void>;
    setBadgeBackgroundColor?: (details: {
      color: string;
    }) => void | Promise<void>;
  };

  /**
   * Access the extension badge API across supported browser runtimes.
   *
   * @returns Browser action interface or null when unavailable.
   */
  function getAction(): BadgeAction | null {
    const root = globalThis as unknown as {
      browser?: { action?: BadgeAction };
      chrome?: { action?: BadgeAction };
    };
    return root.browser?.action ?? root.chrome?.action ?? null;
  }

  /** Clear the current extension badge without interrupting background tasks. */
  async function clearBadge(): Promise<void> {
    try {
      await getAction()?.setBadgeText({ text: "" });
    } catch (error) {
      console.debug("Failed to clear extension badge:", error);
    }
  }

  /** Refresh the badge using stored activity for the active account. */
  async function refreshBadge(): Promise<void> {
    try {
      const StorageService = (await import("../services/storageService"))
        .default;
      await StorageService.refreshBadgeForActiveAccount();
    } catch (error) {
      console.debug("Failed to refresh badge:", error);
    }
  }

  /**
   * Relay an extension event to tabs that can receive content-script messages.
   *
   * @param message - Serializable message to broadcast.
   */
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
      const formId = "1FAIpQLSc_IYKM_q4_WW0S-t-sQgsHdeRwLYbDMxD-BrR68tkdjx8aqg";
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
    refreshBadge().catch((error) => {
      console.debug("Failed to refresh extension badge on startup:", error);
    });
  });

  /**
   * Handle background commands that change extension state without a data reply.
   *
   * @param request - Message payload validated by the runtime message router.
   */
  async function handleBackgroundNotification(
    request: Record<string, unknown>,
  ): Promise<void> {
    try {
      switch (request.type) {
        case "setBadge": {
          const action = getAction();
          if (!action) return;
          await action.setBadgeText({
            text: typeof request.text === "string" && request.text
              ? request.text
              : "0",
          });
          await action.setBadgeBackgroundColor?.({
            color: typeof request.color === "string" && request.color
              ? request.color
              : UI_COLORS?.BADGE || "#155dfc",
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
            engine: typeof request.engine === "string" && request.engine
              ? request.engine
              : "google",
          });
          break;
        case "searchFeatureChanged":
          await broadcast({
            type: "searchFeatureChanged",
            enabled: Boolean(request.enabled),
          });
          break;
        case "enableEplusSearchChanged":
          await broadcast({
            type: "enableEplusSearchChanged",
            enabled: Boolean(request.enabled),
          });
          break;
        default:
          break;
      }
    } catch (error) {
      console.debug("Error handling runtime notification:", error);
    }
  }

  /**
   * Open the changelog tab requested by the extension's test interface.
   *
   * @param request - Runtime message containing optional version information.
   */
  async function openChangelogTestPage(
    request: Record<string, unknown>,
  ): Promise<void> {
    try {
      const version = typeof request.version === "string" ? request.version : "";
      const from = typeof request.from === "string" ? request.from : "";
      const path = `/changelog.html?version=${encodeURIComponent(version)}&from=${encodeURIComponent(from)}`;
      await browser.tabs.create({
        url: browser.runtime.getURL(path as any),
        active: true,
      });
    } catch (error) {
      console.debug("Failed to open changelog test tab:", error);
    }
  }

  /**
   * Route runtime messages while keeping request/reply and notification
   * return contracts separate; unknown messages are not claimed.
   *
   * @param message - Untrusted runtime message from another extension context.
   * @returns The reply Promise for supported commands, otherwise undefined.
   */
  function handleExtensionRuntimeMessage(
    message: unknown,
  ): Promise<unknown> | undefined {
    if (!message || typeof message !== "object" || Array.isArray(message)) {
      return undefined;
    }

    const request = message as Record<string, unknown>;
    if (request._openChangelogTest === true) {
      return openChangelogTestPage(request);
    }

    if (request.type === "arcadeAccessCodeLookup") {
      const gameId = request.gameId;
      if (typeof gameId !== "string" || !/^[0-9]{1,12}$/.test(gameId)) {
        return Promise.resolve(null);
      }
      return lookupArcadeAccessCode(gameId).catch((error) => {
        console.debug("Failed to resolve Arcade Access Code:", error);
        return null;
      });
    }

    if (typeof request.type === "string") {
      return handleBackgroundNotification(request);
    }
    return undefined;
  }

  browser.runtime.onMessage.addListener(handleExtensionRuntimeMessage);
});
