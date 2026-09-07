import type { VercelResponse } from '@vercel/node';

export const SPRINT_FIELDS = ['project', 'system', 'sprint_number', 'objective', 'po', 'lane', 'progress', 'expected_progress', 'priority_level', 'service_order', 'position', 'function_points', 'detailed_function_points', 'source_status', 'billing_forecast_month'];

export function pickFields(input: Record<string, unknown>, fields: string[]) {
  return Object.fromEntries(Object.entries(input).filter(([key]) => fields.includes(key)));
}

export function validateSprint(payload: Record<string, unknown>, response: VercelResponse, partial = false) {
  if (!partial && (!payload.code || !payload.project || !payload.objective || !payload.lane)) {
    response.status(400).json({ error: 'code, project, objective e lane são obrigatórios.' });
    return false;
  }
  if (payload.progress !== undefined && (!Number.isInteger(payload.progress) || Number(payload.progress) < 0 || Number(payload.progress) > 100)) {
    response.status(400).json({ error: 'progress deve ser um inteiro entre 0 e 100.' });
    return false;
  }
  return true;
}
