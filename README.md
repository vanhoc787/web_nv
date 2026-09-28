# Loan Management Web

Ứng dụng quản lý khoản vay gồm backend FastAPI và frontend React/Vite.

## Yêu cầu

- Python 3.13 (khuyến nghị)
- Node.js 22.12 trở lên và npm
- PostgreSQL đang chạy

## Cài đặt và chạy Backend

1. Tạo database PostgreSQL tên `loan_DB_web` bằng pgAdmin hoặc chạy trong `psql`:

   ```sql
   CREATE DATABASE loan_DB_web;
   ```

2. Tạo hoặc cập nhật file `BE/.env`:

   ```env
   DATABASE_URL=postgresql+psycopg://postgres:<MAT_KHAU>@localhost:5432/loan_DB_web
   SECURITY_ALGORITHM=HS256
   SECRET_KEY=<CHUOI_BI_MAT_NGAU_NHIEN>
   ```

   Thay thông tin kết nối PostgreSQL cho phù hợp. Có thể tạo secret bằng lệnh `python -c "import secrets; print(secrets.token_urlsafe(32))"`.

3. Cài dependencies và khởi động backend trong PowerShell:

   ```powershell
   cd BE
   py -3.13 -m venv .venv
   .\.venv\Scripts\Activate.ps1
   python -m pip install --upgrade pip
   python -m pip install -r requirements.txt
   python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

   Khi khởi động lần đầu, backend tạo các bảng cần thiết trong database. Tài liệu API có tại <http://localhost:8000/docs>.

## Cài đặt và chạy Frontend

Mở một terminal khác tại thư mục dự án:

```powershell
cd FE
npm ci
npm run dev
```

Mở <http://localhost:5173> trong trình duyệt. Frontend hiện gọi API tại `http://localhost:8000`, cấu hình trong `FE/src/config/api.js`; nếu đổi địa chỉ hoặc cổng backend, cập nhật URL tại file đó.

## Đăng nhập lần đầu

Khi database chưa có user, backend tự tạo tài khoản quản trị:

- Username: `admin`
- Password: `123456`

Đổi mật khẩu mặc định ngay sau khi đăng nhập. Nếu user `admin` đã tồn tại, backend không tự ghi đè mật khẩu.

## Kiểm tra Frontend

Trong thư mục `FE`, có thể chạy:

```powershell
npm run build
npm run lint
```

Để chạy backend ở chế độ thông thường thay vì tự reload khi sửa code, bỏ tùy chọn `--reload` khỏi lệnh Uvicorn.