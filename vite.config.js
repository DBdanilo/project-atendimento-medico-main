import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/pacientes': 'http://localhost:3001',
      '/triagens': 'http://localhost:3001',
      '/atendimentos': 'http://localhost:3001',
      '/funcionarios': 'http://localhost:3001',
      '/login': 'http://localhost:3001',
      '/relatorios': 'http://localhost:3001',
      '/painel': 'http://localhost:3001',
      '/api': 'http://localhost:3001',
    }
  }
})
