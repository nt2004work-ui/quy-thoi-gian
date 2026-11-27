# Quỹ thời gian

Quản lý thời gian trong ngày: chấm công vào/ra, tính lương theo giờ, việc phụ, năng suất mỗi ngày, kế hoạch tháng, lương thực nhận.
Giao diện Cute Pop (cùng bảng màu với app thu chi), cài được như app (PWA), mở lại được khi mất mạng.
Không cần build: `index.html` + Supabase.

## Triển khai

1. **Supabase**: tạo project mới, vào *SQL Editor*, dán toàn bộ `schema.sql` rồi chạy, sau đó chạy tiếp `cap_nhat.sql`.
2. **Khóa API**: *Project Settings > API*, chép `Project URL` và `anon public key` vào đầu thẻ `<script>` trong `index.html` (`SUPABASE_URL`, `SUPABASE_KEY`). Khóa `anon` được phép công khai vì dữ liệu đã có Row Level Security. Không dùng `service_role`.
3. **Đăng nhập**: *Authentication > Providers > Email* đã bật sẵn. Muốn vào ngay không cần xác nhận email, tắt *Confirm email*.
4. **GitHub**: đẩy cả thư mục lên một repo, *Settings > Pages*, nhánh `main`, thư mục `/ (root)`. Link dạng `https://<tên>.github.io/<repo>/`.
5. **Supabase > Authentication > URL Configuration**: đặt *Site URL* là link GitHub Pages ở trên.
6. **Cài lên điện thoại**: mở link bằng Chrome (Android) chọn *Cài đặt ứng dụng*, hoặc Safari (iPhone) chọn *Chia sẻ > Thêm vào MH chính*.

## PWA và ngoại tuyến

- `sw.js` lưu sẵn giao diện, font và thư viện Supabase (`vendor/`) nên app mở được khi không có mạng.
- Mất mạng: xem được dữ liệu của lần tải gần nhất (lưu trong trình duyệt). **Thêm, sửa, xóa cần có mạng** và app sẽ báo rõ.
- Chấm công: nhập ngày, giờ vào và giờ ra (nút "Bây giờ" điền giờ hiện tại); ra về sau nửa đêm vẫn tính đúng.
- Sau khi sửa `index.html` hoặc file nào trong `sw.js`, **đổi `VERSION` trong `sw.js`** (v1 -> v2) để máy người dùng nhận bản mới.
- Muốn tạo lại icon: `node tools/gen-icons.mjs`. Chạy thử cục bộ: `node tools/serve.mjs` rồi mở http://localhost:5180 (service worker chỉ chạy trên localhost hoặc https).

## Cách tính

- Lương/giờ = lương tháng ÷ (ngày công × giờ/ngày).
- Lương chính thực nhận = giờ việc chính × lương/giờ × (1 − % khấu trừ).
- Việc phụ: tự nhập tiền nhận, không bị khấu trừ.
- Tổng thực nhận = lương chính thực nhận + thu nhập việc phụ.
- Năng suất ngày = (giờ chính + giờ phụ) ÷ giờ chuẩn mỗi ngày.

## Giờ nghỉ và phụ cấp

- **Giờ nghỉ**: nhập theo tiếng (0.5, 1, 1.25...) khi chấm công. Số giờ làm = (giờ ra − giờ vào) − giờ nghỉ, chỉ phần này được tính lương.
- **Phụ cấp** (tab Lương): thêm nhiều khoản tùy ý, mỗi khoản một số tiền cho mỗi ngày. Cộng cho mỗi ngày có ghi giờ việc chính, không bị khấu trừ. Sửa trực tiếp tên hoặc số tiền trong danh sách. Phụ cấp lấy theo mức hiện tại, đổi mức sẽ áp dụng cho cả tháng đang xem.
- Project Supabase đã chạy `schema.sql` bản cũ: chạy thêm `cap_nhat.sql`.

## Lịch hằng ngày (tab Lịch)

- Bảng kiểu trang tính cho từng ngày: ✓ · Giờ · Việc cần làm · các cột tự thêm (Ghi chú, Địa điểm...). Gõ thẳng vào ô để sửa, kéo ngang nếu nhiều cột.
- "+ Thêm cột" tạo cột mới dùng cho mọi ngày; đổi tên bằng cách gõ vào tiêu đề cột, xóa bằng dấu ×.
- Nếu Supabase chưa chạy `cap_nhat.sql`, app vẫn lưu được việc và ca làm nhưng ẩn cột giờ, cột tùy chỉnh và hiện nhắc chạy SQL.
