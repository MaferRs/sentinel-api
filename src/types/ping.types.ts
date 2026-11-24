/**
 * Resultado padronizado de uma verificação HTTP (ping) em uma URL.
 */
export interface PingResult {
  isUp: boolean;
  statusCode: number | null;
  latencyMs: number;
  error: string | null;
}
