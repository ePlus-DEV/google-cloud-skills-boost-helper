# CloudSkills AutoScript

CloudSkills AutoScript là một tiện ích mở rộng cho Chrome tự động chỉnh sửa trang CloudSkillsBoost Labs với các tùy chọn bật/tắt. Nó cho phép người dùng bật hoặc tắt script, ẩn hoặc hiển thị bảng xếp hạng, và cung cấp phản hồi trực quan về trạng thái của script.

## Tính năng

- Bật hoặc tắt script từ popup.
- Ẩn hoặc hiển thị bảng xếp hạng trên CloudSkillsBoost Labs.
- Phản hồi trực quan về trạng thái của script.

## Cài đặt

1. Clone repository hoặc tải file ZIP.
2. Mở Chrome và điều hướng đến `chrome://extensions/`.
3. Bật "Chế độ nhà phát triển" bằng cách bật công tắc ở góc trên bên phải.
4. Nhấp vào "Tải tiện ích đã giải nén" và chọn thư mục chứa các file tiện ích mở rộng.

## Sử dụng

1. Nhấp vào biểu tượng tiện ích để mở popup.
2. Sử dụng công tắc bật/tắt để bật hoặc tắt script.
3. Script sẽ tự động chỉnh sửa trang CloudSkillsBoost Labs dựa trên trạng thái của công tắc.
4. Biểu tượng tiện ích sẽ hiển thị huy hiệu cho biết script đang bật ("ON") hay tắt ("OFF").

## Đa ngôn ngữ

Tiện ích hỗ trợ nhiều ngôn ngữ. Các ngôn ngữ có sẵn:

- Tiếng Anh (en)
- Tiếng Pháp (fr)
- Tiếng Việt (vi)

## Các file

- `background.js`: Xử lý các tác vụ nền, chẳng hạn như inject content script và cập nhật huy hiệu tiện ích.
- `content.js`: Chỉnh sửa trang CloudSkillsBoost Labs dựa trên trạng thái bật/tắt của script.
- `_locales/`: Chứa các file localization cho các ngôn ngữ khác nhau.
- `manifest.json`: File manifest cho tiện ích Chrome.

## Giấy phép

Dự án này được cấp phép theo Giấy phép MIT.
