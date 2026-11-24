import { PingResult } from '../types/ping.types.js';

/**
 * Realiza uma verificação HTTP na URL informada e calcula a latência de resposta.
 *
 * @param url Endereço completo com protocolo (ex: https://meusite.com)
 * @param timeoutMs Tempo limite máximo de espera em milissegundos (padrão: 5000ms)
 */
export async function checkUrl(url: string, timeoutMs = 5000): Promise<PingResult> {
  const startTime = performance.now();

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(timeoutMs),
      redirect: 'follow',
      headers: {
        'User-Agent': 'Sentinel-Monitor/1.0',
      },
    });

    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);
    const isUp = response.status >= 200 && response.status < 400;

    return {
      isUp,
      statusCode: response.status,
      latencyMs,
      error: isUp ? null : `HTTP status ${response.status}: ${response.statusText}`,
    };
  } catch (err: unknown) {
    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);

    let errorMessage = 'Erro desconhecido na verificação';

    if (err instanceof Error) {
      if (err.name === 'TimeoutError') {
        errorMessage = `Tempo limite esgotado (${timeoutMs}ms)`;
      } else {
        errorMessage = err.message;
      }
    }

    return {
      isUp: false,
      statusCode: null,
      latencyMs,
      error: errorMessage,
    };
  }
}
