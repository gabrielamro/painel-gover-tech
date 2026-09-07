import type { VercelRequest, VercelResponse } from '@vercel/node';
import { badRequest, internalError, methodNotAllowed } from '../_lib/http.js';
import { supabaseFromRequest } from '../_lib/supabase.js';
import { requireUser } from '../_lib/auth.js';
import { pickFields, SPRINT_FIELDS, validateSprint } from '../_lib/validation.js';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!['GET', 'PATCH'].includes(request.method || '')) return methodNotAllowed(response, ['GET', 'PATCH']);
  const id = String(request.query.id || '').trim();
  if (!id) return badRequest(response, 'Identificador da Sprint é obrigatório.');

  try {
    const supabase = supabaseFromRequest(request);
    const user = await requireUser(supabase, request, response);
    if (!user) return;
    if (request.method === 'GET') {
      const { data, error } = await supabase.from('sprints').select('*').eq('id', id).single();
      if (error) return internalError(response, error);
      return response.status(200).json({ data });
    }

    if (!request.body || typeof request.body !== 'object' || Array.isArray(request.body)) return badRequest(response, 'O corpo da requisição deve ser um objeto JSON.');
    const patch = pickFields(request.body as Record<string, unknown>, SPRINT_FIELDS);
    if (!Object.keys(patch).length) return badRequest(response, 'Nenhum campo editável foi informado.');
    if (!validateSprint(patch, response, true)) return;
    const { data, error } = await supabase.from('sprints').update(patch).eq('id', id).select().single();
    if (error) return internalError(response, error);
    await supabase.from('audit_logs').insert({ action: 'SPRINT_UPDATED', entity: 'Sprint', entity_id: id, details: { fields: Object.keys(patch) }, created_by: user.id });
    return response.status(200).json({ data });
  } catch (error) {
    return internalError(response, error);
  }
}
