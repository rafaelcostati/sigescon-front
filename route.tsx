import { createBrowserRouter } from 'react-router-dom';
import { App } from '@/App'; // Ajuste este caminho se necessário
import Page from '@/dashboard/page'; // Ajuste este caminho se necessário
// É uma boa prática ter uma página 404

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    
    children: [
      {
     
        index: true,
        element: <Page />,
      },
      
    ],
  },
]);