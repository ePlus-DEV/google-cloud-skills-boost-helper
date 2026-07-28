import UpdateNotificationService from "../../services/updateNotificationService";

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
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.className = `fixed top-4 right-4 ${
    type === "success" ? "bg-green-500" : "bg-red-500"
  } text-white px-4 py-2 rounded-lg shadow-lg z-50`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function createToggle(
  id: string,
  headingId: string,
  disabled = false,
): string {
  return `
    <label class="relative inline-flex items-center ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}">
      <input type="checkbox" id="${id}" aria-labelledby="${headingId}" class="sr-only peer" ${disabled ? "disabled" : ""} />
      <div class="w-14 h-8 bg-gray-200 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 transition-colors duration-200 peer-checked:bg-blue-600"></div>
      <div class="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-200 peer-checked:translate-x-6"></div>
    </label>
  `;
}

function createNotificationSection(): HTMLElement {
  const section = document.createElement("section");
  section.id = "notification-preferences-section";
  section.className = "space-y-4";

  section.innerHTML = `
    <div class="flex items-center gap-3 px-1">
      <div class="bg-blue-100 p-2.5 rounded-lg">
        <i class="fa-solid fa-bell text-blue-600" aria-hidden="true"></i>
      </div>
      <h3 class="text-xl font-bold text-gray-900">${getMessage("labelEnableNotifications")}</h3>
    </div>

    <div class="bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-200">
      <div class="flex items-center justify-between gap-6">
        <div class="flex items-start space-x-4 min-w-0">
          <div class="bg-blue-100 p-3 rounded-lg shadow-sm shrink-0">
            <i class="fa-solid fa-rectangle-list text-blue-600 text-lg" aria-hidden="true"></i>
          </div>
          <div>
            <h4 id="changelog-notification-heading" class="text-lg font-bold text-gray-800 mb-2">
              ${getMessage("changelogWhatsNew")}
            </h4>
            <p class="text-gray-600 text-sm leading-relaxed">
              ${getMessage("changelogLatestUpdates")}
            </p>
          </div>
        </div>
        <div class="flex items-center space-x-3 shrink-0">
          ${createToggle("changelog-notification-toggle", "changelog-notification-heading")}
          <span id="changelog-notification-status" aria-live="polite" class="text-sm font-medium text-gray-700">
            ${getMessage("labelEnabled")}
          </span>
        </div>
      </div>
    </div>

    <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm opacity-80">
      <div class="flex items-center justify-between gap-6">
        <div class="flex items-start space-x-4 min-w-0">
          <div class="bg-gray-100 p-3 rounded-lg shadow-sm shrink-0">
            <i class="fa-solid fa-bell text-gray-500 text-lg" aria-hidden="true"></i>
          </div>
          <div>
            <div class="flex items-center gap-2 mb-2">
              <h4 id="browser-notification-heading" class="text-lg font-bold text-gray-800">
                ${getMessage("labelEnableNotifications")}
              </h4>
              <span class="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                ${getMessage("statusNotStarted")}
              </span>
            </div>
            <p class="text-gray-600 text-sm leading-relaxed">
              ${getMessage("notificationPermissionNote")}
            </p>
          </div>
        </div>
        <div class="flex items-center space-x-3 shrink-0">
          ${createToggle("browser-notification-toggle", "browser-notification-heading", true)}
        </div>
      </div>
    </div>
  `;

  return section;
}

function renderUpdateNotificationState(enabled: boolean): void {
  const toggle = document.getElementById(
    "changelog-notification-toggle",
  ) as HTMLInputElement | null;
  const status = document.getElementById("changelog-notification-status");

  if (toggle) toggle.checked = enabled;
  if (status) {
    status.textContent = enabled
      ? getMessage("labelEnabled")
      : getMessage("labelDisabled");
  }
}

async function syncUpdateNotificationToggle(): Promise<void> {
  renderUpdateNotificationState(await UpdateNotificationService.isEnabled());
}

async function handleUpdateNotificationToggle(enabled: boolean): Promise<void> {
  try {
    await UpdateNotificationService.setEnabled(enabled);
    renderUpdateNotificationState(enabled);
    showToast(
      enabled
        ? getMessage("messageNotificationsEnabled")
        : getMessage("messageNotificationsDisabled"),
    );
  } catch (error) {
    console.debug("Failed to update changelog notification setting:", error);
    await syncUpdateNotificationToggle();
    showToast(getMessage("errorSaveSetting"), "error");
  }
}

export function initNotificationSettings() {
  if (document.getElementById("notification-preferences-section")) return;

  const sections = document.getElementById("options-sections");
  const badgeToggle = document.getElementById("badge-display-toggle");
  const badgeCard = badgeToggle?.closest(".rounded-lg");
  const section = createNotificationSection();

  if (badgeCard?.parentElement) {
    badgeCard.insertAdjacentElement("afterend", section);
  } else {
    sections?.appendChild(section);
  }

  const toggle = document.getElementById(
    "changelog-notification-toggle",
  ) as HTMLInputElement | null;
  toggle?.addEventListener("change", () => {
    void handleUpdateNotificationToggle(Boolean(toggle.checked));
  });

  void syncUpdateNotificationToggle();
}
