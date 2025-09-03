// src/App.tsx
import { Outlet } from 'react-router-dom';


export function App() {
  return (
    <>
      <title>Sigescon</title>   

      

      <main>        
        <Outlet />
      </main>
    </>
  );
}