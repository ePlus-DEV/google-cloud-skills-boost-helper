# Template .env Configuration
# Copy nội dung này vào file .env.local của bạn

```env
# ============================================
# FIREBASE CONFIGURATION
# ============================================
# Lấy từ Firebase Console > Project Settings > General
WXT_FIREBASE_API_KEY=your-api-key-here
WXT_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
WXT_FIREBASE_PROJECT_ID=your-project-id
WXT_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
WXT_FIREBASE_MESSAGING_SENDER_ID=123456789
WXT_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Firebase Remote Config fetch settings
WXT_FIREBASE_FETCH_INTERVAL_MS=3600000  # 1 hour
WXT_FIREBASE_FETCH_TIMEOUT_MS=60000     # 1 minute

# ============================================
# COUNTDOWN CONFIGURATION (Arcade Program)
# ============================================
# Main Arcade deadline (Games & Trivia)
WXT_COUNTDOWN_DEADLINE=2025-10-14T23:59:59+05:30
WXT_COUNTDOWN_TIMEZONE=+05:30
WXT_COUNTDOWN_ENABLED=true

# ============================================
# FACILITATOR PROGRAM CONFIGURATION
# ============================================
# Facilitator program deadline (Milestones & Bonus)
# ⚠️ Set countdown_enabled_arcade=false khi KHÔNG CÓ Facilitator
WXT_COUNTDOWN_DEADLINE_ARCADE=2025-12-31T23:59:59+05:30
WXT_COUNTDOWN_ENABLED_ARCADE=false  # ❌ FALSE cho mùa mới không có Facilitator

# ============================================
# NOTES
# ============================================
# - Local development: Các giá trị này bị IGNORE
# - Production: Dùng làm fallback khi Firebase fail
# - Firebase Remote Config có priority CAO NHẤT
# - Xem docs/ENV_CONFIGURATION.md để biết thêm chi tiết
```

---

## Ví dụ cấu hình cho các scenarios:

### 1. Mùa mới (Không có Facilitator) - Vietnam timezone

```env
# Arcade
WXT_COUNTDOWN_DEADLINE=2026-03-31T23:59:59+07:00
WXT_COUNTDOWN_TIMEZONE=+07:00
WXT_COUNTDOWN_ENABLED=true

# Facilitator - TẮT
WXT_COUNTDOWN_DEADLINE_ARCADE=2026-12-31T23:59:59+07:00
WXT_COUNTDOWN_ENABLED_ARCADE=false  # ❌
```

### 2. Có Facilitator program - India timezone

```env
# Arcade
WXT_COUNTDOWN_DEADLINE=2026-03-31T23:59:59+05:30
WXT_COUNTDOWN_TIMEZONE=+05:30
WXT_COUNTDOWN_ENABLED=true

# Facilitator - BẬT
WXT_COUNTDOWN_DEADLINE_ARCADE=2026-04-30T23:59:59+05:30
WXT_COUNTDOWN_ENABLED_ARCADE=true  # ✅
```

### 3. Testing / Development

```env
# Arcade - Short deadline for testing
WXT_COUNTDOWN_DEADLINE=2026-01-15T23:59:59+07:00
WXT_COUNTDOWN_TIMEZONE=+07:00
WXT_COUNTDOWN_ENABLED=true

# Facilitator - BẬT cho test
WXT_COUNTDOWN_DEADLINE_ARCADE=2026-01-20T23:59:59+07:00
WXT_COUNTDOWN_ENABLED_ARCADE=true  # ✅
```

---

## Quick Copy Templates:

### Template A: Vietnam - No Facilitator ❌
```
WXT_COUNTDOWN_DEADLINE=2026-03-31T23:59:59+07:00
WXT_COUNTDOWN_TIMEZONE=+07:00
WXT_COUNTDOWN_ENABLED=true
WXT_COUNTDOWN_DEADLINE_ARCADE=2026-12-31T23:59:59+07:00
WXT_COUNTDOWN_ENABLED_ARCADE=false
```

### Template B: Vietnam - With Facilitator ✅
```
WXT_COUNTDOWN_DEADLINE=2026-03-31T23:59:59+07:00
WXT_COUNTDOWN_TIMEZONE=+07:00
WXT_COUNTDOWN_ENABLED=true
WXT_COUNTDOWN_DEADLINE_ARCADE=2026-04-30T23:59:59+07:00
WXT_COUNTDOWN_ENABLED_ARCADE=true
```

### Template C: India - No Facilitator ❌
```
WXT_COUNTDOWN_DEADLINE=2026-03-31T23:59:59+05:30
WXT_COUNTDOWN_TIMEZONE=+05:30
WXT_COUNTDOWN_ENABLED=true
WXT_COUNTDOWN_DEADLINE_ARCADE=2026-12-31T23:59:59+05:30
WXT_COUNTDOWN_ENABLED_ARCADE=false
```

---

## Timezone Reference:

| Location | Timezone | Example |
|----------|----------|---------|
| Vietnam | `+07:00` | `2026-03-31T23:59:59+07:00` |
| India | `+05:30` | `2026-03-31T23:59:59+05:30` |
| UTC | `+00:00` | `2026-03-31T23:59:59+00:00` |
| USA EST | `-05:00` | `2026-03-31T23:59:59-05:00` |
| USA PST | `-08:00` | `2026-03-31T23:59:59-08:00` |

---

**Ghi nhớ:** 
- ⚠️ Local development: Config này sẽ bị **IGNORE**
- 🚀 Production: Config này là **fallback** khi Firebase fail
- 🔥 Firebase Remote Config **luôn** có priority cao nhất!
