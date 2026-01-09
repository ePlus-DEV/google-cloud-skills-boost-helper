# 🎯 Firebase Priority - Visual Guide

## 1. Priority Pyramid

```
              ┌─────────────────────┐
              │  🔥 FIREBASE CONFIG │  ← ⭐ HIGHEST PRIORITY
              │countdown_enabled_   │     (Source of Truth)
              │      arcade         │
              └──────────┬──────────┘
                         │
                    ┌────▼────┐
                    │ TRUE?   │
                    └────┬────┘
                         │
            ┌────────────┴────────────┐
            │                         │
        ❌ FALSE                   ✅ TRUE
            │                         │
    ┌───────▼────────┐       ┌────────▼──────────┐
    │   ẨN LUÔN      │       │ 👤 USER SETTING   │  ← Lower Priority
    │   (Override)   │       │  facilitator      │     (Individual)
    │                │       │    Program        │
    │ 💾 User data   │       └────────┬──────────┘
    │   UNCHANGED    │                │
    └────────────────┘         ┌──────▼──────┐
                               │   TRUE?     │
                               └──────┬──────┘
                                      │
                          ┌───────────┴────────────┐
                          │                        │
                      ❌ FALSE                 ✅ TRUE
                          │                        │
                    ┌─────▼─────┐          ┌───────▼────────┐
                    │    ẨN     │          │   HIỂN THỊ    │
                    │ (User tắt)│          │   FACILITATOR │
                    └───────────┘          └───────────────┘
```

---

## 2. Decision Tree

```
START: Cần hiển thị Facilitator?
  │
  ├──► Check Firebase: countdown_enabled_arcade
  │
  ├─── = FALSE ────► ❌ ẨN (Stop here, không check user)
  │                   💾 User data: UNCHANGED
  │
  └─── = TRUE ─────► Continue...
                      │
                      ├──► Check User: account.facilitatorProgram  
                      │
                      ├─── = TRUE ────► ✅ HIỂN THỊ
                      │                  💾 User data: UNCHANGED
                      │
                      └─── = FALSE ───► ❌ ẨN
                                         💾 User data: UNCHANGED
```

---

## 3. Scenario Matrix

### 📊 Mùa Mới (Không có Facilitator)

```
BEFORE (Mùa cũ):
┌──────────────────────────────────────┐
│ 🔥 Firebase: true                    │
│ 👤 Users: 1000 accounts              │
│    - account1.facilitatorProgram=true│
│    - account2.facilitatorProgram=true│
│    - account3.facilitatorProgram=true│
│    - ...                             │
│ 📺 UI: HIỂN THỊ Facilitator          │
└──────────────────────────────────────┘

CHANGE (1 dòng config):
┌──────────────────────────────────────┐
│ 🔥 Firebase: false  ← CHỈ ĐỔI CÁI NÀY│
└──────────────────────────────────────┘

AFTER (Instant effect):
┌──────────────────────────────────────┐
│ 🔥 Firebase: false ✅                │
│ 👤 Users: 1000 accounts              │
│    - account1.facilitatorProgram=true│ ← KHÔNG ĐỔI ✅
│    - account2.facilitatorProgram=true│ ← KHÔNG ĐỔI ✅ 
│    - account3.facilitatorProgram=true│ ← KHÔNG ĐỔI ✅
│    - ...                             │
│ 📺 UI: ẨN Facilitator ✅             │ ← Firebase override
└──────────────────────────────────────┘
```

---

## 4. Data Flow Diagram

```
┌────────────┐         ┌─────────────────┐
│  Firebase  │────────►│  Priority Check │
│   Config   │ Step 1  │                 │
└────────────┘         │  IF false:      │
                       │    ↓            │
     ┌─────────────────┤  RETURN ẨN      │
     │                 │  (Skip Step 2)  │
     │                 └─────────────────┘
     │                         │
     │ IF true                 │ Step 2
     │                         ↓
     │                ┌─────────────────┐
     │                │   User Setting  │
     └───────────────►│      Check      │
                      │                 │
                      │  IF true: HIỆN  │
                      │  IF false: ẨN   │
                      └─────────────────┘
                               │
                               ↓
                      ┌─────────────────┐
                      │   UI Render     │
                      │                 │
                      │ 💾 User data:   │
                      │    UNCHANGED    │
                      └─────────────────┘
```

---

## 5. Code Flow

```typescript
// Step 1: Check Firebase (Priority 1)
const firebaseEnabled = await firebase.getBooleanParam('countdown_enabled_arcade', false);

if (!firebaseEnabled) {
  // 🚫 STOP HERE - Firebase override
  hide();
  console.log('❌ Firebase Override');
  return; // ← Exit early, không check user
}

// Step 2: Check User (Priority 2) - Chỉ chạy khi Firebase = true
const user = await getAccount();

if (user?.facilitatorProgram === true) {
  show();
  console.log('✅ Both enabled');
} else {
  hide();
  console.log('❌ User disabled');
}

// Note: User data KHÔNG BAO GIỜ bị update trong logic này
```

---

## 6. Timeline Example

```
Timeline: Mùa Gen AI 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tháng 1: Mùa mới bắt đầu
├─ Firebase: countdown_enabled_arcade = FALSE
├─ User data: facilitatorProgram = TRUE (từ mùa trước)
└─ UI: ẨN ❌ (Firebase override)

Tháng 2: Google announce Facilitator
├─ Firebase: countdown_enabled_arcade = TRUE ← Changed!
├─ User data: facilitatorProgram = TRUE (unchanged)
└─ UI: HIỂN THỊ ✅ (cả 2 true)

Tháng 3: User tự tắt
├─ Firebase: countdown_enabled_arcade = TRUE
├─ User data: facilitatorProgram = FALSE ← User action
└─ UI: ẨN ❌ (user choice)

Tháng 4: Kết thúc mùa
├─ Firebase: countdown_enabled_arcade = FALSE ← End season
├─ User data: facilitatorProgram = FALSE (unchanged)
└─ UI: ẨN ❌ (cả 2 false)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Key: Firebase change = 2 lần
     User data preserve = TOÀN BỘ
```

---

## 7. Benefits Visualization

```
┌─────────────────────────────────────────────────┐
│          WITHOUT Priority Logic                 │
│  (Old approach: Only check user setting)        │
├─────────────────────────────────────────────────┤
│ ❌ Phải update 1000 accounts khi đổi mùa       │
│ ❌ Database migration required                  │
│ ❌ Risk of data loss                            │
│ ❌ Cannot rollback easily                       │
│ ❌ Slow deployment                              │
└─────────────────────────────────────────────────┘
                       │
                       ↓ UPGRADE TO
                       ↓
┌─────────────────────────────────────────────────┐
│          WITH Priority Logic                    │
│  (New approach: Firebase priority)              │
├─────────────────────────────────────────────────┤
│ ✅ Không cần update accounts (0 queries)       │
│ ✅ Zero database migration                      │
│ ✅ Data preservation guaranteed                 │
│ ✅ Instant rollback (1 config change)          │
│ ✅ Instant deployment                           │
└─────────────────────────────────────────────────┘
```

---

## 8. Real-World Example

### Scenario: 10,000 Users

#### ❌ Old Approach (No Priority)
```
Mùa mới → Tắt Facilitator
├─ Update 10,000 accounts: facilitatorProgram = false
├─ Time: ~5 minutes (database operations)
├─ Risk: Network errors, partial updates
└─ Rollback: Update 10,000 accounts lại = another 5 min

Total effort: HIGH
Total risk: MEDIUM  
Total time: 10+ minutes
```

#### ✅ New Approach (Firebase Priority)
```
Mùa mới → Tắt Facilitator
├─ Update 1 Firebase config: countdown_enabled_arcade = false
├─ Time: ~1 second
├─ Risk: None (one atomic operation)
├─ User data: UNCHANGED (all 10,000 accounts)
└─ Rollback: Update 1 config lại = 1 second

Total effort: MINIMAL
Total risk: NONE
Total time: 2 seconds
```

---

## 9. Quick Reference

| Action | Firebase | User | UI | Data Changed? |
|--------|----------|------|----|--------------| 
| Tắt mùa mới | `false` | `true` | ẨN | ❌ NO |
| Bật lại | `true` | `true` | HIỆN | ❌ NO |
| User tự tắt | `true` | `false` | ẨN | ✅ YES (user action) |
| Forced hide all | `false` | any | ẨN | ❌ NO |

---

## 10. Implementation Checklist

- [x] Firebase check first (Priority 1)
- [x] User check second (Priority 2)  
- [x] Early return when Firebase = false
- [x] User data never modified by system
- [x] Console logs for debugging
- [x] Both UI and bonus calculation respect priority
- [x] Documentation complete
- [x] Test cases covered

✅ **All implemented and working!**
