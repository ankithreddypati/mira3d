import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
})

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   base: process.env.NODE_ENV === 'production' ? '/demo/' : '/',  
//   plugins: [react()],
//   define: {
//     global: {}, 
//   }
// })
