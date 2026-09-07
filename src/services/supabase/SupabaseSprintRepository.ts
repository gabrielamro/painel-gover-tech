import { createClient } from '@supabase/supabase-js';
import type { Sprint, SprintTask } from '../../domain/sprint/model';
import { normalizeSprintProjectManager } from '../../domain/people/projectManager';

type SupabaseSprint = Record<string, unknown> & { id: string };
type SupabaseTask = Record<string, unknown> & { sprint_id: string };

const client = (() => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return url && anonKey ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } }) : null;
})();

async function authenticatedClient() {
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session ? client : null;
}

const numberOr = (value: unknown, fallback = 0) => typeof value === 'number' ? value : Number(value ?? fallback);

function mapTask(row: SupabaseTask): SprintTask {
  return {
    id: String(row.id || `TASK-${Date.now()}`),
    title: String(row.title || 'Task sem título'),
    owner: row.owner ? String(row.owner) : undefined,
    ownerId: row.owner_id ? String(row.owner_id) : undefined,
    ownerRole: row.owner_role ? String(row.owner_role) : undefined,
    points: numberOr(row.points, 0),
    status: (row.status || 'A Fazer') as SprintTask['status'],
    createdAt: row.created_at ? String(row.created_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
}

function mapSprint(row: SupabaseSprint, tasks: SprintTask[]): Sprint {
  return normalizeSprintProjectManager({
    ...row,
    id: row.id,
    code: String(row.code || row.id),
    project: String(row.project || row.system || ''),
    system: row.system ? String(row.system) : undefined,
    sprintNumber: numberOr(row.sprint_number, 0),
    serviceOrder: row.service_order ? String(row.service_order) : undefined,
    objective: String(row.objective || ''),
    lane: String(row.lane || 'planning') as Sprint['lane'],
    progress: numberOr(row.progress),
    health: numberOr(row.health, 90),
    expectedProgress: numberOr(row.expected_progress, 70),
    priorityLevel: row.priority_level ? String(row.priority_level) : undefined,
    functionPoints: numberOr(row.function_points),
    detailedFunctionPoints: numberOr(row.detailed_function_points),
    billingForecastMonth: row.billing_forecast_month ? String(row.billing_forecast_month) : undefined,
    po: row.po ? String(row.po) : undefined,
    projectManager: row.project_manager ? String(row.project_manager) : row.manager ? String(row.manager) : undefined,
    manager: row.manager ? String(row.manager) : row.project_manager ? String(row.project_manager) : undefined,
    position: numberOr(row.position),
    taskItems: tasks,
    tasks: tasks.length || numberOr(row.tasks),
    completedTasks: tasks.filter((task) => task.status === 'Concluída').length,
    blocked: tasks.filter((task) => task.status === 'Bloqueada').length,
    lastUpdated: row.updated_at ? String(row.updated_at) : undefined,
  });
}

export async function loadSupabaseSprints(): Promise<Sprint[] | null> {
  const authenticated = await authenticatedClient();
  if (!authenticated) return null;

  const { data: sprintRows, error: sprintError } = await authenticated.from('sprints').select('*').order('position', { ascending: true });
  if (sprintError) throw sprintError;
  const rows = (sprintRows || []) as SupabaseSprint[];
  if (!rows.length) return [];

  const ids = rows.map((row) => row.id);
  const { data: taskRows, error: taskError } = await authenticated.from('tasks').select('*').in('sprint_id', ids).order('created_at', { ascending: true });
  if (taskError) throw taskError;
  const tasksBySprint = new Map<string, SprintTask[]>();
  for (const row of (taskRows || []) as SupabaseTask[]) {
    const list = tasksBySprint.get(row.sprint_id) || [];
    list.push(mapTask(row));
    tasksBySprint.set(row.sprint_id, list);
  }
  return rows.map((row) => mapSprint(row, tasksBySprint.get(row.id) || []));
}

/**
 * Persiste as posições de uma raia depois de uma movimentação. Sprints que
 * ainda existem apenas localmente não possuem UUID do Supabase e continuam no
 * modo local até serem cadastradas no banco remoto.
 */
export async function saveSupabaseSprintPositions(sprints: Sprint[]): Promise<boolean> {
  const authenticated = await authenticatedClient();
  if (!authenticated) return false;

  const updates = sprints.flatMap((sprint) => {
    const id = typeof sprint.id === 'string' ? sprint.id : '';
    if (!id) return [];
    return [
      authenticated
        .from('sprints')
        .update({
          lane: sprint.lane,
          position: sprint.position ?? 0,
          updated_at: sprint.lastUpdated || new Date().toISOString(),
        })
        .eq('id', id),
    ];
  });

  if (!updates.length) return false;
  const results = await Promise.all(updates);
  const failed = results.find((result) => result.error);
  if (failed?.error) throw failed.error;
  return true;
}
