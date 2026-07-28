const STORAGE_KEY = "local:showChangelogOnUpdate" as const;

async function isEnabled(): Promise<boolean> {
  try {
    const value = await storage.getItem<boolean>(STORAGE_KEY);
    // A missing preference keeps the existing enabled-by-default behavior.
    return value !== false;
  } catch (error) {
    console.debug("Failed to read changelog notification setting:", error);
    // Do not open a new active tab when the user's preference is unverifiable.
    return false;
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
