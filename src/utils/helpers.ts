/**
 * Formata uma data para o formato "dd/mm/aaaa hh:mm".
 * @param dateString - A string da data a ser formatada.
 * @returns A data formatada.
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Retorna a classe CSS correspondente à cor da pontuação.
 * @param score - A pontuação do candidato.
 * @returns A classe CSS para a cor.
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600 dark:text-green-400"; // Verde para notas altas
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400"; // Amarelo para notas médias
  if (score >= 40) return "text-orange-600 dark:text-orange-400"; // Laranja para notas baixas
  return "text-red-600 dark:text-red-400"; // Vermelho para notas muito baixas
}
