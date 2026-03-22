# 🌟 FastJob - Nền tảng Freelance Marketplace (Fullstack Next.js)

FastJob là một dự án ứng dụng web toàn diện mô phỏng nền tảng kết nối **Client (Khách hàng)** và **Freelancer (Người làm tự do)** theo mô hình marketplace chuyên nghiệp (tương tự như Upwork, Fiverr). 

Hệ thống cung cấp một luồng làm việc khép kín từ khâu Đăng tin tuyển dụng -> Ứng tuyển -> Ký kết Hợp đồng -> Bàn giao sản phẩm theo từng Giai đoạn (Milestone) -> Thanh toán -> Đánh giá đối tác. Đồng thời tích hợp thêm các công cụ tương tác thời gian thực như Chat, Thông báo, tích hợp Ví điện tử nội bộ, và Bảng điều khiển Quản trị toàn diện.

---

## 🚀 Tính năng nổi bật

### 👥 1. Quản lý Tài khoản & Phân quyền (RBAC)
- Khung xác thực bảo mật **JWT (Access/Refresh Token)**.
- Hỗ trợ 3 vai trò phân tách chặt chẽ: `ADMIN` / `CLIENT` / `FREELANCER`.
- Luồng Onboarding thu thập đa dạng thông tin hồ sơ cho user mới sau khi đăng ký.
- Quản lý Hồ sơ năng lực (Portfolio), Level, Kỹ năng, Chứng chỉ của Freelancer.

### 💼 2. Luồng Công việc cốt lõi (Core Flow)
- **Client**: Đăng tải mô tả công việc, ngân sách, yêu cầu kỹ năng.
- **Freelancer**: Gửi Đề xuất (Proposal), Báo giá tự do.
- **Client**: Duyệt/Từ chối đề xuất (Approve/Reject).
- **Hệ thống**: Tự động sinh Hợp đồng điện tử kèm các Giai đoạn thanh toán (Milestones) khi Đề xuất được phê duyệt.

### 📈 3. Quản lý Hợp đồng & Milestone
- Chia nhỏ dự án thành nhiều Giai đoạn (Milestones).
- Trạng thái bám sát thực tế: `CHƯA BẮT ĐẦU` -> `ĐANG THỰC HIỆN` -> `CHỜ DUYỆT` -> `ĐÃ DUYỆT/THANH TOÁN`.
- Luồng Giải ngân/Yêu cầu làm lại chuyên nghiệp.

### ⚡ 4. Tương tác Thời gian thực (Real-time)
- **Real-time Chat**: Tích hợp module nhắn tin trực tiếp trong phòng làm việc của mỗi Hợp đồng (Sử dụng Socket.io).
- **Notification Center**: Thông báo sự kiện tự động (Push event khi có Đề xuất mới, Hợp đồng cập nhật, Có tin nhắn mới...). Có đếm số lượng chưa đọc.

### 🏆 5. Gamification & System Metrics
- **Hệ thống Đánh giá**: Review sao (1-5) và nhận xét tích lũy chéo giữa Client/Freelancer sau khi hợp đồng hoàn tất.
- **Bảng Xếp Hạng (Leaderboard)**: Top Freelancer dựa trên thu nhập, Job đúng hạn, lượt hoàn thành. Chạy tính toán nền tự động qua Node-Cron.
- **Ranking / Streaks / Points**: Tạo tính hứng thú cày cuốc, giữ chân người dùng.

### 💰 6. Ví nội bộ & Quản lý Giao dịch (Demo)
- Nạp tiền (Credit) / Trừ tiền (Debit) / Thanh toán giải ngân Milestone.
- Log chi tiết biến động số dư.

### 🛠 7. Admin Dashboard Toàn diện
- Giao diện Admin chuyên nghiệp Dark-mode, thống kê chỉ số Analytics như GMV, Doanh thu (Stripe-like UI).
- Quản trị User (Khoá / Mở khoá / Xoá tài khoản).
- Quản lý Job, Hợp đồng, Xử lý vé Yêu cầu Hỗ trợ (Support/Dispute) từ người dùng.

---

## ⚙️ Kiến trúc & Công nghệ

Dự án được ứng dụng mô hình **Monorepo** chia làm 2 thư mục chính:

*   **`./` (Frontend):** Xây dựng trên **Next.js 16 (App Router)**, Tailwind CSS 4, shadcn/ui, Framer Motion, Socket.io-client.
*   **`./backend` (Backend API):** Xây dựng bằng **Next.js 14 (Pages API)**, PostgreSQL, **Prisma ORM**, JWT, Socket.io Server, Zod Validation, Node-Cron vòng lặp.

Frontend gọi API tới logic backend xử lý gián tiếp qua biến môi trường độc lập.

---

## 📦 Hướng dẫn Cài đặt & Khởi chạy (Local)

### 📋 Yêu cầu Môi trường
- **Node.js** >= 20
- **npm** >= 10
- **PostgreSQL** >= 14 đang chạy ngầm trên máy.

### 1️⃣ Clone mã nguồn
```bash
git clone https://github.com/imk1803/TMDT.git
cd TMDT
```

### 2️⃣ Cài đặt thư viện (Dependencies)
_Gói thư viện được cấu hình tách biệt_

Cài đặt cho Frontend:
```bash
npm install
```

Cài đặt cho Backend API:
```bash
cd backend
npm install
cd ..
```

### 3️⃣ Cấu hình Biến môi trường (.env)
Tạo file `.env.local` ở thư mục gốc (Frontend):
```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000"
```

Tạo file `.env` ở thư mục `backend/`:
*(Kết nối PostgreSQL của bạn vào `DATABASE_URL`)*
```env
DATABASE_URL="postgresql://<USER>:<PASSWORD>@localhost:5432/fastworkdb"
JWT_SECRET="super-strong-jwt-secret-key-development"
JWT_REFRESH_SECRET="super-strong-refresh-secret-string"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="30d"
BCRYPT_SALT_ROUNDS="12"
CORS_ORIGIN="http://localhost:3000"
```

### 4️⃣ Khởi tạo Database & Dữ liệu Mẫu (Seed Data)
Di chuyển vào backend, khởi tạo CSDL bằng Prisma và chèn Dữ liệu Mẫu có sẵn (Rất quan trọng để test hệ thống):

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run seed
cd ..
```

### 5️⃣ Khởi động Hệ thống
Bạn cần chạy 2 Terminal song song để Server Backend và UI Frontend cùng hoạt động:

**Terminal 1 (Backend - chạy ở cổng 4000):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend - chạy ở cổng 3000):**
```bash
npm run dev
```

Thưởng thức thành quả:
- Trang chủ người dùng: [http://localhost:3000](http://localhost:3000)
- Backend Endpoints: [http://localhost:4000/api/...](http://localhost:4000/api)

---

## 🧪 Tài khoản Dữ liệu Test (Có sẵn nhờ npm run seed)
Hệ thống `seed` mặc định đã tạo ra hàng chục Job, Contract, User có sẵn. Hãy dùng các thông tin dưới đây để đăng nhập và kiểm tra (Mật khẩu chung cho tất cả là: `password123`):

🔐 **Admin Toàn quyền:**
- Email: `admin@example.com` | Pass: `password123`
*(Vào dashboard tại `/admin/...` xem Analytics)*

💼 **Tài khoản Khách Hàng (Client):**
- Email: `client1@example.com` | Pass: `password123`
- Email: `client2@example.com` | Pass: `password123`
*(Đã đăng các job dự án công nghệ, có sẵn số dư ví)*

👨‍💻 **Tài khoản Freelancer:**
- Email: `freelancer1@example.com` | Pass: `password123`
- Email: `freelancer2@example.com` | Pass: `password123`
*(Gắn sẵn Portfolio, Rank, đang có hợp đồng dở dang)*

---

## 🐛 Xử lý lỗi thường gặp (Troubleshoot)

**1. Lỗi cổng 4000 bị trùng (EADDRINUSE:::4000):**
Xảy ra khi Backend Next.js bị khởi động nhiều lần hoặc ngầm. Tắt tiến trình bằng (Windows):
```powershell
netstat -ano | findstr :4000
taskkill /PID <PID_VỪA_TÌM> /F
```

**2. Frontend gặp lỗi "CORS/Failed to fetch":**
Trình duyệt chặn API vì `localhost:4000` chưa phản hồi. Hãy chắc chắn Terminal Backend đã hiện thông báo `Ready on http://localhost:4000`.

**3. Prisma báo sai Database URL:**
Đảm bảo user/password Postgres trong file `.env` là chính xác với local máy tính của bạn và database `fastworkdb` (hoặc tên tuỳ chỉnh) đã được cấp quyền khởi tạo table.

---

*Dự án được tối ưu hoá theo kiến trúc hiện đại để dễ dàng làm quen với mô hình Marketplace B2B/B2C.* Chúc bạn có một trải nghiệm code vui vẻ! ✨
