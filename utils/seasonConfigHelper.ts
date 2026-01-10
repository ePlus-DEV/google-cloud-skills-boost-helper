import firebaseService from "../services/firebaseService";

/**
 * Helper script để setup config cho mùa mới
 */

/**
 * Config cho mùa mới KHÔNG có Facilitator
 *
 * @param arcadeDeadline - Deadline cho mùa Arcade mới (ISO 8601 format with timezone)
 */
export async function setupNewSeasonConfig(
  arcadeDeadline: string
): Promise<void> {
  await firebaseService.initialize();

  firebaseService.setLocalConfigValue(
    "countdown_deadline_facilitator",
    arcadeDeadline
  );

  firebaseService.setLocalConfigValue("countdown_enabled_facilitator", "true");
  firebaseService.setLocalConfigValue("countdown_enabled_arcade", "false");
  firebaseService.setLocalConfigValue(
    "countdown_deadline_arcade",
    arcadeDeadline
  );
}

/**
 * Chỉ tắt Facilitator program
 */
export async function disableFacilitator(): Promise<void> {
  await firebaseService.initialize();
  firebaseService.setLocalConfigValue("countdown_enabled_arcade", "false");
}

/**
 * Bật lại Facilitator program
 *
 * @param facilitatorDeadline - Deadline cho chương trình Facilitator
 */
export async function enableFacilitator(
  facilitatorDeadline: string
): Promise<void> {
  await firebaseService.initialize();
  firebaseService.setLocalConfigValue("countdown_enabled_arcade", "true");
  firebaseService.setLocalConfigValue(
    "countdown_deadline_arcade",
    facilitatorDeadline
  );
}

/**
 * Reset về default values
 */
export async function resetToDefaults(): Promise<void> {
  await firebaseService.initialize();
  firebaseService.resetLocalConfig();
}

export default {
  setupNewSeasonConfig,
  disableFacilitator,
  enableFacilitator,
  resetToDefaults,
};
