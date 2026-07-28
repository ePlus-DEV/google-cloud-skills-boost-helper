import NotificationService from "../../services/notificationService";

function getMessage(key: string): string {
  try {
    const lookupMessage = browser.i18n.getMessage as unknown as (
      messageName: string,
    ) => string;
    return lookupMessage(key) || key;
  } catch {
    return key;
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
          <h4 id="notification-heading" class="text-lg font-bold text-gray-800 mb-2" data-i18n="labelEnableNotifications">
            ${getMessage("labelEnableNotifications")}
          </h4>
          <p class="text-gray-600 text-sm leading-relaxed" data-i18n="descriptionEnableNotifications">
            ${getMessage("descriptionEnableNotifications")}
          </p>
          <p class="text-xs text-gray-500 mt-2" data-i18n="notificationPermissionNote">
            ${getMessage("notificationPermissionNote")}
          </p>
        </div>
      </div>

      <div class="flex items-center space-x-3">
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id="notification-toggle" aria-labelledby="notification-heading" class="sr-only peer" />
          <div class="w-14 h-8 bg-gray-200 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 transition-colors duration-200 peer-checked:bg-blue-600"></div>
          <div class="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-200 peer-checked:translate-x-6"></div>
        </label>
        <span id="notification-status" aria-live="polite" class="text-sm font-medium text-gray-700">
          ${getMessage("labelDisabled")}
        </span>
      </div>
    </div>
  `;

  return wrapper;
}

function renderNotificationState(active: boolean): void {
  const toggle = document.getElementById(
    "notification-toggle",
  ) as HTMLInputElement | null;
  const status = document.getElementById("notification-status");

  if (toggle) toggle.checked = active;
  if (status) {
    status.textContent = active
      ? getMessage("labelEnabled")
      : getMessage("labelDisabled");
  }
}

async function syncNotificationToggle() {
  const state = await NotificationService.reconcileState();
  renderNotificationState(state.active);
}

async function handleNotificationToggle(enabled: boolean) {
  try {
    const active = await NotificationService.setEnabled(enabled);
    renderNotificationState(active);

    if (enabled && !active) {
      showToast(getMessage("messageNotificationPermissionDenied"), "error");
      return;
    }

    if (active) {
      await NotificationService.create(
        "notifications-enabled",
        getMessage("labelEnableNotifications"),
        getMessage("messageNotificationsEnabled"),
      );
    }

    showToast(
      active
        ? getMessage("messageNotificationsEnabled")
        : getMessage("messageNotificationsDisabled"),
      "success",
    );
  } catch (error) {
    console.debug("Failed to update notification setting:", error);
    renderNotificationState(false);

    try {
      await NotificationService.setEnabled(false);
    } catch (fallbackError) {
      console.debug(
        "Failed to persist disabled notification setting:",
        fallbackError,
      );
    }

    showToast(getMessage("errorSaveSetting"), "error");
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
    handleNotificationToggle(Boolean(toggle.checked)).catch((error) => {
      console.debug("Failed to handle notification toggle:", error);
    });
  });

  syncNotificationToggle().catch((error) => {
    console.debug("Failed to sync notification toggle:", error);
  });
}
