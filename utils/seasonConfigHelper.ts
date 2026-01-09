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
  console.log('🎮 Setting up NEW SEASON (NO Facilitator)...');
  console.log('📅 Arcade Deadline:', arcadeDeadline);
  console.log('🌏 Timezone:', timezone);

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

    console.log('✅ New season config applied!');
    console.log('\n📊 Current configuration:');
    console.log(JSON.stringify(firebaseService.getAllParams(), null, 2));
    
    console.log('\n⚠️  Remember to:');
    console.log('1. Set facilitatorProgram = false for all accounts');
    console.log('2. Update Firebase Remote Config if deploying to production');
    console.log('3. Document the new season information');

  } catch (error) {
    console.error('❌ Failed to setup new season:', error);
    throw error;
  }
}

/**
 * Chỉ tắt Facilitator program (giữ nguyên Arcade config)
 */
export async function disableFacilitator(): Promise<void> {
  console.log('❌ Disabling Facilitator program...');
  
  try {
    await firebaseService.initialize();
    
    firebaseService.setLocalConfigValue('countdown_enabled_arcade', 'false');
    
    console.log('✅ Facilitator disabled');
    console.log('📊 countdown_enabled_arcade:', 
      await firebaseService.getBooleanParam('countdown_enabled_arcade', true)
    );
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
  console.log('✅ Enabling Facilitator program...');
  console.log('📅 Facilitator Deadline:', facilitatorDeadline);
  
  try {
    await firebaseService.initialize();
    
    firebaseService.setLocalConfigValue('countdown_enabled_arcade', 'true');
    firebaseService.setLocalConfigValue('countdown_deadline_arcade', facilitatorDeadline);
    
    console.log('✅ Facilitator enabled');
    console.log('\n📊 Current Facilitator config:');
    console.log('- Enabled:', await firebaseService.getBooleanParam('countdown_enabled_arcade', false));
    console.log('- Deadline:', await firebaseService.getStringParam('countdown_deadline_arcade', 'N/A'));
    
    console.log('\n⚠️  Remember to:');
    console.log('1. Update FACILITATOR_MILESTONE_REQUIREMENTS in facilitatorService.ts');
    console.log('2. Set facilitatorProgram = true for eligible accounts');
    console.log('3. Update Firebase Remote Config if deploying to production');
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
  console.log('🔄 Resetting to default values...');
  
  try {
    await firebaseService.initialize();
    firebaseService.resetLocalConfig();
    
    console.log('✅ Reset complete!');
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
  console.log('🎨 Applied preset: Gen AI Q1 2026');
}

/**
 * Preset: Mùa Cloud Skills Q2 2026 (ví dụ)
 */
export async function presetCloudSkills_Q2_2026(): Promise<void> {
  await setupNewSeasonConfig(
    '2026-06-30T23:59:59+07:00',
    '+07:00'
  );
  console.log('🎨 Applied preset: Cloud Skills Q2 2026');
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
  
  console.log('✨ Season config helpers loaded!');
  console.log('Usage in console:');
  console.log('- seasonConfig.viewConfig()');
  console.log('- seasonConfig.setup("2026-03-31T23:59:59+07:00")');
  console.log('- seasonConfig.disableFacilitator()');
  console.log('- seasonConfig.enableFacilitator("2026-06-30T23:59:59+07:00")');
  console.log('- seasonConfig.reset()');
  console.log('- seasonConfig.presets.genAI_Q1_2026()');
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
