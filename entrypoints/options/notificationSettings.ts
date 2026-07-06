import AccountService from "../../services/accountService";
import NotificationService from "../../services/notificationService";

function getMessage(key: string, fallback: string): string {
  try {
    return browser.i18n.getMessage(key) || fallback;
  } catch {
    return fallback;
  }
}

function showToast(message: string, type: "success" | "error" = "success") {
  const toast = document.createElement("div");
  toast.className = `fixed top-4 right-4 ${
    type === "success" ? "bg-green-500" : "bg-red-500"
  } text-white px-4 py-2 rounded-lg shadow-lg z-50`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

async function isNotificationEnabled(): Promise<boolean> {
  try {
    const settings = await AccountService.getSettings();
    return Boolean(settings.enableNotifications);
  } catch {
    return false;
  }
}

async function saveNotificationEnabled(enabled: boolean): Promise<void> {
  await AccountService.updateSettings({ enableNotifications: Boolean(enabled) });
}

function createNotificationCard(): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className =
    "bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-200";

  wrapper.innerHTML = `
    <div class="flex items-center justify-between">
      <div class="flex items-start space-x-4">
        <div class="bg-blue-100 p-3 rounded-lg shadow-sm">
          <i class="fa-solid fa-bell text-blue-600 text-lg"></i>
        </div>
        <div>
          <h4 class="text-lg font-bold text-gray-800 mb-2" data-i18n="labelEnableNotifications">
            ${getMessage("labelEnableNotifications", "Enable push notifications")}
          </h4>
          <p class="text-gray-600 text-sm leading-relaxed" data-i18n="descriptionEnableNotifications">
            ${getMessage(
              "descriptionEnableNotifications",
              "Show browser notifications only when you enable this feature.",
            )}
          </p>
          <p class="text-xs text-gray-500 mt-2" data-i18n="notificationPermissionNote">
            ${getMessage(
              "notificationPermissionNote",
              "Permission will be requested only after you turn this on.",
            )}
          </p>
        </div>
      </div>

      <div class="flex items-center space-x-3">
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id="notification-toggle" class="sr-only peer" />
          <div class="w-14 h-8 bg-gray-200 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 transition-colors duration-200 peer-checked:bg-blue-600"></div>
          <div class="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-200 peer-checked:translate-x-6"></div>
        </label>
        <span id="notification-status" class="text-sm font-medium text-gray-700">
          ${getMessage("labelDisabled", "disabled")}
        </span>
      </div>
    </div>
  `;

  return wrapper;
}

async function syncNotificationToggle() {
  const toggle = document.getElementById(
    "notification-toggle",
  ) as HTMLInputElement | null;
  const status = document.getElementById("notification-status");
  if (!toggle) return;

  const [enabled, allowed] = await Promise.all([
    isNotificationEnabled(),
    NotificationService.hasPermission(),
  ]);

  const active = enabled && allowed;
  toggle.checked = active;
  if (status) {
    status.textContent = active
      ? getMessage("labelEnabled", "enabled")
      : getMessage("labelDisabled", "disabled");
  }

  if (enabled && !allowed) {
    await saveNotificationEnabled(false);
  }
}

async function handleNotificationToggle(enabled: boolean) {
  const toggle = document.getElementById(
    "notification-toggle",
  ) as HTMLInputElement | null;
  const status = document.getElementById("notification-status");

  try {
    if (enabled) {
      const granted = await NotificationService.requestPermission();
      if (!granted) {
        if (toggle) toggle.checked = false;
        if (status) status.textContent = getMessage("labelDisabled", "disabled");
        await saveNotificationEnabled(false);
        showToast(
          getMessage(
            "messageNotificationPermissionDenied",
            "Notification permission was denied. The feature remains disabled.",
          ),
          "error",
        );
        return;
      }
    }

    await saveNotificationEnabled(enabled);
    if (status) {
      status.textContent = enabled
        ? getMessage("labelEnabled", "enabled")
        : getMessage("labelDisabled", "disabled");
    }

    showToast(
      enabled
        ? getMessage("messageNotificationsEnabled", "Push notifications enabled")
        : getMessage("messageNotificationsDisabled", "Push notifications disabled"),
      "success",
    );
  } catch (error) {
    console.debug("Failed to update notification setting:", error);
    if (toggle) toggle.checked = false;
    if (status) status.textContent = getMessage("labelDisabled", "disabled");
    await saveNotificationEnabled(false);
    showToast(getMessage("errorSaveSetting", "Failed to save setting"), "error");
  }
}

export function initNotificationSettings() {
  if (document.getElementById("notification-toggle")) return;

  const sections = document.getElementById("options-sections");
  const badgeToggle = document.getElementById("badge-display-toggle");
  const badgeCard = badgeToggle?.closest(".rounded-lg");
  const card = createNotificationCard();

  if (badgeCard?.parentElement) {
    badgeCard.insertAdjacentElement("afterend", card);
  } else {
    sections?.appendChild(card);
  }

  const toggle = document.getElementById(
    "notification-toggle",
  ) as HTMLInputElement | null;
  toggle?.addEventListener("change", () => {
    handleNotificationToggle(Boolean(toggle.checked));
  });

  syncNotificationToggle();
}
