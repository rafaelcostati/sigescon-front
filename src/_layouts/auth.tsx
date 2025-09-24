import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Background with modern gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Geometric patterns */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      {/* Main content card with glass morphism */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-2xl shadow-2xl shadow-blue-500/10 p-1">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/30">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Modern footer */}
      <footer className="absolute bottom-6 left-0 right-0 z-10 px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center space-x-2 backdrop-blur-md bg-white/20 border border-white/30 rounded-full px-6 py-3 shadow-lg">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-gray-700">
              Copyright © PGE-PA {new Date().getFullYear()} | DTIGD
            </p>
          </div>
          <p className="mt-2 text-xs text-gray-500/80">
            Todos os direitos reservados
          </p>
        </div>
      </footer>

      {/* Custom CSS for animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
        `
      }} />
    </div>
  );
}