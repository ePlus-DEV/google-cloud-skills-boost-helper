const STORAGE_KEY = "local:showChangelogOnUpdate" as const;

async function isEnabled(): Promise<boolean> {
  try {
    const value = await storage.getItem<boolean>(STORAGE_KEY);
    return value !== false;
  } catch (error) {
    console.debug("Failed to read changelog notification setting:", error);
    return true;
  }
}

async function setEnabled(enabled: boolean): Promise<void> {
  await storage.setItem(STORAGE_KEY, Boolean(enabled));
}

const UpdateNotificationService = {
  isEnabled,
  setEnabled,
};

export default UpdateNotificationService;
