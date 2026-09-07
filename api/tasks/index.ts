import type { VercelRequest, VercelResponse } from '@vercel/node';
import { methodNotAllowed, internalError, badRequest } from '../_lib/http.js';
import { supabaseFromRequest } from '../_lib/supabase.js';
import { requireUser } from '../_lib/auth.js';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!['GET', 'POST'].includes(request.method || '')) return methodNotAllowed(response, ['GET', 'POST']);
  try {
    const client = supabaseFromRequest(request);
    const user = await requireUser(client, request, response);
    if (!user) return;
    if (request.method === 'GET') {
      const sprintId = String(request.query.sprint_id || '');
      if (!sprintId) return badRequest(response, 'sprint_id é obrigatório.');
      const { data, error } = await client.from('tasks').select('*').eq('sprint_id', sprintId).order('created_at');
      if (error) return internalError(response, error);
      return response.status(200).json({ data });
    }
    const input = request.body as Record<string, unknown>;
    const record = {
      sprint_id: input.sprint_id,
      title: input.title,
      owner: input.owner || null,
      owner_id: input.owner_id || null,
      owner_role: input.owner_role || null,
      status: input.status || 'A Fazer',
      points: Number(input.points || 1),
      created_by: user.id,
    };
    const { data, error } = await client.from('tasks').insert(record).select().single();
    if (error) return internalError(response, error);
    await client.from('audit_logs').insert({ action: 'TASK_CREATED', entity: 'Task', entity_id: data.id, details: { sprint_id: data.sprint_id }, created_by: user.id });
    return response.status(201).json({ data });
  } catch (error) { return internalError(response, error); }
}
