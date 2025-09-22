/**
 * Utilitários para validação de permissões no sistema
 */

export type PerfilNome = 'Administrador' | 'Gestor' | 'Fiscal';

export interface PermissionRule {
  perfil: PerfilNome;
  action: string;
  resource: string;
  condition?: (context: any) => boolean;
}

/**
 * Classe para validação de permissões
 */
export class PermissionHelper {

  /**
   * Verifica se o usuário tem permissão para uma ação específica
   */
  static hasPermission(
    userPerfil: PerfilNome,
    action: string,
    resource: string,
    context?: any
  ): boolean {

    // Administrador tem acesso total
    if (userPerfil === 'Administrador') {
      return true;
    }

    // Regras específicas por perfil
    const rules = this.getPermissionRules();

    return rules.some(rule =>
      rule.perfil === userPerfil &&
      rule.action === action &&
      rule.resource === resource &&
      (!rule.condition || rule.condition(context))
    );
  }

  /**
   * Define as regras de permissão do sistema
   */
  static getPermissionRules(): PermissionRule[] {
    return [
      // === REGRAS PARA GESTOR ===
      {
        perfil: 'Gestor',
        action: 'read',
        resource: 'contratos',
        condition: (context) => context?.gestorId === context?.currentUserId
      },
      {
        perfil: 'Gestor',
        action: 'update',
        resource: 'contratos',
        condition: (context) => context?.gestorId === context?.currentUserId
      },
      {
        perfil: 'Gestor',
        action: 'read',
        resource: 'relatorios',
        condition: (context) => context?.gestorId === context?.currentUserId
      },
      {
        perfil: 'Gestor',
        action: 'read',
        resource: 'pendencias',
        condition: (context) => context?.gestorId === context?.currentUserId
      },
      {
        perfil: 'Gestor',
        action: 'create',
        resource: 'pendencias',
        condition: (context) => context?.gestorId === context?.currentUserId
      },

      // === REGRAS PARA FISCAL ===
      {
        perfil: 'Fiscal',
        action: 'read',
        resource: 'contratos',
        condition: (context) =>
          context?.fiscalId === context?.currentUserId ||
          context?.fiscalSubstitutoId === context?.currentUserId
      },
      {
        perfil: 'Fiscal',
        action: 'read',
        resource: 'pendencias',
        condition: (context) =>
          context?.fiscalId === context?.currentUserId ||
          context?.fiscalSubstitutoId === context?.currentUserId
      },
      {
        perfil: 'Fiscal',
        action: 'create',
        resource: 'relatorios',
        condition: (context) =>
          context?.fiscalId === context?.currentUserId ||
          context?.fiscalSubstitutoId === context?.currentUserId
      },
      {
        perfil: 'Fiscal',
        action: 'read',
        resource: 'relatorios',
        condition: (context) =>
          context?.fiscalId === context?.currentUserId ||
          context?.fiscalSubstitutoId === context?.currentUserId
      },
      {
        perfil: 'Fiscal',
        action: 'upload',
        resource: 'arquivos',
        condition: (context) =>
          context?.fiscalId === context?.currentUserId ||
          context?.fiscalSubstitutoId === context?.currentUserId
      },

      // === REGRAS GERAIS ===
      {
        perfil: 'Gestor',
        action: 'read',
        resource: 'dashboard',
      },
      {
        perfil: 'Fiscal',
        action: 'read',
        resource: 'dashboard',
      },
    ];
  }

  /**
   * Verifica se o usuário pode acessar um contrato específico
   */
  static canAccessContract(
    userPerfil: PerfilNome,
    userId: number,
    contract: {
      gestorId?: number;
      fiscalId?: number;
      fiscalSubstitutoId?: number;
    }
  ): boolean {
    if (userPerfil === 'Administrador') return true;

    if (userPerfil === 'Gestor') {
      return contract.gestorId === userId;
    }

    if (userPerfil === 'Fiscal') {
      return contract.fiscalId === userId || contract.fiscalSubstitutoId === userId;
    }

    return false;
  }

  /**
   * Verifica se o usuário pode criar/editar contratos
   */
  static canManageContracts(userPerfil: PerfilNome): boolean {
    return userPerfil === 'Administrador';
  }

  /**
   * Verifica se o usuário pode gerenciar usuários
   */
  static canManageUsers(userPerfil: PerfilNome): boolean {
    return userPerfil === 'Administrador';
  }

  /**
   * Verifica se o usuário pode analisar relatórios
   */
  static canAnalyzeReports(userPerfil: PerfilNome): boolean {
    return userPerfil === 'Administrador';
  }

  /**
   * Verifica se o usuário pode criar pendências
   */
  static canCreatePendencias(
    userPerfil: PerfilNome,
    userId: number,
    contractGestorId?: number
  ): boolean {
    if (userPerfil === 'Administrador') return true;
    if (userPerfil === 'Gestor') return contractGestorId === userId;
    return false;
  }

  /**
   * Verifica se o usuário pode enviar relatórios
   */
  static canSubmitReports(
    userPerfil: PerfilNome,
    userId: number,
    contract: {
      fiscalId?: number;
      fiscalSubstitutoId?: number;
    }
  ): boolean {
    if (userPerfil === 'Fiscal') {
      return contract.fiscalId === userId || contract.fiscalSubstitutoId === userId;
    }
    return false;
  }

  /**
   * Verifica se o usuário pode excluir arquivos
   */
  static canDeleteFiles(userPerfil: PerfilNome): boolean {
    return userPerfil === 'Administrador';
  }

  /**
   * Verifica se o usuário pode download arquivos
   */
  static canDownloadFiles(
    userPerfil: PerfilNome,
    userId: number,
    contract: {
      gestorId?: number;
      fiscalId?: number;
      fiscalSubstitutoId?: number;
    }
  ): boolean {
    // Todos podem fazer download se tiverem acesso ao contrato
    return this.canAccessContract(userPerfil, userId, contract);
  }

  /**
   * Obtém as ações permitidas para um usuário em um contexto específico
   */
  static getAllowedActions(
    userPerfil: PerfilNome,
    userId: number,
    context: {
      contractId?: number;
      gestorId?: number;
      fiscalId?: number;
      fiscalSubstitutoId?: number;
    }
  ): string[] {
    const actions: string[] = [];

    // Ações básicas para todos os perfis autenticados
    actions.push('read_own_profile');

    if (userPerfil === 'Administrador') {
      actions.push(
        'manage_contracts',
        'manage_users',
        'analyze_reports',
        'create_pendencias',
        'delete_files',
        'read_all_data'
      );
    }

    if (userPerfil === 'Gestor') {
      if (context.gestorId === userId) {
        actions.push(
          'read_managed_contracts',
          'update_managed_contracts',
          'create_pendencias_for_managed_contracts',
          'read_reports_for_managed_contracts'
        );
      }
    }

    if (userPerfil === 'Fiscal') {
      const isFiscalResponsible =
        context.fiscalId === userId || context.fiscalSubstitutoId === userId;

      if (isFiscalResponsible) {
        actions.push(
          'read_assigned_contracts',
          'submit_reports',
          'read_own_pendencias',
          'upload_report_files'
        );
      }
    }

    return actions;
  }

  /**
   * Filtra uma lista de contratos baseado nas permissões do usuário
   */
  static filterContractsByPermission<T extends {
    gestorId?: number;
    fiscalId?: number;
    fiscalSubstitutoId?: number;
  }>(
    contracts: T[],
    userPerfil: PerfilNome,
    userId: number
  ): T[] {
    if (userPerfil === 'Administrador') {
      return contracts; // Admin vê todos
    }

    return contracts.filter(contract =>
      this.canAccessContract(userPerfil, userId, contract)
    );
  }

  /**
   * Verifica se o usuário pode alternar para um perfil específico
   */
  static canSwitchToProfile(
    _currentPerfil: PerfilNome,
    targetPerfil: PerfilNome,
    availableProfiles: PerfilNome[]
  ): boolean {
    // Só pode alternar para perfis que o usuário possui
    return availableProfiles.includes(targetPerfil);
  }

  /**
   * Obtém a hierarquia de perfis (para casos onde hierarquia importa)
   */
  static getProfileHierarchy(): Record<PerfilNome, number> {
    return {
      'Administrador': 3,
      'Gestor': 2,
      'Fiscal': 1
    };
  }

  /**
   * Verifica se um perfil tem nível superior a outro
   */
  static isHigherLevel(perfil1: PerfilNome, perfil2: PerfilNome): boolean {
    const hierarchy = this.getProfileHierarchy();
    return hierarchy[perfil1] > hierarchy[perfil2];
  }

  /**
   * Verifica permissões para navegação entre páginas
   */
  static canAccessRoute(userPerfil: PerfilNome, route: string): boolean {
    const adminOnlyRoutes = [
      '/admin/',
      '/usuarios/',
      '/gestao-relatorios',
      '/analisar-relatorios'
    ];


    const fiscalRoutes = [
      '/fiscal/',
      '/minhas-pendencias',
      '/contratos/' // Com restrições baseadas em contexto
    ];

    if (userPerfil === 'Administrador') {
      return true; // Admin acessa tudo
    }

    if (userPerfil === 'Gestor') {
      // Verifica se não é rota exclusiva de admin
      const isAdminOnly = adminOnlyRoutes.some(adminRoute =>
        route.startsWith(adminRoute)
      );
      return !isAdminOnly;
    }

    if (userPerfil === 'Fiscal') {
      // Fiscal só acessa rotas específicas
      return fiscalRoutes.some(fiscalRoute =>
        route.startsWith(fiscalRoute)
      ) || route === '/dashboard';
    }

    return false;
  }
}