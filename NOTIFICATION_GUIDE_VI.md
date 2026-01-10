# Push Notifications trong Extension

## Tổng quan

Extension hiện đã có hệ thống notification hoàn chỉnh để thông báo đến user khi có sự kiện quan trọng.

## Files đã được tạo

1. **services/notificationService.ts** - Service chính để hiển thị notifications
2. **services/monitorService.ts** - Service để monitor và tự động gửi notifications
3. **NOTIFICATION_USAGE.md** - Hướng dẫn chi tiết cách sử dụng (tiếng Anh)

## Cách sử dụng nhanh

### 1. Hiển thị notification đơn giản

```typescript
import { notificationService } from "./services/notificationService";

// Hiển thị notification
await notificationService.showSimple(
  "Thông báo mới",
  "Bạn có 1 thông báo mới"
);
```

### 2. Notification với action khi click

```typescript
await notificationService.show(
  {
    title: "Cập nhật mới",
    message: "Extension đã được cập nhật",
  },
  () => {
    // Xử lý khi user click vào notification
    browser.tabs.create({ url: "https://example.com" });
  }
);
```

### 3. Notification với buttons

```typescript
await notificationService.showWithActions(
  "Hoàn thành Lab",
  "Bạn muốn chia sẻ?",
  [
    { title: "Chia sẻ" },
    { title: "Bỏ qua" }
  ],
  (buttonIndex) => {
    if (buttonIndex === 0) {
      // Xử lý khi click "Chia sẻ"
    }
  }
);
```

### 4. Sử dụng Monitor Service (tự động)

Trong **entrypoints/background.ts**, thêm:

```typescript
import { monitorService } from "../services/monitorService";

export default defineBackground(() => {
  // ... code hiện tại ...
  
  // Khởi tạo monitoring
  monitorService.initialize({
    enableMilestoneNotifications: true,    // Thông báo khi đạt milestone
    enableDeadlineNotifications: true,     // Thông báo deadline
    enableUpdateNotifications: true,       // Thông báo update
    milestones: [100, 500, 1000, 5000],   // Các mốc điểm để thông báo
    deadlineWarningDays: [7, 3, 1],       // Thông báo trước deadline bao nhiêu ngày
  });
});
```

Monitor service sẽ tự động:
- Thông báo khi đạt milestone (100, 500, 1000, 5000 điểm...)
- Thông báo khi sắp đến deadline (7 ngày, 3 ngày, 1 ngày trước)
- Nhắc nhở daily progress (nếu chưa làm lab trong ngày)

## Các tính năng đã implement

✅ Notification Service cơ bản
✅ Click handlers
✅ Action buttons (max 2 buttons)
✅ Priority levels
✅ Auto-clear hoặc require interaction
✅ Monitor service với auto-check định kỳ
✅ Milestone notifications
✅ Deadline warnings
✅ Daily reminders
✅ Permission "notifications" đã được thêm vào manifest

## Ví dụ thực tế đã được thêm vào code

Trong **background.ts**, notification đã được tích hợp khi:
- Extension được update lên version mới → Hiển thị notification với link đến changelog

## Tùy chỉnh

Bạn có thể tùy chỉnh notification bằng cách:

1. **Thay đổi icon**: Đặt icon của bạn trong `public/icon/` và sử dụng
2. **Thay đổi màu sắc**: Không thể (do giới hạn của browser API)
3. **Thay đổi âm thanh**: Sử dụng `silent: true` để tắt âm thanh
4. **Thay đổi thời gian hiển thị**: Sử dụng `requireInteraction: true/false`

## Testing

Để test notifications, bạn có thể:

1. Sử dụng browser console:
```javascript
// Trong background script console
const { notificationService } = await import("./services/notificationService");
await notificationService.showSimple("Test", "This is a test");
```

2. Hoặc dùng function test trong monitorService:
```javascript
const { monitorService } = await import("./services/monitorService");
await monitorService.testNotifications();
```

## Lưu ý

- Notifications chỉ hoạt động khi extension đang chạy
- Browser có thể block notifications nếu user tắt trong settings
- Một số browser có giới hạn số lượng notifications hiển thị cùng lúc
- Nên sử dụng notifications một cách tiết kiệm để không làm phiền user

## Xem thêm

Đọc file [NOTIFICATION_USAGE.md](./NOTIFICATION_USAGE.md) để có hướng dẫn chi tiết và nhiều ví dụ hơn.
