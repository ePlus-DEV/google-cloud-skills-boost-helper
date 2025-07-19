# 🚀 Quick Start Guide - Arcade Points Scraping

## Cách sử dụng tính năng scraping mới

### 📱 Trong Extension Popup

1. **Mở extension popup** (click vào icon extension)
2. **Hai buttons để cập nhật điểm**:
   - 🔄 **"Update Points"** - Thử API trước, fallback sang scraping
   - 🔍 **"Scrape" button** - Chỉ dùng scraping (bypass API)

### ⚙️ Trong Options Page

1. **Mở Options** (right-click extension icon → Options)
2. **Nhập Profile URL** của bạn
3. **Hai cách để fetch data**:
   - 💾 **"Save" button** - API + scraping fallback
   - 🔍 **"Scrape" button** - Chỉ scraping

### 🤖 Auto-Detection

Extension sẽ **tự động** scrape khi bạn vào các trang:
- `https://www.cloudskillsboost.google/public_profiles/*`
- `https://www.cloudskillsboost.google/profile*`
- `https://www.cloudskillsboost.google/my_account/profile*`

## 🎯 Khi nào dùng Scraping?

### ✅ Nên dùng Scraping khi:
- API không hoạt động
- Muốn data real-time
- Quan tâm về privacy
- Không muốn phụ thuộc external service

### ⚡ Nên dùng API khi:
- Cần tốc độ nhanh
- API đang hoạt động tốt
- Không quan trọng về privacy

## 🔧 Debug và Test

### Console Commands
```javascript
// Test scraping manual
const data = await ArcadeScrapingService.scrapeArcadeData("profile-url");

// Check current page data
const currentData = ArcadeScrapingService.extractArcadeDataFromCurrentPage();

// Manual trigger auto-detection
const detectedData = await ProfileDetectionService.manualCheck();
```

### Kiểm tra Storage
```javascript
// Xem data đã lưu
import { StorageService } from './services';
const savedData = await StorageService.getArcadeData();
console.log(savedData);
```

## 🚨 Troubleshooting

### ❌ Không scrape được?

1. **Check profile URL** - Phải là public profile
2. **Check console** - Xem có error message không
3. **Refresh page** - Đôi khi cần reload để load badges
4. **Try manual** - Dùng console commands để test

### ⚠️ Điểm không chính xác?

1. **Check badge detection** - Console sẽ log số badges tìm thấy
2. **Verify selectors** - Google có thể đã thay đổi DOM structure
3. **Custom rules** - Có thể cần adjust logic tính điểm

### 🐌 Chậm?

1. **Use API** - API thường nhanh hơn
2. **Check network** - Scraping cần internet connection tốt
3. **Reduce frequency** - Không scrape quá thường xuyên

## 📊 Features Overview

| Feature | Status | Description |
|---------|--------|-------------|
| 🔍 **Basic Scraping** | ✅ | Scrape từ profile URL |
| 🤖 **Auto-Detection** | ✅ | Tự động scrape khi browse |
| 🔄 **API Fallback** | ✅ | API fail → scraping |
| 🎮 **Popup Integration** | ✅ | Buttons trong popup |
| ⚙️ **Options Integration** | ✅ | Settings trong options |
| 💾 **Smart Caching** | ✅ | Chỉ update khi cần |
| 🏷️ **Badge Classification** | ✅ | Phân loại badges thông minh |

## 🎉 Ready to Use!

Extension đã sẵn sàng với tính năng scraping tích hợp. Chỉ cần:

1. ✅ **Build extension** (`yarn build`)
2. ✅ **Load vào browser**
3. ✅ **Nhập profile URL**
4. ✅ **Click scrape button**
5. ✅ **Enjoy real-time arcade points!** 🎯

---

**Happy Scraping! 🕷️✨**
