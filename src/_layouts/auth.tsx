import { Outlet } from "react-router-dom";
import BackgroundParticles from "@/assets/BackgroundParticles"; // ✅ corrigido

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-cover p-4">
      {/* background animado */}
      <BackgroundParticles />

      {/* card central */}
      <div className="relative z-10 w-full max-w-md rounded-2xl shadow-xl border border-white/20 bg-white/10 backdrop-blur-lg">
        
        <Outlet />
      </div>

      {/* rodapé */}
      <footer className="absolute bottom-5 w-full text-center text-sm text-slate-300 z-10">
        Copyright &copy; PGE-PA {new Date().getFullYear()} | DTIGD - Todos os
        direitos reservados.
      </footer>
    </div>
  );
}
