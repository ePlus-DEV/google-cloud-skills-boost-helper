import AccountService from "./accountService";

const NOTIFICATION_PERMISSION = {
  permissions: ["notifications"],
} as const;

type PermissionMethod = (
  permissions: typeof NOTIFICATION_PERMISSION,
) => Promise<boolean>;

export interface NotificationState {
  enabled: boolean;
  allowed: boolean;
  active: boolean;
}

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

async function setEnabled(enabled: boolean): Promise<boolean> {
  if (!enabled) {
    await AccountService.updateSettings({ enableNotifications: false });
    return false;
  }

  const allowed = (await hasPermission()) || (await requestPermission());
  await AccountService.updateSettings({ enableNotifications: allowed });
  return allowed;
}

async function reconcileState(): Promise<NotificationState> {
  const [enabled, allowed] = await Promise.all([isEnabled(), hasPermission()]);

  if (enabled && !allowed) {
    await AccountService.updateSettings({ enableNotifications: false });
    return { enabled: false, allowed: false, active: false };
  }

  return {
    enabled,
    allowed,
    active: enabled && allowed,
  };
}

async function canNotify(): Promise<boolean> {
  const state = await reconcileState();
  return state.active;
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
  setEnabled,
  reconcileState,
  canNotify,
  create,
};

export default NotificationService;
