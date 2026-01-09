# Season Configuration Examples

## Quick Start

```typescript
import seasonConfig from './utils/seasonConfigHelper';

// Xem config hiện tại
await seasonConfig.viewConfig();

// Setup mùa mới KHÔNG có Facilitator
await seasonConfig.setup('2026-03-31T23:59:59+07:00', '+07:00');

// Hoặc dùng preset
await seasonConfig.presets.genAI_Q1_2026();
```

## Trong Browser Console

Nếu bạn đã load script, có thể dùng trực tiếp trong console:

```javascript
// Xem config
seasonConfig.viewConfig()

// Setup mùa mới
seasonConfig.setup('2026-03-31T23:59:59+07:00')

// Tắt Facilitator
seasonConfig.disableFacilitator()

// Bật lại Facilitator
seasonConfig.enableFacilitator('2026-06-30T23:59:59+07:00')

// Reset về default
seasonConfig.reset()

// Dùng preset
seasonConfig.presets.genAI_Q1_2026()
```

## Scenarios

### 1. Mùa Mới - KHÔNG có Facilitator

```typescript
// Tình huống: Google announce Gen AI Q1 2026, chưa có Facilitator
await seasonConfig.setup('2026-03-31T23:59:59+07:00');

// Kết quả:
// ✅ Arcade countdown: hiển thị đến 31/03/2026
// ❌ Facilitator: TẮT hoàn toàn
// ❌ Milestones: Không hiển thị
```

### 2. Có Facilitator sau này

```typescript
// Sau 1 tháng, Google announce Facilitator program
await seasonConfig.enableFacilitator('2026-04-30T23:59:59+07:00');

// Kết quả:
// ✅ Arcade countdown: vẫn hiển thị (giữ nguyên)
// ✅ Facilitator: BẬT với deadline 30/04/2026
// ✅ Milestones: Hiển thị progress
```

### 3. Chỉ tắt Facilitator

```typescript
// Giữ nguyên Arcade, chỉ tắt Facilitator
await seasonConfig.disableFacilitator();
```

### 4. Xem config hiện tại

```typescript
await seasonConfig.viewConfig();

// Output:
// 📊 Current Configuration:
// ========================
// 
// 🎮 ARCADE:
// - Enabled: true
// - Deadline: 2026-03-31T23:59:59+07:00
// - Timezone: +07:00
// - Source: local
// 
// 🎯 FACILITATOR:
// - Enabled: false
// - Deadline: 2026-03-31T23:59:59+07:00
// - Source: local
```

### 5. Reset về default

```typescript
await seasonConfig.reset();

// Quay về giá trị hardcoded trong firebaseService.ts
```

## Production Deployment

Khi deploy production, nhớ update Firebase Remote Config:

```bash
# Login Firebase
firebase login

# Set config values
firebase remoteconfig:set countdown_enabled true
firebase remoteconfig:set countdown_deadline "2026-03-31T23:59:59+00:00"
firebase remoteconfig:set countdown_timezone "+00:00"
firebase remoteconfig:set countdown_enabled_arcade false
firebase remoteconfig:set countdown_deadline_arcade "2026-03-31T23:59:59+00:00"

# Publish changes
firebase deploy --only remoteconfig
```

Hoặc dùng Firebase Console UI:
1. Vào Firebase Console > Remote Config
2. Update parameters:
   - `countdown_enabled` = `true`
   - `countdown_deadline` = `2026-03-31T23:59:59+00:00`
   - `countdown_enabled_arcade` = `false` ❌
3. Click "Publish changes"

## Integration với Account Service

Nếu cần update accounts để tắt Facilitator:

```typescript
import { accountService } from './services/accountService';

// Lấy tất cả accounts
const accounts = await accountService.getAllAccounts();

// Disable Facilitator cho tất cả
for (const account of accounts) {
  await accountService.updateAccount({
    ...account,
    facilitatorProgram: false, // ❌ TẮT
  });
}

console.log(`✅ Updated ${accounts.length} accounts`);
```

## Typical Timeline

### Khi bắt đầu mùa mới (Month 1)

```typescript
// 1. Setup config cho mùa mới
await seasonConfig.setup('2026-03-31T23:59:59+07:00');

// 2. Disable Facilitator cho accounts
// (Xem code phía trên)

// 3. Update Firebase Remote Config
// (Nếu production)

// 4. Test trên local
await seasonConfig.viewConfig();
```

### Khi Google announce Facilitator (Month 2)

```typescript
// 1. Update requirements trong facilitatorService.ts
// Edit: FACILITATOR_MILESTONE_REQUIREMENTS

// 2. Enable Facilitator
await seasonConfig.enableFacilitator('2026-04-30T23:59:59+07:00');

// 3. Enable cho accounts
// facilitatorProgram = true

// 4. Update Firebase Remote Config
// countdown_enabled_arcade = true

// 5. Test
await seasonConfig.viewConfig();
```

## Notes

- 🔧 Local development tự động dùng local config
- 🚀 Production cần update Firebase Remote Config
- 📝 Nhớ document thông tin mùa mới
- ✅ Test kỹ trước khi deploy production
- 🔄 Có thể chuyển đổi qua lại dễ dàng
