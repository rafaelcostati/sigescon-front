# SIGESCON - Sistema de Gestão de Contratos (Frontend)

## 📋 Visão Geral

Sistema de gestão de contratos desenvolvido em React + TypeScript + Vite, com foco em fiscalização, gestão de pendências e relatórios de contratos públicos.

## 🏗️ Arquitetura

### Stack Tecnológica
- **Framework**: React 18.3.1
- **Linguagem**: TypeScript 5.8.3
- **Build Tool**: Vite 7.1.0
- **Roteamento**: React Router DOM 7.8.0
- **Estilização**: Tailwind CSS 4.1.11
- **UI Components**: Radix UI + Lucide Icons + Tabler Icons
- **Formulários**: React Hook Form 7.62.0 + Zod 4.1.5
- **Requisições HTTP**: Axios 1.11.0
- **Notificações**: Sonner 2.0.7
- **Tabelas**: TanStack React Table 8.21.3

### Estrutura de Pastas

```
src/
├── pages/                    # Páginas da aplicação
│   ├── admin/               # Painel administrativo
│   │   ├── AdminDashboard.tsx
│   │   └── Administracao.tsx
│   ├── auth/                # Autenticação
│   ├── contratos/           # Gestão de contratos
│   ├── pendencias/          # Gestão de pendências
│   ├── relatorios/          # Gestão de relatórios
│   ├── usuarios/            # Gestão de usuários
│   ├── fiscal/              # Área do fiscal
│   ├── gestor/              # Área do gestor
│   └── fornecedor/          # Área do fornecedor
├── components/              # Componentes reutilizáveis
│   ├── ui/                  # Componentes base (shadcn/ui)
│   ├── alerts/              # Componentes de alertas
│   ├── notifications/       # Sistema de notificações
│   ├── pendencias/          # Componentes de pendências
│   ├── relatorios/          # Componentes de relatórios
│   ├── status/              # Badges e status
│   └── routing/             # Componentes de roteamento
├── lib/                     # Bibliotecas e utilitários
│   └── api.ts               # Cliente API e funções
├── contexts/                # Contextos React
├── hooks/                   # Custom Hooks
├── services/                # Serviços e integrações
├── utils/                   # Funções utilitárias
├── config/                  # Configurações
└── _layouts/                # Layouts da aplicação
```

## 🎯 Funcionalidades Principais

### 1. **Gestão de Contratos**
- ✅ Criação, edição e visualização de contratos
- ✅ Upload e download de arquivos (contratos, aditivos, anexos)
- ✅ Modelo de relatório padrão disponível para download
- ✅ Filtros avançados (data, garantia, vencimento)
- ✅ Visualização de histórico de alterações

### 2. **Sistema de Pendências**
- ✅ Criação manual e automática de pendências
- ✅ Configuração de intervalo de dias para pendências automáticas
- ✅ Sistema de lembretes por email (configurável)
- ✅ Notificações de pendências vencidas
- ✅ Gestão por fiscal responsável

### 3. **Gestão de Relatórios**
- ✅ Upload de relatórios pelos fiscais
- ✅ Fluxo de aprovação (Aguardando Análise → Aprovado/Rejeitado)
- ✅ Comentários e feedback do gestor
- ✅ Histórico de relatórios por contrato
- ✅ Arquivos anexos aos relatórios

### 4. **Painel Administrativo**
Sistema completo de configurações em [Administracao.tsx](src/pages/admin/Administracao.tsx):

#### 4.1 Pendências Automáticas
- Configuração do intervalo de dias (1-365)
- Criação automática de pendências "1º Relatório Fiscal", "2º Relatório Fiscal", etc.
- Notificação automática aos fiscais

#### 4.2 Lembretes de Pendências
- Dias antes do vencimento para iniciar lembretes (1-90)
- Intervalo entre lembretes (1-30 dias)
- Preview de quantos lembretes serão enviados
- Exemplo: 30 dias antes, a cada 5 dias = ~6 lembretes

#### 4.3 Modelo de Relatório
- Upload de modelo padrão (PDF, DOC, DOCX, ODT)
- Limite de 10MB por arquivo
- Download disponível em todos os contratos
- Substituição/remoção de modelo

#### 4.4 Alertas de Vencimento de Contratos
- Sistema ativo/inativo
- Dias antes do vencimento (1-365)
- Periodicidade de reenvio (1-90 dias)
- Perfis destinatários:
  - **Administrador**: Recebe relatório consolidado de TODOS os contratos
  - **Gestor**: Recebe apenas dos contratos que gerencia
  - **Fiscal**: Recebe apenas dos contratos que fiscaliza
- Configuração de horário de envio (HH:MM)

### 5. **Dashboard Administrativo**
Localizado em [AdminDashboard.tsx](src/pages/admin/AdminDashboard.tsx):
- ✅ Usuários ativos
- ✅ Contratos ativos
- ✅ Pendências vencidas e pendentes por contratado
- ✅ Relatórios aguardando análise (com destaque visual)
- ✅ Total de contratações
- ✅ **Contratos próximos ao vencimento (90 dias)**:
  - Categorização por urgência (Crítico/Alto/Médio)
  - Estatísticas: 30 dias, 60 dias, 90 dias
  - Preview de até 5 contratos
  - Link para visualização completa

### 6. **Sistema de Perfis**
- **Administrador**: Acesso total ao sistema
- **Gestor**: Gerencia contratos específicos
- **Fiscal**: Fiscaliza contratos e envia relatórios
- **Fornecedor**: Visualização restrita

### 7. **Sistema de Autenticação**
- Login com email/senha
- JWT token + refresh token
- Alternância de perfis em tempo real
- Redirect automático ao trocar perfil
- Recuperação de senha por email

## 🔗 Integração com Backend

### API Base URL
Configurado em `src/lib/api.ts`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
```

### Principais Endpoints Utilizados

#### Configurações (Admin)
- `GET /config/pendencias/intervalo-dias` - Obter intervalo de pendências
- `PATCH /config/pendencias/intervalo-dias` - Atualizar intervalo
- `GET /config/lembretes/config` - Obter config de lembretes
- `PATCH /config/lembretes/config` - Atualizar lembretes
- `GET /config/modelo-relatorio/info` - Info do modelo
- `POST /config/modelo-relatorio/upload` - Upload de modelo
- `DELETE /config/modelo-relatorio` - Remover modelo
- `GET /config/modelo-relatorio/download` - Download do modelo
- `GET /config/alertas-vencimento` - Config de alertas
- `PATCH /config/alertas-vencimento` - Atualizar alertas

#### Contratos
- `GET /contratos` - Listar contratos (com filtros)
- `GET /contratos/{id}` - Detalhes do contrato
- `POST /contratos` - Criar contrato
- `PUT /contratos/{id}` - Atualizar contrato
- `POST /contratos/{id}/arquivos` - Upload de arquivo

#### Pendências
- `GET /pendencias` - Listar pendências
- `POST /pendencias` - Criar pendência
- `PATCH /pendencias/{id}` - Atualizar status
- `POST /contratos/{id}/pendencias/automaticas` - Criar pendências automáticas

#### Relatórios
- `GET /relatorios` - Listar relatórios
- `POST /relatorios` - Enviar relatório
- `PATCH /relatorios/{id}/analisar` - Aprovar/rejeitar relatório

#### Dashboard
- `GET /dashboard/admin/completo` - Dashboard completo do admin
- `GET /dashboard/admin/pendencias-vencidas-completo` - Pendências vencidas
- `GET /dashboard/admin/contratos-proximos-vencimento` - Contratos vencendo

## 🎨 Padrões de Design

### Componentes UI (shadcn/ui)
Localização: `src/components/ui/`
- Card, Button, Input, Label
- Dialog, Dropdown, Popover
- Badge, Checkbox, Tabs
- Table, Tooltip, Separator

### Padrão de Cores
- **Azul**: Pendências automáticas
- **Âmbar**: Lembretes e relatórios aguardando análise
- **Verde**: Alertas de vencimento e aprovações
- **Roxo**: Modelo de relatório
- **Vermelho**: Pendências vencidas e alertas críticos

### Toast Notifications (Sonner)
```typescript
toast.success("Operação realizada com sucesso!");
toast.error("Erro ao processar operação");
toast.info("Informação importante");
```

## 🔐 Segurança

- Tokens JWT armazenados em localStorage
- Refresh token automático
- Protected routes por perfil
- Validação de formulários com Zod
- Sanitização de inputs

## 📊 Estado Global

### Contextos
- **AuthContext**: Gerencia autenticação e usuário logado
- **ProfileContext**: Gerencia perfil ativo e alternância

## 🚀 Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento (0.0.0.0)
npm run build    # Build de produção
npm run lint     # Linter ESLint
npm run preview  # Preview do build
```

## 📝 Convenções de Código

### Nomenclatura
- **Componentes**: PascalCase (Ex: `AdminDashboard.tsx`)
- **Funções**: camelCase (Ex: `carregarConfiguracao`)
- **Constantes**: UPPER_SNAKE_CASE (Ex: `API_BASE_URL`)
- **Interfaces/Types**: PascalCase (Ex: `AlertasVencimentoConfig`)

### TypeScript
- Sempre tipar props de componentes
- Usar interfaces para objetos complexos
- Evitar `any`, preferir `unknown` quando necessário

### Componentes
```typescript
export default function NomeComponente() {
  // 1. Estados
  const [estado, setEstado] = useState();

  // 2. Hooks
  useEffect(() => {}, []);

  // 3. Funções
  const minhaFuncao = async () => {};

  // 4. Render
  return (<div>...</div>);
}
```

## 🐛 Debug e Logs

Logs de debug presentes em:
- Carregamento de configurações
- Requisições API
- Mudanças de estado importantes
- Erros capturados

Padrão:
```typescript
console.log("✅ Sucesso:", data);
console.error("❌ Erro:", error);
console.warn("⚠️ Aviso:", warning);
console.log("🔍 Debug:", info);
```

## 📦 Dependências Principais

### Produção
- `react` + `react-dom` - Framework
- `react-router-dom` - Roteamento
- `axios` - Cliente HTTP
- `react-hook-form` + `zod` - Formulários
- `tailwindcss` - Estilização
- `@radix-ui/*` - Componentes base
- `sonner` - Toasts
- `lucide-react` + `@tabler/icons-react` - Ícones
- `@tanstack/react-table` - Tabelas avançadas
- `jwt-decode` - Decodificação de JWT

### Desenvolvimento
- `typescript` - Tipagem estática
- `vite` - Build tool
- `eslint` - Linter

## 🔄 Fluxos Importantes

### 1. Criação de Pendências Automáticas
1. Admin configura intervalo em dias (ex: 60 dias)
2. Ao visualizar contrato, admin clica "Criar Pendências Automáticas"
3. Sistema calcula: `(data_fim - data_inicio) / intervalo_dias`
4. Cria pendências: "1º Relatório Fiscal", "2º Relatório Fiscal", etc.
5. Envia email ao fiscal e fiscal substituto

### 2. Sistema de Lembretes
1. Admin configura dias_antes (ex: 30) e intervalo (ex: 5)
2. Scheduler do backend verifica pendências diariamente
3. Envia lembretes: 30, 25, 20, 15, 10, 5 dias antes e no vencimento
4. Email enviado ao fiscal responsável

### 3. Análise de Relatórios
1. Fiscal envia relatório (status: "Aguardando Análise")
2. Aparece no dashboard do admin com destaque
3. Gestor/Admin acessa "Gestão de Relatórios"
4. Analisa e aprova/rejeita com comentários
5. Fiscal recebe notificação

### 4. Alertas de Vencimento
1. Admin configura: dias_antes (ex: 90), periodicidade (ex: 30), perfis
2. Scheduler verifica contratos vencendo
3. Envia emails:
   - **Admin**: Lista completa de contratos vencendo
   - **Gestor**: Apenas contratos que gerencia
   - **Fiscal**: Apenas contratos que fiscaliza
4. Reenvia a cada 30 dias até vencimento

## 🎯 Próximas Funcionalidades Planejadas

1. ⏳ **Logs de Auditoria** (Em implementação)
   - Histórico de alterações em configurações
   - Rastreamento de criação/edição de contratos
   - Logs de avaliação de pendências

2. ⏳ **Sistema de Escalonamento** (Em implementação)
   - Notificação ao gestor se pendência não resolvida
   - Notificação ao admin após X dias
   - Configurável pelo painel

3. 📋 **Templates de Email**
   - Editor visual de templates
   - Variáveis dinâmicas
   - Preview antes de salvar

4. 📊 **Relatórios Consolidados**
   - Relatório mensal/semanal automático
   - Exportação PDF/Excel
   - Métricas de desempenho

## 📞 Pontos de Atenção

### Performance
- Paginação em listas grandes
- Lazy loading de componentes pesados
- Debounce em inputs de busca

### Acessibilidade
- Labels em todos os inputs
- Tooltips em ícones
- Feedback visual em ações

### UX
- Loading states em operações assíncronas
- Confirmações em ações destrutivas
- Mensagens de erro claras

## 🔗 Links Úteis

- **Backend**: `../backend-contratos-FASTAPI/`
- **Documentação API**: `http://localhost:8000/docs` (Swagger)
- **shadcn/ui**: https://ui.shadcn.com/
- **Radix UI**: https://www.radix-ui.com/
- **Tailwind CSS**: https://tailwindcss.com/

---

**Última atualização**: 30/09/2025
**Versão**: 0.0.0
**Desenvolvedor**: Rafael
