# Google Search Feature for Labs Without Solutions

## Overview

Khi một lab không có solution có sẵn trong hệ thống, extension sẽ hiển thị các nút tìm kiếm để giúp người dùng tìm được hướng dẫn từ các nguồn bên ngoài.

## Features

### 1. Google Search Button

- **Mục đích**: Tìm kiếm solution trên Google với query được tối ưu hóa
- **Query logic**:
  - Sử dụng tên lab làm base query
  - Thêm keywords dựa trên platform (Google Cloud, AWS, Azure)
  - Tối ưu với các site phổ biến: Medium, GitHub, StackOverflow, Qwiklabs
- **Example query**: `"Create VM Instance on Google Cloud" Google Cloud Platform solution tutorial site:medium.com OR site:github.com`

### 2. YouTube Search Button

- **Mục đích**: Tìm video hướng dẫn trên YouTube
- **Query logic**:
  - Sử dụng tên lab + keywords phù hợp với video format
  - Thêm "tutorial walkthrough demo" để tìm video chi tiết
- **Example query**: `"Create VM Instance on Google Cloud" Google Cloud tutorial walkthrough`

## UI Display

Khi không có solution:

```
[No solution] [🔍 Google Search] [📺 YouTube]
```

Khi có solution:

```
[Solution this lab]
```

## Implementation Details

### Files Modified

- `components/uiComponents.ts`: Thêm logic hiển thị và các hàm search
- `entrypoints/content.ts`: Expose UIComponents globally để onclick handlers hoạt động

### Methods Added

- `UIComponents.searchOnGoogle()`: Mở Google search với query tối ưu
- `UIComponents.searchOnYouTube()`: Mở YouTube search với query tối ưu

### Error Handling

- Try-catch cho các hàm search
- Fallback queries khi không thể lấy được lab title
- Console logging để debug

## Benefits

1. **Better User Experience**: Người dùng không bị "bỏ lại" khi không có solution
2. **Smart Queries**: Query được tối ưu dựa trên loại lab và platform
3. **Multiple Options**: Cả text-based (Google) và video-based (YouTube) resources
4. **Platform Awareness**: Detect và tối ưu query cho Google Cloud, AWS, Azure
5. **Site-specific Search**: Ưu tiên các nguồn chất lượng cao

## Usage

Extension sẽ tự động hiển thị các nút search khi:

1. Đang ở trang lab
2. Không tìm thấy solution từ database hiện tại
3. Lab page được load thành công
