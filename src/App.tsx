import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { router } from '../routes';
import './index.css'; // ou './globals.css' dependendo do seu arquivo de estilos

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster 
        position="top-right" 
        richColors 
        closeButton 
        duration={4000}
      />
    </AuthProvider>
  );
}