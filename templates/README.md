# 📊 Templates CSV - Hướng dẫn sử dụng

## 🎯 Badges Template (`badges-template.csv`)

Template này giúp bạn tự tạo file CSV để tính toán arcade points một cách thủ công.

### Cách sử dụng:

1. **Mở file template**: `badges-template.csv`
2. **Thay thế placeholders**:
   - `[Month]` → Tháng (vd: "July", "June")
   - `[Year]` → Năm (vd: "2025")
   - `[Number]` → Số tuần (vd: "1", "2", "3", "4")
   - `[Date]` → Ngày đạt badge (vd: "Jul 19, 2025")
   - `[Title]` → Tên level/skill
   - `[Service Name]` → Tên service (vd: "BigQuery", "Kubernetes Engine")

3. **Thêm badges thực tế** của bạn
4. **Xóa các dòng không sử dụng**
5. **Import vào Excel/Google Sheets** để tính tổng

### Ví dụ điền thông tin:

```csv
Badge Name,Category,Arcade Points,Earned Date,Image URL
"Skills Boost Arcade Trivia July 2025 Week 3","Weekly Trivia",1,"Jul 19, 2025 EDT",""
"Skills Boost Arcade Base Camp July 2025","Arcade Monthly/Game",1,"Jul 14, 2025 EDT",""
"Level 2: Modern Application Deployment","Skill Badge",0.5,"Jul 19, 2025 EDT",""
"ExtraSkillestrial!","Special Edition",2,"Jul 14, 2025 EDT",""
```

### Quy tắc tính điểm:

| Category            | Points per Badge | Ghi chú                   |
| ------------------- | ---------------- | ------------------------- |
| Weekly Trivia       | 1                | Mỗi tuần 1 badge          |
| Arcade Monthly/Game | 1                | Base Camp cũng = 1 point  |
| Special Edition     | 2                | Các event đặc biệt        |
| Skill Badge         | 0.5              | 2 badges = 1 arcade point |

### Formulas trong Excel/Google Sheets:

```excel
// Tổng điểm theo category
=SUMIF(B:B,"Weekly Trivia",C:C)
=SUMIF(B:B,"Arcade Monthly/Game",C:C)
=SUMIF(B:B,"Special Edition",C:C)
=SUMIF(B:B,"Skill Badge",C:C)

// Tổng tất cả
=SUM(C:C)

// Đếm badges
=COUNTIF(B:B,"Weekly Trivia")
```

### Target Points cho các League:

- **Bronze**: 5 points
- **Silver**: 15 points
- **Gold**: 25 points
- **Platinum**: 40 points
- **Diamond**: 60+ points

---

**Tip**: Sử dụng template này khi bạn muốn:

- Lập kế hoạch training
- Tính toán trước khi làm labs
- So sánh với bạn bè
- Track progress hàng tháng
