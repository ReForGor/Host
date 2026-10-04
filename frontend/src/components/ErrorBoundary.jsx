import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0314] text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-purple-600 selection:text-white relative overflow-hidden">
          {/* Celestial Background Elements */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20" viewBox="0 0 800 800" fill="none">
              <circle cx="400" cy="400" r="380" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="4 8" />
              <circle cx="400" cy="400" r="280" stroke="#06B6D4" strokeWidth="1" strokeDasharray="2 6" />
            </svg>
          </div>

          <div className="relative z-10 max-w-md w-full bg-[#120826]/90 border border-purple-500/30 rounded-3xl p-8 text-center shadow-[0_0_40px_rgba(139,92,246,0.15)] backdrop-blur-sm">
            <div className="w-20 h-20 bg-rose-500/10 rounded-2xl mx-auto flex items-center justify-center mb-6 border border-rose-500/20 shadow-[0_0_20px_rgba(225,29,72,0.2)] animate-pulse">
              <AlertTriangle className="w-10 h-10 text-rose-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-2 tracking-tight">ขออภัย เกิดข้อผิดพลาด</h1>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              มีบางอย่างทำงานผิดปกติในระบบชั่วคราว เราได้บันทึกข้อผิดพลาดนี้ไว้แล้ว กรุณาลองใหม่อีกครั้ง
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                โหลดหน้าเว็บใหม่
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full py-3.5 bg-[#1C0F3A] hover:bg-purple-900/40 text-purple-300 font-bold rounded-xl border border-purple-500/30 flex items-center justify-center gap-2 transition-all"
              >
                <Home className="w-4 h-4" />
                กลับสู่หน้าหลัก
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
