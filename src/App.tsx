import { RouterProvider } from 'react-router-dom'
import { router } from '../routes'
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import '../src/index.css'

export function App() {
  

  return (

    <HelmetProvider>
      
        <Helmet titleTemplate="SIGESCON | %s" />
        <Toaster richColors />
        <RouterProvider router={ router } />

    
    </HelmetProvider>   

      
    
  )
}
