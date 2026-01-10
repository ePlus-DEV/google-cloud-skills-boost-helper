# Notification Service Usage Guide

## Giới thiệu

NotificationService cung cấp API để hiển thị browser notifications trong extension. Service này hỗ trợ Chrome, Firefox, Edge và các browser khác.

## Import Service

```typescript
import { notificationService } from "../services/notificationService";
```

## Các phương thức chính

### 1. Hiển thị notification đơn giản

```typescript
// Hiển thị notification cơ bản
await notificationService.showSimple(
  "Thông báo mới",
  "Bạn có 1 thông báo mới từ Google Cloud Skills Boost"
);
```

### 2. Hiển thị notification với callback khi click

```typescript
await notificationService.show(
  {
    title: "Thông báo quan trọng",
    message: "Extension đã được cập nhật lên phiên bản mới",
    requireInteraction: true, // Không tự động đóng
  },
  () => {
    // Xử lý khi user click vào notification
    console.log("User clicked notification");
    browser.tabs.create({ url: "https://example.com" });
  }
);
```

### 3. Hiển thị notification với action buttons

```typescript
await notificationService.showWithActions(
  "Hoàn thành Lab",
  "Bạn vừa hoàn thành lab mới. Muốn chia sẻ thành tích?",
  [
    { title: "Chia sẻ" },
    { title: "Bỏ qua" }
  ],
  (buttonIndex) => {
    if (buttonIndex === 0) {
      // User click "Chia sẻ"
      console.log("User wants to share");
    } else {
      // User click "Bỏ qua"
      console.log("User dismissed");
    }
  }
);
```

### 4. Hiển thị notification quan trọng

```typescript
// Notification với priority cao và require interaction
await notificationService.showImportant(
  "Thời hạn sắp hết!",
  "Bạn còn 2 ngày để hoàn thành các Lab trong Season 2",
  () => {
    // Mở trang arcade khi click
    browser.tabs.create({ 
      url: "https://go.cloudskillsboost.google/arcade" 
    });
  }
);
```

### 5. Hiển thị notification với hình ảnh

```typescript
await notificationService.showWithImage(
  "Badge mới",
  "Chúc mừng! Bạn đã đạt được badge Google Cloud",
  "https://example.com/badge-image.png"
);
```

### 6. Hiển thị notification với options đầy đủ

```typescript
const notificationId = await notificationService.show(
  {
    title: "Thông báo chi tiết",
    message: "Đây là nội dung thông báo",
    iconUrl: browser.runtime.getURL("icon/icon-128.png"),
    type: "basic",
    priority: 2, // 0-2, 2 là cao nhất
    requireInteraction: true, // true = không tự động đóng
    silent: false, // true = không có âm thanh
    contextMessage: "Google Cloud Skills Boost Helper",
    buttons: [
      { title: "Xem ngay" },
      { title: "Để sau" }
    ]
  },
  () => {
    // Callback khi click vào notification body
    console.log("Clicked on notification");
  },
  (buttonIndex) => {
    // Callback khi click vào button
    console.log(`Clicked button ${buttonIndex}`);
  }
);

// Lưu notification ID để có thể clear sau này
console.log("Notification ID:", notificationId);
```

### 7. Clear notification

```typescript
// Clear một notification cụ thể
await notificationService.clear(notificationId);

// Clear tất cả notifications
await notificationService.clearAll();
```

## Ví dụ thực tế trong Extension

### 1. Thông báo khi có Lab mới

```typescript
// Trong background.ts hoặc content script
import { notificationService } from "../services/notificationService";

// Giả sử bạn check lab mới định kỳ
async function checkForNewLabs() {
  const newLabs = await fetchNewLabs(); // Hàm của bạn
  
  if (newLabs.length > 0) {
    await notificationService.show(
      {
        title: `${newLabs.length} Lab mới!`,
        message: "Click để xem danh sách các lab mới",
        requireInteraction: false,
      },
      () => {
        // Mở popup hoặc options page
        browser.tabs.create({ 
          url: browser.runtime.getURL("/options.html#labs") 
        });
      }
    );
  }
}

// Check mỗi 1 giờ
setInterval(checkForNewLabs, 60 * 60 * 1000);
```

### 2. Thông báo khi đạt milestone

```typescript
async function checkMilestone(totalPoints: number) {
  const milestones = [100, 500, 1000, 5000];
  
  for (const milestone of milestones) {
    if (totalPoints >= milestone) {
      const alreadyNotified = await storage.get(`milestone_${milestone}`);
      
      if (!alreadyNotified) {
        await notificationService.showImportant(
          "🎉 Milestone đạt được!",
          `Chúc mừng bạn đã đạt ${milestone} điểm!`,
          () => {
            browser.tabs.create({ 
              url: "https://go.cloudskillsboost.google/arcade" 
            });
          }
        );
        
        // Đánh dấu đã thông báo
        await storage.set(`milestone_${milestone}`, true);
      }
    }
  }
}
```

### 3. Thông báo countdown deadline

```typescript
async function checkDeadline() {
  const deadline = new Date("2026-06-30T23:59:59");
  const now = new Date();
  const daysLeft = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  // Thông báo khi còn 7 ngày, 3 ngày, 1 ngày
  if ([7, 3, 1].includes(daysLeft)) {
    await notificationService.showWithActions(
      "⏰ Thời hạn sắp hết!",
      `Bạn còn ${daysLeft} ngày để hoàn thành Season Arcade`,
      [
        { title: "Xem tiến độ" },
        { title: "OK" }
      ],
      (buttonIndex) => {
        if (buttonIndex === 0) {
          browser.tabs.create({ 
            url: browser.runtime.getURL("/popup.html") 
          });
        }
      }
    );
  }
}

// Check mỗi ngày
setInterval(checkDeadline, 24 * 60 * 60 * 1000);
```

### 4. Thông báo khi có update từ Firebase Remote Config

```typescript
import { firebaseService } from "../services/firebaseService";
import { notificationService } from "../services/notificationService";

async function checkRemoteConfigUpdates() {
  const hasUpdates = await firebaseService.fetchAndActivate();
  
  if (hasUpdates) {
    const importantMessage = await firebaseService.getString("important_message");
    
    if (importantMessage) {
      await notificationService.showImportant(
        "Thông báo mới từ Google Cloud",
        importantMessage,
        () => {
          browser.tabs.create({ 
            url: browser.runtime.getURL("/options.html#notifications") 
          });
        }
      );
    }
  }
}

// Check mỗi 2 giờ
setInterval(checkRemoteConfigUpdates, 2 * 60 * 60 * 1000);
```

## Setup trong Background Script

Để notification service hoạt động, bạn cần setup listeners trong background script:

```typescript
// Trong entrypoints/background.ts
import { notificationService } from "../services/notificationService";

export default defineBackground(() => {
  // Setup notification listeners
  notificationService.setupListeners();
  
  // ... rest of your background code
});
```

## Permissions trong manifest.json

Đảm bảo bạn đã khai báo permission trong `wxt.config.ts` hoặc manifest:

```typescript
// wxt.config.ts
export default defineConfig({
  manifest: {
    permissions: [
      "notifications",
      "storage"
    ]
  }
});
```

## Best Practices

1. **Không spam notifications**: Giới hạn số lượng notifications để không làm phiền user
2. **Có ý nghĩa**: Chỉ gửi notification cho những thông tin quan trọng
3. **Có action**: Cung cấp action button hoặc click handler để user có thể xử lý
4. **Tracking**: Lưu trạng thái để không gửi duplicate notifications
5. **Timing**: Chọn thời điểm phù hợp để gửi notification (không gửi quá nhiều cùng lúc)

## API Reference

### NotificationOptions

```typescript
interface NotificationOptions {
  title: string;                           // Tiêu đề (required)
  message: string;                         // Nội dung (required)
  iconUrl?: string;                        // URL icon
  type?: "basic" | "image" | "list" | "progress"; // Loại notification
  priority?: number;                       // 0-2, 2 là cao nhất
  requireInteraction?: boolean;            // true = không tự động đóng
  silent?: boolean;                        // true = không có âm thanh
  buttons?: Array<{ title: string }>;     // Action buttons (max 2)
  contextMessage?: string;                 // Text phụ
}
```

### Methods

- `isSupported()`: Kiểm tra browser có hỗ trợ notifications
- `requestPermission()`: Request permission (tự động cho extension)
- `show(options, onClick?, onButtonClick?)`: Hiển thị notification đầy đủ
- `showSimple(title, message)`: Hiển thị notification đơn giản
- `showWithActions(title, message, buttons, onButtonClick)`: Với buttons
- `showImportant(title, message, onClick?)`: Notification quan trọng
- `showWithImage(title, message, imageUrl)`: Với hình ảnh
- `clear(notificationId)`: Clear một notification
- `clearAll()`: Clear tất cả
- `setupListeners()`: Setup event listeners (gọi trong background)

## Troubleshooting

### Notification không hiển thị?

1. Kiểm tra permission trong manifest
2. Kiểm tra đã gọi `setupListeners()` trong background
3. Check browser console for errors
4. Đảm bảo browser hỗ trợ notifications

### Click handler không hoạt động?

1. Đảm bảo `setupListeners()` được gọi trước khi show notification
2. Check callback có được lưu đúng không
3. Test với simple example trước

### Notification tự động đóng quá nhanh?

Sử dụng `requireInteraction: true` để notification không tự động đóng:

```typescript
await notificationService.show({
  title: "Title",
  message: "Message",
  requireInteraction: true
});
```
