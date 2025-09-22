/**
 * Utilitários para gerenciamento de status no sistema
 */

export type StatusType =
  | 'pendente'
  | 'aguardando_analise'
  | 'aprovado'
  | 'rejeitado'
  | 'concluido'
  | 'cancelado'
  | 'vencido'
  | 'ativo';

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconName: string;
  priority: number; // Para ordenação (1 = mais importante)
  description: string;
}

/**
 * Configurações de status padronizadas
 */
export const STATUS_CONFIGS: Record<string, StatusConfig> = {
  vencido: {
    label: 'VENCIDO',
    color: 'text-white',
    bgColor: 'bg-red-500',
    borderColor: 'border-red-600',
    iconName: 'alert-triangle',
    priority: 1,
    description: 'Prazo vencido - requer ação imediata'
  },
  pendente: {
    label: 'Pendente',
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    iconName: 'clock',
    priority: 2,
    description: 'Aguardando ação do responsável'
  },
  aguardando_analise: {
    label: 'Aguardando Análise',
    color: 'text-amber-800',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-200',
    iconName: 'hourglass',
    priority: 3,
    description: 'Enviado para análise do administrador'
  },
  rejeitado: {
    label: 'Rejeitado',
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    iconName: 'x',
    priority: 4,
    description: 'Não aprovado - necessita correção'
  },
  aprovado: {
    label: 'Aprovado',
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    iconName: 'check',
    priority: 5,
    description: 'Aprovado com sucesso'
  },
  concluido: {
    label: 'Concluído',
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    iconName: 'check-circle',
    priority: 6,
    description: 'Processo finalizado'
  },
  cancelado: {
    label: 'Cancelado',
    color: 'text-gray-800',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
    iconName: 'x-circle',
    priority: 7,
    description: 'Cancelado pelo sistema ou usuário'
  },
  ativo: {
    label: 'Ativo',
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    iconName: 'check-circle',
    priority: 8,
    description: 'Status ativo no sistema'
  }
};

/**
 * Classe utilitária para operações com status
 */
export class StatusHelper {

  /**
   * Normaliza o nome do status para busca
   */
  static normalizeStatus(status: string): string {
    return status
      .toLowerCase()
      .replace(/[_\s-]/g, '')
      .replace(/[áàâã]/g, 'a')
      .replace(/[éèê]/g, 'e')
      .replace(/[íìî]/g, 'i')
      .replace(/[óòôõ]/g, 'o')
      .replace(/[úùû]/g, 'u')
      .replace(/ç/g, 'c');
  }

  /**
   * Obtém a configuração de um status
   */
  static getStatusConfig(status: string): StatusConfig {
    const normalized = this.normalizeStatus(status);

    // Mapeamentos especiais
    const mappings: Record<string, string> = {
      'aguardandoanalise': 'aguardando_analise',
      'aguardandoaprovacao': 'aguardando_analise',
      'pendenteanalise': 'aguardando_analise',
      'concluida': 'concluido',
      'finalizado': 'concluido',
      'recusado': 'rejeitado',
      'negado': 'rejeitado',
      'ematraso': 'vencido',
      'atrasado': 'vencido',
      'vigente': 'ativo'
    };

    const mappedStatus = mappings[normalized] || normalized;

    return STATUS_CONFIGS[mappedStatus] || {
      label: status,
      color: 'text-gray-800',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-200',
      iconName: 'file-text',
      priority: 9,
      description: 'Status não categorizado'
    };
  }

  /**
   * Verifica se um status indica urgência
   */
  static isUrgent(status: string): boolean {
    const config = this.getStatusConfig(status);
    return config.priority <= 2; // vencido ou pendente
  }

  /**
   * Verifica se um status indica sucesso/conclusão
   */
  static isSuccess(status: string): boolean {
    const normalized = this.normalizeStatus(status);
    return ['aprovado', 'concluido', 'ativo'].includes(normalized);
  }

  /**
   * Verifica se um status indica falha/problema
   */
  static isFailure(status: string): boolean {
    const normalized = this.normalizeStatus(status);
    return ['rejeitado', 'vencido', 'cancelado'].includes(normalized);
  }

  /**
   * Verifica se um status indica processo em andamento
   */
  static isInProgress(status: string): boolean {
    const normalized = this.normalizeStatus(status);
    return ['pendente', 'aguardando_analise'].includes(normalized);
  }

  /**
   * Ordena uma lista de itens por prioridade de status
   */
  static sortByStatusPriority<T>(
    items: T[],
    getStatus: (item: T) => string
  ): T[] {
    return items.sort((a, b) => {
      const statusA = this.getStatusConfig(getStatus(a));
      const statusB = this.getStatusConfig(getStatus(b));
      return statusA.priority - statusB.priority;
    });
  }

  /**
   * Agrupa itens por status
   */
  static groupByStatus<T>(
    items: T[],
    getStatus: (item: T) => string
  ): Record<string, T[]> {
    return items.reduce((groups, item) => {
      const status = this.normalizeStatus(getStatus(item));
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  /**
   * Conta itens por status
   */
  static countByStatus<T>(
    items: T[],
    getStatus: (item: T) => string
  ): Record<string, number> {
    const groups = this.groupByStatus(items, getStatus);
    return Object.keys(groups).reduce((counts, status) => {
      counts[status] = groups[status].length;
      return counts;
    }, {} as Record<string, number>);
  }

  /**
   * Obtém estatísticas resumidas de status
   */
  static getStatusStats<T>(
    items: T[],
    getStatus: (item: T) => string
  ): {
    total: number;
    urgent: number;
    inProgress: number;
    success: number;
    failure: number;
    byStatus: Record<string, number>;
  } {
    const total = items.length;
    let urgent = 0;
    let inProgress = 0;
    let success = 0;
    let failure = 0;

    const byStatus = this.countByStatus(items, getStatus);

    items.forEach(item => {
      const status = getStatus(item);
      if (this.isUrgent(status)) urgent++;
      if (this.isInProgress(status)) inProgress++;
      if (this.isSuccess(status)) success++;
      if (this.isFailure(status)) failure++;
    });

    return {
      total,
      urgent,
      inProgress,
      success,
      failure,
      byStatus
    };
  }

  /**
   * Verifica se uma transição de status é válida
   */
  static isValidTransition(fromStatus: string, toStatus: string): boolean {
    const from = this.normalizeStatus(fromStatus);
    const to = this.normalizeStatus(toStatus);

    // Regras básicas de transição
    const transitions: Record<string, string[]> = {
      pendente: ['aguardando_analise', 'cancelado', 'vencido'],
      aguardando_analise: ['aprovado', 'rejeitado', 'cancelado'],
      rejeitado: ['pendente', 'aguardando_analise', 'cancelado'],
      aprovado: ['concluido'],
      concluido: [], // Status final
      cancelado: [], // Status final
      vencido: ['pendente', 'cancelado'], // Pode ser reaberto
      ativo: ['cancelado']
    };

    return transitions[from]?.includes(to) || false;
  }

  /**
   * Obtém as próximas transições possíveis para um status
   */
  static getPossibleTransitions(status: string): string[] {
    const normalized = this.normalizeStatus(status);

    const transitions: Record<string, string[]> = {
      pendente: ['aguardando_analise', 'cancelado'],
      aguardando_analise: ['aprovado', 'rejeitado'],
      rejeitado: ['pendente'],
      aprovado: ['concluido'],
      concluido: [],
      cancelado: [],
      vencido: ['pendente'],
      ativo: ['cancelado']
    };

    return transitions[normalized] || [];
  }
}