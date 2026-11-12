# 🎞️ CinéRoll · Drawn (그려본다) 35mm Slideshow

> Website trình chiếu hình ảnh phong cách cuộn phim nhựa 35mm điện ảnh lãng mạn, kết hợp lời bài hát khổng lồ chìm trong nền và ca khúc **THAMA - Drawn (OST Part 3)**.

![CinéRoll 35mm Preview](public/assets/aistudio/5a7fb318ebc51861b22676dd5b0b1fc0_09e7c4cf.jpg)

---

## ✨ Điểm Nổi Bật (Features)

- **Cuộn phim dọc 35mm chân thực (Vertical Film Strip):**
  - Mô phỏng cơ học với lỗ đục phim 35mm (sprocket holes) chạy dọc 2 bên.
  - Thông số kỹ thuật phim điện ảnh cổ điển (`FRAME 01A`, `KODAK 35MM SAFETY FILM`, `ISO 400`).
  - Chuyển động cuộn trôi êm ả, mượt mà ở 60fps với cơ chế cuộn vô tận (seamless infinite loop).
  - Nhấp vào dải phim để Tạm dừng hoặc Tiếp tục cuộn phim bất kỳ lúc nào.
- **Lời bài hát nền khổ lớn (Ambient Background Lyrics):**
  - Toàn bộ lời bài hát **THAMA - Drawn (그려본다)** cuộn trôi liên tục ở lớp nền phía sau.
  - Kích thước chữ to bản (responsive clamp) trải rộng vừa khít màn hình, dải phim 35mm che phần giữa để lộ chữ rõ nét ở hai bên sườn.
- **Tích hợp nhạc nền tự động (Audio Player):**
  - Phát bản nhạc **THAMA - Drawn OST Part 3** trực tiếp với thanh điều khiển tối giản ở góc dưới (Phát / Tạm dừng và điều chỉnh âm lượng).
- **Tối giản & Đậm chất điện ảnh:**
  - Không có thanh công cụ rườm rà, tập trung 100% vào cảm xúc của hình ảnh và âm nhạc.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Framework:** [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler:** [Vite 8](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Fonts:** Outfit, Playfair Display, Space Mono

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Getting Started)

### 1. Yêu Cầu Môi Trường
- [Node.js](https://nodejs.org/) (phiên bản 18+ hoặc 20+)
- npm, yarn, hoặc pnpm

### 2. Cài Đặt
```bash
# Clone repository về máy tính
git clone https://github.com/<username>/<repo-name>.git

# Di chuyển vào thư mục dự án
cd <repo-name>

# Cài đặt các thư viện phụ thuộc
npm install
```

### 3. Khởi Chạy Môi Trường Phát Triển (Development)
```bash
npm run dev
```
Mở trình duyệt và truy cập: `http://localhost:3000`

### 4. Đóng Gói Sản Phẩm (Build Production)
```bash
npm run build
```
Thư mục xuất ra sẵn sàng để deploy là `dist/`.

---

## 🌐 Hướng Dẫn Đưa Lên GitHub (Push to GitHub)

Nếu bạn vừa tải mã nguồn về và muốn tạo mới một repo trên GitHub của mình:

1. Đăng nhập [GitHub](https://github.com) và tạo một **New repository** (ví dụ đặt tên là `cineroll-drawn-slideshow`).
2. Mở terminal tại thư mục dự án này và chạy các lệnh sau:

```bash
# Khởi tạo git (nếu chưa có)
git init

# Đặt nhánh mặc định là main
git branch -M main

# Thêm tất cả tệp vào git
git add .

# Tạo commit đầu tiên
git commit -m "feat: Initial commit for CinéRoll 35mm Slideshow with THAMA - Drawn OST"

# Liên kết với kho lưu trữ GitHub của bạn (thay bằng link repo của bạn)
git remote add origin https://github.com/<username>/<repo-name>.git

# Đẩy code lên GitHub
git push -u origin main
```

---

## ☁️ Triển Khai Miễn Phí (Deploy to Vercel / Netlify)

Dự án này tương thích 100% với các nền tảng hosting tĩnh hiện đại:

### Triển khai lên Vercel:
1. Đăng nhập [Vercel](https://vercel.com).
2. Chọn **Add New Project** ➔ Chọn repository GitHub vừa tạo.
3. Vercel sẽ tự động phát hiện `Vite`:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Nhấn **Deploy** ➔ Trang web sẽ hoạt động trực tiếp sau 1 phút!

---

## 📝 Giấy Phép & Bản Quyền (License)

Dự án này phục vụ mục đích học tập, sáng tạo cá nhân và trình chiếu nghệ thuật hình ảnh / âm nhạc.
