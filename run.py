import sys
import subprocess
import signal
import time

print("=" * 60)
print("⚡ TechPrice Thailand - Starting Backend + Frontend (One Command)")
print("=" * 60)

backend_cmd = [sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"]
frontend_cmd = ["npm", "--prefix", "frontend", "run", "dev"]

print("\n🚀 [1/2] Starting Backend FastAPI on http://localhost:8000 ...")
backend_proc = subprocess.Popen(backend_cmd)

time.sleep(2)

print("🎨 [2/2] Starting Frontend React + Vite on http://localhost:3000 ...")
frontend_proc = subprocess.Popen(frontend_cmd, shell=True)

print("\n" + "=" * 60)
print("✅ SYSTEM READY:")
print("   • Web Frontend: http://localhost:3000 (หรือ http://localhost:8000)")
print("   • REST API:     http://localhost:8000")
print("   • API Docs:     http://localhost:8000/docs")
print("   • กด Ctrl+C เพื่อหยุดการทำงานทั้งสองเซิร์ฟเวอร์พร้อมกัน")
print("=" * 60 + "\n")

def shutdown(signum, frame):
    print("\n🛑 Shutting down servers...")
    try:
        backend_proc.terminate()
        frontend_proc.terminate()
    except Exception:
        pass
    sys.exit(0)

signal.signal(signal.SIGINT, shutdown)
signal.signal(signal.SIGTERM, shutdown)

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    shutdown(None, None)
