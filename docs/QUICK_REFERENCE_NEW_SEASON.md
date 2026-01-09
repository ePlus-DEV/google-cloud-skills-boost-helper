# 🎮 Quick Reference: Mùa Mới Config

## TL;DR - Mùa mới KHÔNG có Facilitator

### Local Development
```typescript
import seasonConfig from './utils/seasonConfigHelper';

// Setup trong 1 dòng
await seasonConfig.setup('2026-03-31T23:59:59+07:00');
```

### Browser Console
```javascript
seasonConfig.setup('2026-03-31T23:59:59+07:00')
```

### Kết quả
- ✅ Arcade: **BẬT** (countdown đến deadline)
- ❌ Facilitator: **TẮT** (không hiển thị)

---

## Các Lệnh Thường Dùng

| Lệnh | Mục đích |
|------|----------|
| `seasonConfig.viewConfig()` | Xem config hiện tại |
| `seasonConfig.setup(deadline)` | Setup mùa mới (no Facilitator) |
| `seasonConfig.disableFacilitator()` | Chỉ tắt Facilitator |
| `seasonConfig.enableFacilitator(deadline)` | Bật lại Facilitator |
| `seasonConfig.reset()` | Reset về default |

---

## Config Values Quan Trọng

### Arcade (Game/Trivia bình thường)
| Key | Value (Mùa mới) | Mô tả |
|-----|-----------------|-------|
| `countdown_enabled` | `true` | ✅ BẬT countdown |
| `countdown_deadline` | `2026-03-31T23:59:59+07:00` | Deadline mùa mới |
| `countdown_timezone` | `+07:00` | Vietnam timezone |

### Facilitator (Chương trình bonus)
| Key | Value (Chưa có) | Mô tả |
|-----|-----------------|-------|
| `countdown_enabled_arcade` | `false` | ❌ TẮT Facilitator |
| `countdown_deadline_arcade` | `2026-03-31T23:59:59+07:00` | Placeholder |

---

## File Locations

| File | Mục đích |
|------|----------|
| `firebaseService.ts` | Core service (hardcoded defaults) |
| `seasonConfigHelper.ts` | Helper utilities |
| `NEW_SEASON_CONFIG.md` | Chi tiết hướng dẫn |
| `SEASON_CONFIG_EXAMPLES.md` | Ví dụ sử dụng |

---

## Checklist Khi Có Mùa Mới

### Phase 1: Mùa mới announce (KHÔNG có Facilitator)
- [ ] Có thông tin deadline mùa mới
- [ ] Chạy `seasonConfig.setup(newDeadline)`
- [ ] Set `facilitatorProgram = false` cho accounts
- [ ] Test local
- [ ] Update Firebase Remote Config (production)
- [ ] Deploy

### Phase 2: Google announce Facilitator (SAU ĐÓ)
- [ ] Update `FACILITATOR_MILESTONE_REQUIREMENTS`
- [ ] Update `FACILITATOR_MILESTONE_POINTS`
- [ ] Chạy `seasonConfig.enableFacilitator(deadline)`
- [ ] Set `facilitatorProgram = true` cho accounts
- [ ] Test local
- [ ] Update Firebase Remote Config
- [ ] Deploy

---

## Timeline Diagram

```
Tháng 1 (Mùa mới bắt đầu)
├─ Google announce: Gen AI Q1 2026
├─ Deadline: 31/03/2026
├─ Facilitator: CHƯA CÓ ❌
└─ Config: Arcade ON, Facilitator OFF

Tháng 2 (Có Facilitator)
├─ Google announce: Facilitator program
├─ Deadline Facilitator: 30/04/2026
├─ Requirements: Mới hoàn toàn
└─ Config: Arcade ON, Facilitator ON ✅

Tháng 3 (Cuối mùa)
├─ Deadline Arcade: 31/03/2026
├─ Deadline Facilitator: 30/04/2026
└─ Cả 2 đều active
```

---

## Environment Detection

Tự động phát hiện:
- 🔧 **Local**: `localhost` hoặc `127.0.0.1` → Dùng local config
- 🚀 **Production**: Khác → Dùng Firebase Remote Config

---

## Common Issues

### Issue: UI vẫn hiển thị Facilitator
**Fix**: Kiểm tra `account.facilitatorProgram`
```typescript
const account = await accountService.getCurrentAccount();
console.log(account?.facilitatorProgram); // Should be false
```

### Issue: Config không apply
**Fix**: Reset và apply lại
```typescript
await seasonConfig.reset();
await seasonConfig.setup('2026-03-31T23:59:59+07:00');
```

### Issue: Production khác local
**Fix**: Update Firebase Remote Config
- Go to Firebase Console > Remote Config
- Set `countdown_enabled_arcade` = `false`
- Publish changes

---

## Production Deploy (Firebase)

### Via Firebase CLI
```bash
firebase remoteconfig:set countdown_enabled_arcade false
firebase deploy --only remoteconfig
```

### Via Firebase Console
1. Navigate: Firebase Console → Remote Config
2. Update: `countdown_enabled_arcade` → `false`
3. Click: "Publish changes"

---

## Contact & Support

- 📖 Full docs: `docs/NEW_SEASON_CONFIG.md`
- 💡 Examples: `docs/SEASON_CONFIG_EXAMPLES.md`
- 🔧 Helper: `utils/seasonConfigHelper.ts`
- 🔥 Service: `services/firebaseService.ts`
