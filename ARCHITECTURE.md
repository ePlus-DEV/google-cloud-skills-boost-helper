# Code Architecture

## Overview
Code đã được refactor để dễ maintain và có cấu trúc rõ ràng hơn. Các thành phần được tách riêng theo chức năng.

## Structure

```
├── types/              # Type definitions
│   ├── api.ts         # API response types & interfaces
│   ├── popup.ts       # Popup & Options types
│   └── index.ts       # Export all types
│
├── services/          # Business logic services
│   ├── apiClient.ts   # Apollo Client & GraphQL queries
│   ├── searchService.ts # Fuse.js search logic
│   ├── labService.ts  # Lab page processing
│   ├── profileService.ts # Profile page functionality
│   ├── arcadeApiService.ts # Arcade API operations
│   ├── storageService.ts # Storage operations
│   ├── popupUIService.ts # Popup UI operations
│   ├── badgeService.ts # Badge rendering & pagination
│   ├── popupService.ts # Main popup functionality
│   ├── optionsService.ts # Options page functionality
│   └── index.ts       # Export all services
│
├── components/        # UI components
│   ├── uiComponents.ts # Reusable UI elements
│   └── index.ts       # Export all components
│
└── entrypoints/
    ├── content.ts     # Main content script (simplified)
    ├── popup/
    │   └── main.tsx   # Popup script (simplified)
    └── options/
        └── main.tsx   # Options script (simplified)
```

## Key Improvements

### 1. Separation of Concerns
- **Services**: Xử lý business logic
- **Components**: Xử lý UI elements
- **Types**: Type definitions tập trung
- **Main script**: Chỉ orchestrate các services

### 2. Single Responsibility Principle

- `ApiClient`: Chỉ xử lý API calls
- `SearchService`: Chỉ xử lý search logic
- `LabService`: Chỉ xử lý lab page logic
- `ProfileService`: Chỉ xử lý profile page logic
- `ArcadeApiService`: Chỉ xử lý Arcade API operations
- `StorageService`: Chỉ xử lý storage operations
- `PopupUIService`: Chỉ xử lý popup UI operations
- `BadgeService`: Chỉ xử lý badge rendering
- `PopupService`: Main popup orchestration
- `OptionsService`: Main options page orchestration
- `UIComponents`: Chỉ tạo UI elements

### 3. Reusability
- Các service có thể được reuse ở nhiều nơi
- UI components có thể được tái sử dụng
- Type definitions được share giữa các module

### 4. Easy Testing
- Mỗi service có thể được test riêng biệt
- Mock API client dễ dàng
- Isolated business logic

### 5. Better Maintainability
- Code được tổ chức theo module
- Dễ dàng tìm và sửa bug
- Thêm feature mới không ảnh hưởng code cũ
- Clear dependencies giữa các module

## Usage Examples

### Adding New Lab Functionality
```typescript
// In services/labService.ts
static async newFeature(): Promise<void> {
  // Implementation here
}

// In content.ts
if (LabService.isLabPage()) {
  await LabService.processLabPage();
  await LabService.newFeature(); // Easy to add
}
```

### Adding New UI Component
```typescript
// In components/uiComponents.ts
static createNewButton(): HTMLButtonElement {
  // Implementation here
}

// Use anywhere
const button = UIComponents.createNewButton();
```

### Modifying API Logic
```typescript
// All API logic is centralized in services/apiClient.ts
// Easy to modify without affecting other parts
```

## Benefits

1. **Maintainable**: Code dễ đọc, dễ hiểu, dễ sửa
2. **Scalable**: Dễ dàng thêm feature mới
3. **Testable**: Mỗi module có thể test riêng
4. **Reusable**: Components và services có thể tái sử dụng
5. **Type Safe**: TypeScript types được định nghĩa rõ ràng
6. **Professional**: Cấu trúc code chuyên nghiệp, tuân thủ best practices
