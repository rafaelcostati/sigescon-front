import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    react({
      // Configurações específicas para React 19
      jsxRuntime: 'automatic',
      jsxImportSource: 'react'
    }), 
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Configurações mais conservadoras para produção
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // Configuração simplificada para evitar problemas de hoisting
        manualChunks: undefined,
        // Força a criação de chunks menores
        experimentalMinChunkSize: 1000,
        format: 'es'
      }
    }
  },
  // Otimizações de dependências
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom'
    ],
    force: true
  },
  // Configurações específicas para evitar problemas de hoisting
  esbuild: {
    // Configurações para manter a compatibilidade
    keepNames: true,
    legalComments: 'none'
  }
})