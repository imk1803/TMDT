# JobFinder - Nền tảng freelance marketplace (Demo Local)

JobFinder là dự án mô phỏng một nền tảng kết nối **Client** và **Freelancer** theo mô hình marketplace.
Hệ thống hỗ trợ đầy đủ luồng chính: đăng ký/đăng nhập theo vai trò, đăng công việc, gửi đề xuất, chấp nhận đề xuất để tạo hợp đồng, milestone, chat realtime theo hợp đồng, ví và giao dịch demo, thông báo, bảng xếp hạng và gamification.

## Tính năng chính

- Xác thực JWT + phân quyền `ADMIN` / `CLIENT` / `FREELANCER`
- Onboarding sau đăng ký theo vai trò người dùng
- Quản lý hồ sơ freelancer/client
- Job flow hoàn chỉnh:
  - Client tạo công việc
  - Freelancer gửi đề xuất
  - Client duyệt/từ chối đề xuất
  - Tự động tạo hợp đồng khi duyệt đề xuất
- Milestone theo hợp đồng:
  - Trạng thái `PENDING -> IN_PROGRESS -> SUBMITTED -> APPROVED`
  - Thông báo khi submit/approve milestone
- Chat realtime theo từng hợp đồng bằng Socket.IO (có xác thực)
- Notification center + badge số lượng chưa đọc
- Ví (wallet) và giao dịch demo: nạp/rút/ghi log DB
- Ranking + leaderboard + cron tính điểm
- Gamification: points, level, badge, streak, lịch sử điểm
- Giao diện tiếng Việt có dấu, đồng bộ theo visual language của dự án

## Kiến trúc dự án

Monorepo gồm 2 ứng dụng:

- `./` : Frontend Next.js (App Router) chạy cổng `3000`
- `./backend` : Backend API Next.js (Pages API) + Prisma chạy cổng `4000`

Frontend gọi API backend qua biến môi trường `NEXT_PUBLIC_API_BASE_URL`.

## Công nghệ sử dụng

### Frontend

- Next.js `16`
- React `19`
- TypeScript
- Tailwind CSS `4`
- Lucide React
- Socket.IO Client

### Backend

- Next.js `14` (API)
- Node.js + TypeScript
- Prisma ORM
- PostgreSQL
- Zod (validation)
- JWT + bcryptjs
- Socket.IO
- node-cron

## Yêu cầu môi trường

- Node.js `>= 20`
- npm `>= 10`
- PostgreSQL `>= 14`

## Hướng dẫn cài đặt và chạy local

## 1) Clone source

```bash
git clone https://github.com/imk1803/TMDT.git
cd TMDT
```

## 2) Cài dependencies

Cài cho frontend:

```bash
npm install
```

Cài cho backend:

```bash
cd backend
npm install
cd ..
```

## 3) Cấu hình môi trường

Tạo file `./.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000"
```

Tạo file `./backend/.env` (hoặc copy từ `backend/.env.example`):

```env
DATABASE_URL="postgresql://postgres:admin@localhost:5432/fastworkdb"
JWT_SECRET="replace_with_strong_secret"
JWT_REFRESH_SECRET="replace_with_strong_refresh_secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="30d"
BCRYPT_SALT_ROUNDS="12"
```

## 4) Khởi tạo database (Prisma)

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
# tuỳ chọn
npm run seed
cd ..
```

## 5) Chạy backend và frontend

Mở 2 terminal riêng:

Terminal 1 (backend):

```bash
cd backend
npm run dev
```

Terminal 2 (frontend):

```bash
npm run dev
```

Truy cập:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:4000](http://localhost:4000)

## Script hữu ích

### Frontend (`./`)

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run lint:i18n
```

### Backend (`./backend`)

```bash
npm run dev
npm run build
npm run start
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

## Lỗi thường gặp

### 1) `EADDRINUSE: address already in use :::4000`

Đang có backend process chạy sẵn ở cổng `4000`.
Chỉ giữ **1 terminal backend dev** duy nhất.

Windows (PowerShell):

```powershell
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### 2) Frontend báo CORS khi gọi `localhost:4000`

- Kiểm tra backend đã chạy chưa
- Kiểm tra đúng `NEXT_PUBLIC_API_BASE_URL` trong `.env.local`
- Khởi động lại frontend sau khi sửa env

### 3) Prisma không kết nối DB

- Kiểm tra PostgreSQL đã chạy
- Kiểm tra `DATABASE_URL`
- Chạy lại `npm run prisma:migrate`

## Lưu ý

- Dự án hiện tối ưu cho **demo local**, chưa harden cho production.
- Các luồng thanh toán/ví đang ở mức mô phỏng cập nhật DB.

## Đóng góp

- Tạo branch mới từ `main`
- Commit theo từng nhóm thay đổi rõ ràng
- Mở Pull Request mô tả đầy đủ tính năng/sửa lỗi

---

Nếu bạn cần, mình có thể bổ sung thêm phần:

- kiến trúc module chi tiết (diagram)
- API docs dạng bảng endpoint
- hướng dẫn deploy lên VPS (PM2 + Nginx + SSL)
