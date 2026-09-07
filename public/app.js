import { AnalyticsService as DomainAnalyticsService, AuditService as DomainAuditService, DecisionService as DomainDecisionService, PfForecastService } from './domain.js';
import { getInitialSprints, persistSprints } from './frontend/repositories/sprint-repository.js';
import { TASK_STATUSES, createTasks, SprintProgressService, SprintHealthService, SprintAlertService, syncSprintDerived } from './frontend/services/sprint-domain-service.js';
import { renderTaskBoard } from './frontend/components/task-board.js';
import { AuthService } from './frontend/services/auth.js';
import { ApiSprintRepository } from './frontend/repositories/sprint-repository.js';
import { mountAuthControl } from './frontend/components/auth-control.js';

const LANES = [
  { id: 'planning', label: 'Em planejamento', tone: 'blue' },
  { id: 'planned', label: 'Planejado', tone: 'blue' },
  { id: 'development', label: 'Em desenvolvimento', tone: 'indigo' },
  { id: 'homologation', label: 'Em homologação', tone: 'amber' },
  { id: 'approved', label: 'Homologado', tone: 'green' },
  { id: 'billing', label: 'Aguardando faturamento', tone: 'blue' },
  { id: 'completed', label: 'Faturado', tone: 'green' },
];

const WIP_LIMITS = { planning: Infinity, planned: Infinity, development: Infinity, homologation: Infinity, approved: Infinity, billing: Infinity, completed: Infinity };
let boardPreferences = JSON.parse(localStorage.getItem('painelpro-kanban-preferences') || 'null') || { sort: 'position', collapsed: {} };
boardPreferences.sort = 'position';
const persistBoardPreferences = () => localStorage.setItem('painelpro-kanban-preferences', JSON.stringify(boardPreferences));

const DATASET_VERSION = 'spreadsheet-2026-08-31-v1';
const spreadsheetRows = [
  ['15819', 'SPRINT 26', 40, 74.75, 'CONTAGEM REALIZADA', 'CADSUF', 'approved'],
  ['15859', 'SPRINT 24 WEB', 40, 36.45, 'EM HOMOLOGAÇÃO', 'SIMNAC WEB', 'homologation'],
  ['15860', 'SPRINT 22 APP', 40, 75, 'EM HOMOLOGAÇÃO', 'SIMNAC APP', 'homologation'],
  ['15807', 'SPRINT 26', 20, 10.5, 'APTA PARA FATURAMENTO', 'SAC', 'billing'],
  ['15600', 'SPRINT 26', 20, 5.75, 'APTA PARA FATURAMENTO', 'SAC', 'billing'],
  ['15599', 'SPRINT 26', 20, 17.25, 'APTA PARA FATURAMENTO', 'SAC', 'billing'],
  ['15598', 'SPRINT 26', 20, 30, 'APTA PARA FATURAMENTO', 'SAC', 'billing'],
  ['15883', 'SPRINT 26', 20, 9, 'APTA PARA FATURAMENTO', 'SAC', 'billing'],
  ['15843', 'SPRINT 26', 20, 6, 'APTA PARA FATURAMENTO', 'SAC', 'billing'],
  ['15930', 'SPRINT 3', 40, 148, 'REVISÃO OU IMPLANTAÇÃO', 'Sagat - Recepção', 'development'],
  ['15697', 'SPRINT 2', 40, 97, 'CONTAGEM REALIZADA', 'Sagat - Recepção', 'approved'],
  ['15793', 'SPRINT 18', 30, 33.6, 'APTA PARA FATURAMENTO', 'Sagat- Analise RD', 'billing'],
  ['15896', 'SPRINT 19', 40, 30.75, 'CONTAGEM REALIZADA', 'Sagat- Analise RD', 'approved'],
  ['15776', 'SPRINT 25', null, 25, 'APTA PARA FATURAMENTO', 'SAC', 'billing'],
];
const seed = spreadsheetRows.map(([order, title, estimatedPf, detailedPf, sourceStatus, system, lane], index) => ({
  code: `OS-${order}`,
  project: system,
  system,
  sprintNumber: Number(String(title).match(/\d+/)?.[0] || 0),
  objective: title,
  po: 'Não informado',
  progress: 0,
  expectedProgress: 0,
  lane,
  end: 'Não informado',
  tasks: 0,
  blocked: 0,
  impediments: 0,
  risks: 0,
  deliveries: 0,
  health: 90,
  priorityLevel: 'Média',
  serviceOrder: `#${order}`,
  position: index + 1,
  functionPoints: estimatedPf,
  detailedFunctionPoints: detailedPf,
  sourceStatus,
  labels: [],
  taskItems: [],
  technicalLead: 'Não informado',
  nextMilestone: 'Não informado',
  acceptanceCriteria: 'Não informado',
  billingForecastMonth: PfForecastService.normalizeMonth(''),
  lastUpdated: new Date().toISOString(),
}));

let sprints = getInitialSprints(seed);
if (localStorage.getItem('painelpro-dataset-version') !== DATASET_VERSION) {
  sprints = seed.map((sprint) => ({ ...sprint, taskItems: [] }));
  ['painelpro-db', 'painelpro-cadastros', 'painelpro-labels', 'painelpro-label-colors', 'painelpro-system-colors', 'painelpro-relationships', 'painelpro-pf-improvements', 'painelpro-kanban-saved-view', 'painelpro-official-systems-v1'].forEach((key) => localStorage.removeItem(key));
  localStorage.setItem('painelpro-sprints', JSON.stringify(sprints));
  localStorage.setItem('painelpro-cadastros', JSON.stringify({ systems: [...new Set(seed.map((sprint) => sprint.system))], pos: [], managers: [], cgticAnalysts: [], businessAnalysts: [], priorities: ['Baixa', 'Média', 'Alta', 'Crítica'], labels: [] }));
  localStorage.setItem('painelpro-dataset-version', DATASET_VERSION);
}
const FILTER_DEFAULTS = { query: '', project: 'Projetos', po: 'POs', manager: 'Gerentes', priority: 'Prioridades', label: 'Etiquetas', issue: 'Situações' };
let filters = { ...FILTER_DEFAULTS };
let selected = null;
let activeView = 'kanban';
let pfFilters = { month: PfForecastService.normalizeMonth(''), project: 'Projetos', os: 'OS', po: 'POs', manager: 'Gerentes', lane: 'Situações' };
let dashboardLaneFilter = 'all';

const syncDerived = () => syncSprintDerived(sprints);
syncDerived();
if (!localStorage.getItem('painelpro-workflow-migrated-v2')) { sprints.forEach((sprint) => { const previousLane = sprint.lane; if (previousLane === 'active' || previousLane === 'attention' || previousLane === 'critical') sprint.lane = 'development'; if (previousLane === 'critical') sprint.priorityLevel = 'Crítica'; if (previousLane === 'attention') sprint.labels = ['Atenção']; }); sprints.filter((sprint) => sprint.lane === 'planned').forEach((sprint) => { sprint.lane = 'planning'; }); localStorage.setItem('painelpro-workflow-migrated-v2', 'true'); }
sprints.forEach((sprint, index) => { sprint.priorityLevel ||= sprint.health < 60 ? 'Crítica' : sprint.health < 75 ? 'Alta' : sprint.health < 90 ? 'Média' : 'Baixa'; sprint.labels ||= sprint.health < 70 ? ['Atenção'] : []; sprint.expectedProgress ??= Math.min(100, sprint.progress + (sprint.health < 70 ? 18 : 8)); sprint.lastUpdated ||= new Date(Date.now() - (index % 9) * 86400000).toISOString(); sprint.nextMilestone ||= sprint.lane === 'homologation' ? 'Concluir validação funcional' : sprint.lane === 'billing' ? 'Emitir documentação de faturamento' : 'Finalizar próximo pacote de entrega'; sprint.technicalLead ||= ['Lucas Almeida', 'João Victor', 'Rafael Lima'][index % 3]; sprint.acceptanceCriteria ||= 'Entrega validada pelo PO e sem bloqueios críticos.'; sprint.enteredLaneAt ||= sprint.lastUpdated; if (!Object.hasOwn(sprint, 'functionPoints')) sprint.functionPoints = Math.max(1, Math.round((sprint.tasks || 1) * 1.5)); });
sprints.forEach((sprint, index) => { sprint.serviceOrder ||= `#OS${15000 + index}`; });
sprints.forEach((sprint, index) => {
  sprint.billingForecastMonth ||= PfForecastService.normalizeMonth('', new Date(new Date().getFullYear(), new Date().getMonth() + (index % 3) - 1, 1));
  if (['billing', 'completed'].includes(sprint.lane) && !Object.hasOwn(sprint, 'detailedFunctionPoints')) sprint.detailedFunctionPoints = Math.max(0, Math.round(Number(sprint.functionPoints || 0) * (index % 3 === 0 ? 1.12 : index % 3 === 1 ? 0.96 : 1)));
  if (sprint.lane === 'completed') sprint.invoicedAt ||= new Date(Date.now() - (index % 20) * 86400000).toISOString();
});
localStorage.setItem('painelpro-sprints', JSON.stringify(sprints));
const DEFAULT_PRIORITIES = ['Baixa', 'Média', 'Alta', 'Crítica'];
const registryKey = 'painelpro-cadastros';
const registry = () => {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(registryKey) || '{}') || {}; } catch { saved = {}; }
  const systemsFromSprints = sprints.map((item) => item.system || item.project.split(' - Sprint')[0]);
  const posFromSprints = sprints.map((item) => item.po).filter(Boolean);
  const labelsFromSprints = sprints.flatMap((item) => item.labels || []);
  return {
    systems: [...new Set([...systemsFromSprints, ...(saved.systems || [])])].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    pos: [...new Set([...posFromSprints, ...(saved.pos || [])])].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    managers: [...new Set([...(saved.managers || []), 'Adilson Villar'])].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    cgticAnalysts: [...new Set(saved.cgticAnalysts || [])].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    businessAnalysts: [...new Set(saved.businessAnalysts || [])].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    priorities: [...new Set([...DEFAULT_PRIORITIES, ...(saved.priorities || [])])],
    labels: [...new Set([...labelsFromSprints, ...(saved.labels || [])])].sort((a, b) => a.localeCompare(b, 'pt-BR')),
  };
};
const saveRegistry = (value) => localStorage.setItem(registryKey, JSON.stringify(value));
const labelColorKey = 'painelpro-label-colors';
const labelColors = () => { try { return JSON.parse(localStorage.getItem(labelColorKey) || '{}') || {}; } catch { return {}; } };
const labelColor = (label) => labelColors()[label] || '#4f7df3';
const saveLabelColors = (colors) => localStorage.setItem(labelColorKey, JSON.stringify(colors));
const systemColorKey = 'painelpro-system-colors';
const systemColors = () => { try { return JSON.parse(localStorage.getItem(systemColorKey) || '{}') || {}; } catch { return {}; } };
const saveSystemColors = (colors) => localStorage.setItem(systemColorKey, JSON.stringify(colors));
const relationshipKey = 'painelpro-relationships';
const relationships = () => { try { const saved = JSON.parse(localStorage.getItem(relationshipKey) || '{}') || {}; return { managers: saved.managers || [], systemPO: saved.systemPO || {}, poManager: saved.poManager || {}, systemAnalysts: saved.systemAnalysts || {} }; } catch { return { managers: [], systemPO: {}, poManager: {}, systemAnalysts: {} }; } };
const saveRelationships = (value) => localStorage.setItem(relationshipKey, JSON.stringify(value));
{
  const links = relationships();
  const needsManager = !links.managers.includes('Adilson Villar');
  links.managers = [...new Set([...links.managers, 'Adilson Villar'])];
  sprints.forEach((sprint) => { if (sprint.po) links.poManager[sprint.po] = 'Adilson Villar'; });
  if (needsManager) saveRelationships(links);
  localStorage.setItem('painelpro-initial-project-manager-v1', 'true');
}
const systemPO = (system) => relationships().systemPO[system] || '';
const poManager = (po) => relationships().poManager[po] || '';
const projectAnalysts = (system) => relationships().systemAnalysts[system] || { cgtic: '', business: '' };
document.addEventListener('submit', (event) => { const form = event.target; if (!form.matches?.('.registry-editor [data-registry-edit-form]')) return; const editor = form.closest('.editor-modal'); if (editor?.dataset.registryType !== 'systems') return; const values = new FormData(form); const next = String(values.get('value') || '').trim(); if (!next) return; const links = relationships(); delete links.systemAnalysts[editor.dataset.registryPrevious]; links.systemAnalysts[next] = { cgtic: String(values.get('cgticAnalyst') || ''), business: String(values.get('businessAnalyst') || '') }; saveRelationships(links); }, true);
new MutationObserver(() => { const form = document.querySelector('.registry-editor[data-registry-type="systems"] [data-registry-edit-form]:not([data-analysts-wired])'); if (!form) return; form.dataset.analystsWired = 'true'; const analysts = projectAnalysts(form.closest('.editor-modal').dataset.registryPrevious); const data = registry(); [['cgticAnalyst', 'Analista CGTIC', data.cgticAnalysts, analysts.cgtic], ['businessAnalyst', 'Analista de negócio', data.businessAnalysts, analysts.business]].forEach(([name, label, options, selected]) => { const field = document.createElement('label'); field.textContent = label; const select = document.createElement('select'); select.name = name; select.innerHTML = `<option value="">Não vinculado</option>${options.map((option) => `<option ${option === selected ? 'selected' : ''}>${esc(option)}</option>`).join('')}`; field.append(select); form.querySelector('.editor-actions').before(field); }); }).observe(document.body, { childList: true, subtree: true });
const reorderCards = () => { document.querySelectorAll('.sprint-card').forEach((cardEl) => { cardEl.ondragover = (event) => { const dragged = document.querySelector('.sprint-card.dragging'); const target = sprints.find((sprint) => sprint.code === cardEl.dataset.code); if (dragged && target && sprints.find((sprint) => sprint.code === dragged.dataset.code)?.lane === target.lane) { event.preventDefault(); cardEl.classList.add('drop-target'); } }; cardEl.ondragleave = () => cardEl.classList.remove('drop-target'); cardEl.ondrop = (event) => { const dragged = document.querySelector('.sprint-card.dragging'); cardEl.classList.remove('drop-target'); if (!dragged || dragged === cardEl) return; const from = sprints.findIndex((sprint) => sprint.code === dragged.dataset.code); const to = sprints.findIndex((sprint) => sprint.code === cardEl.dataset.code); if (from < 0 || to < 0 || sprints[from].lane !== sprints[to].lane) return; event.preventDefault(); event.stopPropagation(); const [moved] = sprints.splice(from, 1); sprints.splice(to, 0, moved); sprints.filter((sprint) => sprint.lane === moved.lane).forEach((sprint, index) => { sprint.position = index; }); persist(); DomainAuditService.log('SPRINT_REORDERED', 'Sprint', moved.code, { position: moved.position, lane: moved.lane }); render(); }; }); };

const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
const lane = (id) => LANES.find((item) => item.id === id);
function systemColor(system) { const saved = systemColors()[system]; if (saved) return saved; const palette = ['#2f72d2', '#7a55d8', '#159a68', '#d6811f', '#d2577d', '#27869e', '#6a7f33', '#a454b6']; let hash = 0; for (const char of String(system)) hash = (hash * 31 + char.charCodeAt(0)) | 0; return palette[Math.abs(hash) % palette.length]; }
const healthClass = (score) => score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical';
const visible = () => sprints.filter((sprint) => {
  const q = filters.query.toLowerCase();
  const normalizeSearch = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const matchesQuery = !q || normalizeSearch(JSON.stringify(sprint)).includes(normalizeSearch(q));
  const matchesProject = ['Projetos', 'Todos os projetos'].includes(filters.project) || (sprint.system || sprint.project.split(' - Sprint')[0]) === filters.project;
  const matchesHealth = true;
  const matchesPo = ['POs', 'Todos os POs'].includes(filters.po) || sprint.po === filters.po;
  const matchesManager = ['Gerentes', 'Todos os gerentes'].includes(filters.manager) || poManager(sprint.po) === filters.manager;
  const matchesPriority = ['Prioridades', 'Todas as prioridades'].includes(filters.priority) || sprint.priorityLevel === filters.priority;
  const matchesLabel = ['Etiquetas', 'Todas as etiquetas'].includes(filters.label) || (sprint.labels || []).includes(filters.label);
  const matchesLane = currentRoute() !== 'dashboard' || dashboardLaneFilter === 'all' || sprint.lane === dashboardLaneFilter;
  const matchesIssue = ['Situações', 'Todas as situações'].includes(filters.issue) || (filters.issue === 'Com bloqueios' && sprint.blocked > 0) || (filters.issue === 'Atrasadas' && sprint.health < 60) || (filters.issue === 'Sem atualização' && Date.now() - new Date(sprint.lastUpdated).getTime() > 7 * 86400000);
  return matchesQuery && matchesProject && matchesHealth && matchesPo && matchesManager && matchesPriority && matchesLabel && matchesLane && matchesIssue;
});
const persist = () => persistSprints(sprints);
const scoreLabel = (score) => score >= 80 ? 'Saudável' : score >= 60 ? 'Atenção' : 'Crítica';
persist();

function icon(name) { return ({ grid: '▦', chart: '◒', alert: '◉', box: '▣', update: '↗', search: '⌕', filter: '≡', arrow: '→', close: '×', chevron: '⌄' })[name] || ''; }

const currentRoute = () => (window.location.hash.replace('#/', '') || 'kanban');
const routeShell = (title, content) => `<div class="shell"><aside class="sidebar"><div class="brand"><span class="brand-mark">P</span><span>Painel<span class="brand-soft">Pro</span></span></div><div class="workspace"><span class="workspace-dot"></span><span>Gover Tech</span><span class="workspace-chevron">⌄</span></div><nav><div class="nav-label">VISÃO GERAL</div><a href="#/kanban" class="nav-item ${currentRoute() === 'kanban' ? 'active' : ''}">${icon('grid')} <span>Kanban de Sprints</span></a><a href="#/dashboard" class="nav-item ${currentRoute() === 'dashboard' ? 'active' : ''}">${icon('chart')} <span>Dashboard Executivo</span></a><a href="#/superintendencia" class="nav-item ${currentRoute() === 'superintendencia' ? 'active' : ''}">◉ <span>Superintendência</span></a><a href="#/attention" class="nav-item ${currentRoute() === 'attention' ? 'active' : ''}">${icon('alert')} <span>Sala de Situação</span></a><div class="nav-label spaced">GESTÃO</div><a href="#/update" class="nav-item ${currentRoute() === 'update' ? 'active' : ''}">${icon('update')} <span>Nova Atualização</span></a></nav><div class="sidebar-bottom"><div class="user-avatar">CP</div><div><strong>Camila Pereira</strong><small>Gerente de portfólio</small></div></div></aside><main class="main"><header class="topbar"><div><div class="breadcrumb">Visão geral <span>/</span> ${title}</div><h1>${title}</h1><p class="subhead">Dados compartilhados com o Kanban de Sprints.</p></div><div class="top-actions"><div class="top-avatar">CP</div></div></header>${content}</main></div>`;
function goverDashboard(data, summary) { const tasks = data.reduce((sum, sprint) => sum + sprint.tasks, 0); const recent = data.slice().sort((a, b) => b.deliveries - a.deliveries).slice(0, 3); const riskItems = data.filter((sprint) => sprint.health < 70 || sprint.blocked > 0).sort((a, b) => a.health - b.health).slice(0, 3); return `<div class="gover-dashboard"><div class="gover-kpis"><div class="gover-kpi"><span class="kpi-icon blue">◒</span><div><small>Total de Sprints</small><strong>${summary.totalSprints}</strong><em>Portfólio atual</em></div></div><div class="gover-kpi"><span class="kpi-icon purple">▣</span><div><small>Tasks no Portfólio</small><strong>${tasks}</strong><em>${summary.blockedTasks} bloqueadas</em></div></div><div class="gover-kpi"><span class="kpi-icon green">✓</span><div><small>Entregas registradas</small><strong>${summary.deliveries}</strong><em>Atualizadas pelas Sprints</em></div></div><div class="gover-kpi"><span class="kpi-icon orange">!</span><div><small>Itens em atenção</small><strong>${summary.warningSprints + summary.criticalSprints}</strong><em>Exigem acompanhamento</em></div></div></div><section class="gover-section"><div class="gover-section-title"><h2>Status dos Sistemas</h2><span>${summary.totalSprints} Sprints conectadas ao portfólio</span></div><div class="system-grid">${data.map((sprint) => `<article class="system-card"><div class="system-head"><span class="system-avatar ${healthClass(sprint.health)}">${sprint.project.slice(0, 2).toUpperCase()}</span><div><b>${esc(sprint.project)}</b><small>${sprint.code} · ${esc(sprint.objective)}</small></div><span class="system-health ${healthClass(sprint.health)}">${sprint.health}</span></div><strong class="system-progress">${sprint.progress}%</strong><div class="progress-bar"><span style="width:${sprint.progress}%"></span></div><div class="system-foot"><span>${sprint.tasks} tasks · ${sprint.blocked} bloqueadas</span><span class="system-status ${healthClass(sprint.health)}">● ${lane(sprint.lane).label}</span></div></article>`).join('')}</div></section><div class="gover-bottom"><section class="gover-panel"><div class="gover-panel-title"><h2>Progresso Geral dos Projetos</h2><span>Planejado × Real</span></div>${evolutionChart(data, summary.overallProgress)}</section><section class="gover-panel"><div class="gover-panel-title"><h2>Atividades Recentes</h2><a href="#/update">Nova atualização →</a></div><div class="activity-list">${recent.map((sprint, index) => `<div class="activity"><span class="activity-icon ${index === 1 ? 'purple' : index === 2 ? 'green' : 'blue'}">${index === 2 ? '✓' : '↗'}</span><div><b>${index === 0 ? 'Entrega atualizada' : index === 1 ? 'Sprint em acompanhamento' : 'Progresso recalculado'}</b><p>${sprint.project} · ${sprint.code}</p><small>${sprint.objective}</small></div><time>${sprint.deliveries} ent.</time></div>`).join('')}</div><a class="panel-link" href="#/kanban">Ver operação completa →</a></section><section class="gover-panel"><div class="gover-panel-title"><h2>Alertas e Riscos</h2><a href="#/attention">Ver sala →</a></div><div class="risk-list">${riskItems.map((sprint, index) => `<div class="risk-item"><span class="risk-icon ${sprint.health < 60 ? 'red' : index === 1 ? 'yellow' : 'blue'}">${sprint.health < 60 ? '!' : 'i'}</span><div><b>${sprint.blocked > 0 ? 'Tasks bloqueadas' : 'Progresso abaixo do esperado'}</b><p>${sprint.project} · ${sprint.code}</p><small>${sprint.blocked} bloqueios · ${sprint.risks} riscos</small></div></div>`).join('') || '<div class="empty-state">Nenhum alerta ativo.</div>'}</div><a class="panel-link" href="#/attention">Ver todos os alertas →</a></section></div></div>`; }
function renderRoute(route) { const data = visible(); const summary = DomainAnalyticsService.summarize(data); if (route === 'dashboard') { $('#app').innerHTML = routeShell('Dashboard Executivo', `<div class="route-content"><div class="metric-grid"><div class="metric-card"><span>Avanço geral</span><strong>${summary.overallProgress}%</strong><small>progresso médio do portfólio</small></div><div class="metric-card"><span>Sprints críticas</span><strong class="metric-danger">${summary.criticalSprints}</strong><small>exigem decisão gerencial</small></div><div class="metric-card"><span>Tasks bloqueadas</span><strong>${summary.blockedTasks}</strong><small>em ${summary.totalSprints} Sprints</small></div><div class="metric-card"><span>Entregas</span><strong class="metric-good">${summary.deliveries}</strong><small>registradas no período</small></div></div><div class="route-panels"><div class="route-panel"><div class="section-title">Distribuição do portfólio</div>${distribution(data, summary.counts)}</div><div class="route-panel"><div class="section-title">Evolução Planejado × Real</div>${evolutionChart(data, summary.overallProgress)}</div></div><div class="route-panel full"><div class="section-title">Sprints prioritárias</div>${data.filter((sprint) => sprint.health < 60 || sprint.blocked > 1).sort((a,b) => a.health-b.health).map((sprint) => `<div class="route-row"><b>${sprint.code} · ${sprint.project}</b><span>${sprint.progress}%</span><span class="health-pill ${healthClass(sprint.health)}">${scoreLabel(sprint.health)}</span><a href="#/kanban">Abrir no Kanban →</a></div>`).join('') || '<div class="empty-state">Nenhuma Sprint prioritária.</div>'}</div></div>`); return; } if (route === 'attention') { const attention = data.filter((sprint) => sprint.health < 70 || sprint.blocked > 0); $('#app').innerHTML = routeShell('Sala de Situação', `<div class="route-content"><div class="situation-banner"><strong>${attention.length} itens exigem decisão</strong><span>Ordenados por criticidade e impacto operacional</span></div><div class="decision-list">${attention.sort((a,b) => a.health-b.health).map((sprint) => `<div class="decision-card"><div class="decision-card-head"><span class="alert-icon ${sprint.health < 60 ? 'red' : 'yellow'}">!</span><div><b>${sprint.project} — ${sprint.code}</b><small>${sprint.objective}</small></div><span class="health-pill ${healthClass(sprint.health)}">${sprint.health}/100</span></div><p><strong>Problema:</strong> ${sprint.blocked} tasks bloqueadas, ${sprint.impediments} impedimentos e ${sprint.risks} riscos.</p><p><strong>Ação recomendada:</strong> Revisar dependências e plano de entrega.</p><div><a class="secondary-button" href="#/kanban">Abrir Sprint</a><button class="primary-small" data-decision="${sprint.code}">Registrar decisão</button></div></div>`).join('') || '<div class="empty-state">Tudo sob controle no momento.</div>'}</div></div>`); document.querySelectorAll('[data-decision]').forEach((button) => button.onclick = () => { DomainAuditService.log('DECISION_CREATED', 'Sprint', button.dataset.decision, { decision: 'Revisar dependências' }); button.textContent = 'Decisão registrada'; button.disabled = true; }); return; } if (route === 'update') { $('#app').innerHTML = routeShell('Nova Atualização', `<div class="route-content"><div class="update-layout"><div class="route-panel"><div class="section-title">Atualizar execução</div><form id="update-form"><label>Projeto<select id="update-project">${[...new Set(sprints.map((sprint) => sprint.project))].map((project) => `<option>${project}</option>`).join('')}</select></label><label>Sprint<select id="update-sprint">${sprints.map((sprint) => `<option value="${sprint.code}">${sprint.code} · ${sprint.project}</option>`).join('')}</select></label><label>Status da Task<select id="update-status">${TASK_STATUSES.map((status) => `<option>${status}</option>`).join('')}</select></label><label>Progresso observado<input type="range" id="update-progress" min="0" max="100" value="50"><output id="progress-output">50%</output></label><label>Comentário<textarea id="update-comment" placeholder="Registre um contexto curto para a equipe"></textarea></label><button class="primary-button" type="submit">Salvar atualização</button></form><div id="update-feedback" class="form-feedback"></div></div><div class="route-panel"><div class="section-title">Atalhos do PO</div><p class="route-copy">Use esta tela para registrar o estado operacional sem produzir relatórios manuais extensos.</p><div class="shortcut">✓ Atualiza uma Task</div><div class="shortcut">⚑ Recalcula bloqueios</div><div class="shortcut">◒ Recalcula Health Score</div><div class="shortcut">↗ Gera auditoria</div></div></div></div>`); $('#update-progress').oninput = (event) => { $('#progress-output').textContent = `${event.target.value}%`; }; $('#update-form').onsubmit = (event) => { event.preventDefault(); const sprint = sprints.find((item) => item.code === $('#update-sprint').value); sprint.progress = Number($('#update-progress').value); sprint.metrics = SprintProgressService.calculate(sprint); sprint.health = SprintHealthService.calculate(sprint, sprint.metrics).score; DomainAuditService.log('TASK_UPDATED', 'Sprint', sprint.code, { status: $('#update-status').value, comment: $('#update-comment').value }); persist(); $('#update-feedback').textContent = 'Atualização salva; Kanban, alertas e indicadores foram recalculados.'; }; return; } render(); }

function renderCadastros() {
  const data = registry();
  const list = (items, type, empty) => items.length ? items.map((item) => `<li><span>${type === 'labels' || type === 'systems' ? `<i class="registry-label-swatch" style="background:${esc(type === 'labels' ? labelColor(item) : systemColor(item))}"></i>` : ''}${esc(item)}</span><span class="registry-actions"><button type="button" class="registry-edit" data-registry-edit="${type}" data-registry-value="${esc(item)}" aria-label="Editar ${esc(item)}">✎</button><button type="button" class="registry-remove" data-registry-remove="${type}" data-registry-value="${esc(item)}" aria-label="Remover ${esc(item)}">×</button></span></li>`).join('') : `<li class="registry-empty">${empty}</li>`;
  $('#app').innerHTML = routeShell('Cadastros', `<div class="registry-page"><div class="registry-intro"><div><span class="eyebrow">CONFIGURAÇÃO DO PORTFÓLIO</span><h2>Dados base do Kanban</h2><p>Cadastre as opções usadas na criação e no acompanhamento das Sprints.</p></div><a class="secondary-button" href="#/kanban">Voltar ao Kanban</a></div><div class="registry-grid"><section class="registry-card"><div class="registry-card-head"><div><span class="registry-icon system">▣</span><h3>Sistemas e projetos</h3></div><b>${data.systems.length}</b></div><p>Siglas e projetos disponíveis para novas Sprints.</p><ul>${list(data.systems, 'systems', 'Nenhum sistema cadastrado.')}</ul><form data-registry-form="systems"><input name="value" placeholder="Ex.: NOVO SISTEMA" required><button class="primary-small">Adicionar</button></form></section><section class="registry-card"><div class="registry-card-head"><div><span class="registry-icon po">◉</span><h3>POs</h3></div><b>${data.pos.length}</b></div><p>Responsáveis disponíveis na criação e edição das Sprints.</p><ul>${list(data.pos, 'pos', 'Nenhum PO cadastrado.')}</ul><form data-registry-form="pos"><input name="value" placeholder="Nome do PO" required><button class="primary-small">Adicionar</button></form></section><section class="registry-card"><div class="registry-card-head"><div><span class="registry-icon priority">⚑</span><h3>Prioridades</h3></div><b>${data.priorities.length}</b></div><p>Níveis usados para orientar a ordem de tratamento.</p><ul>${list(data.priorities, 'priorities', 'Nenhuma prioridade cadastrada.')}</ul><form data-registry-form="priorities"><input name="value" placeholder="Ex.: Urgente" required><button class="primary-small">Adicionar</button></form></section><section class="registry-card"><div class="registry-card-head"><div><span class="registry-icon label">⌑</span><h3>Etiquetas</h3></div><b>${data.labels.length}</b></div><p>Marcadores para destacar contexto e acompanhar o trabalho.</p><ul>${list(data.labels, 'labels', 'Nenhuma etiqueta cadastrada.')}</ul><form data-registry-form="labels"><input name="value" placeholder="Ex.: Dependência externa" required><button class="primary-small">Adicionar</button></form></section></div></div>`);
  const registryGrid = document.querySelector('.registry-grid');
  if (registryGrid) registryGrid.insertAdjacentHTML('beforeend', `<section class="registry-card"><div class="registry-card-head"><div><span class="registry-icon po">◉</span><h3>Gerentes de Projetos</h3></div><b>${data.managers.length}</b></div><p>Gerentes responsáveis pelos POs vinculados ao portfólio.</p><ul>${list(data.managers, 'managers', 'Nenhum gerente cadastrado.')}</ul><form data-registry-form="managers"><input name="value" placeholder="Nome do gerente" required><button class="primary-small">Adicionar</button></form></section>`);
  if (registryGrid) registryGrid.insertAdjacentHTML('beforeend', `<section class="registry-card"><div class="registry-card-head"><div><span class="registry-icon system">◈</span><h3>Analistas CGTIC</h3></div><b>${data.cgticAnalysts.length}</b></div><p>Responsáveis técnicos pelos projetos, que respondem à área dona.</p><ul>${list(data.cgticAnalysts, 'cgticAnalysts', 'Nenhum analista CGTIC cadastrado.')}</ul><form data-registry-form="cgticAnalysts"><input name="value" placeholder="Nome do analista CGTIC" required><button class="primary-small">Adicionar</button></form></section><section class="registry-card"><div class="registry-card-head"><div><span class="registry-icon label">◇</span><h3>Analistas de Negócio</h3></div><b>${data.businessAnalysts.length}</b></div><p>Área dona do projeto e usuária do sistema.</p><ul>${list(data.businessAnalysts, 'businessAnalysts', 'Nenhum analista de negócio cadastrado.')}</ul><form data-registry-form="businessAnalysts"><input name="value" placeholder="Nome do analista de negócio" required><button class="primary-small">Adicionar</button></form></section>`);
  const labelForm = document.querySelector('[data-registry-form="labels"]');
  if (labelForm) { const color = document.createElement('input'); color.name = 'color'; color.type = 'color'; color.value = '#4f7df3'; color.className = 'registry-color-input'; color.setAttribute('aria-label', 'Cor da etiqueta'); labelForm.insertBefore(color, labelForm.querySelector('button')); }
  const systemForm = document.querySelector('[data-registry-form="systems"]');
  if (systemForm) { const color = document.createElement('input'); color.name = 'color'; color.type = 'color'; color.value = '#2f72d2'; color.className = 'registry-color-input'; color.setAttribute('aria-label', 'Cor dos cards do sistema'); systemForm.insertBefore(color, systemForm.querySelector('button')); }
  if (systemForm) { const select = document.createElement('select'); select.name = 'po'; select.innerHTML = `<option value="">PO vinculado</option>${data.pos.map((po) => `<option>${esc(po)}</option>`).join('')}`; systemForm.insertBefore(select, systemForm.querySelector('button')); }
  if (systemForm) { const cgtic = document.createElement('select'); cgtic.name = 'cgticAnalyst'; cgtic.innerHTML = `<option value="">Analista CGTIC</option>${data.cgticAnalysts.map((analyst) => `<option>${esc(analyst)}</option>`).join('')}`; systemForm.insertBefore(cgtic, systemForm.querySelector('button')); const business = document.createElement('select'); business.name = 'businessAnalyst'; business.innerHTML = `<option value="">Analista de negócio</option>${data.businessAnalysts.map((analyst) => `<option>${esc(analyst)}</option>`).join('')}`; systemForm.insertBefore(business, systemForm.querySelector('button')); }
  const poForm = document.querySelector('[data-registry-form="pos"]');
  if (poForm) { const select = document.createElement('select'); select.name = 'manager'; select.innerHTML = `<option value="">Gerente vinculado</option>${data.managers.map((manager) => `<option>${esc(manager)}</option>`).join('')}`; poForm.insertBefore(select, poForm.querySelector('button')); }
  [systemForm, poForm].filter(Boolean).forEach((form) => form.addEventListener('submit', () => { const formData = new FormData(form); const value = String(formData.get('value') || '').trim(); if (!value) return; const links = relationships(); if (form.dataset.registryForm === 'systems') { links.systemPO[value] = String(formData.get('po') || ''); links.systemAnalysts[value] = { cgtic: String(formData.get('cgticAnalyst') || ''), business: String(formData.get('businessAnalyst') || '') }; } if (form.dataset.registryForm === 'pos') links.poManager[value] = String(formData.get('manager') || ''); saveRelationships(links); }, true));
  const nav = document.querySelector('.sidebar nav');
  const update = nav?.querySelector('a[href="#/update"]');
  if (nav && !nav.querySelector('a[href="#/cadastros"]')) { const link = document.createElement('a'); link.href = '#/cadastros'; link.className = 'nav-item active'; link.innerHTML = `${icon('box')} <span>Cadastros</span>`; nav.insertBefore(link, update || null); }
  document.querySelectorAll('[data-registry-form]').forEach((form) => form.onsubmit = (event) => { event.preventDefault(); const type = form.dataset.registryForm; const formData = new FormData(form); const value = String(formData.get('value') || '').trim(); if (!value) return; const current = registry(); if (current[type].some((item) => item.localeCompare(value, 'pt-BR', { sensitivity: 'accent' }) === 0)) { form.querySelector('input').setCustomValidity('Este cadastro já existe.'); form.querySelector('input').reportValidity(); form.querySelector('input').setCustomValidity(''); return; } current[type].push(value); if (type === 'labels') { const colors = labelColors(); colors[value] = String(formData.get('color') || '#4f7df3'); saveLabelColors(colors); } if (type === 'systems') { const colors = systemColors(); colors[value] = String(formData.get('color') || '#2f72d2'); saveSystemColors(colors); } saveRegistry(current); DomainAuditService.log('REGISTRY_CREATED', 'Cadastro', value, { type }); render(); });
  document.querySelectorAll('[data-registry-edit]').forEach((button) => button.onclick = () => {
    const type = button.dataset.registryEdit; const previous = button.dataset.registryValue;
    const editor = document.createElement('div'); editor.className = 'editor-modal'; editor.dataset.registryPrevious = previous; editor.dataset.registryType = type;
    editor.innerHTML = `<div class="editor-dialog registry-editor"><button class="editor-close" data-registry-close>×</button><span class="eyebrow">EDITAR CADASTRO</span><h2>Atualizar ${type === 'systems' ? 'sistema ou projeto' : type === 'pos' ? 'PO' : type === 'priorities' ? 'prioridade' : 'etiqueta'}</h2><form data-registry-edit-form><label>Nome<input name="value" value="${esc(previous)}" required autofocus></label>${type === 'labels' || type === 'systems' ? `<label>${type === 'systems' ? 'Cor dos cards' : 'Cor da etiqueta'}<input class="registry-color-input" name="color" type="color" value="${esc(type === 'systems' ? systemColor(previous) : labelColor(previous))}"></label>` : ''}<div class="editor-actions"><button type="button" class="secondary-button" data-registry-close>Cancelar</button><button class="primary-small">Salvar alteração</button></div></form></div>`;
    document.body.append(editor); editor.querySelectorAll('[data-registry-close]').forEach((close) => close.onclick = () => editor.remove()); const editForm = editor.querySelector('[data-registry-edit-form]'); if (type === 'systems' || type === 'pos') { const linkLabel = document.createElement('label'); linkLabel.textContent = type === 'systems' ? 'PO vinculado' : 'Gerente vinculado'; const select = document.createElement('select'); select.name = type === 'systems' ? 'po' : 'manager'; const values = type === 'systems' ? registry().pos : registry().managers; const selectedLink = type === 'systems' ? systemPO(previous) : poManager(previous); select.innerHTML = `<option value="">Não vinculado</option>${values.map((value) => `<option ${selectedLink === value ? 'selected' : ''}>${esc(value)}</option>`).join('')}`; linkLabel.append(select); editForm.querySelector('.editor-actions').before(linkLabel); } editForm.addEventListener('submit', () => { const formData = new FormData(editForm); const value = String(formData.get('value') || '').trim(); if (!value) return; const color = editor.querySelector('input[name="color"]'); if (color) { const colors = type === 'systems' ? systemColors() : labelColors(); delete colors[previous]; colors[value] = color.value; if (type === 'systems') saveSystemColors(colors); else saveLabelColors(colors); } const links = relationships(); if (type === 'systems') { delete links.systemPO[previous]; links.systemPO[value] = String(formData.get('po') || ''); } if (type === 'pos') { delete links.poManager[previous]; links.poManager[value] = String(formData.get('manager') || ''); } if (type === 'managers') Object.keys(links.poManager).forEach((po) => { if (links.poManager[po] === previous) links.poManager[po] = value; }); saveRelationships(links); }, true); editor.querySelector('input')?.focus();
    editor.querySelector('[data-registry-edit-form]').onsubmit = (event) => { event.preventDefault(); const value = String(new FormData(event.currentTarget).get('value') || '').trim(); if (!value || value === previous) { editor.remove(); return; } const current = registry(); if (current[type].some((item) => item !== previous && item.localeCompare(value, 'pt-BR', { sensitivity: 'accent' }) === 0)) { const input = editor.querySelector('input'); input.setCustomValidity('Este cadastro já existe.'); input.reportValidity(); input.setCustomValidity(''); return; } current[type] = current[type].map((item) => item === previous ? value : item); if (type === 'systems') sprints.forEach((sprint) => { if ((sprint.system || sprint.project.split(' - Sprint')[0]) === previous) { sprint.system = value; sprint.project = `${value} - Sprint ${sprint.sprintNumber || Number(sprint.code.replace(/\D/g, ''))}`; } }); if (type === 'pos') sprints.forEach((sprint) => { if (sprint.po === previous) sprint.po = value; }); if (type === 'priorities') sprints.forEach((sprint) => { if (sprint.priorityLevel === previous) sprint.priorityLevel = value; }); if (type === 'labels') sprints.forEach((sprint) => { sprint.labels = (sprint.labels || []).map((label) => label === previous ? value : label); }); saveRegistry(current); persist(); DomainAuditService.log('REGISTRY_UPDATED', 'Cadastro', value, { type, previous }); editor.remove(); render(); };
  });
  document.querySelectorAll('[data-registry-remove]').forEach((button) => button.onclick = () => { const type = button.dataset.registryRemove; const value = button.dataset.registryValue; const current = registry(); current[type] = current[type].filter((item) => item !== value); if (type === 'labels') { const colors = labelColors(); delete colors[value]; saveLabelColors(colors); } if (type === 'systems') { const colors = systemColors(); delete colors[value]; saveSystemColors(colors); } saveRegistry(current); DomainAuditService.log('REGISTRY_REMOVED', 'Cadastro', value, { type }); render(); });
}

function ensureCadastrosNav() {
  const nav = document.querySelector('.sidebar nav');
  if (!nav) return;
  let link = nav.querySelector('a[href="#/cadastros"]');
  if (!link) {
    link = document.createElement('a');
    link.href = '#/cadastros';
    link.className = 'nav-item';
    link.innerHTML = `${icon('box')} <span>Cadastros</span>`;
    nav.insertBefore(link, nav.querySelector('a[href="#/update"]') || null);
  }
  link.classList.toggle('active', currentRoute() === 'cadastros');
}
new MutationObserver(() => ensureCadastrosNav()).observe(document.body, { childList: true, subtree: true });

function ensurePfForecastNav() {
  const nav = document.querySelector('.sidebar nav');
  if (!nav) return;
  let link = nav.querySelector('a[href="#/pf-forecast"]');
  if (!link) {
    link = document.createElement('a');
    link.href = '#/pf-forecast';
    link.className = 'nav-item';
    link.innerHTML = '▥ <span>Previsão de PF Mês</span>';
    const attention = nav.querySelector('a[href="#/attention"]');
    nav.insertBefore(link, attention || nav.querySelector('.nav-label.spaced'));
  }
  link.classList.toggle('active', currentRoute() === 'pf-forecast');
}
new MutationObserver(() => ensurePfForecastNav()).observe(document.body, { childList: true, subtree: true });

function compactKanbanToolbar() {
  const toolbar = document.querySelector('.toolbar-v2'); const topActions = document.querySelector('.main:has(.board-wrap) .top-actions');
  if (!toolbar || !topActions) return;
  const menu = document.createElement('div'); menu.className = 'kanban-filter-menu';
  const activeCount = Object.entries(filters).filter(([key, value]) => value !== FILTER_DEFAULTS[key]).length;
  menu.innerHTML = `<button type="button" class="kanban-filter-toggle" aria-expanded="false">≡ Filtros${activeCount ? `<b>${activeCount}</b>` : ''} <span>⌄</span></button><div class="kanban-filter-dropdown hidden" role="group" aria-label="Filtros do Kanban"></div>`;
  const panel = menu.querySelector('.kanban-filter-dropdown');
  const primary = toolbar.querySelector('.toolbar-primary'); const secondary = toolbar.querySelector('.toolbar-secondary');
  const search = primary.querySelector('.search-box');
  if (search) topActions.insertBefore(search, topActions.firstChild);
  [...primary.children].forEach((control) => { if (!control.matches('#more-filters') && control !== search) panel.append(control); });
  const filterChips = secondary.querySelector('.filter-chips'); const issueFilter = secondary.querySelector('#issue-filter'); const viewToggle = secondary.querySelector('.view-toggle');
  if (issueFilter) panel.append(issueFilter); if (filterChips) panel.append(filterChips);
  const newSprint = topActions.querySelector('#new-sprint');
  newSprint?.insertAdjacentElement('afterend', menu); if (viewToggle) menu.insertAdjacentElement('afterend', viewToggle);
  toolbar.remove();
  const toggle = menu.querySelector('.kanban-filter-toggle');
  toggle.onclick = () => { const opening = panel.classList.contains('hidden'); panel.classList.toggle('hidden', !opening); toggle.setAttribute('aria-expanded', String(opening)); };
  panel.onclick = (event) => event.stopPropagation();
  menu.onkeydown = (event) => { if (event.key === 'Escape') { panel.classList.add('hidden'); toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); } };
  document.querySelectorAll('.kanban-filter-dropdown select').forEach((control) => { control.title = control.options[control.selectedIndex]?.text || control.value; });
  const boardHead = document.querySelector('.board-head'); const boardWrap = document.querySelector('.board-wrap');
  const sprintCountText = boardHead?.querySelector('strong')?.textContent || `${visible().length} sprints acompanhadas`;
  if (boardWrap && !boardWrap.querySelector('.kanban-count-info')) boardWrap.insertAdjacentHTML('beforeend', `<div class="kanban-count-info">● ${esc(sprintCountText)} nos filtros atuais</div>`);
  const profile = topActions.querySelector('.top-avatar');
  if (profile && !topActions.querySelector('.kanban-profile-menu')) {
    const profileMenu = document.createElement('div'); profileMenu.className = 'kanban-profile-menu';
    profileMenu.innerHTML = `<button type="button" class="kanban-profile-toggle" aria-label="Mais opções" aria-expanded="false">•••</button><div class="kanban-profile-dropdown hidden"><button type="button" data-kanban-labels><span>⌑</span><b>Etiquetas</b></button><button type="button" data-kanban-save-view><span>▣</span><b>Salvar visão</b></button></div>`;
    profile.insertAdjacentElement('afterend', profileMenu);
    const profileToggle = profileMenu.querySelector('.kanban-profile-toggle'); const profileDropdown = profileMenu.querySelector('.kanban-profile-dropdown');
    profileToggle.onclick = () => { const opening = profileDropdown.classList.contains('hidden'); profileDropdown.classList.toggle('hidden', !opening); profileToggle.setAttribute('aria-expanded', String(opening)); };
    profileMenu.querySelector('[data-kanban-labels]').onclick = () => { profileDropdown.classList.add('hidden'); window.dispatchEvent(new Event('painelpro:open-label-manager')); };
    profileMenu.querySelector('[data-kanban-save-view]').onclick = () => { localStorage.setItem('painelpro-kanban-saved-view', JSON.stringify({ filters, sort: boardPreferences.sort })); profileDropdown.classList.add('hidden'); const toast = document.querySelector('#toast'); if (toast) { toast.textContent = 'Visão atual salva'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 1800); } };
    profileMenu.onkeydown = (event) => { if (event.key === 'Escape') { profileDropdown.classList.add('hidden'); profileToggle.setAttribute('aria-expanded', 'false'); profileToggle.focus(); } };
  }
}

const PF_IMPROVEMENTS_KEY = 'painelpro-pf-improvements';
const pfImprovementDefaults = [
  { id: 'IMP-01', title: 'Revisar estimativas das OSs do MAPI', description: 'Validar as estimativas antes da homologação.', system: 'MAPI', serviceOrder: '', owner: 'Camila Pereira', priority: 'Alta', status: 'Resolvido', resolved: true, createdAt: new Date().toISOString(), resolvedAt: new Date().toISOString() },
  { id: 'IMP-02', title: 'Padronizar classificação de situações', description: 'Revisar o uso das raias financeiras.', system: '', serviceOrder: '', owner: 'Camila Pereira', priority: 'Média', status: 'A analisar', resolved: false, createdAt: new Date().toISOString() },
  { id: 'IMP-03', title: 'Reduzir lead time em homologação', description: 'Definir prazo e responsável para retorno da área dona.', system: '', serviceOrder: '', owner: 'Camila Pereira', priority: 'Alta', status: 'Em tratamento', resolved: false, createdAt: new Date().toISOString() },
];
const loadPfImprovements = () => { try { const value = JSON.parse(localStorage.getItem(PF_IMPROVEMENTS_KEY) || 'null'); return Array.isArray(value) ? value : pfImprovementDefaults; } catch { return pfImprovementDefaults; } };
const savePfImprovements = (items) => localStorage.setItem(PF_IMPROVEMENTS_KEY, JSON.stringify(items));
const pfNumber = (value) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(Number(value || 0));
const pfMonthLabel = (value) => { const [year, month] = String(value).split('-').map(Number); return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1)).replace(/^./, (char) => char.toUpperCase()); };
const shiftPfMonth = (value, amount) => { const [year, month] = String(value).split('-').map(Number); const date = new Date(year, month - 1 + amount, 1); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; };

function pfFilteredSprints() {
  return sprints.filter((sprint) => {
    const system = sprint.system || sprint.project.split(' - Sprint')[0];
    return sprint.billingForecastMonth === pfFilters.month
      && (pfFilters.project === 'Projetos' || system === pfFilters.project)
      && (pfFilters.os === 'OS' || sprint.serviceOrder === pfFilters.os)
      && (pfFilters.po === 'POs' || sprint.po === pfFilters.po)
      && (pfFilters.manager === 'Gerentes' || poManager(sprint.po) === pfFilters.manager)
      && (pfFilters.lane === 'Situações' || sprint.lane === pfFilters.lane);
  });
}

function pfDeltaBadge(estimated, detailed) {
  if (!estimated && !detailed) return '<span class="pf-delta neutral">Sem comparação</span>';
  const delta = detailed - estimated;
  const percent = estimated ? Math.abs(delta / estimated * 100) : 100;
  if (Math.abs(delta) < 0.01) return '<span class="pf-delta neutral">Sem alteração</span>';
  return `<span class="pf-delta ${delta > 0 ? 'up' : 'down'}">${delta > 0 ? '↗' : '↘'} ${delta > 0 ? '+' : '-'}${pfNumber(percent)}% ${delta > 0 ? 'crescimento' : 'redução'}</span>`;
}

function pfComparisonChart(data) {
  const groups = [...new Set(data.map((sprint) => sprint.system || sprint.project.split(' - Sprint')[0]))].map((system) => {
    const items = data.filter((sprint) => (sprint.system || sprint.project.split(' - Sprint')[0]) === system);
    const estimated = items.reduce((sum, sprint) => sum + PfForecastService.estimated(sprint), 0);
    const detailed = items.reduce((sum, sprint) => sum + PfForecastService.detailed(sprint), 0);
    const comparable = estimated;
    return { system, estimated, detailed, comparable };
  }).sort((a, b) => b.estimated - a.estimated);
  const max = Math.max(1, ...groups.flatMap((item) => [item.estimated, item.detailed]));
  return groups.length ? `<div class="pf-chart-legend"><span><i class="estimated"></i>PF estimado</span><span><i class="detailed"></i>PF detalhado</span></div><div class="pf-comparison-chart">${groups.map((item) => `<button class="pf-comparison-row" data-pf-project="${esc(item.system)}"><b>${esc(item.system)}</b><div class="pf-bars"><span class="estimated" style="width:${item.estimated / max * 100}%"><em>${pfNumber(item.estimated)}</em></span><span class="detailed" style="width:${item.detailed / max * 100}%"><em>${pfNumber(item.detailed)}</em></span></div>${pfDeltaBadge(item.comparable, item.detailed)}</button>`).join('')}</div>` : '<div class="pf-empty">Nenhuma OS prevista para este recorte.</div>';
}

function pfFlowChart(data) {
  const groups = [...new Set(data.map((sprint) => sprint.system || sprint.project.split(' - Sprint')[0]))].map((system) => {
    const items = data.filter((sprint) => (sprint.system || sprint.project.split(' - Sprint')[0]) === system);
    return { system, execution: items.filter((sprint) => ['planning', 'planned', 'development'].includes(sprint.lane)).reduce((sum, sprint) => sum + PfForecastService.estimated(sprint), 0), delivery: items.filter((sprint) => ['homologation', 'approved', 'billing'].includes(sprint.lane)).reduce((sum, sprint) => sum + PfForecastService.estimated(sprint), 0) };
  }).sort((a, b) => (b.execution + b.delivery) - (a.execution + a.delivery));
  const max = Math.max(1, ...groups.flatMap((item) => [item.execution, item.delivery]));
  return groups.length ? `<div class="pf-chart-legend compact"><span><i class="estimated"></i>Preparação e execução</span><span><i class="delivery"></i>Fluxo de entrega</span></div><div class="pf-flow-chart">${groups.map((item) => `<button class="pf-flow-row" data-pf-project="${esc(item.system)}"><b>${esc(item.system)}</b><div><span class="execution" style="width:${item.execution / max * 100}%"><em>${pfNumber(item.execution)}</em></span><span class="delivery" style="width:${item.delivery / max * 100}%"><em>${pfNumber(item.delivery)}</em></span></div></button>`).join('')}</div>` : '<div class="pf-empty">Sem distribuição para o período.</div>';
}

function pfOsCard(sprint) {
  const system = sprint.system || sprint.project.split(' - Sprint')[0];
  const detailed = PfForecastService.detailed(sprint);
  return `<button class="pf-os-card" data-pf-open="${sprint.code}" style="--system-color:${systemColor(system)}"><div class="pf-os-head"><span>${esc(system)}</span><b>${esc(sprint.serviceOrder || sprint.code)}</b></div><small>Sprint ${sprint.sprintNumber || Number(sprint.code.replace(/\D/g, ''))}</small><h4>${esc(sprint.objective)}</h4><div class="pf-os-values"><span><small>PF estimado</small><b>${pfNumber(sprint.functionPoints)}</b></span><span><small>PF detalhado</small><b>${pfNumber(detailed)}</b></span></div><div class="pf-os-foot"><span>${pfMonthLabel(sprint.billingForecastMonth)}</span><span>${sprint.progress}%</span></div><i><b style="width:${sprint.progress}%"></b></i></button>`;
}

function pfCriticalItems(data) {
  const items = [];
  data.forEach((sprint) => {
    if (sprint.blocked > 0) items.push({ tone: 'red', icon: '!', title: `${sprint.blocked} task${sprint.blocked > 1 ? 's' : ''} bloqueada${sprint.blocked > 1 ? 's' : ''}`, detail: `${sprint.serviceOrder} · impacto de ${pfNumber(sprint.functionPoints)} PF` });
    if (sprint.lane === 'billing' && !PfForecastService.detailed(sprint)) items.push({ tone: 'orange', icon: '△', title: 'PF detalhado pendente', detail: `${sprint.serviceOrder} · aguardando análise` });
    if (Date.now() - new Date(sprint.lastUpdated).getTime() > 7 * 86400000) items.push({ tone: 'purple', icon: '◷', title: 'OS sem atualização recente', detail: `${sprint.serviceOrder} · ${sprint.system}` });
  });
  return items.slice(0, 4);
}

function openPfImprovementModal() {
  document.querySelector('.pf-improvement-modal')?.remove();
  const element = document.createElement('div');
  element.className = 'editor-modal pf-improvement-modal';
  const systems = registry().systems;
  element.innerHTML = `<div class="editor-dialog"><button class="editor-close" data-pf-improvement-close>×</button><span class="eyebrow">NOVO PONTO DE MELHORIA</span><h2>Adicionar ponto de melhoria</h2><form data-pf-improvement-form><label>Título<input name="title" required placeholder="O que precisa ser melhorado?"></label><label>Descrição<textarea name="description" rows="3" placeholder="Contexto, resultado esperado e observações"></textarea></label><div class="editor-columns"><label>Projeto<select name="system"><option value="">Portfólio geral</option>${systems.map((system) => `<option>${esc(system)}</option>`).join('')}</select></label><label>OS<select name="serviceOrder"><option value="">Não vinculada</option>${sprints.map((sprint) => `<option value="${esc(sprint.serviceOrder)}">${esc(sprint.serviceOrder)} · ${esc(sprint.system)}</option>`).join('')}</select></label></div><div class="editor-columns"><label>Responsável<input name="owner" value="Camila Pereira" required></label><label>Prioridade<select name="priority"><option>Baixa</option><option selected>Média</option><option>Alta</option><option>Crítica</option></select></label><label>Prazo<input name="dueDate" type="date"></label></div><div class="editor-actions"><button type="button" class="secondary-button" data-pf-improvement-close>Cancelar</button><button class="primary-small">Adicionar melhoria</button></div></form></div>`;
  document.body.append(element);
  element.querySelectorAll('[data-pf-improvement-close]').forEach((button) => button.onclick = () => element.remove());
  element.querySelector('[data-pf-improvement-form]').onsubmit = (event) => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const items = loadPfImprovements();
    items.unshift({ id: `IMP-${Date.now()}`, title: String(form.get('title')), description: String(form.get('description') || ''), system: String(form.get('system') || ''), serviceOrder: String(form.get('serviceOrder') || ''), owner: String(form.get('owner')), priority: String(form.get('priority')), dueDate: String(form.get('dueDate') || ''), status: 'A analisar', resolved: false, createdAt: new Date().toISOString() });
    savePfImprovements(items); DomainAuditService.log('PF_IMPROVEMENT_CREATED', 'Improvement', items[0].id, { title: items[0].title }); element.remove(); renderPfForecast();
  };
}

function renderPfForecast() {
  const data = pfFilteredSprints();
  const summary = PfForecastService.summarize(data, pfFilters.month);
  summary.comparableEstimatedPf = data.reduce((sum, sprint) => sum + PfForecastService.estimated(sprint), 0);
  summary.detailedPf = data.reduce((sum, sprint) => sum + PfForecastService.detailed(sprint), 0);
  summary.deltaPf = summary.detailedPf - summary.comparableEstimatedPf;
  const systems = [...new Set(sprints.map((sprint) => sprint.system || sprint.project.split(' - Sprint')[0]))].sort();
  const orders = [...new Set(sprints.map((sprint) => sprint.serviceOrder).filter(Boolean))].sort();
  const pos = [...new Set(sprints.map((sprint) => sprint.po).filter(Boolean))].sort();
  const managers = relationships().managers;
  const critical = pfCriticalItems(data);
  const improvements = loadPfImprovements();
  const comparableEstimated = summary.comparableEstimatedPf;
  const lanesToShow = ['planning', 'planned', 'development', 'homologation', 'approved', 'billing', 'completed'];
  const content = `<div class="pf-page"><section class="pf-toolbar"><div class="pf-month-control"><button data-pf-month="-1" aria-label="Mês anterior">‹</button><strong>▣ ${pfMonthLabel(pfFilters.month)}</strong><button data-pf-month="1" aria-label="Próximo mês">›</button></div><select data-pf-filter="project"><option>Projetos</option>${systems.map((item) => `<option ${pfFilters.project === item ? 'selected' : ''}>${esc(item)}</option>`).join('')}</select><select data-pf-filter="os"><option>OS</option>${orders.map((item) => `<option ${pfFilters.os === item ? 'selected' : ''}>${esc(item)}</option>`).join('')}</select><select data-pf-filter="po"><option>POs</option>${pos.map((item) => `<option ${pfFilters.po === item ? 'selected' : ''}>${esc(item)}</option>`).join('')}</select><select data-pf-filter="manager"><option>Gerentes</option>${managers.map((item) => `<option ${pfFilters.manager === item ? 'selected' : ''}>${esc(item)}</option>`).join('')}</select><select data-pf-filter="lane"><option value="Situações">Situações</option>${LANES.map((item) => `<option value="${item.id}" ${pfFilters.lane === item.id ? 'selected' : ''}>${item.label}</option>`).join('')}</select><button class="pf-reset" data-pf-reset aria-label="Limpar filtros">↻</button></section><section class="pf-kpis"><article><i class="blue">▣</i><span>PF previstos no mês<strong>${pfNumber(summary.estimatedPf)}</strong></span></article><article><i class="purple">↗</i><span>OSs em desenvolvimento<strong>${summary.developmentCount}</strong></span></article><article><i class="green">✓</i><span>OSs entregues<strong>${summary.deliveredCount}</strong></span></article><article><i class="orange">◷</i><span>PF aguardando faturamento<strong>${pfNumber(summary.waitingPf)}</strong></span></article><article><i class="teal">$</i><span>PF faturados no mês<strong>${pfNumber(summary.invoicedPf)}</strong></span></article></section><div class="pf-dashboard-grid"><div class="pf-main-column"><section class="pf-chart-card pf-comparison"><div class="pf-section-head"><div><span class="eyebrow">ANÁLISE FINANCEIRA</span><h3>PF estimado × PF detalhado</h3></div><div class="pf-summary-values"><span>Estimado<b>${pfNumber(comparableEstimated)}</b></span><span>Detalhado<b>${pfNumber(summary.detailedPf)}</b></span><span>Variação<b>${summary.deltaPf >= 0 ? '+' : ''}${pfNumber(summary.deltaPf)} PF</b></span>${pfDeltaBadge(comparableEstimated, summary.detailedPf)}</div></div>${pfComparisonChart(data)}</section><section class="pf-chart-card"><div class="pf-section-head"><div><span class="eyebrow">DISTRIBUIÇÃO</span><h3>Etapa e projeto</h3></div><small>Valores em PF</small></div>${pfFlowChart(data)}</section></div><aside class="pf-insights"><div class="pf-section-head"><div><span class="eyebrow">ACOMPANHAMENTO</span><h3>Pontos críticos</h3></div><b>${critical.length}</b></div><div class="pf-critical-list">${critical.map((item) => `<article class="${item.tone}"><i>${item.icon}</i><span><b>${esc(item.title)}</b><small>${esc(item.detail)}</small></span></article>`).join('') || '<div class="pf-empty compact">Nenhum ponto crítico neste recorte.</div>'}</div><div class="pf-improvements-head"><h3>Pontos de melhoria</h3><button data-add-pf-improvement>＋ Adicionar</button></div><div class="pf-improvement-list">${improvements.map((item) => `<label><input type="checkbox" data-resolve-improvement="${item.id}" ${item.resolved ? 'checked' : ''}><span><b>${esc(item.title)}</b><small>${item.resolved ? `Resolvido${item.resolvedAt ? ` em ${new Date(item.resolvedAt).toLocaleDateString('pt-BR')}` : ''}` : `${esc(item.status)}${item.dueDate ? ` · prazo ${new Date(`${item.dueDate}T12:00:00`).toLocaleDateString('pt-BR')}` : ''}`}</small></span></label>`).join('') || '<div class="pf-empty compact">Nenhuma melhoria cadastrada.</div>'}</div></aside></div><section class="pf-os-section"><div class="pf-section-head"><div><span class="eyebrow">PREVISÃO POR OS</span><h3>OSs do mês por situação</h3></div><span>${data.length} OS${data.length === 1 ? '' : 's'}</span></div><div class="pf-lane-grid">${lanesToShow.map((laneId) => { const items = data.filter((sprint) => sprint.lane === laneId); return `<section class="pf-lane"><header><span class="lane-dot"></span><b>${lane(laneId).label}</b><em>${items.length}</em></header><div>${items.map(pfOsCard).join('') || '<p>Nenhuma OS</p>'}</div></section>`; }).join('')}</div></section></div>`;
  $('#app').innerHTML = routeShell('Previsão de PF Mês', content) + (selected ? drawerV2(selected) : '') + '<div id="toast" class="toast"></div>';
  document.querySelector('.pf-main-column .pf-chart-card:not(.pf-comparison)')?.remove();
  document.querySelector('.pf-main-column')?.classList.add('single-panel');
  const totalDetailedPf = data.reduce((sum, sprint) => sum + PfForecastService.detailed(sprint), 0);
  document.querySelector('.pf-kpis')?.insertAdjacentHTML('beforeend', `<article><i class="purple">∑</i><span>Total de PF detalhado<strong>${pfNumber(totalDetailedPf)}</strong></span></article>`);
  document.querySelectorAll('.pf-kpis article').forEach((article) => { if (article.textContent.includes('PF faturados no mês')) article.remove(); });
  ensurePfForecastNav();
  const pfToolbar = document.querySelector('.pf-toolbar');
  const pfTopbar = document.querySelector('.main:has(.pf-page) .topbar');
  if (pfToolbar && pfTopbar) {
    const topControls = document.createElement('div'); topControls.className = 'pf-top-controls';
    const monthControl = pfToolbar.querySelector('.pf-month-control');
    const filterPanel = document.createElement('div'); filterPanel.className = 'pf-filter-dropdown hidden'; filterPanel.setAttribute('role', 'group'); filterPanel.setAttribute('aria-label', 'Filtros da previsão mensal');
    pfToolbar.querySelectorAll('select,.pf-reset').forEach((control) => filterPanel.append(control));
    const activeFilterCount = [['project', 'Projetos'], ['os', 'OS'], ['po', 'POs'], ['manager', 'Gerentes'], ['lane', 'Situações']].filter(([key, initial]) => pfFilters[key] !== initial).length;
    const filterWrap = document.createElement('div'); filterWrap.className = 'pf-filter-menu';
    filterWrap.innerHTML = `<button type="button" class="pf-filter-toggle" aria-expanded="false">≡ Filtros${activeFilterCount ? `<b>${activeFilterCount}</b>` : ''} <span>⌄</span></button>`;
    filterWrap.append(filterPanel); if (monthControl) topControls.append(monthControl); topControls.append(filterWrap);
    pfTopbar.insertBefore(topControls, pfTopbar.querySelector('.top-actions'));
    pfToolbar.remove();
    const toggle = filterWrap.querySelector('.pf-filter-toggle');
    toggle.onclick = () => { const opening = filterPanel.classList.contains('hidden'); filterPanel.classList.toggle('hidden', !opening); toggle.setAttribute('aria-expanded', String(opening)); };
    filterPanel.onclick = (event) => event.stopPropagation();
    filterWrap.onkeydown = (event) => { if (event.key === 'Escape') { filterPanel.classList.add('hidden'); toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); } };
  }
  const pfOsHeading = document.querySelector('.pf-os-section .pf-section-head h3');
  if (pfOsHeading) pfOsHeading.textContent = `OSs previstas para ${pfMonthLabel(pfFilters.month)}`;
  document.querySelectorAll('.pf-lane').forEach((laneElement) => { if (!laneElement.querySelector('[data-pf-open]')) laneElement.remove(); });
  const pfLaneGrid = document.querySelector('.pf-lane-grid');
  if (pfLaneGrid && !pfLaneGrid.querySelector('.pf-lane')) pfLaneGrid.innerHTML = '<div class="pf-empty pf-empty-month">Nenhuma OS prevista para o mês e filtros selecionados.</div>';
  document.querySelectorAll('.pf-kpis article span').forEach((label) => { label.title = String(label.childNodes[0]?.textContent || '').trim(); });
  document.querySelectorAll('.pf-os-card h4,.pf-critical-list b,.pf-improvement-list b,.pf-comparison-row>b,.pf-flow-row>b').forEach((item) => { item.title = item.textContent.trim(); });
  document.querySelectorAll('.pf-toolbar select').forEach((control) => { control.title = control.options[control.selectedIndex]?.text || control.value; });
  const pfDetailGrid = document.querySelector('.drawer-v2 [data-popup-panel="summary"] .detail-grid');
  if (pfDetailGrid && selected) { const analysts = projectAnalysts(selected.system || selected.project.split(' - Sprint')[0]); pfDetailGrid.insertAdjacentHTML('beforeend', `<div><small>PF estimado</small><b>${pfNumber(selected.functionPoints)} PF</b></div><div><small>PF detalhado</small><b>${pfNumber(selected.detailedFunctionPoints)} PF</b></div><div><small>Previsão de faturamento</small><b>${pfMonthLabel(selected.billingForecastMonth)}</b></div><div><small>Analista CGTIC</small><b>${esc(analysts.cgtic || 'Não vinculado')}</b></div><div><small>Analista de negócio</small><b>${esc(analysts.business || 'Não vinculado')}</b></div>`); }
  document.querySelectorAll('[data-pf-month]').forEach((button) => button.onclick = () => { pfFilters.month = shiftPfMonth(pfFilters.month, Number(button.dataset.pfMonth)); renderPfForecast(); });
  document.querySelectorAll('[data-pf-filter]').forEach((control) => control.onchange = () => { pfFilters[control.dataset.pfFilter] = control.value; renderPfForecast(); });
  document.querySelector('[data-pf-reset]')?.addEventListener('click', () => { pfFilters = { month: PfForecastService.normalizeMonth(''), project: 'Projetos', os: 'OS', po: 'POs', manager: 'Gerentes', lane: 'Situações' }; renderPfForecast(); });
  document.querySelectorAll('[data-pf-project]').forEach((button) => button.onclick = () => { pfFilters.project = button.dataset.pfProject; renderPfForecast(); });
  document.querySelectorAll('[data-pf-open]').forEach((button) => button.onclick = () => { selected = sprints.find((sprint) => sprint.code === button.dataset.pfOpen); renderPfForecast(); });
  document.querySelector('[data-add-pf-improvement]')?.addEventListener('click', openPfImprovementModal);
  document.querySelectorAll('[data-resolve-improvement]').forEach((checkbox) => checkbox.onchange = () => { const items = loadPfImprovements(); const item = items.find((entry) => entry.id === checkbox.dataset.resolveImprovement); if (!item) return; item.resolved = checkbox.checked; item.status = checkbox.checked ? 'Resolvido' : 'Em tratamento'; item.resolvedAt = checkbox.checked ? new Date().toISOString() : null; item.resolvedBy = checkbox.checked ? 'Camila Pereira' : null; savePfImprovements(items); DomainAuditService.log('PF_IMPROVEMENT_STATUS_CHANGED', 'Improvement', item.id, { resolved: item.resolved }); renderPfForecast(); });
  document.querySelectorAll('[data-close="true"]').forEach((item) => item.onclick = (event) => { if (event.target === item || item.classList.contains('drawer-close')) { selected = null; renderPfForecast(); } });
  document.querySelectorAll('.drawer-tab').forEach((button) => button.onclick = () => { document.querySelectorAll('.drawer-tab').forEach((item) => item.classList.toggle('active', item === button)); document.querySelectorAll('[data-popup-panel]').forEach((panel) => panel.classList.toggle('hidden', panel.dataset.popupPanel !== button.dataset.popupTab)); });
}

function bindDashboardSituation() {
  if (currentRoute() !== 'dashboard') return;
  const content = document.querySelector('.route-content');
  if (!content || content.querySelector('[data-dashboard-situation]')) return;
  const control = document.createElement('label');
  control.className = 'dashboard-situation-filter';
  control.innerHTML = `<span>Filtrar situação da Sprint</span><select data-dashboard-situation><option value="all">Todas as situações</option>${LANES.map((item) => `<option value="${item.id}" ${dashboardLaneFilter === item.id ? 'selected' : ''}>${item.label}</option>`).join('')}</select>`;
  content.prepend(control);
  control.querySelector('select').onchange = (event) => { dashboardLaneFilter = event.target.value; render(); };
}

function render() {
  if (currentRoute() === 'attention') { window.location.hash = '#/kanban'; return; }
  if (currentRoute() === 'cadastros') return renderCadastros();
  if (currentRoute() === 'pf-forecast') return renderPfForecast();
  if (currentRoute() === 'superintendencia') {
    $('#app').innerHTML = routeShell('Painel Gover - Superintendência', '<div class="super-dashboard-mount"></div>');
    return;
  }
  if (currentRoute() !== 'kanban') { renderRoute(currentRoute()); bindDashboardSituation(); return; }
  const data = visible();
  const projects = [...new Set(sprints.map((sprint) => sprint.system || sprint.project.split(' - Sprint')[0]))].sort();
  const pos = [...new Set(sprints.map((sprint) => sprint.po))].sort();
  const labels = [...new Set(sprints.flatMap((sprint) => sprint.labels || []))].sort();
  const activeFilters = Object.entries(filters).filter(([key, value]) => value !== FILTER_DEFAULTS[key]);
  const portfolio = DomainAnalyticsService.summarize(data);
  const progress = portfolio.overallProgress;
  const counts = portfolio.counts;
  $('#app').innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand"><span class="brand-mark">P</span><span>Painel<span class="brand-soft">Pro</span></span></div>
        <div class="workspace"><span class="workspace-dot"></span><span>Gover Tech</span><span class="workspace-chevron">⌄</span></div>
        <nav><div class="nav-label">VISÃO GERAL</div><a href="#/kanban" class="nav-item active">${icon('grid')} <span>Kanban de Sprints</span></a><a href="#/dashboard" class="nav-item">${icon('chart')} <span>Dashboard Executivo</span></a><a href="#/superintendencia" class="nav-item">◉ <span>Superintendência</span></a><a href="#/attention" class="nav-item">${icon('alert')} <span>Sala de Situação</span><span class="nav-badge">5</span></a><div class="nav-label spaced">GESTÃO</div><a href="#/kanban" class="nav-item">${icon('box')} <span>Projetos</span></a><a href="#/update" class="nav-item">${icon('update')} <span>Nova Atualização</span></a></nav>
        <div class="sidebar-bottom"><div class="user-avatar">CP</div><div><strong>Camila Pereira</strong><small>Gerente de portfólio</small></div><span class="more">•••</span></div>
      </aside>
      <main class="main">
        <header class="topbar"><div><div class="breadcrumb">Visão geral <span>/</span> Operação</div><h1>Kanban de Sprints</h1><p class="subhead">Acompanhe a execução do portfólio em tempo real.</p></div><div class="top-actions"><button class="icon-button" aria-label="Ajuda">?</button><button class="new-sprint-button top-new-sprint" id="new-sprint">＋ Nova Sprint</button><button class="icon-button notification">♧<i></i></button><div class="top-avatar">CP</div></div></header>
        <div class="toolbar toolbar-v2">
          <div class="toolbar-primary"><div class="search-box">${icon('search')}<input id="search" placeholder="Buscar sistema, Sprint ou objetivo" value="${esc(filters.query)}" /></div><select id="project-filter" aria-label="Projeto"><option>Todos os projetos</option>${projects.map((project) => `<option ${filters.project === project ? 'selected' : ''}>${esc(project)}</option>`).join('')}</select><select id="po-filter" aria-label="PO"><option>Todos os POs</option>${pos.map((po) => `<option ${filters.po === po ? 'selected' : ''}>${esc(po)}</option>`).join('')}</select><select id="priority-filter" aria-label="Prioridade"><option>Todas as prioridades</option>${['Baixa','Média','Alta','Crítica'].map((priority) => `<option ${filters.priority === priority ? 'selected' : ''}>${priority}</option>`).join('')}</select><select id="label-filter" aria-label="Etiqueta"><option>Todas as etiquetas</option>${labels.map((label) => `<option ${filters.label === label ? 'selected' : ''}>${esc(label)}</option>`).join('')}</select><button class="filter-button" id="more-filters">${icon('filter')} Mais filtros <span class="filter-count">${activeFilters.length || ''}</span></button></div>
          <div class="toolbar-secondary"><select id="issue-filter" aria-label="Situação"><option>Todas as situações</option>${['Com bloqueios','Atrasadas','Sem atualização'].map((issue) => `<option ${filters.issue === issue ? 'selected' : ''}>${issue}</option>`).join('')}</select><div class="filter-chips">${activeFilters.map(([key,value]) => `<button class="filter-chip" data-clear-filter="${key}">${esc(value)} ×</button>`).join('')}${activeFilters.length ? '<button class="clear-filters" id="clear-filters">Limpar tudo</button>' : ''}</div><div class="view-toggle"><button class="view active" data-view="kanban">▦ Kanban</button><button class="view" data-view="list">☷ Lista</button></div></div>
        </div>
        <div class="content-grid"><section class="board-wrap"><div class="board-head"><div><span class="eyebrow">PORTFÓLIO ATUAL</span><strong>${data.length} sprints acompanhadas</strong></div><button class="filter-button">${icon('filter')} Filtros <span class="filter-count">${[filters.project !== 'Todos os projetos', filters.health !== 'Todas as saúdes'].filter(Boolean).length || ''}</span></button></div><div id="board" class="board">${LANES.map((item) => `<section class="lane lane-${item.tone}" data-lane="${item.id}"><div class="lane-header"><div><span class="lane-dot"></span><span>${item.label}</span></div><b>${counts[item.id]}</b></div><div class="lane-cards">${data.filter((sprint) => sprint.lane === item.id).map(card).join('') || `<div class="empty-lane">Nenhuma sprint nesta raia</div>`}</div></section>`).join('')}</div><div id="list-view" class="list-view hidden">${listTable(data)}</div></section><aside class="analytics"><div class="analytics-heading"><div><span class="eyebrow">ANÁLISE EXECUTIVA</span><h2>Saúde do portfólio</h2></div><button class="more">•••</button></div><div class="progress-widget"><div class="progress-ring" style="--progress:${progress * 3.6}deg"><div><strong>${progress}%</strong><span>avanço geral</span></div></div><div class="progress-copy"><strong>${progress >= 70 ? 'Ritmo saudável' : 'Atenção necessária'}</strong><p>Progresso médio das sprints visíveis.</p><div class="mini-line"><span style="width:${progress}%"></span></div><small>Planejado <b>75%</b><em>Real ${progress}%</em></small></div></div><div class="analytics-section"><div class="section-title">Distribuição das sprints <span>ⓘ</span></div><div class="distribution">${distribution(data, counts)}</div></div><div class="analytics-section"><div class="section-title">Evolução do portfólio <span>ⓘ</span></div>${evolutionChart(data, progress)}</div><div class="analytics-section"><div class="section-title">Principais alertas <span class="alert-count">${data.filter((sprint) => sprint.health < 60).length}</span></div><div class="alerts">${alerts(data)}</div></div><div class="analytics-section deliveries-section"><div class="section-title">Entregas recentes <a>Ver todas ${icon('arrow')}</a></div><div class="deliveries">${deliveryList(data)}</div></div></aside></div>
      </main>
    </div>${selected ? drawerV2(selected) : ''}<div id="toast" class="toast">Alteração salva e indicadores recalculados</div>`;
  compactKanbanToolbar();
  bind();
  const board = $('#board');
  const list = $('#list-view');
  if (board && list) { board.classList.toggle('hidden', activeView === 'list'); list.classList.toggle('hidden', activeView !== 'list'); document.querySelectorAll('.view').forEach((button) => button.classList.toggle('active', button.dataset.view === activeView)); }
}

function card(sprint) {
  const initials = sprint.po.split(' ').map((part) => part[0]).join('').slice(0, 2);
  const labels = (sprint.labels || []).slice(0, 3);
  const staleDays = Math.floor((Date.now() - new Date(sprint.lastUpdated).getTime()) / 86400000);
  const tasks = Number(sprint.tasks || 0);
  const blocked = Number(sprint.blocked || 0);
  const completed = Number(sprint.completedTasks ?? Math.round(tasks * (sprint.progress || 0) / 100));
  const pending = Math.max(0, tasks - completed - blocked);
  const progress = Math.max(0, Math.min(100, Number(sprint.progress || 0)));
  const system = sprint.system || sprint.project.split(' - Sprint')[0];
  const sprintLabel = sprint.sprintNumber ? `Sprint ${sprint.sprintNumber}` : sprint.code;
  const priorityClass = sprint.priorityLevel.toLowerCase().replace('í', 'i');
  const hClass = healthClass(sprint.health);
  const hLabel = sprint.health >= 80 ? 'Saudável' : sprint.health >= 60 ? 'Atenção' : 'Crítico';
  const expectedPct = sprint.expectedProgress ?? 70;
  const sysColor = systemColor(system);

  // Metric pills — only show blocked if > 0
  const pillBlocked = blocked > 0
    ? `<span class="metric-pill-blocked">⊘ ${blocked} bloqueada${blocked > 1 ? 's' : ''}</span>`
    : '';

  // Label chips
  const tagChips = labels.map((label) =>
    `<span>${esc(label)}</span>`
  ).join('');
  const issues = [
    blocked > 0 ? `<span class="issue issue-blocked">⚑ ${blocked} bloqueada${blocked > 1 ? 's' : ''}</span>` : '',
    sprint.impediments > 0 ? `<span class="issue issue-warning">! ${sprint.impediments} impedimento${sprint.impediments > 1 ? 's' : ''}</span>` : '',
  ].filter(Boolean).join('');

  return `<article class="sprint-card sprint-card-v2 sprint-card-modern priority-${priorityClass}"
    draggable="true" data-code="${sprint.code}"
    style="--system-color:${sysColor};--card-progress:${progress * 3.6}deg">

    <!-- Faixa de cor contínua do sistema -->
    <div class="card-band" aria-hidden="true"></div>

    <!-- Corpo do card -->
    <div class="card-body-inner">

      <!-- Título + Donut -->
      <div class="card-top">
        <div class="card-title-block">
          <div class="card-system-row">
            <span class="card-band-system ${String(system).length > 10 ? 'is-long' : ''}">${esc(system)}</span>
            <span class="card-sprint-eyebrow">${esc(sprintLabel)} · OS ${esc(sprint.serviceOrder || 'Não informada')}</span>
          </div>
          <span class="sprint-title">${esc(sprint.objective)}</span>
        </div>
        <div class="card-actions-modern">
          <div class="card-progress-ring">
            <strong>${progress}%</strong>
          </div>
          <div class="card-menu-wrap card-top-menu">
            <button class="card-band-menu" type="button" aria-label="Ações de ${esc(sprint.code)}" aria-expanded="false">⋮</button>
            <div class="card-context-menu hidden">
              <button type="button" data-edit-sprint="${sprint.code}">Editar Sprint</button>
              <button type="button" data-open-sprint="${sprint.code}">Abrir detalhes</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Divisor -->
      <div class="card-divider"></div>

      <!-- Pills de métricas -->
      <div class="card-metric-pills">
        <span class="metric-pill-done">✓ ${completed} concluída${completed !== 1 ? 's' : ''}</span>
        <span class="metric-pill-pending">⏳ ${pending} pendente${pending !== 1 ? 's' : ''}</span>
        ${pillBlocked}
      </div>

      <!-- Trilha de progresso dupla (planejado vs real) -->
      <div class="card-dual-track">
        <div class="card-dual-planned" style="width:${expectedPct}%"></div>
        <div class="card-dual-real" style="width:${progress}%"></div>
      </div>

      <!-- Footer: PO · Data · Health -->
      <div class="card-footer-new">
        <div class="card-po-avatar">${initials}</div>
        <span class="card-po-name">${esc(sprint.po)}</span>
        <span class="card-footer-sep">·</span>
        <span class="card-footer-date">📅 ${esc(sprint.end)}</span>
        <span class="card-footer-sep">·</span>
        <span class="card-function-points">${sprint.functionPoints ?? 0} PF</span>
        <span class="card-footer-spacer"></span>
        <span class="card-health-dot ${hClass}"></span>
        <span class="card-health-label ${hClass}">${hLabel}</span>
      </div>

      <!-- Tags e código -->
      ${tagChips || issues ? `<div class="card-tags">${tagChips}${issues}</div>` : ''}

    </div>
  </article>`;
}

function listTable(data) { return `<table><thead><tr><th>#</th><th>Sistema / Sprint</th><th>OS</th><th>Objetivo</th><th>PO</th><th>Prazo</th><th>Progresso</th><th>Tasks</th><th>Bloqueios</th><th>PF</th><th>Ações</th></tr></thead><tbody>${data.map((s, index) => { const tasks = Number(s.tasks || 0); const completed = Number(s.completedTasks ?? Math.round(tasks * (s.progress || 0) / 100)); const pending = Math.max(0, tasks - completed - Number(s.blocked || 0)); return `<tr data-code="${esc(s.code)}"><td class="list-index">${index + 1}</td><td><b>${esc(s.system || s.project.split(' - Sprint')[0])}</b><small>${esc(s.project)}</small></td><td><b>${esc(s.serviceOrder || 'Não informada')}</b></td><td>${esc(s.objective)}</td><td>${esc(s.po || 'Não informado')}</td><td>${esc(s.end || 'Não informado')}</td><td><b>${Number(s.progress || 0)}%</b><small>Planejado ${Number(s.expectedProgress ?? 70)}%</small></td><td>${completed} concluídas<small>${pending} pendentes</small></td><td class="${Number(s.blocked || 0) ? 'stat-danger' : ''}">${Number(s.blocked || 0)}</td><td>${Number(s.functionPoints || 0)} PF</td><td><button type="button" class="list-action" data-open-sprint="${esc(s.code)}">Abrir</button><button type="button" class="list-action" data-edit-sprint="${esc(s.code)}">Editar</button></td></tr>`; }).join('')}</tbody></table>`; }
function distribution(data, counts) { return LANES.map((item) => `<div class="dist-row"><span><i class="dot-${item.tone}"></i>${item.label}</span><b>${counts[item.id]}</b><div><span style="width:${data.length ? (counts[item.id] / data.length) * 100 : 0}%"></span></div></div>`).join(''); }
function evolutionChart(data, progress) { const planned = data.length ? Math.min(100, Math.round(data.reduce((sum, sprint) => sum + (sprint.metrics?.expectedProgress ?? 70), 0) / data.length)) : 0; const points = [planned - 18, planned - 11, planned - 7, planned - 4, planned, planned]; const realPoints = [Math.max(0, progress - 24), Math.max(0, progress - 18), Math.max(0, progress - 12), Math.max(0, progress - 8), Math.max(0, progress - 3), progress]; return `<div class="evolution-chart"><div class="chart-labels"><span>100%</span><span>50%</span><span>0%</span></div><div class="chart-area"><div class="chart-grid"></div><svg viewBox="0 0 300 108" role="img" aria-label="Evolução planejado versus real"><polyline points="${points.map((value, index) => `${index * 60},${105 - value}`).join(' ')}" fill="none" stroke="#a8bdd1" stroke-width="2" stroke-dasharray="4 3"/><polyline points="${realPoints.map((value, index) => `${index * 60},${105 - value}`).join(' ')}" fill="none" stroke="#4384d2" stroke-width="2.5"/>${realPoints.map((value, index) => `<circle cx="${index * 60}" cy="${105 - value}" r="3" fill="#4384d2"/>`).join('')}</svg></div></div><div class="chart-legend"><span><i class="legend-planned"></i>Planejado ${planned}%</span><span><i class="legend-real"></i>Real ${progress}%</span><b>Desvio ${progress - planned} p.p.</b></div>`; }
function alerts(data) { return data.filter((s) => s.health < 60 || s.blocked > 1).sort((a,b) => a.health - b.health).slice(0,3).map((s) => `<div class="alert-item"><span class="alert-icon ${s.health < 60 ? 'red' : 'yellow'}">!</span><div><b>${s.project} — ${s.code}</b><p>${s.blocked > 1 ? `${s.blocked} tasks bloqueadas` : `Progresso abaixo do esperado`}</p><small>${s.impediments} impedimentos abertos</small></div></div>`).join('') || '<div class="empty-state">Nenhum alerta para os filtros atuais.</div>'; }
function deliveryList(data) { return data.sort((a,b) => b.deliveries - a.deliveries).slice(0,3).map((s) => `<div class="delivery-item"><span>✓</span><div><b>${s.project}</b><p>${s.objective}</p></div><time>${s.end}</time></div>`).join(''); }
function legacyDrawer(sprint) { const tasks = sprint.taskItems || createTasks(sprint); return `<div class="drawer-backdrop" data-close="true"><aside class="drawer"><button class="drawer-close" data-close="true">×</button><span class="eyebrow">${sprint.code} · ${sprint.project}</span><h2>${sprint.objective}</h2><div class="drawer-status ${healthClass(sprint.health)}"><span>●</span>${lane(sprint.lane).label}<b>${sprint.health}/100</b></div><div class="drawer-progress"><div><span>Progresso calculado</span><b>${sprint.progress}%</b></div><div class="progress-bar"><span style="width:${sprint.progress}%"></span></div><p>Planejado ${sprint.metrics?.expectedProgress ?? 70}% <strong>Desvio ${sprint.metrics?.deviation ?? 0} p.p.</strong></p></div><h3>Kanban interno de Tasks <span>${sprint.tasks}</span></h3><p class="task-helper">Arraste uma Task para alterar seu status</p><div class="task-board">${TASK_STATUSES.map((status) => `<div class="task-column" data-task-status="${status}"><div class="task-column-title">${status}<b>${tasks.filter((task) => task.status === status).length}</b></div>${tasks.filter((task) => task.status === status).map((task) => `<div class="task" draggable="true" data-task-id="${task.id}"><span class="task-check ${task.status === 'Concluída' ? 'done' : ''}">${task.status === 'Concluída' ? '✓' : ''}</span><div><b>${task.id} · ${task.points} pts</b><p>${esc(task.title)}</p><small>${esc(task.owner)}</small></div></div>`).join('') || '<div class="task-column-empty">Vazia</div>'}</div>`).join('')}</div><div class="drawer-alert"><b>Por que está nesta raia?</b><p>${sprint.health < 60 ? `${sprint.blocked} tasks bloqueadas e ${sprint.impediments} impedimentos abertos exigem ação.` : 'O ritmo da execução está abaixo do ideal para o prazo.'}</p></div><button class="primary-button">Ver sprint completa ${icon('arrow')}</button></aside></div>`; }

function legacyBind() {
  reorderCards();
  document.querySelectorAll('.nav-item').forEach((item) => item.onclick = (event) => { if (item.getAttribute('href')) return; event.preventDefault(); const label = item.textContent.toLowerCase(); window.location.hash = label.includes('dashboard') ? '/dashboard' : label.includes('situação') ? '/attention' : label.includes('atualização') ? '/update' : '/kanban'; });
  $('#search').oninput = (e) => { filters.query = e.target.value; render(); const searchInput = $('#search'); searchInput?.focus(); searchInput?.setSelectionRange(filters.query.length, filters.query.length); };
  $('#project-filter').onchange = (e) => { filters.project = e.target.value; render(); };
  $('#health-filter').onchange = (e) => { filters.health = e.target.value; render(); };
  document.querySelectorAll('.view').forEach((button) => button.onclick = () => { activeView = button.dataset.view; document.querySelectorAll('.view').forEach((item) => item.classList.remove('active')); button.classList.add('active'); $('#board').classList.toggle('hidden', activeView === 'list'); $('#list-view').classList.toggle('hidden', activeView !== 'list'); });
  document.querySelectorAll('.sprint-card').forEach((cardEl) => { cardEl.onclick = (e) => { if (!cardEl.classList.contains('dragging')) { selected = sprints.find((s) => s.code === cardEl.dataset.code); render(); } }; cardEl.ondragstart = () => { cardEl.classList.add('dragging'); }; cardEl.ondragend = () => cardEl.classList.remove('dragging'); });
  document.querySelectorAll('.lane').forEach((laneEl) => { laneEl.ondragover = (e) => { e.preventDefault(); laneEl.classList.add('drag-over'); }; laneEl.ondragleave = () => laneEl.classList.remove('drag-over'); laneEl.ondrop = (e) => { e.preventDefault(); laneEl.classList.remove('drag-over'); const dragged = document.querySelector('.dragging'); if (!dragged) return; const sprint = sprints.find((s) => s.code === dragged.dataset.code); if (sprint.lane !== laneEl.dataset.lane) { const previous = lane(sprint.lane).label; sprint.lane = laneEl.dataset.lane; persist(); selected = null; render(); const toast = $('#toast'); toast.textContent = `${sprint.code}: ${previous} → ${lane(laneEl.dataset.lane).label} · indicadores recalculados`; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2600); } }; });
  document.querySelectorAll('[data-close="true"]').forEach((item) => item.onclick = () => { selected = null; render(); });
  document.querySelectorAll('.list-view tr[data-code]').forEach((row) => row.onclick = (event) => { if (event.target.closest('button')) return; selected = sprints.find((s) => s.code === row.dataset.code); activeView = 'list'; render(); });
  document.querySelectorAll('.task[data-task-id]').forEach((taskEl) => { taskEl.ondragstart = () => taskEl.classList.add('dragging'); taskEl.ondragend = () => taskEl.classList.remove('dragging'); });
  document.querySelectorAll('.task-column').forEach((column) => { column.ondragover = (event) => { event.preventDefault(); column.classList.add('drop-target'); }; column.ondragleave = () => column.classList.remove('drop-target'); column.ondrop = (event) => { event.preventDefault(); column.classList.remove('drop-target'); const dragged = document.querySelector('.task.dragging'); const task = selected?.taskItems.find((item) => item.id === dragged?.dataset.taskId); if (!task) return; task.status = column.dataset.taskStatus; selected.blocked = selected.taskItems.filter((item) => item.status === 'Bloqueada').length; selected.progress = SprintProgressService.calculate(selected).actualProgress; selected.health = undefined; selected.health = SprintHealthService.calculate(selected).score; syncDerived(); persist(); render(); const toast = $('#toast'); toast.textContent = `${task.id} movida para ${task.status} · indicadores recalculados`; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2400); }; });
}
render();
mountAuthControl();

async function hydrateRemoteSprints() {
  if (window.__PAINELPRO_DATA_SOURCE__ !== 'api' || !AuthService.enabled) return;
  const token = await AuthService.accessToken();
  if (!token) return;
  try {
    const remoteSprints = await ApiSprintRepository.load(token);
    if (!Array.isArray(remoteSprints)) return;
    sprints = syncSprintDerived(remoteSprints);
    render();
    mountAuthControl();
  } catch (error) {
    console.warn('Modo remoto indisponível; mantendo dados locais.', error);
  }
}

hydrateRemoteSprints();
window.addEventListener('hashchange', () => queueMicrotask(mountAuthControl));
window.addEventListener('hashchange', () => { selected = null; render(); });
document.addEventListener('click', (event) => { const decisionButton = event.target.closest('[data-decision]'); if (!decisionButton || decisionButton.disabled) return; DomainDecisionService.create({ projectId: 'local', sprintId: decisionButton.dataset.decision, title: 'Revisar dependências', description: 'Decisão registrada pela Sala de Situação', decision: 'Revisar dependências', responsible: 'Camila Pereira' }); });

// Interações P0 do Kanban. Mantidas no núcleo para que filtros, auditoria e indicadores usem a mesma fonte local.
const labelNames = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('painelpro-labels') || '[]');
    return [...new Set(['Atenção', ...registry().labels, ...saved.map((item) => typeof item === 'string' ? item : item.name).filter(Boolean), ...sprints.flatMap((item) => item.labels || [])])].sort();
  } catch { return ['Atenção']; }
};
const relativeUpdate = (date) => {
  const days = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86400000));
  return days === 0 ? 'Atualizada hoje' : `Atualizada há ${days} dia${days === 1 ? '' : 's'}`;
};
const auditFor = (code) => {
  try { return (JSON.parse(localStorage.getItem('painelpro-db') || '{}').auditLogs || []).filter((item) => item.entityId === code).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); } catch { return []; }
};
const taskBoard = renderTaskBoard;

function drawerV2(sprint) {
  const tasks = sprint.taskItems || createTasks(sprint);
  const analysis = sprint.healthAnalysis || SprintHealthService.calculate(sprint);
  const history = auditFor(sprint.code);
  const issues = [
    ['Bloqueios', sprint.blocked, 'Destravar dependências com responsável e prazo.'],
    ['Impedimentos', sprint.impediments, 'Registrar plano de remoção e acompanhar diariamente.'],
  ];
return `<div class="drawer-backdrop" data-close="true"><aside class="drawer drawer-v2"><button class="drawer-close" data-close="true" aria-label="Fechar">×</button><div class="drawer-header"><span class="eyebrow">${esc(sprint.system || sprint.project)} · Sprint ${sprint.sprintNumber || Number(sprint.code.replace(/\D/g, ''))} · ${esc(sprint.serviceOrder || sprint.code)}</span><h2>${esc(sprint.objective)}</h2><div class="drawer-summary"><span class="health-pill ${healthClass(sprint.health)}">${sprint.health}/100 · ${scoreLabel(sprint.health)}</span><span class="priority-pill priority-${sprint.priorityLevel.toLowerCase().replace('í','i')}">${sprint.priorityLevel}</span><span>${lane(sprint.lane).label}</span></div></div><nav class="drawer-tabs" aria-label="Detalhes da Sprint"><button class="drawer-tab" data-popup-tab="summary">Resumo</button><button class="drawer-tab active" data-popup-tab="tasks">Tasks <b>${tasks.length}</b></button><button class="drawer-tab" data-popup-tab="history">Histórico</button></nav><section class="drawer-panel hidden" data-popup-panel="summary"><div class="drawer-progress"><div><span>Progresso real</span><b>${sprint.progress}%</b></div><div class="dual-progress"><span style="width:${sprint.expectedProgress}%"></span><b style="width:${sprint.progress}%"></b></div><p>Planejado ${sprint.expectedProgress}% <strong>Desvio ${(sprint.progress - sprint.expectedProgress) > 0 ? '+' : ''}${sprint.progress - sprint.expectedProgress} p.p.</strong></p></div><div class="detail-grid"><div><small>OS da Sprint</small><b>${esc(sprint.serviceOrder || 'Não informada')}</b></div><div><small>PO responsável</small><b>${esc(sprint.po)}</b></div><div><small>Liderança técnica</small><b>${esc(sprint.technicalLead)}</b></div><div><small>Prazo da Sprint</small><b>${esc(sprint.end)}</b></div><div><small>Próximo marco</small><b>${esc(sprint.nextMilestone)}</b></div></div><div class="drawer-section"><h3>Critério de aceite</h3><p>${esc(sprint.acceptanceCriteria)}</p></div><div class="drawer-section"><h3>Contexto operacional</h3><p>${analysis.reasons.length ? esc(analysis.reasons.join(' · ')) : 'Execução dentro do ritmo esperado.'}</p>${analysis.recommendations.length ? `<p class="recommendation">${esc(analysis.recommendations[0])}</p>` : ''}</div><button class="primary-button" data-edit-sprint="${sprint.code}">Editar Sprint</button></section><section class="drawer-panel" data-popup-panel="tasks"><div class="task-panel-head"><p class="task-helper">Arraste uma task para alterar seu status. A saúde da Sprint é recalculada automaticamente.</p><button type="button" class="primary-small" data-add-task>＋ Nova Task</button></div><form class="task-create-form hidden" data-task-create-form><label>Título<input name="title" maxlength="120" placeholder="O que precisa ser realizado?" required></label><div><label>Responsável<input name="owner" maxlength="60" placeholder="Nome do responsável" required></label><label>Pontos<input name="points" type="number" min="1" max="100" value="3" required></label><label>Status<select name="status">${TASK_STATUSES.map((status) => `<option>${status}</option>`).join('')}</select></label></div><div class="task-create-actions"><button type="button" class="secondary-button" data-cancel-task>Cancelar</button><button class="primary-small">Adicionar Task</button></div></form>${taskBoard(tasks)}</section><section class="drawer-panel hidden" data-popup-panel="history">${history.length ? `<div class="history-list">${history.map((item) => `<article><b>${esc(item.action.replaceAll('_', ' '))}</b><p>${esc(item.user || 'Usuário do portfólio')}</p><time>${new Date(item.createdAt).toLocaleString('pt-BR')}</time></article>`).join('')}</div>` : '<div class="empty-state">Ainda não há eventos registrados para esta Sprint.</div>'}</section></aside></div>`;
}

function openCreateSprintModal() {
  document.querySelector('.create-sprint-modal')?.remove();
  const next = Math.max(0, ...sprints.map((item) => item.sprintNumber || Number(item.code.replace(/\D/g, '')) || 0)) + 1;
  const systems = registry().systems;
  const element = document.createElement('div');
  element.className = 'editor-modal create-sprint-modal';
  element.innerHTML = `<div class="editor-dialog"><button class="editor-close" data-create-close>×</button><span class="eyebrow">NOVA SPRINT</span><h2>Adicionar ao Kanban</h2><form id="create-sprint-form"><div class="editor-columns"><label>Sistema<select name="system">${systems.map((system) => `<option>${esc(system)}</option>`).join('')}</select></label><label>Número da Sprint<input name="number" type="number" min="1" value="${next}" required></label><label>Número da OS<input name="serviceOrder" value="OS${15000 + sprints.length}" placeholder="OS15000"></label></div><label>Objetivo<input name="objective" placeholder="Resultado que esta Sprint deve entregar" required></label><div class="editor-columns"><label>PO responsável<select name="po">${[...new Set(sprints.map((item) => item.po))].sort().map((po) => `<option>${esc(po)}</option>`).join('')}</select></label><label>Prazo<input name="end" placeholder="dd/mm" required></label><label>Pontos de Função<input name="functionPoints" type="number" min="0" step="0.5" value="0"></label></div><div class="editor-columns"><label>Raia inicial<select name="lane">${LANES.map((item) => `<option value="${item.id}" ${item.id === 'planning' ? 'selected' : ''}>${item.label}</option>`).join('')}</select></label><label>Prioridade<select name="priority">${['Baixa', 'Média', 'Alta', 'Crítica'].map((priority) => `<option ${priority === 'Média' ? 'selected' : ''}>${priority}</option>`).join('')}</select></label></div><label>Etiquetas<div class="label-picker">${labelNames().map((name) => `<label><input type="checkbox" name="labels" value="${esc(name)}"> ${esc(name)}</label>`).join('')}</div></label><div class="editor-actions"><button type="button" class="secondary-button" data-create-close>Cancelar</button><button class="primary-small">Criar Sprint</button></div></form></div>`;
  document.body.append(element);
  const currentRegistry = registry();
  const functionPointsField = element.querySelector('input[name="functionPoints"]');
  if (functionPointsField) {
    functionPointsField.closest('label').childNodes[0].nodeValue = 'PF estimado';
    functionPointsField.closest('.editor-columns').insertAdjacentHTML('beforeend', `<label>PF detalhado<input name="detailedFunctionPoints" type="number" min="0" step="0.5" value="0"></label><label>Previsão de faturamento<input name="billingForecastMonth" type="month" value="${PfForecastService.normalizeMonth('')}" required></label>`);
  }
  const poSelect = element.querySelector('select[name="po"]');
  const prioritySelect = element.querySelector('select[name="priority"]');
  if (poSelect) poSelect.innerHTML = currentRegistry.pos.map((po) => `<option>${esc(po)}</option>`).join('');
  if (prioritySelect) prioritySelect.innerHTML = currentRegistry.priorities.map((priority) => `<option ${priority === 'Média' ? 'selected' : ''}>${esc(priority)}</option>`).join('');
  const sprintSystemSelect = element.querySelector('select[name="system"]');
  const syncSprintPO = () => { const linkedPO = systemPO(sprintSystemSelect?.value); if (linkedPO && poSelect?.querySelector(`option[value="${CSS.escape(linkedPO)}"]`)) poSelect.value = linkedPO; };
  sprintSystemSelect?.addEventListener('change', syncSprintPO); syncSprintPO();
  element.querySelectorAll('[data-create-close]').forEach((button) => button.onclick = () => element.remove());
  element.querySelector('#create-sprint-form').onsubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget); const number = Number(form.get('number')); const system = form.get('system');
    if (sprints.some((item) => (item.system || item.project.split(' - Sprint')[0]) === system && Number(item.sprintNumber || item.code.replace(/\D/g, '')) === number)) { alert('Já existe uma Sprint com este número neste sistema.'); return; }
    const sprint = { code: `SPR-${String(Math.max(0, ...sprints.map((item) => Number(item.code.replace(/\D/g, '')) || 0)) + 1).padStart(2, '0')}`, system, sprintNumber: number, project: `${system} - Sprint ${number}`, objective: form.get('objective'), po: form.get('po'), end: form.get('end'), lane: form.get('lane'), priorityLevel: form.get('priority'), labels: form.getAll('labels'), progress: 0, expectedProgress: 10, tasks: 0, blocked: 0, impediments: 0, risks: 0, deliveries: 0, health: 90, lastUpdated: new Date().toISOString(), nextMilestone: 'Definir escopo e plano de entrega', technicalLead: 'A definir', acceptanceCriteria: 'Critérios de aceite a definir com o PO.', taskItems: [] };
    const serviceOrder = String(form.get('serviceOrder') || '').trim();
    sprint.serviceOrder = serviceOrder ? (serviceOrder.startsWith('#') ? serviceOrder : `#${serviceOrder}`) : `#OS${15000 + sprints.length}`;
    sprint.functionPoints = Number(form.get('functionPoints') || 0);
    sprint.detailedFunctionPoints = Number(form.get('detailedFunctionPoints') || 0);
    sprint.billingForecastMonth = String(form.get('billingForecastMonth') || PfForecastService.normalizeMonth(''));
    sprint.billingForecastUpdatedAt = new Date().toISOString();
    sprint.billingForecastUpdatedBy = 'Camila Pereira';
    sprints.push(sprint); syncDerived(); persist(); DomainAuditService.log('SPRINT_CREATED', 'Sprint', sprint.code, { lane: sprint.lane, priority: sprint.priorityLevel }); element.remove(); render();
  };
}

function bindP0() {
  reorderCards();
  document.querySelectorAll('.nav-item').forEach((item) => item.onclick = (event) => { if (item.getAttribute('href')) return; event.preventDefault(); const label = item.textContent.toLowerCase(); window.location.hash = label.includes('dashboard') ? '/dashboard' : label.includes('situação') ? '/attention' : label.includes('atualização') ? '/update' : '/kanban'; });
  const filterControl = (selector, key) => { const control = $(selector); if (control) control.onchange = (event) => { filters[key] = event.target.value; render(); }; };
  $('#search').oninput = (event) => { filters.query = event.target.value; render(); const searchInput = $('#search'); searchInput?.focus(); searchInput?.setSelectionRange(filters.query.length, filters.query.length); };
  filterControl('#project-filter', 'project'); filterControl('#health-filter', 'health'); filterControl('#po-filter', 'po'); filterControl('#priority-filter', 'priority'); filterControl('#label-filter', 'label'); filterControl('#lane-filter', 'lane'); filterControl('#issue-filter', 'issue');
  const poFilter = $('#po-filter');
  if (poFilter && !$('#manager-filter')) { const managerSelect = document.createElement('select'); managerSelect.id = 'manager-filter'; managerSelect.setAttribute('aria-label', 'Gerente de Projetos'); managerSelect.innerHTML = `<option>Gerentes</option>${relationships().managers.map((manager) => `<option ${filters.manager === manager ? 'selected' : ''}>${esc(manager)}</option>`).join('')}`; poFilter.insertAdjacentElement('afterend', managerSelect); filterControl('#manager-filter', 'manager'); }
  [['#project-filter', 'Projetos'], ['#po-filter', 'POs'], ['#priority-filter', 'Prioridades'], ['#label-filter', 'Etiquetas'], ['#issue-filter', 'Situações']].forEach(([selector, label]) => { const option = $(selector)?.options[0]; if (option) option.textContent = label; });
  if ($('#more-filters')) $('#more-filters').onclick = () => $('.toolbar-secondary')?.classList.toggle('toolbar-secondary-collapsed');
  $('#new-sprint').onclick = openCreateSprintModal;
  $('#clear-filters')?.addEventListener('click', () => { filters = { ...FILTER_DEFAULTS }; render(); });
  document.querySelectorAll('[data-clear-filter]').forEach((button) => button.onclick = () => { filters[button.dataset.clearFilter] = FILTER_DEFAULTS[button.dataset.clearFilter]; render(); });
  // OS e function-points já são renderizados diretamente no novo template — nada a fazer aqui.
  document.querySelectorAll('.view').forEach((button) => button.onclick = () => { activeView = button.dataset.view; document.querySelectorAll('.view').forEach((item) => item.classList.remove('active')); button.classList.add('active'); $('#board').classList.toggle('hidden', activeView === 'list'); $('#list-view').classList.toggle('hidden', activeView !== 'list'); });
  document.querySelectorAll('.sprint-card').forEach((cardEl) => { cardEl.onclick = (event) => { if (event.target.closest('.card-menu-wrap') || cardEl.classList.contains('dragging')) return; selected = sprints.find((item) => item.code === cardEl.dataset.code); render(); }; cardEl.ondragstart = () => cardEl.classList.add('dragging'); cardEl.ondragend = () => cardEl.classList.remove('dragging'); });
  document.querySelectorAll('.card-band-menu,.card-menu').forEach((button) => button.onclick = (event) => { event.stopPropagation(); const menu = button.parentElement.querySelector('.card-context-menu'); document.querySelectorAll('.card-context-menu').forEach((item) => { if (item !== menu) item.classList.add('hidden'); }); menu.classList.toggle('hidden'); button.setAttribute('aria-expanded', String(!menu.classList.contains('hidden'))); });
  document.querySelectorAll('[data-open-sprint]').forEach((button) => button.onclick = (event) => { event.stopPropagation(); selected = sprints.find((item) => item.code === button.dataset.openSprint); if (button.closest('.list-view')) activeView = 'list'; render(); });
  document.querySelectorAll('.lane').forEach((laneEl) => { laneEl.ondragover = (event) => { event.preventDefault(); laneEl.classList.add('drag-over'); }; laneEl.ondragleave = () => laneEl.classList.remove('drag-over'); laneEl.ondrop = (event) => { event.preventDefault(); laneEl.classList.remove('drag-over'); const dragged = document.querySelector('.dragging'); const sprint = sprints.find((item) => item.code === dragged?.dataset.code); if (!sprint || sprint.lane === laneEl.dataset.lane) return; const from = lane(sprint.lane); const to = lane(laneEl.dataset.lane); const sensitive = ['approved', 'billing', 'completed'].includes(sprint.lane) && !['approved', 'billing', 'completed'].includes(to.id) || sprint.lane === 'completed' || (to.id === 'billing' && sprint.lane !== 'approved'); if (sensitive && !window.confirm(`Confirmar movimentação de ${from.label} para ${to.label}? Esta alteração será registrada no histórico.`)) return; sprint.lane = to.id; sprint.lastUpdated = new Date().toISOString(); syncDerived(); persist(); DomainAuditService.log('SPRINT_MOVED', 'Sprint', sprint.code, { from: from.id, to: to.id, sensitive }); selected = null; render(); const toast = $('#toast'); toast.textContent = `${sprint.code}: ${from.label} → ${to.label}`; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2600); }; });
  document.querySelectorAll('[data-close="true"]').forEach((item) => item.onclick = (event) => { if (event.target === item || item.classList.contains('drawer-close')) { selected = null; render(); } });
  document.querySelectorAll('.drawer-tab').forEach((button) => button.onclick = () => { document.querySelectorAll('.drawer-tab').forEach((item) => item.classList.toggle('active', item === button)); document.querySelectorAll('[data-popup-panel]').forEach((panel) => panel.classList.toggle('hidden', panel.dataset.popupPanel !== button.dataset.popupTab)); });
  const taskCreateForm = document.querySelector('[data-task-create-form]');
  document.querySelector('[data-add-task]')?.addEventListener('click', () => { taskCreateForm?.classList.remove('hidden'); taskCreateForm?.querySelector('input[name="title"]')?.focus(); });
  document.querySelector('[data-cancel-task]')?.addEventListener('click', () => { taskCreateForm?.reset(); taskCreateForm?.classList.add('hidden'); });
  if (taskCreateForm && selected) taskCreateForm.onsubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    selected.taskItems ||= [];
    const nextTaskNumber = Math.max(0, ...selected.taskItems.map((task) => Number(String(task.id || '').replace(/\D/g, '')) || 0)) + 1;
    const task = {
      id: `T${String(nextTaskNumber).padStart(3, '0')}`,
      title: String(form.get('title') || '').trim(),
      owner: String(form.get('owner') || '').trim(),
      points: Number(form.get('points') || 1),
      status: String(form.get('status') || TASK_STATUSES[0]),
    };
    selected.taskItems.push(task);
    selected.tasks = selected.taskItems.length;
    selected.blocked = selected.taskItems.filter((item) => item.status === 'Bloqueada').length;
    selected.progress = SprintProgressService.calculate(selected).actualProgress;
    selected.health = undefined;
    selected.health = SprintHealthService.calculate(selected).score;
    selected.lastUpdated = new Date().toISOString();
    syncDerived();
    persist();
    DomainAuditService.log('TASK_CREATED', 'Sprint', selected.code, { task: task.id, title: task.title, status: task.status, points: task.points });
    render();
  };
  const detailGrid = document.querySelector('.drawer-v2 [data-popup-panel="summary"] .detail-grid');
  if (detailGrid && selected) detailGrid.insertAdjacentHTML('beforeend', `<div><small>Gerente de Projetos</small><b>${esc(poManager(selected.po) || 'Não vinculado')}</b></div>`);
  if (detailGrid && selected) { const analysts = projectAnalysts(selected.system || selected.project.split(' - Sprint')[0]); detailGrid.insertAdjacentHTML('beforeend', `<div><small>PF estimado</small><b>${pfNumber(selected.functionPoints)} PF</b></div><div><small>PF detalhado</small><b>${pfNumber(selected.detailedFunctionPoints)} PF</b></div><div><small>Previsão de faturamento</small><b>${pfMonthLabel(selected.billingForecastMonth)}</b></div><div><small>Analista CGTIC</small><b>${esc(analysts.cgtic || 'Não vinculado')}</b></div><div><small>Analista de negócio</small><b>${esc(analysts.business || 'Não vinculado')}</b></div>`); }
  document.querySelectorAll('.list-view tr[data-code]').forEach((row) => row.onclick = (event) => { if (event.target.closest('button')) return; selected = sprints.find((item) => item.code === row.dataset.code); activeView = 'list'; render(); });
  document.querySelectorAll('.task[data-task-id]').forEach((taskEl) => { taskEl.ondragstart = () => taskEl.classList.add('dragging'); taskEl.ondragend = () => taskEl.classList.remove('dragging'); });
  document.querySelectorAll('.task-column').forEach((column) => { column.ondragover = (event) => { event.preventDefault(); column.classList.add('drop-target'); }; column.ondragleave = () => column.classList.remove('drop-target'); column.ondrop = (event) => { event.preventDefault(); column.classList.remove('drop-target'); const task = selected?.taskItems.find((item) => item.id === document.querySelector('.task.dragging')?.dataset.taskId); if (!task) return; task.status = column.dataset.taskStatus; selected.blocked = selected.taskItems.filter((item) => item.status === 'Bloqueada').length; selected.progress = SprintProgressService.calculate(selected).actualProgress; selected.lastUpdated = new Date().toISOString(); syncDerived(); persist(); DomainAuditService.log('TASK_UPDATED', 'Sprint', selected.code, { task: task.id, status: task.status }); render(); }; });
}

window.addEventListener('painelpro:labels-updated', () => { if (currentRoute() === 'kanban') render(); });
render();

function parseEndDate(value) {
  const match = String(value || '').match(/(\d{1,2})\/(\d{1,2})/);
  return match ? new Date(new Date().getFullYear(), Number(match[2]) - 1, Number(match[1])).getTime() : Number.MAX_SAFE_INTEGER;
}
function sortSprints(items) { return items.slice().sort((a, b) => {
  if (boardPreferences.sort === 'priority') return ({ Crítica: 0, Alta: 1, Média: 2, Baixa: 3 }[a.priorityLevel] ?? 4) - ({ Crítica: 0, Alta: 1, Média: 2, Baixa: 3 }[b.priorityLevel] ?? 4);
  if (boardPreferences.sort === 'deadline') return parseEndDate(a.end) - parseEndDate(b.end);
  if (boardPreferences.sort === 'stale') return new Date(a.lastUpdated) - new Date(b.lastUpdated);
  return (a.position ?? 0) - (b.position ?? 0);
}); }

function enhanceFlowControls() {
  if (currentRoute() !== 'kanban') return;
  const boardHead = $('.board-head');
  if (!boardHead || boardHead.querySelector('.board-flow-controls')) return;
  const controls = document.createElement('div');
  controls.className = 'board-flow-controls';
  const saved = localStorage.getItem('painelpro-kanban-saved-view');
  controls.innerHTML = `<button class="flow-button" id="save-view">Salvar visão</button>${saved ? '<button class="flow-button" id="load-view">Minha visão</button>' : ''}`;
  boardHead.append(controls);
  $('#save-view').onclick = () => { localStorage.setItem('painelpro-kanban-saved-view', JSON.stringify({ filters, sort: boardPreferences.sort })); const button = $('#save-view'); button.textContent = 'Visão salva'; setTimeout(() => { if (button.isConnected) button.textContent = 'Salvar visão'; }, 1600); };
  $('#load-view')?.addEventListener('click', () => { try { const savedView = JSON.parse(localStorage.getItem('painelpro-kanban-saved-view')); const savedFilters = savedView.filters || {}; filters = Object.fromEntries(Object.keys(FILTER_DEFAULTS).map((key) => [key, savedFilters[key] ?? FILTER_DEFAULTS[key]])); boardPreferences.sort = 'position'; persistBoardPreferences(); render(); } catch { /* visão inválida: mantém o estado atual */ } });
  document.querySelectorAll('.lane').forEach((laneElement) => {
    const laneId = laneElement.dataset.lane; const limit = WIP_LIMITS[laneId] || 99;
    const laneCards = [...laneElement.querySelectorAll('.sprint-card')];
    sortSprints(laneCards.map((cardElement) => sprints.find((item) => item.code === cardElement.dataset.code)).filter(Boolean)).forEach((sprint) => laneElement.querySelector('.lane-cards').append(document.querySelector(`.sprint-card[data-code="${sprint.code}"]`)));
    const count = laneCards.length; const badge = laneElement.querySelector('.lane-header b');
    badge.textContent = limit >= 90 ? `${count}` : `${count}/${limit}`;
    badge.title = limit >= 90 ? `${count} Sprints` : `Limite WIP: ${limit}`;
    laneElement.classList.toggle('wip-exceeded', count > limit);
    const header = laneElement.querySelector('.lane-header');
    const collapse = document.createElement('button'); collapse.className = 'lane-collapse'; collapse.type = 'button'; collapse.setAttribute('aria-label', `Recolher ${lane(laneId).label}`); collapse.textContent = boardPreferences.collapsed[laneId] ? '⌄' : '⌃';
    collapse.onclick = (event) => { event.preventDefault(); event.stopPropagation(); boardPreferences.collapsed[laneId] = !boardPreferences.collapsed[laneId]; persistBoardPreferences(); laneElement.classList.toggle('lane-collapsed', boardPreferences.collapsed[laneId]); collapse.textContent = boardPreferences.collapsed[laneId] ? '⌄' : '⌃'; };
    header.append(collapse); laneElement.classList.toggle('lane-collapsed', Boolean(boardPreferences.collapsed[laneId]));
    const defaultDrop = laneElement.ondrop;
    laneElement.ondrop = (event) => { const moving = document.querySelector('.sprint-card.dragging'); const movingSprint = sprints.find((item) => item.code === moving?.dataset.code); const effectiveCount = count - (movingSprint?.lane === laneId ? 1 : 0); if (movingSprint && movingSprint.lane !== laneId && effectiveCount >= limit && !window.confirm(`A raia ${lane(laneId).label} atingiu o limite WIP de ${limit}. Deseja movimentar mesmo assim?`)) { event.preventDefault(); return; } defaultDrop(event); };
  });
}

function bindP1() { bindP0(); enhanceFlowControls(); }
render();

// P1.2 — dependências e ações em lote para operação do portfólio.
var bulkSelection = new Set();
function sprintName(sprint) { return `${sprint.system || sprint.project} · Sprint ${sprint.sprintNumber || Number(sprint.code.replace(/\D/g, ''))}`; }
function dependencyItems(sprint) { return (sprint.dependencies || []).map((code) => sprints.find((item) => item.code === code)).filter(Boolean); }
function dependencyStatus(sprint) { const pending = dependencyItems(sprint).filter((item) => item.lane !== 'completed' && item.lane !== 'approved' && item.lane !== 'billing'); return { total: dependencyItems(sprint).length, pending }; }

function openDependencyModal(code) {
  const sprint = sprints.find((item) => item.code === code); if (!sprint) return;
  document.querySelector('.dependency-modal')?.remove();
  const element = document.createElement('div'); element.className = 'editor-modal dependency-modal';
  const options = sprints.filter((item) => item.code !== code).sort((a, b) => sprintName(a).localeCompare(sprintName(b))).map((item) => `<label class="dependency-option"><input type="checkbox" name="dependency" value="${item.code}" ${(sprint.dependencies || []).includes(item.code) ? 'checked' : ''}><span class="health-pill ${healthClass(item.health)}">${item.health}</span><span>${esc(sprintName(item))}</span><small>${lane(item.lane).label}</small></label>`).join('');
  element.innerHTML = `<div class="editor-dialog"><button class="editor-close" data-dependency-close>×</button><span class="eyebrow">DEPENDÊNCIAS · ${esc(sprint.code)}</span><h2>Dependências da Sprint</h2><p class="label-description">Selecione entregas que precisam avançar antes desta Sprint seguir para homologação ou aceite.</p><form data-dependency-form><div class="dependency-list">${options}</div><div class="editor-actions"><button type="button" class="secondary-button" data-dependency-close>Cancelar</button><button class="primary-small">Salvar dependências</button></div></form></div>`;
  document.body.append(element); element.querySelectorAll('[data-dependency-close]').forEach((button) => button.onclick = () => element.remove());
  element.querySelector('[data-dependency-form]').onsubmit = (event) => { event.preventDefault(); sprint.dependencies = new FormData(event.currentTarget).getAll('dependency'); sprint.lastUpdated = new Date().toISOString(); persist(); DomainAuditService.log('DEPENDENCIES_UPDATED', 'Sprint', sprint.code, { dependencies: sprint.dependencies }); element.remove(); render(); };
}

function openBulkModal() {
  const targets = sprints.filter((item) => bulkSelection.has(item.code)); if (!targets.length) return;
  document.querySelector('.bulk-modal')?.remove(); const element = document.createElement('div'); element.className = 'editor-modal bulk-modal';
  const pos = [...new Set(sprints.map((item) => item.po))].sort(); const labels = labelNames();
  element.innerHTML = `<div class="editor-dialog"><button class="editor-close" data-bulk-close>×</button><span class="eyebrow">AÇÕES EM LOTE</span><h2>Atualizar ${targets.length} Sprint${targets.length === 1 ? '' : 's'}</h2><p class="label-description">Preencha somente os campos que deseja alterar. Todos os itens selecionados serão registrados no histórico.</p><form data-bulk-form><div class="editor-columns"><label>PO responsável<select name="po"><option value="">Não alterar</option>${pos.map((po) => `<option>${esc(po)}</option>`).join('')}</select></label><label>Prioridade<select name="priority"><option value="">Não alterar</option>${['Baixa','Média','Alta','Crítica'].map((value) => `<option>${value}</option>`).join('')}</select></label></div><label>Raia<select name="lane"><option value="">Não alterar</option>${LANES.map((item) => `<option value="${item.id}">${item.label}</option>`).join('')}</select></label><label>Adicionar etiquetas<div class="label-picker">${labels.map((name) => `<label><input type="checkbox" name="labels" value="${esc(name)}"> ${esc(name)}</label>`).join('')}</div></label><div class="editor-actions"><button type="button" class="secondary-button" data-bulk-close>Cancelar</button><button class="primary-small">Aplicar alterações</button></div></form></div>`;
  document.body.append(element); element.querySelectorAll('[data-bulk-close]').forEach((button) => button.onclick = () => element.remove());
  element.querySelector('[data-bulk-form]').onsubmit = (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const changes = { po: form.get('po'), priorityLevel: form.get('priority'), lane: form.get('lane'), labels: form.getAll('labels') }; if (changes.lane && !window.confirm(`Mover ${targets.length} Sprints para ${lane(changes.lane).label}? A operação será auditada.`)) return; targets.forEach((sprint) => { const before = { lane: sprint.lane, po: sprint.po, priority: sprint.priorityLevel }; if (changes.po) sprint.po = changes.po; if (changes.priorityLevel) sprint.priorityLevel = changes.priorityLevel; if (changes.lane) sprint.lane = changes.lane; if (changes.labels.length) sprint.labels = [...new Set([...(sprint.labels || []), ...changes.labels])]; sprint.lastUpdated = new Date().toISOString(); DomainAuditService.log('SPRINT_BULK_UPDATED', 'Sprint', sprint.code, { before, changes }); }); persist(); bulkSelection.clear(); element.remove(); render(); };
}

function enhanceDependenciesAndBulk() {
  if (currentRoute() !== 'kanban') return; bulkSelection ||= new Set();
  const boardHead = $('.board-head');
  if (!boardHead) return;
  document.querySelectorAll('.sprint-card').forEach((cardElement) => {
    const sprint = sprints.find((item) => item.code === cardElement.dataset.code); if (!sprint) return; const top = cardElement.querySelector('.card-top');
    const status = dependencyStatus(sprint); const button = document.createElement('button'); button.className = `dependency-button ${status.pending.length ? 'dependency-pending' : ''}`; button.type = 'button'; button.textContent = status.total ? `↗ ${status.pending.length ? `${status.pending.length} pendente${status.pending.length > 1 ? 's' : ''}` : `${status.total} dependência${status.total > 1 ? 's' : ''}`}` : '＋ Dependência'; button.onclick = (event) => { event.stopPropagation(); openDependencyModal(sprint.code); }; cardElement.querySelector('.card-footer')?.before(button);
  });
  document.querySelectorAll('.lane').forEach((laneElement) => { const previousDrop = laneElement.ondrop; laneElement.ondrop = (event) => { const moving = sprints.find((item) => item.code === document.querySelector('.sprint-card.dragging')?.dataset.code); const destination = laneElement.dataset.lane; const pending = moving ? dependencyStatus(moving).pending : []; if (moving && pending.length && ['homologation', 'approved', 'billing', 'completed'].includes(destination) && !window.confirm(`${sprintName(moving)} possui ${pending.length} dependência${pending.length > 1 ? 's' : ''} ainda não concluída${pending.length > 1 ? 's' : ''}. Deseja seguir mesmo assim?`)) { event.preventDefault(); return; } previousDrop(event); };
  });
  const summary = document.querySelector('.drawer-panel[data-popup-panel="summary"]');
  if (summary && selected && !summary.querySelector('.dependency-summary')) { const status = dependencyStatus(selected); const block = document.createElement('div'); block.className = `drawer-section dependency-summary ${status.pending.length ? 'dependency-pending' : ''}`; block.innerHTML = `<h3>Dependências <button class="inline-action">Editar</button></h3><p>${status.total ? `${status.pending.length ? `${status.pending.length} pendente${status.pending.length > 1 ? 's' : ''}: ` : ''}${dependencyItems(selected).map((item) => esc(sprintName(item))).join(' · ')}` : 'Nenhuma dependência registrada.'}</p>`; block.querySelector('button').onclick = () => openDependencyModal(selected.code); summary.querySelector('.primary-button')?.before(block); }
}

function bindP12() { bindP1(); }
render();

// P2 inicial — sinais explicáveis de fluxo. São recomendações, nunca mudanças automáticas de raia.
function daysBetween(from, to = new Date()) { return Math.max(0, Math.floor((new Date(to).getTime() - new Date(from).getTime()) / 86400000)); }
function forecastFor(sprint) {
  const daysInLane = daysBetween(sprint.enteredLaneAt || sprint.lastUpdated);
  const plannedGap = (sprint.expectedProgress ?? sprint.progress) - sprint.progress;
  const riskPoints = (plannedGap > 10 ? 2 : 0) + (sprint.blocked > 0 ? 2 : 0) + (daysInLane >= 7 ? 1 : 0);
  const level = riskPoints >= 4 ? 'alto' : riskPoints >= 2 ? 'moderado' : 'baixo';
  const reasons = [plannedGap > 10 ? `${plannedGap} p.p. abaixo do planejado` : '', sprint.blocked ? `${sprint.blocked} task${sprint.blocked > 1 ? 's' : ''} bloqueada${sprint.blocked > 1 ? 's' : ''}` : '', daysInLane >= 7 ? `${daysInLane} dias nesta raia` : ''].filter(Boolean);
  const recommendation = level === 'alto' ? 'Priorize uma decisão de desbloqueio e revise o próximo marco.' : level === 'moderado' ? 'Acompanhe o marco e confirme responsáveis até a próxima atualização.' : 'Ritmo compatível com o planejamento atual.';
  return { daysInLane, plannedGap, level, reasons, recommendation };
}

function enhanceForecastInsights() {
  if (currentRoute() !== 'kanban') return;
  const summary = document.querySelector('.drawer-panel[data-popup-panel="summary"]');
  if (summary && selected && !summary.querySelector('.forecast-panel')) {
const forecast = forecastFor(selected); const panel = document.createElement('section'); panel.className = `drawer-section forecast-panel flow-${forecast.level}`; panel.innerHTML = `<h3>Previsão de fluxo <span>Risco ${forecast.level}</span></h3><div class="forecast-metrics"><div><b>${forecast.daysInLane}</b><small>dias na raia</small></div><div><b>${forecast.plannedGap > 0 ? `${forecast.plannedGap} p.p.` : 'No ritmo'}</b><small>${forecast.plannedGap > 0 ? 'abaixo do planejado' : 'real × planejado'}</small></div></div><p>${forecast.reasons.length ? esc(forecast.reasons.join(' · ')) : 'Sem sinais operacionais de atraso.'}</p><p class="forecast-recommendation">${esc(forecast.recommendation)}</p>`; summary.querySelector('.primary-button')?.before(panel); }
document.querySelectorAll('.lane').forEach((laneElement) => { const priorDrop = laneElement.ondrop; laneElement.ondrop = (event) => { const moving = sprints.find((item) => item.code === document.querySelector('.sprint-card.dragging')?.dataset.code); const previousLane = moving?.lane; priorDrop(event); if (moving && previousLane !== laneElement.dataset.lane && moving.lane === laneElement.dataset.lane) { moving.enteredLaneAt = new Date().toISOString(); persist(); DomainAuditService.log('SPRINT_LANE_TIME_RESTARTED', 'Sprint', moving.code, { lane: moving.lane }); render(); } }; });
}

function bindP2() { bindP12(); enhanceForecastInsights(); }
render();

function moveSprintByKeyboard(sprint, direction) {
  const currentIndex = LANES.findIndex((item) => item.id === sprint.lane); const target = LANES[currentIndex + direction];
  if (!target) return;
  const targetCount = sprints.filter((item) => item.lane === target.id).length; const limit = WIP_LIMITS[target.id] || 99;
  const needsConfirmation = targetCount >= limit || ['approved', 'billing', 'completed'].includes(sprint.lane) && !['approved', 'billing', 'completed'].includes(target.id);
  const warning = targetCount >= limit ? ` A raia de destino atingiu o limite WIP de ${limit}.` : '';
  if (needsConfirmation && !window.confirm(`Mover ${sprintName(sprint)} de ${lane(sprint.lane).label} para ${target.label}?${warning}`)) return;
  const from = sprint.lane; sprint.lane = target.id; sprint.lastUpdated = new Date().toISOString(); sprint.enteredLaneAt = sprint.lastUpdated; syncDerived(); persist(); DomainAuditService.log('SPRINT_MOVED_BY_KEYBOARD', 'Sprint', sprint.code, { from, to: target.id }); render();
  requestAnimationFrame(() => { const toast = $('#toast'); if (toast) { toast.textContent = `${sprint.code}: ${lane(from).label} → ${target.label}`; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2600); } });
}

function enhanceAccessibility() {
  if (currentRoute() !== 'kanban') return;
  const boardHead = $('.board-head');
  if (boardHead && !document.querySelector('.keyboard-help')) { const help = document.createElement('p'); help.className = 'keyboard-help'; help.textContent = 'Teclado: Enter abre as Tasks · Alt + ←/→ move a Sprint entre raias.'; $('.main')?.append(help); }
  if (!document.querySelector('#kanban-announcer')) { const announcer = document.createElement('div'); announcer.id = 'kanban-announcer'; announcer.className = 'sr-only'; announcer.setAttribute('aria-live', 'polite'); document.body.append(announcer); }
  document.querySelectorAll('.sprint-card').forEach((cardElement) => { const sprint = sprints.find((item) => item.code === cardElement.dataset.code); if (!sprint) return; cardElement.tabIndex = 0; cardElement.setAttribute('role', 'button'); cardElement.setAttribute('aria-label', `${sprintName(sprint)}. ${sprint.objective}. Pressione Enter para abrir as Tasks ou Alt com seta para mover.`); cardElement.onkeydown = (event) => { if (event.target.closest('button,input,label')) return; if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selected = sprint; render(); return; } if (event.altKey && ['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); moveSprintByKeyboard(sprint, event.key === 'ArrowRight' ? 1 : -1); } }; });
  document.querySelectorAll('.system-badge').forEach((button) => button.onclick = (event) => { event.stopPropagation(); filters.project = button.dataset.system; render(); });
  document.querySelectorAll('.task').forEach((task) => { task.tabIndex = 0; task.setAttribute('role', 'group'); task.setAttribute('aria-label', `${task.innerText.replace(/\s+/g, ' ').trim()}. Use o botão Editar para alterar detalhes.`); });
}

function bind() { bindP2(); enhanceAccessibility(); }
render();
