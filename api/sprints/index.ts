import type { VercelRequest, VercelResponse } from '@vercel/node';
import { badRequest, internalError, methodNotAllowed } from '../_lib/http.js';
import { supabaseFromRequest } from '../_lib/supabase.js';
import { requireUser } from '../_lib/auth.js';
import { pickFields, SPRINT_FIELDS, validateSprint } from '../_lib/validation.js';

type SprintPayload = Record<string, unknown>;

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!['GET', 'POST'].includes(request.method || '')) return methodNotAllowed(response, ['GET', 'POST']);

  try {
    const supabase = supabaseFromRequest(request);
    const user = await requireUser(supabase, request, response);
    if (!user) return;
    if (request.method === 'GET') {
      const { data, error } = await supabase.from('sprints').select('*').order('position', { ascending: true });
      if (error) return internalError(response, error);
      return response.status(200).json({ data });
    }

    if (!request.body || typeof request.body !== 'object' || Array.isArray(request.body)) {
      return badRequest(response, 'O corpo da requisição deve ser um objeto JSON.');
    }
    const payload = request.body as SprintPayload;
    const record = pickFields(payload, ['code', ...SPRINT_FIELDS]);
    if (!validateSprint(record, response)) return;
    record.created_by = user.id;

    const { data, error } = await supabase.from('sprints').insert(record).select().single();
    if (error) return internalError(response, error);
    await supabase.from('audit_logs').insert({ action: 'SPRINT_CREATED', entity: 'Sprint', entity_id: data.id, details: { code: data.code }, created_by: user.id });
    return response.status(201).json({ data });
  } catch (error) {
    return internalError(response, error);
  }
}
