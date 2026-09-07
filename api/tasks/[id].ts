import type { VercelRequest, VercelResponse } from '@vercel/node';
import { methodNotAllowed, internalError, badRequest } from '../_lib/http.js';
import { supabaseFromRequest } from '../_lib/supabase.js';
import { requireUser } from '../_lib/auth.js';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'PATCH') return methodNotAllowed(response, ['PATCH']);
  try {
    const client = supabaseFromRequest(request);
    const user = await requireUser(client, request, response);
    if (!user) return;
    const id = String(request.query.id || '');
    const input = request.body as Record<string, unknown>;
    const patch = Object.fromEntries(Object.entries(input || {}).filter(([key]) => ['title', 'owner', 'owner_id', 'owner_role', 'status', 'points'].includes(key)));
    if (!id || !Object.keys(patch).length) return badRequest(response, 'Identificador e campos editáveis são obrigatórios.');
    const { data, error } = await client.from('tasks').update(patch).eq('id', id).select().single();
    if (error) return internalError(response, error);
    await client.from('audit_logs').insert({ action: 'TASK_UPDATED', entity: 'Task', entity_id: id, details: { fields: Object.keys(patch) }, created_by: user.id });
    return response.status(200).json({ data });
  } catch (error) { return internalError(response, error); }
}
