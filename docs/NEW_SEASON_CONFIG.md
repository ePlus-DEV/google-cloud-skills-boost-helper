# Config cho Mùa Mới (Chưa có Facilitator)

## Tình huống

Khi Google Cloud Skills Boost bắt đầu một **mùa mới** (ví dụ: Gen AI mới, chương trình mới) nhưng **chưa có thông tin về chương trình FACILITATOR**, bạn cần config để:

1. ✅ Hiển thị countdown cho Arcade Game/Trivia bình thường
2. ❌ Tắt chương trình Facilitator (không hiển thị milestones)
3. ⚙️ Sử dụng local config khi development

---

## Cách Config

### 1. **Trong Local Development**

Khi chạy trên localhost, service đã tự động sử dụng local config. Bạn có thể:

#### Option A: Sửa code trong `firebaseService.ts`

Tìm method `getDefaultValues()` và cập nhật phần local environment:

```typescript
private getDefaultValues(): RemoteConfigDefaults {
  // Local environment: use hardcoded development values
  if (this.isLocalEnvironment) {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    return {
      // Arcade deadline - Thay đổi theo thông tin mùa mới
      countdown_deadline: `${currentYear}-03-31T23:59:59+07:00`, // Ví dụ: kết thúc 31/03
      countdown_timezone: "+07:00", // Vietnam timezone
      countdown_enabled: "true", // Bật countdown
      
      // Facilitator - TẮT khi chưa có chương trình
      countdown_deadline_arcade: `${currentYear}-12-31T23:59:59+07:00`,
      countdown_enabled_arcade: "false", // ❌ TẮT facilitator
    };
  }
  // ... production code
}
```

#### Option B: Dùng `setLocalConfigValue()` (Runtime)

Chạy code này trong browser console hoặc khi app khởi động:

```typescript
import firebaseService from './services/firebaseService';

// Khởi tạo
await firebaseService.initialize();

// Config cho mùa mới (ví dụ: Gen AI Q1 2026)
firebaseService.setLocalConfigValue('countdown_deadline', '2026-03-31T23:59:59+07:00');
firebaseService.setLocalConfigValue('countdown_enabled', 'true');

// TẮT Facilitator
firebaseService.setLocalConfigValue('countdown_enabled_arcade', 'false');

// Kiểm tra
console.log(firebaseService.getAllParams());
```

---

### 2. **Trong Production (Firebase Remote Config)**

Khi deploy, cập nhật Firebase Remote Config với các giá trị:

| Parameter | Value | Mô tả |
|-----------|-------|-------|
| `countdown_deadline` | `2026-03-31T23:59:59+00:00` | Deadline của mùa Arcade mới |
| `countdown_timezone` | `+00:00` hoặc `+05:30` | Timezone phù hợp |
| `countdown_enabled` | `true` | Bật countdown cho Arcade |
| `countdown_deadline_arcade` | `2026-12-31T23:59:59+00:00` | Placeholder (không quan trọng) |
| `countdown_enabled_arcade` | `false` | ❌ **TẮT Facilitator** |

---

### 3. **Cập nhật Account Settings**

Nếu có account UI settings, đảm bảo:

```typescript
// Trong accountService.ts hoặc nơi tạo account
const newAccount = {
  email: "user@example.com",
  // ...
  facilitatorProgram: false, // ❌ TẮT facilitator cho account mới
};
```

Hoặc update existing accounts:

```typescript
// Migration script hoặc manual update
const accounts = await accountService.getAllAccounts();
for (const account of accounts) {
  await accountService.updateAccount({
    ...account,
    facilitatorProgram: false, // TẮT facilitator
  });
}
```

---

## Kết quả

### ✅ Khi config đúng:

- **Countdown Arcade**: Hiển thị đếm ngược đến deadline mùa mới
- **Facilitator Section**: KHÔNG hiển thị (vì `facilitatorProgram = false`)
- **Milestone Section**: Bị ẩn hoàn toàn
- **Points Calculation**: Chỉ tính điểm Arcade, không có bonus Facilitator

### ❌ UI sẽ KHÔNG hiển thị:

- ❌ Facilitator milestones (1, 2, 3, Ultimate)
- ❌ Bonus points từ Facilitator
- ❌ Progress bars cho Facilitator requirements
- ❌ Countdown cho Facilitator deadline

---

## Quick Setup Script

Tạo file `setup-new-season.ts` để chạy nhanh:

```typescript
import firebaseService from './services/firebaseService';
import { accountService } from './services/accountService';

/**
 * Setup for New Season without Facilitator
 * Run this when a new Arcade season starts
 */
export async function setupNewSeason(seasonDeadline: string) {
  console.log('🎮 Setting up new Arcade season...');
  
  // 1. Initialize Firebase Service
  await firebaseService.initialize();
  
  // 2. Configure for new season (LOCAL only)
  firebaseService.setLocalConfigValue('countdown_deadline', seasonDeadline);
  firebaseService.setLocalConfigValue('countdown_enabled', 'true');
  firebaseService.setLocalConfigValue('countdown_enabled_arcade', 'false'); // NO Facilitator
  
  // 3. Disable Facilitator for all accounts
  const accounts = await accountService.getAllAccounts();
  console.log(`📝 Updating ${accounts.length} accounts...`);
  
  for (const account of accounts) {
    await accountService.updateAccount({
      ...account,
      facilitatorProgram: false,
    });
  }
  
  console.log('✅ New season setup complete!');
  console.log('📊 Current config:', firebaseService.getAllParams());
}

// Usage:
// setupNewSeason('2026-03-31T23:59:59+07:00'); // Q1 2026 season
```

---

## Khi nào BẬT lại Facilitator?

Khi Google công bố chương trình Facilitator mới:

1. Cập nhật `facilitatorService.ts` với requirements mới:
```typescript
export const FACILITATOR_MILESTONE_REQUIREMENTS: Record<
  string,
  MilestoneRequirements
> = {
  1: { games: 8, trivia: 6, skills: 16, labfree: 8 }, // ⬅️ Requirements mới
  2: { games: 12, trivia: 8, skills: 32, labfree: 16 },
  // ...
};
```

2. Cập nhật config:
```typescript
firebaseService.setLocalConfigValue('countdown_enabled_arcade', 'true'); // ✅ BẬT lại
firebaseService.setLocalConfigValue('countdown_deadline_arcade', '2026-06-30T23:59:59+07:00'); // Deadline mới
```

3. Enable lại cho accounts:
```typescript
account.facilitatorProgram = true; // ✅ BẬT lại
```

---

## Checklist

Khi setup mùa mới KHÔNG có Facilitator:

- [ ] Cập nhật `countdown_deadline` với deadline mùa mới
- [ ] Set `countdown_enabled` = `true`
- [ ] Set `countdown_enabled_arcade` = `false` ❌
- [ ] Set `facilitatorProgram` = `false` cho tất cả accounts ❌
- [ ] Test local để đảm bảo UI không hiển thị Facilitator
- [ ] Update Firebase Remote Config (nếu production)
- [ ] Document deadline và thông tin mùa mới

---

## Notes

- 📌 Local development tự động dùng local config, không cần Firebase
- 🔄 Có thể switch qua lại bằng `setLocalConfigValue()`
- 🎯 Production cần update Firebase Remote Config
- 📝 Nhớ document thông tin mùa mới trong code comments
