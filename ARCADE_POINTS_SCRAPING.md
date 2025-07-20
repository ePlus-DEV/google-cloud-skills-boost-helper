# Cách Đếm Điểm Arcade Point Không Thông Qua API

## Tổng quan

Dự án Google Cloud Skills Boost Helper hỗ trợ nhiều cách để đếm điểm Arcade Point:

1. **Phương pháp API** (mặc định) - Sử dụng API external để tính điểm
2. **Phương pháp Web Scraping** (mới) - Trích xuất trực tiếp từ trang profile
3. **Phương pháp Auto-Detection** (mới) - Tự động phát hiện và cập nhật điểm

## 1. Phương pháp Web Scraping

### ArcadeScrapingService

Service này cho phép trích xuất điểm arcade trực tiếp từ trang profile công khai của Google Cloud Skills Boost mà không cần API.

#### Cách hoạt động:

```typescript
import { ArcadeScrapingService } from "./services";

// Scrape từ URL profile
const profileUrl = "https://www.cloudskillsboost.google/public_profiles/xxx";
const arcadeData = await ArcadeScrapingService.scrapeArcadeData(profileUrl);

// Hoặc scrape từ trang hiện tại
const currentData = ArcadeScrapingService.extractArcadeDataFromCurrentPage();
```

#### Tính năng chính:

- **Trích xuất thông tin user**: Tên, avatar, league
- **Phát hiện badges**: Tự động tìm và phân loại badges
- **Tính điểm theo loại badge**:
  - Arcade Game badges: 1 điểm
  - Trivia badges: 1 điểm
  - Skill badges: 5 điểm
  - Special/Quest badges: 3 điểm
  - Lab completion: 1-2 điểm
  - Certificate/Course: 10+ điểm

#### Thuật toán phát hiện badges:

1. **Selector chính**: Tìm các element với class như `.badge-card`, `.achievement-card`, `.earned-badge`
2. **Fallback detection**: Quét tất cả images có từ khóa liên quan đến badge
3. **Smart classification**: Phân loại badge dựa trên title và URL của image

## 2. Phương pháp Auto-Detection

### ProfileDetectionService

Service này tự động phát hiện khi user đang ở trên trang Google Cloud Skills Boost và scrape điểm real-time.

#### Cách hoạt động:

```typescript
import { ProfileDetectionService } from "./services";

// Khởi tạo auto-detection
await ProfileDetectionService.initialize();

// Manual trigger
const data = await ProfileDetectionService.manualCheck();
```

#### Tính năng chính:

- **Phát hiện trang liên quan**: Tự động chạy khi ở trên profile pages
- **Mutation Observer**: Theo dõi khi badges được load động
- **Periodic Updates**: Kiểm tra định kỳ mỗi 30 giây
- **Smart Updates**: Chỉ cập nhật khi có badges mới hoặc điểm tăng
- **Background Processing**: Chạy ngầm không ảnh hưởng user experience

## 3. Cách sử dụng trong Extension

### PopupService đã được cập nhật:

```typescript
// Sử dụng cả API và scraping (fallback)
await PopupService.refreshData();

// Chỉ sử dụng scraping
await PopupService.refreshDataByScraping();
```

### Content Script tự động khởi tạo:

Khi user vào các trang:

- `https://www.cloudskillsboost.google/public_profiles/*`
- `https://www.cloudskillsboost.google/profile*`
- `https://www.cloudskillsboost.google/my_account/profile*`

Extension sẽ tự động:

1. Phát hiện badges trên trang
2. Tính toán điểm arcade
3. Lưu vào storage
4. Thông báo cho popup (nếu đang mở)

## 4. Ưu điểm của Web Scraping

### So với API:

- ✅ **Không phụ thuộc external service**
- ✅ **Realtime data** - Cập nhật ngay khi có badge mới
- ✅ **No API limits** - Không giới hạn request
- ✅ **Privacy** - Không gửi data ra ngoài
- ✅ **Offline capable** - Có thể cache data local

### Nhược điểm:

- ⚠️ **Phụ thuộc DOM structure** - Có thể break nếu Google thay đổi UI
- ⚠️ **Performance** - Scraping có thể chậm hơn API
- ⚠️ **Maintenance** - Cần update khi có thay đổi UI

## 5. Configuration và Customization

### Tùy chỉnh điểm số:

Có thể thay đổi logic tính điểm trong `calculateBadgePoints()`:

```typescript
private static calculateBadgePoints(title: string, imageURL: string): number {
  const titleLower = title.toLowerCase();

  // Custom logic
  if (titleLower.includes('special-event')) {
    return 10; // Special event badges = 10 points
  }

  // Default logic...
}
```

### Thêm badge selectors:

Có thể thêm selector mới trong `extractBadges()`:

```typescript
const badgeSelectors = [
  ".badge-card",
  ".achievement-card",
  ".new-badge-selector", // Add new selector
  // ...
];
```

## 6. Debugging và Monitoring

### Console logs:

Service sẽ log thông tin chi tiết:

```
ArcadeScrapingService: Found 15 badges
ProfileDetectionService: New content detected, checking for badges...
ProfileDetectionService: Updated stored arcade data
```

### Storage inspection:

Check stored data:

```typescript
import { StorageService } from "./services";

const data = await StorageService.getArcadeData();
console.log("Stored arcade data:", data);
```

## 7. Error Handling

### Graceful fallbacks:

1. **API fails** → Try scraping
2. **Scraping fails** → Show cached data
3. **No badges found** → Show "No data available"
4. **Parse error** → Log error, continue with existing data

### CORS Issues:

Nếu gặp CORS khi scrape external URLs, extension đã được config với appropriate permissions trong `manifest.json`.

## 8. Future Enhancements

### Có thể mở rộng:

- **Caching strategy** - Smart cache với TTL
- **Background sync** - Định kỳ sync data
- **Comparison mode** - So sánh với bạn bè
- **Export functionality** - Export data ra CSV/JSON
- **Achievement tracking** - Theo dõi progress các achievements

---

Với các phương pháp trên, extension có thể hoạt động độc lập không cần API external, đảm bảo privacy và performance tốt hơn cho người dùng.
