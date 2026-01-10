# Hướng dẫn Test Notifications

## Cách 1: Test qua Console (Đơn giản nhất)

### Bước 1: Mở Extension Background Console

1. Mở Chrome/Edge: `chrome://extensions/` hoặc `edge://extensions/`
2. Bật "Developer mode" ở góc phải trên
3. Tìm extension "Google Cloud Skills Boost Helper"
4. Click vào link **"background page"** hoặc **"service worker"**
5. Console sẽ mở ra

### Bước 2: Chạy test command

Copy và paste lệnh sau vào background console:

```javascript
// Test tự động - Sẽ hiển thị 4 notifications lần lượt
browser.runtime.sendMessage({ _testNotifications: true });
```

Hoặc nếu muốn test thủ công từng loại notification:

```javascript
// Test notification đơn giản
chrome.notifications.create({
  type: "basic",
  iconUrl: chrome.runtime.getURL("icon/128.png"),
  title: "Test Simple",
  message: "Hello from notification!"
});

// Test notification với priority cao
chrome.notifications.create({
  type: "basic",
  iconUrl: chrome.runtime.getURL("icon/128.png"),
  title: "Test Important",
  message: "This is important!",
  priority: 2,
  requireInteraction: true
});

// Test với buttons (Chrome only)
chrome.notifications.create({
  type: "basic",
  iconUrl: chrome.runtime.getURL("icon/128.png"),
  title: "Test with Buttons",
  message: "Choose an option:",
  buttons: [
    { title: "Option 1" },
    { title: "Option 2" }
  ]
});
```

## Cách 2: Test từ bất kỳ trang nào của Extension

Mở **Popup** hoặc **Options page**, mở Console (F12), và chạy:

```javascript
// Gửi message đến background để test
browser.runtime.sendMessage({ _testNotifications: true });
```

Hoặc test trực tiếp từ content script:

```javascript
// Trong console của trang cloudskillsboost.google
browser.runtime.sendMessage({ _testNotifications: true });
```

## Cách 3: Thêm Test Button vào Options Page

Nếu muốn test bằng UI, thêm code sau vào **entrypoints/options/main.tsx**:

```typescript
// Thêm vào component Options
const testNotifications = async () => {
  await browser.runtime.sendMessage({ _testNotifications: true });
  alert("Notification tests started! Check your notifications.");
};

// Thêm button trong UI
<button 
  onClick={testNotifications}
  className="px-4 py-2 bg-blue-500 text-white rounded"
>
  🧪 Test Notifications
</button>
```

## Cách 4: Test qua Browser Notification API trực tiếp

Nếu test bằng `browser.runtime.sendMessage()` không hoạt động, dùng API trực tiếp:

```javascript
// Test trong background console
chrome.notifications.create("test-1", {
  type: "basic",
  iconUrl: chrome.runtime.getURL("icon/128.png"),
  title: "Direct Test",
  message: "Testing notifications directly"
});

// Clear notification sau 5 giây
setTimeout(() => {
  chrome.notifications.clear("test-1");
}, 5000);
```

## Cách 5: Test khi Extension Update

Để test notification khi extension update:

1. Build extension: `yarn build`
2. Note version hiện tại trong `package.json`
3. Thay đổi version trong `package.json` (ví dụ: từ 1.0.0 → 1.0.1)
4. Build lại: `yarn build`
5. Reload extension trong `chrome://extensions/`
6. Bạn sẽ thấy notification update xuất hiện!

## Expected Results

Khi chạy `browser.runtime.sendMessage({ _testNotifications: true })`, bạn sẽ thấy 4 notifications xuất hiện lần lượt:

1. **Simple notification** (ngay lập tức) - "🧪 Test Notification"
2. **Notification with click** (sau 2 giây) - Click để mở options page
3. **Notification with buttons** (sau 4 giây) - 2 buttons để chọn
4. **Important notification** (sau 6 giây) - Không tự động đóng

## Troubleshooting

### Không thấy notifications?

1. **Kiểm tra browser notifications settings:**
   - Windows: Settings → System → Notifications → Chrome/Edge
   - Đảm bảo notifications được bật cho browser

2. **Kiểm tra trong browser:**
   - Chrome: Settings → Privacy and security → Site Settings → Notifications
   - Đảm bảo không bị block

3. **Check console for errors:**
   - Mở background console
   - Xem có error không

4. **Kiểm tra permission:**
   - Vào `chrome://extensions/`
   - Click "Details" trên extension
   - Scroll xuống "Permissions" - phải có "Display notifications"

### Notifications tự động đóng quá nhanh?

Thêm `requireInteraction: true`:

```javascript
await notificationService.show({
  title: "Won't auto-close",
  message: "You must click to dismiss",
  requireInteraction: true
});
```

### Click handler không hoạt động?

Đảm bảo `notificationService.setupListeners()` đã được gọi trong background.ts (đã được thêm rồi).

## Quick Test Script

**Cách dễ nhất:** Copy lệnh này vào background console:

```javascript
// Gửi message để test
browser.runtime.sendMessage({ _testNotifications: true });
```

**Cách thủ công:** Test từng notification:

```javascript
// Test script sử dụng Chrome API trực tiếp
(async () => {
  console.log("🧪 Starting notification tests...");
  
  // Test 1: Simple
  console.log("Test 1: Simple notification");
  chrome.notifications.create("test-1", {
    type: "basic",
    iconUrl: chrome.runtime.getURL("icon/128.png"),
    title: "Test 1",
    message: "Simple notification"
  });
  
  // Test 2: With priority
  await new Promise(r => setTimeout(r, 2000));
  console.log("Test 2: High priority");
  chrome.notifications.create("test-2", {
    type: "basic",
    iconUrl: chrome.runtime.getURL("icon/128.png"),
    title: "Test 2",
    message: "High priority notification",
    priority: 2
  });
  
  // Test 3: With buttons
  await new Promise(r => setTimeout(r, 2000));
  console.log("Test 3: With buttons");
  chrome.notifications.create("test-3", {
    type: "basic",
    iconUrl: chrome.runtime.getURL("icon/128.png"),
    title: "Test 3",
    message: "Choose an option",
    buttons: [
      { title: "OK" },
      { title: "Cancel" }
    ]
  });
  
  // Test 4: Important (won't auto-close)
  await new Promise(r => setTimeout(r, 2000));
  console.log("Test 4: Won't auto-close");
  chrome.notifications.create("test-4", {
    type: "basic",
    iconUrl: chrome.runtime.getURL("icon/128.png"),
    title: "Test 4",
    message: "This won't auto-close",
    requireInteraction: true
  });
  
  console.log("✅ All tests completed!");
})();
```

## Video Demo

Nếu cần, bạn có thể record lại quá trình test để reference sau này.

Chúc bạn test thành công! 🎉
