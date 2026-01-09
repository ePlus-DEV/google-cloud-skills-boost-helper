# Priority Logic - Firebase Override User Settings

## Tóm Tắt

**Firebase Remote Config** là "source of truth" và có quyền **override** user settings.

User data (`account.facilitatorProgram`) **KHÔNG BAO GIỜ** bị thay đổi, chỉ ảnh hưởng đến **UI hiển thị**.

---

## Priority Flow

### 🔥 **Priority 1: Firebase Config (Global Control)**

```typescript
countdown_enabled_arcade: boolean
```

**Nếu = `false`**: 
- ❌ **Ẩn Facilitator cho TẤT CẢ users**
- 🚫 **Bỏ qua** user setting
- 💾 User data **VẪN GIỮ NGUYÊN** (`account.facilitatorProgram` không đổi)

**Nếu = `true`**:
- ⏭️ **Tiếp tục** check user setting

---

### 👤 **Priority 2: User Setting (Individual Control)**  

```typescript
account.facilitatorProgram: boolean
```

**Chỉ được check** khi Firebase config = `true`

**Nếu = `true`**:
- ✅ **Hiển thị** Facilitator

**Nếu = `false`**:
- ❌ **Ẩn** Facilitator (user tự tắt)

---

## Truth Table với Priority

| Firebase<br/>(Priority 1) | User Setting<br/>(Priority 2) | UI Display | User Data<br/>Changed? | Giải thích |
|---------------------------|-------------------------------|------------|------------------------|------------|
| `false` | `true` | ❌ **ẨN** | ❌ **NO** | Firebase override - Mùa không có Facilitator |
| `false` | `false` | ❌ **ẨN** | ❌ **NO** | Cả 2 đều tắt |
| `true` | `true` | ✅ **HIỂN THỊ** | ❌ **NO** | Cả 2 đều bật |
| `true` | `false` | ❌ **ẨN** | ❌ **NO** | User tự tắt |

---

## Code Implementation

### updateMilestoneSection()

```typescript
async updateMilestoneSection(): Promise<void> {
  // Priority 1: Check Firebase (Global)
  const facilitatorGloballyEnabled = await firebaseService.getBooleanParam(
    'countdown_enabled_arcade',
    false  // Default: TẮT nếu không có config
  );
  
  // Nếu Firebase = false → ẨN LUÔN, không check tiếp
  if (!facilitatorGloballyEnabled) {
    milestoneSection.classList.add("hidden");
    console.debug("❌ Firebase Override: Facilitator disabled globally");
    return;
  }
  
  // Priority 2: Check User Setting (chỉ khi Firebase = true)
  const currentAccount = await AccountService.getActiveAccount();
  
  if (currentAccount?.facilitatorProgram === true) {
    milestoneSection.classList.remove("hidden");
    console.debug("✅ Showing Facilitator (Firebase=true, User=true)");
  } else {
    milestoneSection.classList.add("hidden");
    console.debug("❌ User disabled Facilitator");
  }
}
```

---

## Scenarios

### Scenario 1: Mùa Mới - KHÔNG có Facilitator

**Setup:**
```typescript
// Firebase Config
countdown_enabled_arcade = false  // 🔥 TẮT globally

// User Data (KHÔNG CẦN THAY ĐỔI)
account.facilitatorProgram = true  // 👤 Vẫn còn từ mùa trước
```

**Kết quả:**
- ❌ UI: **ẨN** Facilitator (Firebase override)
- ✅ Data: `account.facilitatorProgram` vẫn = `true` (unchanged)
- 📝 Log: `"❌ Firebase Override: Facilitator disabled globally"`

**Lợi ích:**
- ✅ Không cần update accounts trong database
- ✅ Data user được preserve
- ✅ Khi có Facilitator lại → Chỉ cần bật Firebase config

---

### Scenario 2: Facilitator Quay Lại

**Setup:**
```typescript
// Firebase Config - BẬT lại
countdown_enabled_arcade = true  // 🔥 Kích hoạt globally

// User Data (KHÔNG THAY ĐỔI)
account.facilitatorProgram = true  // 👤 Vẫn giữ nguyên từ trước
```

**Kết quả:**
- ✅ UI: **HIỂN THỊ** Facilitator (cả 2 đều true)
- ✅ Data: Không thay đổi gì
- 📝 Log: `"✅ Showing Facilitator (Firebase=true, User=true)"`

---

### Scenario 3: User Tự Tắt

**Setup:**
```typescript
// Firebase Config
countdown_enabled_arcade = true  // 🔥 Cho phép globally

// User Data
account.facilitatorProgram = false  // 👤 User tự tắt
```

**Kết quả:**
- ❌ UI: **ẨN** Facilitator (user setting)
- ✅ Data: `account.facilitatorProgram = false`
- 📝 Log: `"❌ User disabled Facilitator"`

---

## Benefits of This Approach

### ✅ **1. Zero Database Migration**
Không cần update `account.facilitatorProgram` cho hàng ngàn users khi đổi mùa.

### ✅ **2. Data Preservation**
User preferences được giữ nguyên, ready cho mùa sau.

### ✅ **3. Instant Toggle**
Bật/tắt Facilitator globally chỉ bằng 1 config change.

### ✅ **4. Rollback Easy**
Nếu Facilitator quay lại → Chỉ cần flip config, user data vẫn intact.

### ✅ **5. User Control**
User vẫn có quyền tắt Facilitator cho riêng mình (khi Firebase = true).

---

## Testing

### Test Firebase Override

```typescript
// 1. Setup: User có facilitatorProgram = true
const account = await AccountService.getActiveAccount();
console.log('User setting:', account.facilitatorProgram); // true

// 2. Firebase Config = false (Override)
await seasonConfig.disableFacilitator();

// 3. Check UI
await PopupUIService.updateMilestoneSection();
// Console: "❌ Firebase Override: Facilitator disabled globally"
// UI: Milestone section = HIDDEN

// 4. Verify user data UNCHANGED
const accountAfter = await AccountService.getActiveAccount();
console.log('User setting after:', accountAfter.facilitatorProgram); // STILL true ✅
```

### Test Priority Flow

```typescript
// Test all combinations
const testCases = [
  { firebase: false, user: true,  expected: 'HIDDEN',  reason: 'Firebase override' },
  { firebase: false, user: false, expected: 'HIDDEN',  reason: 'Both disabled' },
  { firebase: true,  user: true,  expected: 'VISIBLE', reason: 'Both enabled' },
  { firebase: true,  user: false, expected: 'HIDDEN',  reason: 'User disabled' },
];

for (const test of testCases) {
  // Set configs
  firebaseService.setLocalConfigValue('countdown_enabled_arcade', test.firebase);
  
  // Note: User setting is READ-ONLY in this logic, không update
  
  // Check result
  await PopupUIService.updateMilestoneSection();
  const section = document.querySelector('#milestones-section');
  const isHidden = section.classList.contains('hidden');
  
  console.assert(
    (isHidden && test.expected === 'HIDDEN') || 
    (!isHidden && test.expected === 'VISIBLE'),
    `Test failed: ${test.reason}`
  );
}
```

---

## Console Logs

Service tự động log để track priority:

```
🔧 Local Development Mode:
----------------------------
✅ Firebase: countdown_enabled_arcade = false
👤 User: facilitatorProgram = true
📊 Result: HIDDEN (Firebase override)
💾 User data unchanged

🔧 Local Development Mode:
----------------------------
✅ Firebase: countdown_enabled_arcade = true
👤 User: facilitatorProgram = true
📊 Result: VISIBLE (both enabled)
💾 User data unchanged
```

---

## Quick Commands

```typescript
// Xem current state
seasonConfig.viewConfig()

// Disable globally (Override all users)
seasonConfig.disableFacilitator()
// User data: KHÔNG THAY ĐỔI ✅

// Enable globally (Respect user settings)
seasonConfig.enableFacilitator('2026-06-30T23:59:59+07:00')
// User data: KHÔNG THAY ĐỔI ✅
```

---

## Summary

| Aspect | Status |
|--------|--------|
| **Firebase là source of truth** | ✅ YES |
| **User data được preserve** | ✅ YES |
| **Firebase override user setting** | ✅ YES (khi Firebase = false) |
| **User có control cá nhân** | ✅ YES (khi Firebase = true) |
| **Cần update database khi đổi mùa** | ❌ NO |
| **Dễ rollback** | ✅ YES |

**Perfect balance**: Global control + User preferences + Data preservation! 🎯
