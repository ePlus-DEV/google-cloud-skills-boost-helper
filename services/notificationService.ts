const NOTIFICATION_PERMISSION = {
  permissions: ["notifications"],
};

async function hasPermission(): Promise<boolean> {
  try {
    return await browser.permissions.contains(NOTIFICATION_PERMISSION);
  } catch (error) {
    console.debug("Failed to check notification permission:", error);
    return false;
  }
}

async function requestPermission(): Promise<boolean> {
  try {
    return await browser.permissions.request(NOTIFICATION_PERMISSION);
  } catch (error) {
    console.debug("Failed to request notification permission:", error);
    return false;
  }
}

async function create(
  id: string,
  title: string,
  message: string,
): Promise<void> {
  const allowed = await hasPermission();
  if (!allowed) return;

  await browser.notifications.create(id, {
    type: "basic",
    iconUrl: browser.runtime.getURL("/icon/128.png"),
    title,
    message,
  });
}

const NotificationService = {
  hasPermission,
  requestPermission,
  create,
};

export default NotificationService;
