# 📊 Hướng Dẫn CSV Export - Google Cloud Skills Boost

## 🎯 Mục đích

Tài liệu này hướng dẫn cách sử dụng tính năng xuất CSV để tổng hợp và tính toán arcade points từ badges.

## 📁 Files CSV Mẫu

### 1. `google-cloud-badges-sample.csv` - Chi tiết tất cả badges

Chứa thông tin chi tiết về từng badge:

| Cột           | Mô tả               | Ví dụ                                                                    |
| ------------- | ------------------- | ------------------------------------------------------------------------ |
| Badge Name    | Tên badge           | "Skills Boost Arcade Base Camp July 2025"                                |
| Category      | Loại badge          | "Arcade Monthly/Game", "Weekly Trivia", "Skill Badge", "Special Edition" |
| Arcade Points | Điểm arcade         | 1, 0.5, 2                                                                |
| Earned Date   | Ngày đạt badge      | "Jul 14, 2025 EDT"                                                       |
| Image URL     | Link hình ảnh badge | "https://cdn.qwiklabs.com/..."                                           |

### 2. `arcade-points-summary-sample.csv` - Tổng hợp điểm

Tóm tắt tổng điểm theo từng category:

| Category                      | Total Points |
| ----------------------------- | ------------ |
| Weekly Trivia                 | 5            |
| Arcade Monthly/Game/Base Camp | 4            |
| Special Edition               | 4            |
| Skill Badges                  | 5            |
| **TOTAL**                     | **18**       |

## 🔧 Cách sử dụng CSV Export Service

### Trong Browser Console:

```javascript
// 1. Lấy data từ trang hiện tại
const data = ArcadeScrapingService.extractArcadeDataFromCurrentPage();

// 2. Export detailed badges CSV
CSVExportService.exportBadgesCSV(data.badges, "my-badges.csv");

// 3. Export summary CSV
CSVExportService.exportSummaryCSV(data.arcadePoints, "my-summary.csv");

// 4. Export cả hai (full report)
CSVExportService.exportFullReport(data.badges, data.arcadePoints);
```

### Trong Extension Code:

```typescript
import CSVExportService from "../services/csvExportService";

// Export badges từ stored data
const exportBadges = async () => {
  const data = await StorageService.getArcadeData();
  if (data.badges) {
    CSVExportService.exportBadgesCSV(data.badges);
  }
};
```

## 📋 Quy tắc tính điểm Arcade

### Official Rules:

1. **Weekly Trivia** = 1 điểm / badge
2. **Arcade Monthly/Game/Base Camp** = 1 điểm / badge
3. **Special Edition** = 2 điểm / badge
4. **Skill Badges** = 2 badges = 1 điểm (0.5 điểm/badge)

### Ví dụ tính toán:

```
5 Trivia badges × 1 = 5 điểm
4 Game/Base Camp badges × 1 = 4 điểm
2 Special Edition badges × 2 = 4 điểm
10 Skill badges ÷ 2 = 5 điểm
TỔNG = 18 arcade points
```

## 📊 Categories trong CSV

### Weekly Trivia

- Skills Boost Arcade Trivia [Month] [Year] Week [Number]
- Ví dụ: "Skills Boost Arcade Trivia July 2025 Week 3"

### Arcade Monthly/Game

- Skills Boost Arcade Game [Month] [Year]
- Skills Boost Arcade Base Camp [Month] [Year]
- Google Cloud Arcade Facilitator [Month] [Year]

### Special Edition

- ExtraSkillestrial!
- Google I/O Extended [Year] Challenge
- Các badge có từ khóa: extra, special, bonus, festival, challenge

### Skill Badge

- Level [Number]: [Title]
- [Service Name]: Qwik Start
- Professional certification paths

## 🔄 Cách import CSV để tính toán

### Trong Excel/Google Sheets:

1. **Import CSV file**
   - File → Import → CSV
   - Chọn delimiter là comma (,)

2. **Tính tổng điểm theo category:**

   ```excel
   =SUMIF(B:B,"Weekly Trivia",C:C)     // Tổng Trivia
   =SUMIF(B:B,"Arcade Monthly/Game",C:C) // Tổng Game
   =SUMIF(B:B,"Special Edition",C:C)    // Tổng Special
   =SUMIF(B:B,"Skill Badge",C:C)        // Tổng Skill
   ```

3. **Đếm số badges theo category:**
   ```excel
   =COUNTIF(B:B,"Weekly Trivia")        // Số Trivia badges
   =COUNTIF(B:B,"Skill Badge")          // Số Skill badges
   ```

### Trong Python:

```python
import pandas as pd

# Đọc CSV
df = pd.read_csv('google-cloud-badges.csv')

# Tổng điểm theo category
summary = df.groupby('Category')['Arcade Points'].agg(['sum', 'count'])
print(summary)

# Tổng arcade points
total_points = df['Arcade Points'].sum()
print(f"Total Arcade Points: {total_points}")
```

## 📈 Tracking Progress

### Mục tiêu Arcade Points cho các League:

| League   | Points Required |
| -------- | --------------- |
| Bronze   | 5 points        |
| Silver   | 15 points       |
| Gold     | 25 points       |
| Platinum | 40 points       |
| Diamond  | 60+ points      |

### Template tracking tháng:

```
Tháng: July 2025
Target League: Gold (25 points)
Current Points: 18 points
Còn cần: 7 points

Plan:
- Trivia Week 4: +1 point
- 2 Special Edition badges: +4 points
- 4 Skill badges: +2 points
= 25 points (Gold League) ✅
```

## 🔧 Tùy chỉnh CSV Export

### Thêm custom fields:

```typescript
// Trong csvExportService.ts
export interface CustomCSVData extends CSVBadgeData {
  monthEarned: string;
  yearEarned: string;
  weekNumber?: number;
}

// Custom export với thêm thông tin
static exportCustomCSV(badges: BadgeData[]): void {
  const customData = badges.map(badge => ({
    ...this.convertBadgesToCSV([badge])[0],
    monthEarned: this.extractMonth(badge.dateEarned),
    yearEarned: this.extractYear(badge.dateEarned),
    weekNumber: this.extractWeek(badge.title)
  }));

  // Generate và download custom CSV
}
```

## ⚠️ Lưu ý quan trọng

1. **Skill Badge Pairing**: 2 skill badges = 1 arcade point
2. **Base Camp Rule**: Base Camp badges = 1 arcade point (như Game badges)
3. **Date Format**: Dates theo format "Mon DD, YYYY EDT"
4. **CSV Encoding**: Files được lưu với UTF-8 encoding
5. **Image URLs**: Có thể không chính xác 100%, chỉ để tham khảo

## 🎯 Use Cases

### 1. Monthly Progress Tracking

- Export CSV cuối mỗi tháng
- So sánh với tháng trước
- Theo dõi xu hướng đạt badges

### 2. Team/Group Analysis

- Tập hợp CSV từ nhiều thành viên
- So sánh performance
- Xác định badges phổ biến

### 3. Personal Goal Setting

- Phân tích gaps để đạt target league
- Lập kế hoạch training
- Track completion rate

---

**📊 Happy Badge Tracking!** 🏆
