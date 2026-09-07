import type { VercelRequest, VercelResponse } from '@vercel/node';

export function methodNotAllowed(response: VercelResponse, methods: string[]) {
  response.setHeader('Allow', methods.join(', '));
  return response.status(405).json({ error: 'Método não permitido.' });
}

export function badRequest(response: VercelResponse, message: string) {
  return response.status(400).json({ error: message });
}

export function internalError(response: VercelResponse, error: unknown) {
  console.error(error);
  return response.status(500).json({ error: 'Erro interno do servidor.' });
}

