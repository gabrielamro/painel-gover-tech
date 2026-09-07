export function formatPF(value: number): string {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(Math.round((Number(value) + Number.EPSILON) * 100) / 100);
}
