import firebaseService from "../services/firebaseService";

/**
 * Helper script để setup config cho mùa mới
 * 
 * CÁCH DÙNG:
 * 1. Import script này
 * 2. Gọi setupNewSeasonConfig() với thông tin mùa mới
 * 3. Hoặc gọi disableFacilitator() để tắt Facilitator
 */

/**
 * Config cho mùa mới KHÔNG có Facilitator
 * 
 * @param arcadeDeadline - Deadline cho mùa Arcade mới (ISO 8601 format)
 * @param timezone - Timezone string (default: +07:00 for Vietnam)
 * @example
 * setupNewSeasonConfig('2026-03-31T23:59:59+07:00', '+07:00')
 */
export async function setupNewSeasonConfig(
  arcadeDeadline: string,
  timezone: string = '+07:00'
): Promise<void> {

  try {
    // Initialize service
    await firebaseService.initialize();

    // Configure Arcade season
    firebaseService.setLocalConfigValue('countdown_deadline', arcadeDeadline);
    firebaseService.setLocalConfigValue('countdown_timezone', timezone);
    firebaseService.setLocalConfigValue('countdown_enabled', 'true');

    // Disable Facilitator program
    firebaseService.setLocalConfigValue('countdown_enabled_arcade', 'false');
    firebaseService.setLocalConfigValue(
      'countdown_deadline_arcade',
      arcadeDeadline // Sử dụng deadline giống Arcade
    );

  } catch (error) {
    console.error('❌ Failed to setup new season:', error);
    throw error;
  }
}

/**
 * Chỉ tắt Facilitator program (giữ nguyên Arcade config)
 */
export async function disableFacilitator(): Promise<void> {

  
  try {
    await firebaseService.initialize();
    
    firebaseService.setLocalConfigValue('countdown_enabled_arcade', 'false');
    

  } catch (error) {
    console.error('❌ Failed to disable facilitator:', error);
    throw error;
  }
}

/**
 * Bật lại Facilitator program khi có thông tin mới
 * 
 * @param facilitatorDeadline - Deadline cho chương trình Facilitator
 */
export async function enableFacilitator(
  facilitatorDeadline: string
): Promise<void> {

  try {
    await firebaseService.initialize();
    
    firebaseService.setLocalConfigValue('countdown_enabled_arcade', 'true');
    firebaseService.setLocalConfigValue('countdown_deadline_arcade', facilitatorDeadline);
  } catch (error) {
    console.error('❌ Failed to enable facilitator:', error);
    throw error;
  }
}

/**
 * Xem current config
 */
export async function viewCurrentConfig(): Promise<void> {
  await firebaseService.initialize();
  
  console.log('📊 Current Configuration:');
  console.log('========================\n');
  
  const params = firebaseService.getAllParams();
  
  console.log('🎮 ARCADE:');
  console.log('- Enabled:', params.countdown_enabled?.value);
  console.log('- Deadline:', params.countdown_deadline?.value);
  console.log('- Timezone:', params.countdown_timezone?.value);
  console.log('- Source:', params.countdown_enabled?.source);
  
  console.log('\n🎯 FACILITATOR:');
  console.log('- Enabled:', params.countdown_enabled_arcade?.value);
  console.log('- Deadline:', params.countdown_deadline_arcade?.value);
  console.log('- Source:', params.countdown_enabled_arcade?.source);
  
  console.log('\n📋 All Parameters:');
  console.log(JSON.stringify(params, null, 2));
}

/**
 * Reset về default values
 */
export async function resetToDefaults(): Promise<void> {

  
  try {
    await firebaseService.initialize();
    firebaseService.resetLocalConfig();
    
    await viewCurrentConfig();
  } catch (error) {
    console.error('❌ Failed to reset:', error);
    throw error;
  }
}

// ============================================
// PRESET CONFIGS FOR COMMON SCENARIOS
// ============================================

/**
 * Preset: Mùa Gen AI Q1 2026 (ví dụ)
 */
export async function presetGenAI_Q1_2026(): Promise<void> {
  await setupNewSeasonConfig(
    '2026-03-31T23:59:59+07:00',
    '+07:00'
  );
}

/**
 * Preset: Mùa Cloud Skills Q2 2026 (ví dụ)
 */
export async function presetCloudSkills_Q2_2026(): Promise<void> {
  await setupNewSeasonConfig(
    '2026-06-30T23:59:59+07:00',
    '+07:00'
  );

}

// ============================================
// BROWSER CONSOLE FRIENDLY EXPORTS
// ============================================

// Expose to window for easy console access
if (typeof window !== 'undefined') {
  (window as any).seasonConfig = {
    setup: setupNewSeasonConfig,
    disableFacilitator,
    enableFacilitator,
    viewConfig: viewCurrentConfig,
    reset: resetToDefaults,
    presets: {
      genAI_Q1_2026: presetGenAI_Q1_2026,
      cloudSkills_Q2_2026: presetCloudSkills_Q2_2026,
    }
  };
  
}

export default {
  setupNewSeasonConfig,
  disableFacilitator,
  enableFacilitator,
  viewCurrentConfig,
  resetToDefaults,
  presets: {
    genAI_Q1_2026: presetGenAI_Q1_2026,
    cloudSkills_Q2_2026: presetCloudSkills_Q2_2026,
  }
};
