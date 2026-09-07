const STORAGE_KEY = 'painelpro-sprints';
const runtime = typeof window === 'undefined' ? {} : window;
const DATA_SOURCE = runtime.__PAINELPRO_DATA_SOURCE__ || 'local';

function parseStored(fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

export const LocalSprintRepository = {
  load(fallback = []) { return parseStored(fallback); },
  save(sprints) { localStorage.setItem(STORAGE_KEY, JSON.stringify(sprints)); return sprints; },
};

export const ApiSprintRepository = {
  async load(accessToken) {
    const response = await fetch('/api/sprints', { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {} });
    if (!response.ok) throw new Error('Não foi possível carregar as Sprints.');
    const body = await response.json();
    return body.data || [];
  },
  async create(input, accessToken) {
    const response = await fetch('/api/sprints', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }, body: JSON.stringify(input) });
    if (!response.ok) throw new Error('Não foi possível criar a Sprint.');
    return (await response.json()).data;
  },
  async update(id, input, accessToken) {
    const response = await fetch(`/api/sprints/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }, body: JSON.stringify(input) });
    if (!response.ok) throw new Error('Não foi possível atualizar a Sprint.');
    return (await response.json()).data;
  },
};

export function getInitialSprints(seed) {
  // O carregamento remoto será ativado na integração do Supabase Auth (Fase 3).
  return LocalSprintRepository.load(seed);
}

export function persistSprints(sprints) {
  return LocalSprintRepository.save(sprints);
}

export function dataSource() { return DATA_SOURCE; }
