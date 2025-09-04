import { RouterProvider } from 'react-router-dom'
import { router } from '../routes'
import { Toaster } from 'sonner';
import '../src/index.css'

export function App() {
  

  return (

    
      <>
       <Toaster richColors />
        <RouterProvider router={ router } />
      </>
        
       


    

      
    
  )
}
