# 🚀 Guia de Implementação Frontend - SIGESCON React/TypeScript

## 📖 Análise Geral do Estado Atual

### ✅ **Implementações Bem Estruturadas (NÃO ALTERAR)**

O frontend React/TypeScript já possui uma base sólida com implementações corretas:

1. **Autenticação Base** - JWT com localStorage, interceptors HTTP
2. **Sistema de Roteamento** - React Router com proteção de rotas
3. **Contexto de Estado** - AuthContext bem estruturado
4. **Dashboards Diferenciados** - Admin, Gestor e Fiscal com roteamento dinâmico
5. **Sistema de Permissões** - Hook usePermissions com verificação granular
6. **UI Components** - shadcn/ui configurado, componentes consistentes
7. **API Client** - Configuração HTTP centralizada com interceptors
8. **Gestão de Contratos** - Interface completa com filtros e paginação
9. **Upload de Arquivos** - Sistema de drag-and-drop implementado

---

## 🔧 **Funcionalidades que PRECISAM SER IMPLEMENTADAS/CORRIGIDAS**

### 1. 🔄 **Sistema de Alternância de Perfis - CRÍTICO**

**PROBLEMA IDENTIFICADO**: O frontend tem a estrutura base para alternância de perfis, mas não está integrado corretamente com o backend.

#### **Backend Disponível:**
```
POST /auth/alternar-perfil
GET  /auth/contexto
```

#### **O que implementar:**

**1.1. Interface de Seleção de Perfil no Login**
- Quando login retorna `requer_selecao_perfil: true`, mostrar tela de seleção
- Usuário deve escolher o perfil inicial antes de acessar o sistema
- Implementar componente `ProfileSelectionScreen.tsx`

**1.2. Dropdown de Alternância no NavUser**
- O componente `nav-user.tsx` já tem estrutura básica
- **AÇÃO NECESSÁRIA**: Criar dropdown visual para seleção rápida de perfil
- Mostrar perfil atual com badge colorido
- Listar perfis disponíveis para troca
- Implementar loading state durante alternância

**1.3. Persistência do Contexto**
- **AÇÃO NECESSÁRIA**: Após alternância, atualizar TODO o estado da aplicação
- Recarregar dashboard atual
- Atualizar sidebar/navigation
- Disparar refresh em componentes que dependem do perfil

#### **Fluxo Esperado:**
```
1. Login → Verifica requer_selecao_perfil
2. Se true: Mostra tela de seleção
3. Se false: Vai direto para dashboard
4. No NavUser: Dropdown sempre visível para alternar
5. Após alternar: Refresh completo da interface
```

---

### 2. 📊 **Dashboards com Dados Isolados - ALTA PRIORIDADE**

**PROBLEMA IDENTIFICADO**: Os dashboards estão chamando APIs corretas, mas podem não estar respeitando completamente o isolamento de dados.

#### **Backend Disponível:**
```
GET /auth/dashboard                          # Dashboard base por perfil
GET /api/v1/dashboard/fiscal/completo        # Dashboard completo do fiscal
GET /api/v1/dashboard/fiscal/minhas-pendencias # Pendências específicas
```

#### **O que implementar:**

**2.1. Validação de Dados por Perfil**
- **Fiscal**: Deve ver APENAS contratos onde é fiscal/fiscal_substituto
- **Gestor**: Deve ver APENAS contratos onde é gestor
- **Admin**: Vê todos os dados

**2.2. Contadores Dinâmicos**
- **AÇÃO NECESSÁRIA**: Implementar endpoint específico para contadores
- Fiscal: "Minhas Pendências", "Relatórios Enviados", "Contratos Fiscalizados"
- Gestor: "Contratos Gerenciados", "Relatórios Pendentes", "Equipe"
- Admin: "Total Geral", "Pendências Sistema", "Usuários Ativos"

**2.3. Novo Status "Aguardando Análise"**
- **AÇÃO NECESSÁRIA**: Atualizar dashboard para mostrar novo status
- Adicionar card específico para "Aguardando Análise" no dashboard admin
- Implementar filtro por este status nas listagens

---

### 3. 📄 **Sistema de Relatórios e Pendências - ALTA PRIORIDADE**

**PROBLEMA IDENTIFICADO**: Sistema existe parcialmente, falta integração completa com workflow backend.

#### **Backend Disponível:**
```
GET    /api/v1/contratos/{id}/pendencias
POST   /api/v1/contratos/{id}/pendencias
GET    /api/v1/contratos/{id}/pendencias/contador
PATCH  /api/v1/contratos/{id}/pendencias/{id}/cancelar

GET    /api/v1/contratos/{id}/relatorios
POST   /api/v1/contratos/{id}/relatorios
PATCH  /api/v1/contratos/{id}/relatorios/{id}/analise
```

#### **O que implementar:**

**3.1. Fluxo Completo de Pendências**
- **Tela para Admin**: Criar pendência para fiscal específico
- **Tela para Fiscal**: Listar "Minhas Pendências" com status visual
- **Workflow**: Pendente → Relatório Enviado → Aguardando Análise → Aprovado/Rejeitado

**3.2. Sistema de Upload de Relatórios**
- **AÇÃO NECESSÁRIA**: Tela para fiscal enviar relatório + arquivo
- Integrar com endpoint `POST /api/v1/contratos/{id}/relatorios`
- Suporte a reenvio (substitui arquivo anterior)
- Histórico de versões

**3.3. Sistema de Análise para Admin**
- **AÇÃO NECESSÁRIA**: Tela para admin analisar relatórios
- Botões "Aprovar" / "Rejeitar"
- Campo para observações em caso de rejeição
- Integrar com `PATCH /api/v1/contratos/{id}/relatorios/{id}/analise`

**3.4. Contador de Status no Dashboard**
- **AÇÃO NECESSÁRIA**: Usar endpoint `/pendencias/contador`
- Exibir: `{"pendentes": 2, "aguardando_analise": 1, "concluidas": 5}`
- Dashboard Admin: Priorizar "Aguardando Análise"
- Dashboard Fiscal: Destacar "Pendentes"

---

### 4. 📁 **Gerenciamento de Arquivos de Contrato - IMPLEMENTAÇÃO PARCIAL**

**PROBLEMA IDENTIFICADO**: Upload múltiplo existe, mas falta gestão completa dos arquivos.

#### **Backend Disponível:**
```
GET    /api/v1/contratos/{id}/arquivos                     # Lista arquivos
GET    /api/v1/contratos/{id}/arquivos/{arquivo_id}/download # Download seguro
DELETE /api/v1/contratos/{id}/arquivos/{arquivo_id}        # Remove arquivo
GET    /api/v1/arquivos/relatorios/contrato/{id}           # Arquivos de relatórios
```

#### **O que implementar:**

**4.1. Visualizador de Arquivos do Contrato**
- **AÇÃO NECESSÁRIA**: Componente para listar arquivos do contrato
- Separar "Arquivos Contratuais" de "Arquivos de Relatórios"
- Botão download individual
- Para Admin: Botão excluir arquivo

**4.2. Download Seguro**
- **AÇÃO NECESSÁRIA**: Implementar download via blob/stream
- Usar endpoint específico com verificação de permissão
- Indicador de progresso de download

**4.3. Histórico de Relatórios**
- **AÇÃO NECESSÁRIA**: Tela separada para arquivos de relatórios
- Mostrar status: "Aprovado", "Rejeitado", "Pendente de Análise"
- Informação de quem enviou e quando

---

### 5. 🔐 **Controle de Acesso Granular - MÉDIA PRIORIDADE**

**PROBLEMA IDENTIFICADO**: Sistema de permissões existe, mas pode não estar cobrindo todos os casos.

#### **O que verificar/implementar:**

**5.1. Validação Completa por Perfil**
- **AÇÃO NECESSÁRIA**: Revisar hook `usePermissions.ts`
- Garantir que fiscal não vê contratos de outros
- Gestores não veem contratos que não gerenciam
- Admin vê tudo

**5.2. UI Condicional**
- **AÇÃO NECESSÁRIA**: Ocultar botões/ações não permitidas
- Exemplo: Fiscal não deve ver botão "Criar Contrato"
- Gestor não deve ver "Gerenciar Usuários"

**5.3. Proteção de Rotas Específicas**
- **AÇÃO NECESSÁRIA**: Revisar `ProtectedRoute.tsx`
- Algumas páginas específicas podem precisar de proteção adicional
- Exemplo: `/admin/*` apenas para Administrador

---

### 6. 🔔 **Sistema de Notificações - BAIXA PRIORIDADE**

**PROBLEMA IDENTIFICADO**: Não implementado no frontend.

#### **Backend Disponível:**
Sistema de emails automático, mas sem notificações em tempo real no frontend.

#### **O que implementar:**

**6.1. Notificações Toast**
- **AÇÃO NECESSÁRIA**: Expandir uso do sistema toast existente
- Notificar sobre: pendências vencidas, relatórios aprovados/rejeitados
- Integrar com dados do dashboard

**6.2. Badges de Notificação**
- **AÇÃO NECESSÁRIA**: Contadores visuais na sidebar
- "Pendências (3)", "Aguardando Análise (2)"
- Atualização automática periódica

---

## 🛠️ **Instruções Técnicas Detalhadas**

### **IMPLEMENTAÇÃO 1: Sistema de Alternância de Perfis**

#### **1.1. Componente de Seleção de Perfil**

**Criar arquivo**: `src/components/ProfileSelectionModal.tsx`

**Funcionalidade**: Modal/tela que aparece quando `requer_selecao_perfil: true`

**Integração API**:
```
POST /auth/alternar-perfil
Body: { "novo_perfil_id": 2, "justificativa": null }
Response: ContextoSessao atualizado
```

**Comportamento**:
1. Listar `perfis_disponiveis` do contexto
2. Permitir seleção de um perfil
3. Enviar requisição para backend
4. Atualizar estado global
5. Redirecionar para dashboard apropriado

#### **1.2. Dropdown no NavUser**

**Arquivo existente**: `src/components/nav-user.tsx`

**Modificações necessárias**:
1. Adicionar dropdown com perfis disponíveis
2. Mostrar perfil atual com badge colorido
3. Implementar função `handleProfileChange` (já existe base)
4. Adicionar loading state durante alternância

**Integração API**: Mesma que acima

#### **1.3. Atualização Global após Alternância**

**Arquivo principal**: `src/contexts/AuthContext.tsx`

**Modificações necessárias**:
1. Após alternância bem-sucedida, atualizar todo o estado
2. Disparar refresh nos dashboards
3. Atualizar contexto de permissões
4. Notificar componentes filhos sobre mudança

---

### **IMPLEMENTAÇÃO 2: Novo Status "Aguardando Análise"**

#### **2.1. Atualização dos Contadores do Dashboard**

**Arquivos afetados**:
- `src/pages/admin/AdminDashboard.tsx`
- `src/lib/api.ts` (adicionar tipos)

**Nova API necessária**:
```
GET /api/v1/contratos/{id}/pendencias/contador
Response: {
  "pendentes": 2,
  "aguardando_analise": 1,
  "concluidas": 5,
  "canceladas": 0
}
```

**Implementação**:
1. Adicionar card específico para "Aguardando Análise"
2. Usar cor/ícone diferenciado (laranja/amarelo)
3. Fazer card clicável para filtrar contratos

#### **2.2. Filtros de Status Atualizados**

**Arquivo**: `src/pages/contratos/Contratos.tsx`

**Modificações**:
1. Adicionar "Aguardando Análise" nos filtros de status
2. Implementar filtro visual para este status
3. Destacar visualmente contratos neste status

---

### **IMPLEMENTAÇÃO 3: Sistema Completo de Relatórios**

#### **3.1. Tela de Pendências do Fiscal**

**Criar**: `src/pages/fiscal/MinhasPendencias.tsx`

**Funcionalidade**:
- Listar pendências do fiscal logado
- Filtros por status: "Pendente", "Aguardando Análise", "Concluída"
- Botão "Enviar Relatório" para pendências pendentes
- Visualizar status de relatórios já enviados

**API Integration**:
```
GET /api/v1/dashboard/fiscal/minhas-pendencias
Response: Array de pendências com detalhes completos
```

#### **3.2. Modal de Envio de Relatório**

**Criar**: `src/components/RelatorioUploadModal.tsx`

**Funcionalidade**:
- Upload de arquivo (PDF, DOC, XLS)
- Campo para observações
- Suporte a reenvio (substituição)

**API Integration**:
```
POST /api/v1/contratos/{id}/relatorios
FormData: { arquivo: File, observacoes: string }
Response: Relatório criado/atualizado
```

#### **3.3. Sistema de Análise para Admin**

**Criar**: `src/pages/admin/AnalisarRelatorios.tsx`

**Funcionalidade**:
- Listar relatórios pendentes de análise
- Visualizar arquivo enviado
- Aprovar/Rejeitar com observações

**API Integration**:
```
PATCH /api/v1/contratos/{id}/relatorios/{id}/analise
Body: { "aprovado": true/false, "observacoes": "string" }
Response: Status atualizado
```

---

### **IMPLEMENTAÇÃO 4: Gerenciamento de Arquivos**

#### **4.1. Componente de Lista de Arquivos**

**Criar**: `src/components/ContratoArquivos.tsx`

**Funcionalidade**:
- Tabela com arquivos do contrato
- Colunas: Nome, Tipo, Tamanho, Data, Ações
- Botão download para todos
- Botão excluir para Admin

**API Integration**:
```
GET /api/v1/contratos/{id}/arquivos
Response: {
  "arquivos": [...],
  "total_arquivos": 7,
  "contrato_id": 101
}
```

#### **4.2. Download Seguro**

**Função utilitária**: `src/utils/fileDownload.ts`

**Implementação**:
```typescript
const downloadArquivo = async (contratoId: number, arquivoId: number) => {
  // Usar fetch com blob response
  // Criar URL temporária
  // Disparar download via elemento <a>
}
```

**API Integration**:
```
GET /api/v1/contratos/{id}/arquivos/{arquivo_id}/download
Response: Blob/Stream do arquivo
```

#### **4.3. Separação de Arquivos Contratuais vs Relatórios**

**Criar**: `src/components/RelatoriosArquivos.tsx`

**Funcionalidade**:
- Lista específica para arquivos de relatórios
- Mostrar status do relatório
- Informações de envio

**API Integration**:
```
GET /api/v1/arquivos/relatorios/contrato/{id}
Response: Arquivos de relatórios com status
```

---

### **IMPLEMENTAÇÃO 5: Melhorias de UX**

#### **5.1. Loading States Melhorados**

**Arquivos afetados**: Todos os componentes com chamadas API

**Implementar**:
- Skeleton loading para listagens
- Spinner para ações (botões)
- Disable estados durante operações

#### **5.2. Toast Notifications Expandidas**

**Arquivo**: Usar sistema `sonner` existente

**Implementar toasts para**:
- Alternância de perfil bem-sucedida
- Upload de relatório realizado
- Aprovação/rejeição de relatório
- Erros de permissão

#### **5.3. Indicadores Visuais**

**Implementar**:
- Badges de status coloridos
- Ícones para diferentes tipos de ação
- Contadores em tempo real

---

## 🗂️ **Estrutura de Arquivos Necessária**

### **Novos Componentes**:
```
src/components/
├── ProfileSelectionModal.tsx      # Seleção inicial de perfil
├── RelatorioUploadModal.tsx       # Upload de relatórios
├── ContratoArquivos.tsx           # Lista arquivos do contrato
├── RelatoriosArquivos.tsx         # Lista arquivos de relatórios
└── StatusBadge.tsx                # Badge reutilizável para status
```

### **Novas Páginas**:
```
src/pages/
├── fiscal/
│   ├── MinhasPendencias.tsx       # Pendências do fiscal
│   └── EnviarRelatorio.tsx        # Tela de envio
├── admin/
│   ├── AnalisarRelatorios.tsx     # Análise de relatórios
│   └── GerenciarPendencias.tsx    # Criar/cancelar pendências
└── gestor/
    └── RelatoriosEquipe.tsx       # Relatórios da equipe
```

### **Utilitários**:
```
src/utils/
├── fileDownload.ts                # Download seguro de arquivos
├── statusHelpers.ts               # Helpers para status/cores
└── permissionHelpers.ts           # Validações extras de permissão
```

---

## 🚨 **Prioridades de Implementação**

### **FASE 1 - CRÍTICA (Implementar primeiro)**
1. ✅ Sistema de Alternância de Perfis completo
2. ✅ Novo status "Aguardando Análise" nos dashboards
3. ✅ Dados isolados por perfil (verificação/correção)

### **FASE 2 - ALTA (Segunda prioridade)**
1. ✅ Sistema completo de Relatórios e Pendências
2. ✅ Gerenciamento completo de arquivos
3. ✅ Interface de análise para Admin

### **FASE 3 - MÉDIA (Terceira prioridade)**
1. ✅ Melhorias de UX e loading states
2. ✅ Notificações expandidas
3. ✅ Validações extras de segurança

---

## 📋 **Checklist de Validação**

### **Antes de considerar concluído, verificar:**

#### **Sistema de Perfis**:
- [ ] Login mostra seleção quando necessário
- [ ] Dropdown funciona em todos os navegadores
- [ ] Alternância atualiza todo o estado
- [ ] Dashboards mudam corretamente
- [ ] Permissões são aplicadas imediatamente

#### **Isolamento de Dados**:
- [ ] Fiscal vê apenas seus contratos
- [ ] Gestor vê apenas contratos que gerencia
- [ ] Admin vê todos os dados
- [ ] Contadores respeitam isolamento
- [ ] Filtros respeitam permissões

#### **Sistema de Relatórios**:
- [ ] Pendência criada → Email enviado → Fiscal recebe
- [ ] Relatório enviado → Status atualiza → Admin notificado
- [ ] Aprovação/Rejeição → Email para fiscal
- [ ] Reenvio funciona corretamente
- [ ] Histórico está preservado

#### **Gerenciamento de Arquivos**:
- [ ] Upload múltiplo funciona
- [ ] Download é seguro e rápido
- [ ] Exclusão funciona (apenas Admin)
- [ ] Arquivos contratuais ≠ Arquivos de relatórios
- [ ] Permissões de acesso respeitadas

---

## 🎯 **Resultados Esperados Após Implementação**

### **Para o Administrador**:
- Dashboard com contadores isolados e precisos
- Gestão completa de usuários e perfis
- Sistema de análise de relatórios eficiente
- Controle total sobre pendências e arquivos

### **Para o Gestor**:
- Visão apenas dos contratos sob sua gestão
- Acompanhamento da equipe de fiscais
- Dashboard específico com métricas relevantes

### **Para o Fiscal**:
- Lista clara de pendências atribuídas
- Sistema simples de envio de relatórios
- Acompanhamento do status das submissões
- Dashboard focado nas suas responsabilidades

### **Para Todos os Usuários**:
- Alternância de perfil fluida e intuitiva
- Interface responsiva e consistente
- Feedback claro sobre todas as ações
- Sistema robusto e confiável

---

## ⚠️ **Observações Importantes**

### **Compatibilidade com Backend**:
- Todas as APIs mencionadas já estão implementadas e testadas
- Estrutura de resposta é estável e documentada
- Sistema de autenticação JWT é robusto

### **Tecnologias Mantidas**:
- React 18+ com TypeScript
- shadcn/ui para componentes
- Tanstack Router para navegação
- Zustand ou Context API para estado global

### **Não Modificar**:
- Estrutura base do projeto
- Sistema de build/deploy
- Configurações de TypeScript
- Componentes de UI base (shadcn)

### **Testes Necessários**:
- Testar com diferentes perfis
- Validar fluxo completo de relatórios
- Verificar uploads grandes
- Testar alternância de perfil em diferentes browsers

---

*Este documento serve como guia completo para implementar todas as funcionalidades faltantes no frontend, mantendo compatibilidade total com o backend FastAPI já desenvolvido e testado.*