import AccountService from "./accountService";

const NOTIFICATION_PERMISSION = {
  permissions: ["notifications"],
} as const;

type PermissionMethod = (
  permissions: typeof NOTIFICATION_PERMISSION,
) => Promise<boolean>;

async function hasPermission(): Promise<boolean> {
  try {
    const contains = browser.permissions.contains as unknown as PermissionMethod;
    return await contains(NOTIFICATION_PERMISSION);
  } catch (error) {
    console.debug("Failed to check notification permission:", error);
    return false;
  }
}

async function requestPermission(): Promise<boolean> {
  try {
    const request = browser.permissions.request as unknown as PermissionMethod;
    return await request(NOTIFICATION_PERMISSION);
  } catch (error) {
    console.debug("Failed to request notification permission:", error);
    return false;
  }
}

async function isEnabled(): Promise<boolean> {
  try {
    const settings = await AccountService.getSettings();
    return Boolean(settings.enableNotifications);
  } catch (error) {
    console.debug("Failed to read notification setting:", error);
    return false;
  }
}

async function canNotify(): Promise<boolean> {
  const [enabled, allowed] = await Promise.all([isEnabled(), hasPermission()]);
  return enabled && allowed;
}

async function create(
  id: string,
  title: string,
  message: string,
): Promise<boolean> {
  const allowed = await canNotify();
  if (!allowed) return false;

  try {
    await browser.notifications.create(id, {
      type: "basic",
      iconUrl: browser.runtime.getURL("/icon/128.png"),
      title,
      message,
    });
    return true;
  } catch (error) {
    console.debug("Failed to create notification:", error);
    return false;
  }
}

const NotificationService = {
  hasPermission,
  requestPermission,
  isEnabled,
  canNotify,
  create,
};

export default NotificationService;
