# Fix para Erro de Build de Produção

## Problema
Erro: `Cannot access 'P' before initialization` na build de produção, mas funciona em desenvolvimento.

## Causa
O erro é causado por problemas de hoisting e compatibilidade do React 19 com algumas dependências.

## Soluções Aplicadas

### 1. Downgrade do React (Recomendado)
- React 19.1.1 → React 18.3.1
- @types/react 19.1.12 → @types/react 18.3.12
- @types/react-dom 19.1.9 → @types/react-dom 18.3.1

### 2. Configuração do Vite Otimizada
- Target ES2020 para melhor compatibilidade
- Minificação com esbuild (mais estável que terser)
- Remoção de manual chunks complexos
- Configurações específicas para React 18

### 3. Passos para Aplicar o Fix

```bash
# 1. Limpar cache e node_modules
rm -rf node_modules package-lock.json dist

# 2. Reinstalar dependências
npm install

# 3. Limpar cache do Vite
npm run build -- --force

# 4. Fazer nova build
npm run build

# 5. Testar localmente
npm run preview
```

### 4. Verificações Adicionais

Se o problema persistir, verifique:

1. **Variáveis de ambiente** no servidor de produção:
   ```
   VITE_API_URL=http://127.0.0.1:8000/api/v1
   VITE_AUTH_API_URL=http://127.0.0.1:8000/auth
   ```

2. **Configuração do servidor web** (nginx/apache):
   - Servir arquivos estáticos corretamente
   - Configurar fallback para SPA (Single Page Application)

3. **Headers de CORS** no backend se necessário

### 5. Configuração Nginx Recomendada

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    root /caminho/para/dist;
    index index.html;

    # Servir arquivos estáticos
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Fallback para SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 6. Alternativa: Manter React 19

Se preferir manter o React 19, use esta configuração no vite.config.ts:

```typescript
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react'
    }), 
    tailwindcss()
  ],
  build: {
    target: 'esnext',
    minify: false, // Desabilita minificação temporariamente
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
```

## Status
✅ Configuração aplicada
⏳ Aguardando teste em produção
