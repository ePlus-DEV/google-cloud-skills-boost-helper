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

  section.innerHTML = `
    <div class="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-200">
      <div class="flex items-start gap-4">
        <div class="bg-blue-500 p-3 rounded-lg shadow-sm shrink-0">
          <i class="fa-solid fa-bell text-white text-lg" aria-hidden="true"></i>
        </div>

        <div class="min-w-0 flex-1">
          <div class="mb-5">
            <h3 class="text-lg font-bold text-gray-800 mb-1">
              ${getMessage("notificationsSectionTitle") || "Notifications"}
            </h3>
            <p class="text-gray-600 text-sm leading-relaxed">
              ${getMessage("notificationsSectionDescription") || "Control update notices and browser notifications."}
            </p>
          </div>

          <div class="divide-y divide-blue-100 rounded-lg border border-blue-100 bg-white/70">
            <div class="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex items-start gap-3 min-w-0">
                <div class="bg-blue-100 p-2.5 rounded-lg shrink-0">
                  <i class="fa-solid fa-rectangle-list text-blue-600" aria-hidden="true"></i>
                </div>
                <div class="min-w-0">
                  <h4 id="changelog-notification-heading" class="font-semibold text-gray-800">
                    ${getMessage("changelogWhatsNew")}
                  </h4>
                  <p class="mt-1 text-sm text-gray-600 leading-relaxed">
                    ${getMessage("changelogLatestUpdates")}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-3 self-end shrink-0 sm:self-auto">
                ${createToggle("changelog-notification-toggle", "changelog-notification-heading")}
                <span id="changelog-notification-status" aria-live="polite" class="min-w-16 text-sm font-medium text-gray-700">
                  ${getMessage("labelEnabled")}
                </span>
              </div>
            </div>

            <div class="flex flex-col gap-4 p-4 opacity-75 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex items-start gap-3 min-w-0">
                <div class="bg-gray-100 p-2.5 rounded-lg shrink-0">
                  <i class="fa-solid fa-bell text-gray-500" aria-hidden="true"></i>
                </div>
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <h4 id="browser-notification-heading" class="font-semibold text-gray-800">
                      ${getMessage("labelEnableNotifications")}
                    </h4>
                    <span class="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                      ${getMessage("statusNotStarted")}
                    </span>
                  </div>
                  <p class="mt-1 text-sm text-gray-600 leading-relaxed">
                    ${getMessage("notificationPermissionNote")}
                  </p>
                </div>
              </div>

              <div class="flex items-center self-end shrink-0 sm:self-auto">
                ${createToggle("browser-notification-toggle", "browser-notification-heading", true)}
              </div>
            </div>
          </div>
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
