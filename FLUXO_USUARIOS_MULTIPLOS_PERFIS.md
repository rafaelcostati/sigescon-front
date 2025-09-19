# 👥 Fluxo de Usuários com Múltiplos Perfis - Frontend React TypeScript

## 📋 Visão Geral

Este documento orienta a implementação do sistema de usuários com múltiplos perfis no frontend React TypeScript, integrando com a API FastAPI do SIGESCON.

---

## 🏗️ Arquitetura do Sistema

### Conceitos Principais:
- **Usuário**: Pessoa física com login único
- **Perfis**: Papéis que o usuário pode assumir (Admin, Gestor, Fiscal)
- **Contexto Ativo**: Perfil atualmente em uso na sessão
- **Alternância**: Mudança de perfil sem logout

---

## 🔐 1. Autenticação e Login

### 1.1 Endpoint de Login
```typescript
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

### 1.2 Resposta do Login
```typescript
interface LoginResponse {
  access_token: string;
  token_type: "bearer";
  user: {
    id: number;
    nome: string;
    email: string;
    perfil_ativo: {
      id: number;
      nome: "Administrador" | "Gestor" | "Fiscal";
    };
    perfis_disponiveis: Array<{
      id: number;
      nome: string;
      concedido_em: string;
    }>;
  };
}
```

### 1.3 Implementação no Frontend
```typescript
// hooks/useAuth.ts
const login = async (credentials: LoginCredentials) => {
  const response = await api.post('/auth/login', credentials);

  // Armazena token
  localStorage.setItem('token', response.data.access_token);

  // Configura contexto do usuário
  setUser(response.data.user);
  setPerfilAtivo(response.data.user.perfil_ativo);

  return response.data;
};
```

---

## 🔄 2. Alternância de Perfis

### 2.1 Endpoint de Alternância
```typescript
POST /auth/alternar-perfil
Authorization: Bearer {token}
Content-Type: application/json

{
  "novo_perfil_id": 2
}
```

### 2.2 Implementação da Alternância
```typescript
// hooks/useAuth.ts
const alternarPerfil = async (novoPerfilId: number) => {
  const response = await api.post('/auth/alternar-perfil', {
    novo_perfil_id: novoPerfilId
  });

  // Atualiza contexto sem logout
  setPerfilAtivo(response.data.perfil_ativo);

  // Recarrega permissões
  await carregarPermissoes();

  return response.data;
};
```

### 2.3 Componente Seletor de Perfil
```typescript
// components/PerfilSelector.tsx
const PerfilSelector = () => {
  const { user, perfilAtivo, alternarPerfil, perfisDisponiveis } = useAuth();

  const handleChange = async (perfilId: number) => {
    await alternarPerfil(perfilId);
    // Redirecionar para dashboard apropriado
    navigate(getDashboardRoute(perfilId));
  };

  return (
    <Select
      value={perfilAtivo.id}
      onChange={handleChange}
      options={perfisDisponiveis}
    />
  );
};
```

---

## 🎛️ 3. Gerenciamento de Usuários (Admin)

### 3.1 Listagem de Usuários
```typescript
GET /api/v1/usuarios?page=1&limit=10&nome=filtro
Authorization: Bearer {token}
```

### 3.2 Criação de Usuário
```typescript
POST /api/v1/usuarios
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@exemplo.com",
  "cpf": "12345678901",
  "matricula": "MAT001",
  "senha": "senha123",
  "perfil_id": 3  // Perfil inicial
}
```

### 3.3 Implementação do CRUD
```typescript
// services/usuarioService.ts
export const usuarioService = {
  listar: (filtros?: UsuarioFiltros) =>
    api.get('/api/v1/usuarios', { params: filtros }),

  criar: (dados: UsuarioCreate) =>
    api.post('/api/v1/usuarios', dados),

  atualizar: (id: number, dados: UsuarioUpdate) =>
    api.patch(`/api/v1/usuarios/${id}`, dados),

  buscar: (id: number) =>
    api.get(`/api/v1/usuarios/${id}`),

  deletar: (id: number) =>
    api.delete(`/api/v1/usuarios/${id}`)
};
```

---

## 🏷️ 4. Gestão de Perfis do Usuário

### 4.1 Listar Perfis do Usuário
```typescript
GET /api/v1/usuarios/{user_id}/perfis
Authorization: Bearer {token}
```

### 4.2 Conceder Perfis
```typescript
POST /api/v1/usuarios/{user_id}/perfis/conceder
Authorization: Bearer {token}
Content-Type: application/json

{
  "perfis_ids": [1, 2, 3]
}
```

### 4.3 Revogar Perfis
```typescript
POST /api/v1/usuarios/{user_id}/perfis/revogar
Authorization: Bearer {token}
Content-Type: application/json

{
  "perfis_ids": [2]
}
```

### 4.4 Implementação no Frontend
```typescript
// components/GestorPerfis.tsx
const GestorPerfis = ({ usuarioId }: { usuarioId: number }) => {
  const [perfisDisponiveis, setPerfisDisponiveis] = useState([]);
  const [perfisUsuario, setPerfisUsuario] = useState([]);

  const concederPerfil = async (perfilId: number) => {
    await api.post(`/api/v1/usuarios/${usuarioId}/perfis/conceder`, {
      perfis_ids: [perfilId]
    });
    await recarregarPerfis();
  };

  const revogarPerfil = async (perfilId: number) => {
    await api.post(`/api/v1/usuarios/${usuarioId}/perfis/revogar`, {
      perfis_ids: [perfilId]
    });
    await recarregarPerfis();
  };

  return (
    <div>
      {/* Interface para gerenciar perfis */}
    </div>
  );
};
```

---

## 🔒 5. Sistema de Permissões

### 5.1 Verificação de Contexto
```typescript
GET /auth/contexto
Authorization: Bearer {token}
```

### 5.2 Verificação de Permissões
```typescript
GET /auth/permissoes
Authorization: Bearer {token}
```

### 5.3 Hook de Permissões
```typescript
// hooks/usePermissions.ts
export const usePermissions = () => {
  const { perfilAtivo } = useAuth();

  const canCreateUser = () => perfilAtivo.nome === 'Administrador';
  const canManageContracts = () => ['Administrador', 'Gestor'].includes(perfilAtivo.nome);
  const canSubmitReports = () => ['Administrador', 'Fiscal'].includes(perfilAtivo.nome);

  return {
    canCreateUser,
    canManageContracts,
    canSubmitReports
  };
};
```

---

## 🎯 6. Componentes Principais

### 6.1 ProtectedRoute
```typescript
// components/ProtectedRoute.tsx
const ProtectedRoute = ({
  children,
  requiredProfile
}: {
  children: React.ReactNode;
  requiredProfile?: string[];
}) => {
  const { isAuthenticated, perfilAtivo } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredProfile && !requiredProfile.includes(perfilAtivo.nome)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
};
```

### 6.2 Dashboard Dinâmico
```typescript
// pages/Dashboard.tsx
const Dashboard = () => {
  const { perfilAtivo } = useAuth();

  const renderDashboard = () => {
    switch (perfilAtivo.nome) {
      case 'Administrador':
        return <AdminDashboard />;
      case 'Gestor':
        return <GestorDashboard />;
      case 'Fiscal':
        return <FiscalDashboard />;
      default:
        return <DefaultDashboard />;
    }
  };

  return (
    <div>
      <Header />
      <PerfilSelector />
      {renderDashboard()}
    </div>
  );
};
```

---

## 📱 7. Fluxo de Telas

### 7.1 Estrutura de Rotas
```typescript
// App.tsx
const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/admin" element={
        <ProtectedRoute requiredProfile={['Administrador']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route path="usuarios" element={<UsuariosPage />} />
        <Route path="usuarios/novo" element={<NovoUsuarioPage />} />
        <Route path="usuarios/:id" element={<DetalhesUsuarioPage />} />
        <Route path="usuarios/:id/perfis" element={<GerenciarPerfisPage />} />
      </Route>

      <Route path="/gestor" element={
        <ProtectedRoute requiredProfile={['Administrador', 'Gestor']}>
          <GestorLayout />
        </ProtectedRoute>
      }>
        <Route path="contratos" element={<ContratosPage />} />
      </Route>

      <Route path="/fiscal" element={
        <ProtectedRoute requiredProfile={['Administrador', 'Fiscal']}>
          <FiscalLayout />
        </ProtectedRoute>
      }>
        <Route path="pendencias" element={<PendenciasPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
```

---

## 🔄 8. Fluxo Completo de Implementação

### Passo 1: Configuração Base
1. Configure interceptors do Axios para token
2. Implemente hook `useAuth` com contexto
3. Configure tipos TypeScript para as interfaces

### Passo 2: Autenticação
1. Página de login com formulário
2. Armazenamento de token e dados do usuário
3. Redirecionamento baseado no perfil ativo

### Passo 3: Alternância de Perfis
1. Componente seletor de perfil
2. Função de alternância sem logout
3. Atualização de rotas e permissões

### Passo 4: CRUD de Usuários
1. Listagem com filtros e paginação
2. Formulário de criação/edição
3. Modal de confirmação para exclusão

### Passo 5: Gestão de Perfis
1. Interface para visualizar perfis do usuário
2. Botões para conceder/revogar perfis
3. Feedback visual das alterações

### Passo 6: Proteção de Rotas
1. Componente ProtectedRoute
2. Verificação de permissões
3. Páginas de acesso negado

### Passo 7: Dashboard Personalizado
1. Dashboard específico por perfil
2. Menu lateral dinâmico
3. Indicadores baseados em permissões

---

## 🎨 9. Considerações de UX/UI

### 9.1 Indicadores Visuais
- **Badge do perfil ativo** no header
- **Cor diferente** para cada tipo de perfil
- **Ícone específico** para cada papel

### 9.2 Feedback do Sistema
- **Loading states** durante alternância
- **Toast notifications** para ações
- **Confirmações** para ações críticas

### 9.3 Responsividade
- **Menu mobile** com seletor de perfil
- **Tabelas responsivas** para listagens
- **Formulários adaptativos**

---

## 🚨 10. Tratamento de Erros

### 10.1 Erros de Autenticação
```typescript
// Token expirado
if (error.response?.status === 401) {
  logout();
  navigate('/login');
}

// Perfil sem permissão
if (error.response?.status === 403) {
  showError('Você não tem permissão para esta ação');
}
```

### 10.2 Validações de Formulário
```typescript
const validationSchema = yup.object({
  nome: yup.string().required('Nome é obrigatório'),
  email: yup.string().email().required('Email é obrigatório'),
  cpf: yup.string().length(11).required('CPF é obrigatório')
});
```

---

## 📊 11. Estados e Context

### 11.1 AuthContext
```typescript
interface AuthContextType {
  user: User | null;
  perfilAtivo: Perfil | null;
  perfisDisponiveis: Perfil[];
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  alternarPerfil: (perfilId: number) => Promise<void>;
}
```

### 11.2 Gerenciamento de Estado
- **React Context** para autenticação
- **React Query** para cache de dados
- **Local Storage** para persistência

---

## 🎯 12. Pontos de Atenção

### ⚠️ Segurança
- Sempre validar permissões no backend
- Não confiar apenas em verificações frontend
- Renovar token antes da expiração

### ⚠️ Performance
- Implementar cache inteligente
- Lazy loading de componentes
- Debounce em filtros de busca

### ⚠️ Usabilidade
- Feedback claro sobre perfil ativo
- Transições suaves entre perfis
- Breadcrumb para navegação

---

## 🚀 Conclusão

Este fluxo garante uma experiência fluida para usuários com múltiplos perfis, mantendo a segurança e facilidade de uso. O sistema permite alternância rápida entre papéis sem perder o contexto de trabalho.

**Rotas Principais a Implementar:**
- `/auth/login` - Login inicial
- `/auth/alternar-perfil` - Mudança de contexto
- `/api/v1/usuarios/*` - CRUD de usuários
- `/api/v1/usuarios/{id}/perfis/*` - Gestão de perfis

**Próximos Passos:**
1. Implementar autenticação básica
2. Adicionar alternância de perfis
3. Desenvolver CRUD de usuários
4. Implementar gestão de perfis
5. Adicionar proteção de rotas
6. Personalizar dashboards