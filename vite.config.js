import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Caminhos relativos: funciona no GitHub Pages (/alerta-golpes/) e no Netlify.
  base: './',
  plugins: [react(), tailwindcss()],
})
