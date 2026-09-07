import fs from 'node:fs/promises';

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Uso: node scripts/migrate-local-storage.mjs caminho/para/painelpro-sprints.json');
  process.exit(1);
}

const raw = JSON.parse(await fs.readFile(inputPath, 'utf8'));
const sprints = Array.isArray(raw) ? raw : raw.sprints;
if (!Array.isArray(sprints)) throw new Error('O arquivo deve conter um array de Sprints.');

const rows = sprints.map((sprint, index) => ({
  code: sprint.code,
  project: sprint.project,
  system: sprint.system || null,
  sprint_number: sprint.sprintNumber || null,
  objective: sprint.objective,
  po: sprint.po || null,
  lane: sprint.lane === 'active' || sprint.lane === 'attention' || sprint.lane === 'critical' ? 'development' : sprint.lane,
  progress: Number(sprint.progress || 0),
  expected_progress: Number(sprint.expectedProgress ?? 70),
  priority_level: sprint.priorityLevel || 'Média',
  service_order: sprint.serviceOrder || null,
  position: Number(sprint.position ?? index),
}));

console.log(JSON.stringify({ table: 'sprints', rows }, null, 2));
console.error(`Preparadas ${rows.length} Sprints. Revise o JSON e importe pelo Supabase antes de ativar a fonte remota.`);

