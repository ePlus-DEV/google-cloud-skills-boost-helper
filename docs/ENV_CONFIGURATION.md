# Environment Variables Configuration Guide

## 📋 Overview

Project này sử dụng environment variables để config Firebase và Remote Config defaults. 

Trong **local development**, các giá trị này được **IGNORE** và sử dụng hardcoded values. Xem `firebaseService.ts` → `getDefaultValues()`.

## 🔧 Setup Instructions

### 1. Tạo file `.env.local`

```bash
# Copy từ template
cp .env.example .env.local
```

### 2. Config Firebase (Production Only)

```env
# ============================================
# FIREBASE CONFIGURATION
# ============================================
WXT_FIREBASE_API_KEY=your-api-key-here
WXT_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
WXT_FIREBASE_PROJECT_ID=your-project-id
WXT_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
WXT_FIREBASE_MESSAGING_SENDER_ID=123456789
WXT_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Firebase fetch settings
WXT_FIREBASE_FETCH_INTERVAL_MS=3600000  # 1 hour
WXT_FIREBASE_FETCH_TIMEOUT_MS=60000     # 1 minute
```

**Lấy credentials ở đâu?**
- Firebase Console → Project Settings → General
- Scroll down → "Your apps" → Web app
- Copy từ `firebaseConfig` object

### 3. Config Countdown (Arcade Program)

```env
# ============================================
# COUNTDOWN CONFIGURATION (Arcade Program)
# ============================================
# Main Arcade deadline (Games & Trivia)
WXT_COUNTDOWN_DEADLINE=2025-10-14T23:59:59+05:30
WXT_COUNTDOWN_TIMEZONE=+05:30
WXT_COUNTDOWN_ENABLED=true
```

**Format:**
- Deadline: ISO 8601 format `YYYY-MM-DDTHH:mm:ss+TZ`
- Timezone: `+HH:MM` hoặc `-HH:MM`
- Enabled: `true` hoặc `false` (string)

**Examples:**
```env
# Vietnam timezone
WXT_COUNTDOWN_DEADLINE=2026-03-31T23:59:59+07:00
WXT_COUNTDOWN_TIMEZONE=+07:00

# India timezone
WXT_COUNTDOWN_DEADLINE=2026-03-31T23:59:59+05:30
WXT_COUNTDOWN_TIMEZONE=+05:30

# UTC
WXT_COUNTDOWN_DEADLINE=2026-03-31T23:59:59+00:00
WXT_COUNTDOWN_TIMEZONE=+00:00
```

### 4. Config Facilitator Program

```env
# ============================================
# FACILITATOR PROGRAM CONFIGURATION
# ============================================
# ⚠️ QUAN TRỌNG: Set FALSE khi mùa mới KHÔNG CÓ Facilitator
WXT_COUNTDOWN_DEADLINE_ARCADE=2025-12-31T23:59:59+05:30
WXT_COUNTDOWN_ENABLED_ARCADE=false  # ❌ FALSE = TẮT Facilitator
```

**Khi nào set `false`?**
- ❌ Mùa mới chưa có thông tin Facilitator
- ❌ Google chưa announce Facilitator program
- ❌ Muốn tắt Facilitator globally

**Khi nào set `true`?**
- ✅ Google đã announce Facilitator program
- ✅ Có requirements và deadlines rõ ràng
- ✅ Muốn users thấy Facilitator milestones

---

## 📊 Priority Logic

### Local Development
```
Environment Variables → ❌ IGNORED
Hardcoded values in code → ✅ USED
```

Xem `firebaseService.ts` → `getDefaultValues()`:
```typescript
if (this.isLocalEnvironment) {
  return {
    countdown_deadline: `${currentYear}-12-31T23:59:59+07:00`,
    countdown_timezone: '+07:00',
    countdown_enabled: 'true',
    countdown_deadline_arcade: `${currentYear}-12-31T23:59:59+07:00`,
    countdown_enabled_arcade: 'false', // ← Hardcoded local default
  };
}
```

### Production
```
1. Firebase Remote Config → ⭐ HIGHEST PRIORITY
2. Environment Variables   → 🔄 Fallback if Firebase fails
3. Hardcoded defaults      → 🆘 Last resort
```

---

## 🎯 Common Scenarios

### Scenario 1: Mùa Mới - KHÔNG có Facilitator

**`.env.local`:**
```env
# Arcade countdown
WXT_COUNTDOWN_DEADLINE=2026-03-31T23:59:59+07:00
WXT_COUNTDOWN_ENABLED=true

# Facilitator - TẮT
WXT_COUNTDOWN_ENABLED_ARCADE=false  # ❌
```

**Firebase Remote Config:**
```
countdown_deadline: "2026-03-31T23:59:59+00:00"
countdown_enabled: true
countdown_enabled_arcade: false  # ❌ TẮT globally
```

**Kết quả:**
- ✅ Arcade countdown: HIỂN THỊ
- ❌ Facilitator: ẨN (override user settings)

---

### Scenario 2: Có Facilitator Program

**`.env.local`:**
```env
# Arcade countdown
WXT_COUNTDOWN_DEADLINE=2026-03-31T23:59:59+07:00
WXT_COUNTDOWN_ENABLED=true

# Facilitator - BẬT
WXT_COUNTDOWN_DEADLINE_ARCADE=2026-04-30T23:59:59+07:00
WXT_COUNTDOWN_ENABLED_ARCADE=true  # ✅
```

**Firebase Remote Config:**
```
countdown_deadline: "2026-03-31T23:59:59+00:00"
countdown_enabled: true
countdown_deadline_arcade: "2026-04-30T23:59:59+00:00"
countdown_enabled_arcade: true  # ✅ BẬT globally
```

**Kết quả:**
- ✅ Arcade countdown: HIỂN THỊ
- ✅ Facilitator: HIỂN THỊ (nếu user setting = true)

---

## 🔍 Debugging

### Check current config:

**Browser Console:**
```javascript
// View all params
seasonConfig.viewConfig()

// Check specific value
const enabled = await firebaseService.getBooleanParam('countdown_enabled_arcade', false);
console.log('Facilitator enabled:', enabled);
```

**Logs sẽ hiển thị:**
```
📊 Current Configuration:
========================

🎮 ARCADE:
- Enabled: true
- Deadline: 2026-03-31T23:59:59+07:00
- Timezone: +07:00
- Source: local

🎯 FACILITATOR:
- Enabled: false
- Deadline: 2026-12-31T23:59:59+07:00
- Source: local
```

---

## 📁 File Structure

```
project/
├── .env.example           # ← Template (tracked in git)
├── .env.local            # ← Your config (gitignored)
├── .gitignore            # ← Blocks .env.local
└── services/
    └── firebaseService.ts # ← Reads env vars
```

---

## ⚠️ Important Notes

### 1. Local Development
- Environment variables **KHÔNG ĐƯỢC SỬ DỤNG**
- Code sử dụng **hardcoded defaults**
- Để thay đổi: Sửa code hoặc dùng `seasonConfig.setLocalConfigValue()`

### 2. Production Build
- Environment variables **ĐƯỢC SỬ DỤNG** làm fallback
- Firebase Remote Config là **priority cao nhất**
- Nếu Firebase fail → Dùng env vars
- Nếu env vars empty → Dùng hardcoded defaults

### 3. Firebase Override
- Firebase Remote Config **LUÔN** override env vars
- Set trong Firebase Console để control production
- Env vars chỉ là **backup plan**

---

## 🚀 Deployment Checklist

### Before Deploy:

- [ ] Đã set Firebase credentials trong `.env.local` (local build)
- [ ] Đã config Firebase Remote Config (production)
- [ ] `countdown_enabled_arcade` đúng với status mùa hiện tại
- [ ] Deadlines đã được update
- [ ] Test trên local với `seasonConfig.viewConfig()`

### After Deploy:

- [ ] Verify Firebase Remote Config đang active
- [ ] Check console logs cho priority source
- [ ] Test UI với different account settings
- [ ] Verify Facilitator ẩn/hiện đúng

---

## 📚 Related Documentation

- `docs/PRIORITY_LOGIC.md` - Priority between Firebase và user settings
- `docs/VISUAL_PRIORITY_GUIDE.md` - Diagrams và examples
- `docs/NEW_SEASON_CONFIG.md` - Guide cho mùa mới
- `FIREBASE_LOCAL_MODE.md` - Local development mode

---

## 🆘 Troubleshooting

### Issue: UI vẫn hiển thị Facilitator dù đã set `false`

**Check:**
1. Xem console logs: `seasonConfig.viewConfig()`
2. Verify source: Nếu source = "local" → Check hardcoded values
3. Nếu source = "remote" → Check Firebase Console
4. Clear cache và reload extension

**Fix:**
```typescript
// Force disable
await seasonConfig.disableFacilitator();

// Verify
const enabled = await firebaseService.getBooleanParam('countdown_enabled_arcade', false);
console.log('Should be false:', enabled);
```

### Issue: Env vars không được load

**Remember:**
- ✅ Production: Env vars được dùng
- ❌ Local: Env vars bị IGNORE

**Check build mode:**
```typescript
console.log('Environment:', import.meta.env.MODE);
console.log('Is Dev:', import.meta.env.DEV);
// Local: MODE = 'development', DEV = true
```

---

## 💡 Quick Reference

| Variable | Type | Default (Local) | Purpose |
|----------|------|-----------------|---------|
| `WXT_COUNTDOWN_ENABLED` | boolean | `true` | Bật/tắt Arcade countdown |
| `WXT_COUNTDOWN_DEADLINE` | string | `{year}-12-31T23:59:59+07:00` | Arcade deadline |
| `WXT_COUNTDOWN_TIMEZONE` | string | `+07:00` | Timezone |
| `WXT_COUNTDOWN_ENABLED_ARCADE` | boolean | `false` | **Bật/tắt Facilitator** |
| `WXT_COUNTDOWN_DEADLINE_ARCADE` | string | `{year}-12-31T23:59:59+07:00` | Facilitator deadline |

**Key:** Variables có `_ARCADE` suffix là cho **Facilitator program**.
