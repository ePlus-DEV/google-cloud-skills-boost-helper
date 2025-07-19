# 🎮 Arcade Dashboard Scraping Guide

## 🎯 Tổng quan

Extension bây giờ có thể scrape điểm arcade trực tiếp từ **Arcade Dashboard** tại `https://go.cloudskillsboost.google/arcade` mà không cần vào profile page.

## 🔧 Tính năng mới

### 1. Arcade Dashboard Service
- **File**: `services/arcadeDashboardService.ts`
- **Mục đích**: Scrape tổng điểm arcade từ dashboard chính
- **URL hỗ trợ**: `https://go.cloudskillsboost.google/arcade`

### 2. Auto-detection
- Extension tự động phát hiện khi bạn vào trang arcade dashboard
- Tự động scrape và update điểm arcade points
- Không cần configuration thêm

### 3. Popup Integration
- Thêm button **🎮 Arcade Dashboard** trong popup
- Click để mở arcade dashboard trong tab mới
- Export CSV vẫn hoạt động bình thường

## 📊 Data được scrape

### Arcade Points
```typescript
interface ArcadeDashboardData {
  totalArcadePoints: number;        // Tổng điểm arcade
  currentLeague: string;            // League hiện tại (Bronze, Silver, Gold, Platinum, Diamond)  
  nextLeague?: string;              // League tiếp theo
  pointsToNextLeague?: number;      // Điểm cần để lên league
  progressPercentage?: number;      // % tiến độ
  userDetails?: {
    userName?: string;              // Tên user
    profileImage?: string;          // Avatar URL
  };
  leaderboard?: {
    position?: number;              // Vị trí trên leaderboard  
    totalParticipants?: number;     // Tổng số người tham gia
  };
  gameStatus?: {
    isActive: boolean;              // Game có đang active không
    timeRemaining?: string;         // Thời gian còn lại
    currentEvent?: string;          // Event hiện tại
  };
}
```

## 🚀 Cách sử dụng

### 1. Automatic (Tự động)
```javascript
// Extension tự động chạy khi bạn vào arcade page
// Không cần làm gì, data sẽ được update automatically
```

### 2. Manual (Thủ công)
```javascript
// Trong browser console tại https://go.cloudskillsboost.google/arcade
const data = ArcadeDashboardService.extractArcadeDashboardData();
console.log("Total Points:", data.totalArcadePoints);
console.log("Current League:", data.currentLeague);
```

### 3. Via Extension Popup
1. Click extension icon
2. Click nút **🎮** (Arcade Dashboard) để mở arcade page
3. Arcade points sẽ được auto-update
4. Click **Update Points** để refresh data

## 🔍 Selectors được sử dụng

### Arcade Points Detection
```javascript
const pointsSelectors = [
  '.arcade-points-total',
  '.total-arcade-points', 
  '[data-testid="arcade-points"]',
  '.arcade-score',
  '.points-display .number',
  '.ql-display-large',      // Google Design System
  '.ql-display-medium',
  '.ql-headline-large',
  '.score-number',
  '.total-score',
  '.points-value'
];
```

### League Detection
```javascript
const leagueSelectors = [
  '.current-league',
  '.league-display',
  '.user-league',
  '[data-testid="current-league"]',
  '.league-badge',
  '.tier-display'
];
```

### User Profile
```javascript
const userNameSelectors = [
  '.user-name',
  '.profile-name',
  '[data-testid="user-name"]',
  '.account-name'
];
```

## 📋 Testing

### 1. Live Testing
```javascript
// Chạy trong console tại arcade page
testArcadeDashboardScraping();
```

### 2. Mock Testing  
```javascript
// Test với HTML giả
testWithMockHTML();
```

### 3. Auto Testing
```javascript
// Tự động chọn test phù hợp
runArcadeDashboardTest();
```

## 🔄 Integration với Profile Scraping

### Workflow mới:
1. **Arcade Dashboard** → Scrape tổng điểm arcade
2. **Profile Page** → Scrape chi tiết badges  
3. **Data Merge** → Kết hợp data từ 2 nguồn
4. **CSV Export** → Export tất cả data

### Data Priority:
- **Arcade Points**: Dashboard > Profile calculation
- **Badges Detail**: Profile page only
- **User Info**: Dashboard + Profile merge
- **League Info**: Dashboard preferred

## 🎯 Use Cases

### 1. Quick Points Check
- Vào `https://go.cloudskillsboost.google/arcade`
- Extension auto-scrape total points
- Xem ngay trong popup

### 2. Full Analysis
- Scrape dashboard → get total points
- Scrape profile → get badge details  
- Export CSV → full analysis

### 3. Progress Tracking
- Daily check arcade dashboard
- Auto-update league progression
- Monitor leaderboard position

## ⚙️ Configuration

### Auto-scraping được enable cho:
- `https://go.cloudskillsboost.google/arcade`
- `https://cloudskillsboost.google/public_profiles/*`
- `https://cloudskillsboost.google/profile/*`

### ProfileDetectionService updates:
```typescript
// Automatically detect arcade dashboard
if (ArcadeDashboardService.isArcadeDashboardPage()) {
  const data = ArcadeDashboardService.extractArcadeDashboardData();
  // Merge with existing data and save
}
```

## 🐛 Troubleshooting

### Arcade points không được detect:
1. Check console logs: `ArcadeDashboardService:`
2. Inspect page elements manually
3. Run test: `testArcadeDashboardScraping()`

### League không chính xác:
1. Check if page fully loaded
2. Look for league indicators in page text
3. Manual fallback: inspect `.current-league` elements

### Auto-scraping không hoạt động:
1. Verify URL matches: `go.cloudskillsboost.google/arcade`
2. Check extension permissions
3. Reload extension and page

## 📈 Roadmap

### Planned Features:
- [ ] Arcade event countdown integration
- [ ] Leaderboard position tracking over time
- [ ] Multiple arcade games support
- [ ] Goal setting and progress notifications
- [ ] Historical arcade points chart

---

**🎮 Enjoy effortless arcade point tracking!** 🏆
