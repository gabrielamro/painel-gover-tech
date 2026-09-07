export const SYSTEM_COLOR_STORAGE_KEY = 'painelpro-system-colors';
const REGISTRATIONS_STORAGE_KEY = 'painelpro-registrations';

type SystemProject = {
  name: string;
  color?: string;
  modules?: Array<{ name: string }>;
};

const SYSTEM_COLORS: Record<string, string> = {
  SCIEX: '#2563eb',
  SCME: '#0f766e',
  SIMNAC: '#0891b2',
  CADSUF: '#7c3aed',
  SAC: '#d97706',
  'MOBILE – APP DE VISTORIA': '#db2777',
  SAGAT: '#16a34a',
  'SISTEMA DE PROJETOS': '#475569',
  SPR: '#6d28d9',
  SUSTENTAÇÃO: '#0f766e',
};

const FALLBACK_COLORS = ['#2563eb', '#7c3aed', '#0f766e', '#d97706', '#db2777', '#0891b2', '#6d28d9'];

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLocaleUpperCase('pt-BR');
}

export function projectBaseName(value: string): string {
  const normalized = normalize(value);
  if (normalized.startsWith('SCIEX ')) return 'SCIEX';
  if (normalized.startsWith('SAGAT ')) return 'SAGAT';
  if (normalized.startsWith('SIMNAC ')) return 'SIMNAC';
  if (normalized.startsWith('SPR-') || normalized.startsWith('SPR -')) return 'SPR';
  return normalized.split(/\s+-\s+/)[0];
}

export function defaultSystemColor(system: string): string {
  const base = projectBaseName(system);
  if (SYSTEM_COLORS[base]) return SYSTEM_COLORS[base];
  const hash = [...base].reduce((total, character) => (total * 31 + character.charCodeAt(0)) | 0, 0);
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length];
}

function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
}

function readProjects(): SystemProject[] {
  if (typeof window === 'undefined') return [];
  try {
    const source = JSON.parse(window.localStorage.getItem(REGISTRATIONS_STORAGE_KEY) || '{}') as { projects?: unknown };
    return Array.isArray(source.projects) ? source.projects.filter((item): item is SystemProject => Boolean(item && typeof item === 'object' && 'name' in item)) : [];
  } catch {
    return [];
  }
}

function readLegacyColors(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const source = JSON.parse(window.localStorage.getItem(SYSTEM_COLOR_STORAGE_KEY) || '{}');
    return source && typeof source === 'object' && !Array.isArray(source) ? source as Record<string, string> : {};
  } catch {
    return {};
  }
}

/** Returns the configured project color; modules intentionally inherit their parent project color. */
export function getSystemColor(system: string): string {
  const base = projectBaseName(system);
  const standard = defaultSystemColor(base);
  const project = readProjects().find((item) => projectBaseName(item.name) === base);
  const isLegacyDefault = (color: string) => color.toLocaleLowerCase() === '#2563eb' && standard !== '#2563eb';
  if (project && isHexColor(project.color) && !isLegacyDefault(project.color)) return project.color;

  const legacy = readLegacyColors();
  const direct = legacy[system] || legacy[base];
  return isHexColor(direct) && !isLegacyDefault(direct) ? direct : standard;
}

/** Applies distinct standard colors only to blank or legacy-default projects, preserving selected custom colors. */
export function applyStandardSystemColors<T extends SystemProject>(projects: T[]): T[] {
  return projects.map((project) => {
    const standard = defaultSystemColor(project.name);
    const legacyDefault = project.color?.toLocaleLowerCase() === '#2563eb' && standard !== '#2563eb';
    return !isHexColor(project.color) || legacyDefault ? { ...project, color: standard } : project;
  });
}

/** Keeps the legacy UI reading the same source of colors during the React migration. */
export function syncSystemColorCache(projects: SystemProject[]) {
  if (typeof window === 'undefined') return;
  const next = readLegacyColors();
  projects.forEach((project) => {
    const color = isHexColor(project.color) ? project.color : defaultSystemColor(project.name);
    next[project.name] = color;
    next[projectBaseName(project.name)] = color;
    project.modules?.forEach((module) => {
      next[`${project.name} - ${module.name}`] = color;
    });
  });
  window.localStorage.setItem(SYSTEM_COLOR_STORAGE_KEY, JSON.stringify(next));
}
