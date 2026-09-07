import { ApiSprintRepository } from '../repositories/sprint-repository.js';

const json = async (path, options = {}) => {
  const response = await fetch(path, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Falha na API.');
  return body.data;
};

export const ApiRepository = {
  sprints: ApiSprintRepository,
  tasks: {
    list(sprintId, accessToken) { return json(`/api/tasks?sprint_id=${encodeURIComponent(sprintId)}`, { headers: { Authorization: `Bearer ${accessToken}` } }); },
    create(input, accessToken) { return json('/api/tasks', { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` }, body: JSON.stringify(input) }); },
    update(id, input, accessToken) { return json(`/api/tasks/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { Authorization: `Bearer ${accessToken}` }, body: JSON.stringify(input) }); },
  },
};

