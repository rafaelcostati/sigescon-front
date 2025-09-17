import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      {/* card central */}
      <div className="relative z-10 w-full max-w-md rounded-xl">
        <Outlet />
      </div>

      {/* rodapé */}
      <footer className="absolute bottom-5 w-full text-center text-sm text-gray-500 z-10">
        Copyright &copy; PGE-PA {new Date().getFullYear()} | DTIGD - Todos os
        direitos reservados.
      </footer>
    </div>
  );
}
