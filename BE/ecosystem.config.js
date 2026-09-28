module.exports = {
  apps: [
    {
      name: "fastapi-backend",
      script: "venv\\Scripts\\python.exe",
      args: "-m uvicorn app.main:app --host 0.0.0.0 --port 8000",
      cwd: ".", // Đảm bảo PM2 lấy đúng thư mục hiện tại làm gốc
      watch: false
    }
  ]
}