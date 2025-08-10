# Tính năng Multi-Account (Nhiều tài khoản)

## Tổng quan

Phiên bản mới của Google Cloud Skills Boost Helper đã được cải thiện để hỗ trợ quản lý nhiều tài khoản Google Cloud Skills Boost. Người dùng có thể dễ dàng chuyển đổi giữa các tài khoản khác nhau và theo dõi tiến trình của từng tài khoản một cách riêng biệt.

## Tính năng chính

### 1. Quản lý nhiều tài khoản

- **Thêm tài khoản mới**: Dễ dàng thêm tài khoản bằng cách nhập URL profile công khai
- **Đặt tên và biệt danh**: Có thể đặt tên hiển thị và biệt danh cho từng tài khoản để dễ nhận biết
- **Xóa tài khoản**: Xóa tài khoản không còn sử dụng (không thể xóa tài khoản cuối cùng)

### 2. Chuyển đổi tài khoản

- **Account Switcher**: Dropdown menu cho phép chuyển đổi nhanh giữa các tài khoản
- **Hiển thị trong Popup**: Có thể chuyển đổi tài khoản ngay từ popup extension
- **Hiển thị trong Options**: Quản lý đầy đủ tài khoản trong trang options

### 3. Đồng bộ hóa dữ liệu

- **Tự động đồng bộ**: Dữ liệu arcade points của mỗi tài khoản được đồng bộ và lưu trữ riêng biệt
- **Hiển thị realtime**: Thông tin của tài khoản hiện tại được hiển thị ngay lập tức khi chuyển đổi

### 4. Import/Export

- **Xuất dữ liệu**: Xuất toàn bộ dữ liệu tài khoản ra file JSON
- **Nhập dữ liệu**: Nhập dữ liệu từ file JSON hoặc từ text
- **Backup & Restore**: Dễ dàng backup và khôi phục dữ liệu

## Cách sử dụng

### Thêm tài khoản mới

1. Mở trang **Options** của extension
2. Trong phần **"Quản lý tài khoản"**, click nút **"Thêm tài khoản"**
3. Nhập thông tin:
   - **Tên hiển thị** (tùy chọn): Tên để hiển thị trong danh sách
   - **Biệt danh** (tùy chọn): Tên ngắn gọn để dễ nhận biết
   - **URL Profile**: Link đến profile công khai của bạn trên Google Cloud Skills Boost
4. Click **"Thêm tài khoản"**

### Chuyển đổi tài khoản

#### Từ Options page:

- Sử dụng dropdown **"Tài khoản hiện tại"** để chọn tài khoản khác

#### Từ Popup:

- Click vào dropdown **"Tài khoản"** ở đầu popup để chuyển đổi

### Quản lý tài khoản

#### Chỉnh sửa tài khoản:

1. Chọn tài khoản cần chỉnh sửa
2. Click icon **chỉnh sửa** (✏️) bên cạnh thông tin tài khoản
3. Cập nhật tên hoặc biệt danh
4. Click **"Lưu thay đổi"**

#### Xóa tài khoản:

1. Chọn tài khoản cần xóa
2. Click icon **xóa** (🗑️) bên cạnh thông tin tài khoản
3. Xác nhận xóa trong dialog

### Import/Export dữ liệu

#### Xuất dữ liệu:

1. Click nút **"Xuất"** trong phần quản lý tài khoản
2. File JSON sẽ được tải xuống tự động

#### Nhập dữ liệu:

1. Click nút **"Nhập"** trong phần quản lý tài khoản
2. Chọn file JSON hoặc dán nội dung JSON vào textarea
3. Click **"Nhập dữ liệu"**

## Cấu trúc dữ liệu mới

### Account Object

```typescript
interface Account {
  id: string; // ID duy nhất của tài khoản
  name: string; // Tên hiển thị
  nickname?: string; // Biệt danh (tùy chọn)
  profileUrl: string; // URL profile công khai
  arcadeData?: ArcadeData; // Dữ liệu arcade points
  createdAt: string; // Thời gian tạo
  lastUsed: string; // Lần sử dụng cuối
}
```

### AccountsData Structure

```typescript
interface AccountsData {
  accounts: Record<string, Account>; // Danh sách tài khoản theo ID
  activeAccountId: string | null; // ID tài khoản đang hoạt động
  settings: {
    enableSearchFeature: boolean; // Cài đặt chung
  };
}
```

## Tương thích ngược

Extension vẫn tương thích với dữ liệu của phiên bản cũ:

- Dữ liệu cũ sẽ được tự động migration sang cấu trúc mới
- Tài khoản cũ sẽ trở thành "Tài khoản chính" với tên từ profile
- Các API cũ vẫn hoạt động bình thường

## API Services mới

### AccountService

- `getAllAccounts()`: Lấy danh sách tất cả tài khoản
- `getActiveAccount()`: Lấy tài khoản đang hoạt động
- `setActiveAccount(id)`: Đặt tài khoản hoạt động
- `createAccount(options)`: Tạo tài khoản mới
- `updateAccount(id, updates)`: Cập nhật tài khoản
- `deleteAccount(id)`: Xóa tài khoản
- `exportAccounts()`: Xuất dữ liệu
- `importAccounts(data)`: Nhập dữ liệu

### AccountUIService

- `initializeAccountSwitcher()`: Khởi tạo UI quản lý tài khoản
- `loadAccounts()`: Load danh sách tài khoản vào UI
- `switchAccount(id)`: Chuyển đổi tài khoản
- Các modal và UI components khác

## Migration tự động

Khi extension khởi động lần đầu với phiên bản mới:

1. **Kiểm tra dữ liệu cũ**: Tìm kiếm dữ liệu theo format cũ
2. **Tạo cấu trúc mới**: Khởi tạo `AccountsData` structure
3. **Migration dữ liệu**:
   - Chuyển `urlProfile` và `arcadeData` cũ thành Account mới
   - Đặt làm tài khoản hoạt động
   - Giữ nguyên settings cũ
4. **Hoàn tất**: Dữ liệu cũ vẫn được giữ để tương thích

## Lưu ý quan trọng

- **Backup dữ liệu**: Nên xuất dữ liệu thường xuyên để backup
- **URL Profile**: Phải là link công khai và hợp lệ
- **Tài khoản cuối cùng**: Không thể xóa tài khoản cuối cùng
- **Chuyển đổi tài khoản**: Sẽ reload một số UI để cập nhật dữ liệu

## Troubleshooting

### Không thể thêm tài khoản

- Kiểm tra URL profile có đúng format không
- Đảm bảo profile được công khai
- Kiểm tra kết nối internet

### Dữ liệu không đồng bộ

- Thử refresh extension
- Kiểm tra permissions của extension
- Xóa cache và reload

### Import không thành công

- Kiểm tra format file JSON
- Đảm bảo file không bị lỗi
- Thử nhập từng phần nhỏ

## Cải tiến trong tương lai

- **Cloud Sync**: Đồng bộ dữ liệu qua cloud
- **Team Management**: Quản lý nhóm tài khoản
- **Advanced Analytics**: Phân tích chi tiết progress
- **Notifications**: Thông báo khi có cập nhật mới
- **Bulk Operations**: Thao tác hàng loạt trên nhiều tài khoản
