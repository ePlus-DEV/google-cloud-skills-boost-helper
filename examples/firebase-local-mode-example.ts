/**
 * Example usage of Firebase Service in Local Development Mode
 * 
 * Khi chạy trên localhost, service sẽ tự động:
 * - Không kết nối Firebase
 * - Không đọc environment variables
 * - Sử dụng giá trị local hardcoded
 */

import firebaseService from './services/firebaseService';

// ============================================
// 1. INITIALIZATION
// ============================================

console.log('=== Initializing Firebase Service ===');
await firebaseService.initialize();

// Trong local environment, bạn sẽ thấy:
// 🔧 FirebaseService: Running in LOCAL environment, using local config store

// ============================================
// 2. GET DEFAULT VALUES
// ============================================

console.log('\n=== Getting Config Values ===');

const deadline = await firebaseService.getCountdownDeadline();
console.log('Countdown Deadline:', deadline);
// Output (local): 2026-12-31T23:59:59+07:00

const timezone = await firebaseService.getCountdownTimezone();
console.log('Countdown Timezone:', timezone);
// Output (local): +07:00

const enabled = await firebaseService.isCountdownEnabled();
console.log('Countdown Enabled:', enabled);
// Output (local): true

// ============================================
// 3. VIEW ALL PARAMETERS
// ============================================

console.log('\n=== All Parameters ===');
const allParams = firebaseService.getAllParams();
console.log(JSON.stringify(allParams, null, 2));
/* Output (local):
{
  "countdown_deadline": {
    "value": "2026-12-31T23:59:59+07:00",
    "source": "local"
  },
  "countdown_timezone": {
    "value": "+07:00",
    "source": "local"
  },
  "countdown_enabled": {
    "value": true,
    "source": "local"
  },
  ...
}
*/

// ============================================
// 4. UPDATE LOCAL CONFIG VALUES
// ============================================

console.log('\n=== Updating Local Config ===');

// Thay đổi countdown deadline
firebaseService.setLocalConfigValue(
  'countdown_deadline',
  '2025-06-30T23:59:59+07:00'
);

// Tắt countdown
firebaseService.setLocalConfigValue('countdown_enabled', false);

// Kiểm tra giá trị mới
const newDeadline = await firebaseService.getCountdownDeadline();
console.log('New Deadline:', newDeadline);
// Output: 2025-06-30T23:59:59+07:00

const newEnabled = await firebaseService.isCountdownEnabled();
console.log('New Enabled:', newEnabled);
// Output: false

// ============================================
// 5. VIEW LOCAL CONFIG STORE
// ============================================

console.log('\n=== Local Config Store ===');
const localStore = firebaseService.getLocalConfigStore();
console.log(JSON.stringify(localStore, null, 2));

// ============================================
// 6. RESET TO DEFAULTS
// ============================================

console.log('\n=== Resetting to Defaults ===');
firebaseService.resetLocalConfig();

// Kiểm tra lại
const resetDeadline = await firebaseService.getCountdownDeadline();
console.log('Reset Deadline:', resetDeadline);
// Output: Quay về 2026-12-31T23:59:59+07:00

// ============================================
// 7. TEST DIFFERENT SCENARIOS
// ============================================

console.log('\n=== Testing Different Scenarios ===');

// Scenario 1: Event đang diễn ra
firebaseService.setLocalConfigValue(
  'countdown_deadline',
  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 ngày sau
);
firebaseService.setLocalConfigValue('countdown_enabled', true);

// Scenario 2: Event đã kết thúc
firebaseService.setLocalConfigValue(
  'countdown_deadline',
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 ngày trước
);
firebaseService.setLocalConfigValue('countdown_enabled', false);

// Scenario 3: Event sắp bắt đầu
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(10, 0, 0, 0);
firebaseService.setLocalConfigValue(
  'countdown_deadline',
  tomorrow.toISOString()
);
firebaseService.setLocalConfigValue('countdown_enabled', true);

console.log('\nTest scenarios set up successfully!');

// ============================================
// 8. GENERIC PARAMETER GETTERS
// ============================================

console.log('\n=== Using Generic Getters ===');

// Get string parameter
const customParam = await firebaseService.getStringParam(
  'custom_param',
  'default_value'
);
console.log('Custom Param:', customParam);

// Get boolean parameter
const customBool = await firebaseService.getBooleanParam(
  'custom_bool',
  true
);
console.log('Custom Bool:', customBool);

// Set và get custom parameters
firebaseService.setLocalConfigValue('my_custom_message', 'Hello from local!');
const message = await firebaseService.getStringParam(
  'my_custom_message',
  'default message'
);
console.log('Custom Message:', message);

// ============================================
// NOTES
// ============================================

console.log('\n=== Important Notes ===');
console.log('1. Tất cả methods trên CHỈ hoạt động trong local environment');
console.log('2. Khi deploy production, service sẽ tự động dùng Firebase');
console.log('3. Không cần environment variables khi dev local');
console.log('4. Giá trị mặc định sử dụng Vietnam timezone (+07:00)');
console.log('5. Có thể test nhiều scenarios khác nhau bằng setLocalConfigValue()');
