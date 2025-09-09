import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parse, isValid } from 'date-fns';
import { enUS } from 'date-fns/locale';

/**
 * Formata uma string de data vinda da API para o formato dd/MM/yyyy.
 * Suporta os formatos:
 * - "EEE, dd MMM yyyy HH:mm:ss 'GMT'" (ex: "Wed, 23 Jul 2025 12:55:45 GMT")
 * - "yyyy-MM-dd HH:mm:ss.SSS"         (ex: "1984-06-28 00:00:00.000")
 * - "yyyy-MM-dd HH:mm:ss xx"          (ex: "2025-07-22 23:06:08 -0300")
 * @param dataString A data em um dos formatos de string suportados.
 * @returns A data formatada como 'dd/MM/yyyy', ou '-' se a entrada for nula/indefinida, ou 'Data inválida' se o formato não for reconhecido.
 */
export function formatarData(dataString: string | null | undefined): string {
  // 1. Retorna '-' se não houver data
  if (!dataString) {
    return '-';
  }

  // 2. Define uma lista com todos os formatos de entrada que a função suporta.
  // A ordem importa: formatos mais específicos ou comuns devem vir primeiro.
  const formatosPossiveis = [
    "EEE, dd MMM yyyy HH:mm:ss 'GMT'", // Formato original
    "yyyy-MM-dd HH:mm:ss.SSS",         // Formato com milissegundos
    "yyyy-MM-dd HH:mm:ss xx"           // NOVO: Formato com timezone offset (-0300)
  ];

  let data: Date | null = null;

  // 3. Itera sobre a lista de formatos e tenta fazer o parse
  for (const formato of formatosPossiveis) {
    const dataTentativa = parse(
      dataString,
      formato,
      new Date(),
      // O locale é crucial para o formato GMT com nomes de meses em inglês
      { locale: enUS }
    );

    // Se o parse for bem-sucedido, armazena a data e interrompe o laço
    if (isValid(dataTentativa)) {
      data = dataTentativa;
      break;
    }
  }

  // 4. Se uma data válida foi encontrada, formata e retorna
  if (data) {
    return format(data, 'dd/MM/yyyy'); // Ex: 22/07/2025
  } else {
    // Se nenhum formato da lista funcionou, retorna o valor padrão
    return 'Data inválida';
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatarBooleano(valor: string | null | undefined): string {
        if (valor === 'S') return 'Sim';
        if (valor === 'N') return 'Não';
        return valor || '-';
    }

export function formatarMoeda(valor: string | number | null | undefined): string {
        const numero = Number(valor);
        if (valor === null || valor === undefined || isNaN(numero)) {
            return 'R$ 0,00';
        }
        return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }