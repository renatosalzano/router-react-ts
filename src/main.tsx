import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// import createRouter from './router/index.ts'

// export const router = createRouter('/', {
//   user: 'user',
//   test: {
//     index: 'test',
//     foo: "/foo"
//   }
// })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
