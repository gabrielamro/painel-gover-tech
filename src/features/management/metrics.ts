import type { Sprint } from '../../domain/sprint/model';
import { systemColor } from '../../domain/sprint/queries';

export const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
export function dateValue(value: unknown): string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value) && !Number.isNaN(Date.parse(value)) ? value.slice(0, 10) : '';
}
export const acceptedDate = (s: Sprint) => dateValue(s.acceptedAt);
export const atRisk = (s: Sprint, today: string) => Boolean(s.blocked || s.impediments || s.risks || (dateValue(s.end) && dateValue(s.end) < today));
export function managementMetrics(sprints: Sprint[], now: Date) {
  const current = monthKey(now);
  const previous = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const today = `${current}-${String(now.getDate()).padStart(2, '0')}`;
  const items = sprints.filter(s => !s.code.startsWith('MACRO-') && !sprintName(s).toLocaleLowerCase('pt-BR').includes('sustentação'));
  const active = items.filter(s => !acceptedDate(s) && !['approved', 'billing', 'completed'].includes(s.lane));
  const delivered = items.filter(s => acceptedDate(s).startsWith(previous));
  const forecast = active.filter(s => dateValue(s.end).startsWith(current));
  const systems = [...new Set(delivered.map(sprintName))].map(name => ({ name, count: delivered.filter(s => sprintName(s) === name).length })).sort((a,b) => b.count-a.count);
  const deliveredAll = items.filter(s => acceptedDate(s) || ['approved', 'billing', 'completed'].includes(s.lane));
  const systemDelivery = [...new Set([...deliveredAll, ...active].map(sprintName))]
    .map(name => ({
      name,
      deliveredSprints: deliveredAll.filter(s => sprintName(s) === name).length,
      wipSprints: active.filter(s => sprintName(s) === name).length,
      color: systemColor(name),
    }))
    .sort((a, b) => (b.deliveredSprints + b.wipSprints) - (a.deliveredSprints + a.wipSprints))
    .slice(0, 5);
  const days = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
  const weeks: { label: string; safe: number; risk: number; items: Sprint[] }[] = [];
  for (let start = 1; start <= days;) {
    const weekday = new Date(now.getFullYear(), now.getMonth(), start).getDay();
    const end = Math.min(days, start + (7 - weekday) % 7);
    const rows = forecast.filter(s => { const day = Number(dateValue(s.end).slice(8)); return day >= start && day <= end; });
    const risk = rows.filter(s => atRisk(s, today)).length;
    weeks.push({ label: `${String(start).padStart(2,'0')}–${String(end).padStart(2,'0')}`, safe: rows.length-risk, risk, items: rows });
    start = end + 1;
  }
  return { current, previous, today, active, delivered, forecast, systems, systemDelivery, weeks,
    teams: new Set(active.map(s => s.teamId).filter(v => typeof v === 'string' && v.trim())).size,
    missingTeams: active.filter(s => !s.teamId).length,
    missingAcceptance: items.filter(s => ['approved','billing','completed'].includes(s.lane) && !acceptedDate(s)).length,
    decisions: active.filter(s => s.needsClientDecision === true),
  };
}
export function sprintName(s: Sprint) { return s.projectName || s.system || s.project; }
