# Firebase Service - Local Development Mode

## Thay đổi đã thực hiện

Đã cập nhật `firebaseService.ts` để hỗ trợ 2 chế độ hoạt động:

### 1. **Local Environment (Development Mode)**
- **Phát hiện**: Tự động phát hiện môi trường local thông qua:
  - `import.meta.env.MODE === 'development'`
  - `import.meta.env.DEV === true`
  - `window.location.hostname === 'localhost'`
  - `window.location.hostname === '127.0.0.1'`

- **Hoạt động**: 
  - Sử dụng biến local (`localConfigStore`) thay vì Firebase
  - **Không đọc environment variables** - sử dụng giá trị hardcoded
  - Firebase config trả về empty strings (không cần Firebase)
  - Default values sử dụng giá trị local hardcoded:
    - `countdown_deadline`: `{currentYear}-12-31T23:59:59+07:00` (Vietnam timezone)
    - `countdown_timezone`: `"+07:00"`
    - `countdown_enabled`: `"true"`

- **Lợi ích**: 
  - Không cần cấu hình Firebase khi phát triển
  - Không cần setup environment variables
  - Nhanh hơn (không cần fetch từ remote)
  - Dễ dàng test với các giá trị khác nhau
  - Giá trị mặc định phù hợp với môi trường development

### 2. **Production Environment**
- Sử dụng Firebase Remote Config như bình thường
- Fetch và sync dữ liệu từ Firebase server

## Logic Kiểm Tra Kép (Dual-Check Logic)

Để hiển thị Facilitator, cần **CẢ 2 điều kiện** đều đúng:

### ✅ Điều kiện 1: Account Setting
```typescript
account.facilitatorProgram === true
```
User đã enable Facilitator cho account của mình.

### ✅ Điều kiện 2: Global Config (Firebase)
```typescript
countdown_enabled_arcade === true
```
Chương trình Facilitator đang được kích hoạt globally (theo mùa).

### 📊 Kết quả

| Account Setting | Global Config | Kết quả | Ghi chú |
|----------------|---------------|---------|---------|
| `true` | `true` | ✅ **Hiển thị** | Cả 2 đều enabled |
| `true` | `false` | ❌ **Ẩn** | Mùa không có Facilitator |
| `false` | `true` | ❌ **Ẩn** | User tắt Facilitator |
| `false` | `false` | ❌ **Ẩn** | Cả 2 đều tắt |

**Lợi ích**: Có thể tắt Facilitator cho **toàn bộ** extension bằng cách set `countdown_enabled_arcade = false`, ngay cả khi users có setting `facilitatorProgram = true`.

## API Mới

### `setLocalConfigValue(key: string, value: string | boolean | number)`
Cập nhật giá trị config trong local environment.

```typescript
// Ví dụ: Thay đổi countdown deadline
firebaseService.setLocalConfigValue('countdown_deadline', '2025-12-31T23:59:59+00:00');

// Ví dụ: Bật/tắt countdown
firebaseService.setLocalConfigValue('countdown_enabled', true);
```

### `getLocalConfigStore()`
Lấy tất cả các giá trị config hiện tại trong local environment.

```typescript
const config = firebaseService.getLocalConfigStore();
console.log(config);
```

### `resetLocalConfig()`
Reset các giá trị config về default values.

```typescript
firebaseService.resetLocalConfig();
```

## Các phương thức đã được cập nhật

### Public Methods
Tất cả các phương thức sau đã được cập nhật để kiểm tra môi trường trước:

- `initialize()` - Khởi tạo local store thay vì Firebase trong local environment
- `getAllParams()` - Trả về dữ liệu từ local store
- `getCountdownDeadline()` - Lấy từ local store
- `getCountdownTimezone()` - Lấy từ local store
- `isCountdownEnabled()` - Lấy từ local store
- `getStringParam()` - Lấy từ local store
- `getBooleanParam()` - Lấy từ local store

### Internal Methods
Các phương thức internal cũng được cập nhật:

- **`getFirebaseConfig()`**: 
  - Local: Trả về empty strings (Firebase không cần thiết)
  - Production: Đọc từ environment variables
  
- **`getDefaultValues()`**: 
  - Local: Sử dụng giá trị hardcoded (Vietnam timezone +07:00)
  - Production: Đọc từ environment variables với fallbacks

## Console Logs

Service sẽ log rõ ràng nguồn dữ liệu:

- **Local**: `"🔧 FirebaseService: Running in LOCAL environment, using local config store"`
- **Firebase**: `"FirebaseService: Using remote countdown_deadline: ..."`
- **Default**: `"FirebaseService: Using default countdown_deadline ..."`

## Testing trong Development

```typescript
// Trong browser console hoặc code
import firebaseService from './services/firebaseService';

// Khởi tạo service
await firebaseService.initialize();

// Thay đổi config
firebaseService.setLocalConfigValue('countdown_deadline', '2026-01-31T23:59:59+07:00');
firebaseService.setLocalConfigValue('countdown_enabled', true);

// Kiểm tra
const deadline = await firebaseService.getCountdownDeadline();
console.log('Deadline:', deadline);

// Reset về mặc định
firebaseService.resetLocalConfig();
```

## Lưu ý

- Các phương thức `setLocalConfigValue`, `getLocalConfigStore`, và `resetLocalConfig` **chỉ hoạt động trong local environment**
- Khi deploy production, service sẽ tự động chuyển sang sử dụng Firebase
- Không cần thay đổi code khi deploy
