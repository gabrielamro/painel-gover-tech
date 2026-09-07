const SUPER_LANES = {
  planning: 'Em planejamento', planned: 'Planejado', development: 'Em desenvolvimento',
  homologation: 'Em homologação', approved: 'Homologado', billing: 'Aguardando faturamento', completed: 'Faturado',
};
const SUPER_ESC = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
const SUPER_DATE = (value) => { const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date; };
const SUPER_READ = () => { try { return JSON.parse(localStorage.getItem('painelpro-sprints')) || []; } catch { return []; } };
const SUPER_SYSTEM = (sprint) => sprint.system || String(sprint.project || '').split(' - Sprint')[0];
const SUPER_LANE = (sprint) => SUPER_LANES[sprint.lane] || sprint.lane || 'Não informado';
const SUPER_TONE = (sprint) => sprint.health < 60 ? 'critical' : sprint.health < 80 ? 'warning' : 'healthy';
const SUPER_COLOR = (system) => { try { const colors = JSON.parse(localStorage.getItem('painelpro-system-colors') || '{}') || {}; return colors[system] || '#2f72d2'; } catch { return '#2f72d2'; } };

function superLastMonthDeliveries(sprints) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const events = [];
  sprints.forEach((sprint) => {
    if (Array.isArray(sprint.deliveryHistory) && sprint.deliveryHistory.length) {
      sprint.deliveryHistory.forEach((event) => {
        const date = SUPER_DATE(event.date || event.createdAt);
        if (date && date >= start && date < end) events.push({ ...event, sprint, date });
      });
      return;
    }
    const count = Number(sprint.deliveries || 0);
    const date = SUPER_DATE(sprint.lastUpdated) || now;
    if (count > 0 && date >= start && date < end) {
      for (let index = 0; index < count; index += 1) events.push({ sprint, date: new Date(date.getTime() - (index % 4) * 6 * 86400000) });
    }
  });
  return events;
}

function superChart(events) {
  const weeks = [0, 0, 0, 0];
  const now = new Date();
  events.forEach((event) => { const age = Math.max(0, Math.floor((now - event.date) / 86400000)); weeks[Math.min(3, Math.floor(age / 8))] += 1; });
  const max = Math.max(...weeks, 1);
  return `<div class="super-chart" role="img" aria-label="Entregas por semana no último mês">${weeks.slice().reverse().map((value, index) => `<button class="super-chart-bar" data-delivery-week="${3 - index}" style="--bar-height:${Math.max(10, Math.round((value / max) * 100))}%" aria-label="Semana ${index + 1}: ${value} entregas"><span>${value}</span><i></i><small>Sem. ${index + 1}</small></button>`).join('')}</div>`;
}

function renderSuperDetail(mount, events, weekIndex) {
  const selected = events.filter((event) => Math.min(3, Math.floor(Math.max(0, (new Date() - event.date) / 86400000) / 8)) === weekIndex);
  const detail = mount.querySelector('[data-super-detail]');
  if (!detail) return;
  detail.innerHTML = `<div class="super-detail-head"><div><span class="eyebrow">DETALHAMENTO</span><h3>Entregas selecionadas</h3></div><button class="icon-button" data-close-super-detail aria-label="Fechar detalhamento">×</button></div>${selected.length ? `<div class="super-delivery-list">${selected.map((event) => `<a class="super-delivery" href="#/kanban"><span class="delivery-check">✓</span><div><strong>${SUPER_ESC(event.sprint.project || `${SUPER_SYSTEM(event.sprint)} — Sprint ${event.sprint.sprintNumber || ''}`)}</strong><small>${SUPER_ESC(event.sprint.objective || 'Entrega registrada')} · ${event.date.toLocaleDateString('pt-BR')}</small></div><b>${event.sprint.functionPoints || 0} PF</b></a>`).join('')}</div>` : '<div class="super-empty">Nenhuma entrega registrada nessa semana.</div>'}`;
  detail.hidden = false;
}

function renderSuper() {
  if (!location.hash.includes('/superintendencia')) return;
  const mount = document.querySelector('.super-dashboard-mount');
  if (!mount) return;
  const sprints = SUPER_READ();
  const laneFilter = mount.dataset.laneFilter || 'all';
  const filtered = laneFilter === 'blocked' ? sprints.filter((sprint) => Number(sprint.blocked || 0) > 0) : laneFilter === 'completed' ? sprints.filter((sprint) => sprint.lane === 'completed') : laneFilter === 'all' ? sprints : sprints.filter((sprint) => sprint.lane === laneFilter);
  const active = filtered.filter((sprint) => sprint.lane === 'development');
  const blocked = filtered.filter((sprint) => Number(sprint.blocked || 0) > 0);
  const completed = superLastMonthDeliveries(filtered);
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const weeklyDeliveries = completed.filter((event) => event.date >= weekStart);
  const totalTasks = filtered.reduce((sum, sprint) => sum + Number(sprint.tasks || 0), 0);
  const systems = [...new Set(filtered.map(SUPER_SYSTEM))];
  const priorities = filtered.filter((sprint) => sprint.priorityLevel === 'Crítica' || sprint.priorityLevel === 'Alta').length;
  const systemRows = systems.map((system) => {
    const systemSprints = filtered.filter((sprint) => SUPER_SYSTEM(sprint) === system);
    const current = systemSprints.find((sprint) => sprint.lane === 'development') || systemSprints.slice().sort((a, b) => (b.progress || 0) - (a.progress || 0))[0];
    return current ? `<div class="super-system-row"><div class="super-system-name"><span style="--system-color:${SUPER_ESC(current.systemColor || '#2f72d2')}">${SUPER_ESC(system.slice(0, 2).toUpperCase())}</span><div><strong>${SUPER_ESC(system)}</strong><small>${systemSprints.length} Sprint${systemSprints.length > 1 ? 's' : ''} no portfólio</small></div></div><div><strong>${SUPER_ESC(current.project || current.code)}</strong><small>${SUPER_LANE(current)}</small></div><div><strong>${current.progress || 0}%</strong><small>progresso real</small></div><div><span class="super-issue-count ${current.blocked ? 'has-issue' : ''}">${current.blocked || 0}</span><small>bloqueios</small></div><div><span class="super-health ${SUPER_TONE(current)}">${current.health || 0}</span><small>saúde</small></div></div>` : '';
  }).join('');
  const laneOptions = Object.entries(SUPER_LANES).map(([id, label]) => `<option value="${id}" ${laneFilter === id ? 'selected' : ''}>${label}</option>`).join('');
  mount.innerHTML = `<div class="super-dashboard"><section class="super-hero"><div><span class="eyebrow">VISÃO DE DECISÃO</span><h2>O portfólio em uma leitura</h2><p>Acompanhe o que está em desenvolvimento, os bloqueios e as entregas recentes.</p></div><div class="super-updated">${sprints.length} Sprints · atualizado agora</div></section><section class="super-filter-bar"><label>Etapa<select data-super-lane><option value="all" ${laneFilter === 'all' ? 'selected' : ''}>Todas as etapas</option>${laneOptions}</select></label><div class="super-filter-hint">Filtre a visão macro por etapa do fluxo.</div></section><section class="super-kpis"><button class="super-kpi" data-kpi-filter="development"><span class="kpi-icon blue">↗</span><small>Em desenvolvimento</small><strong>${active.length}</strong><em>${systems.length} sistemas acompanhados</em></button><button class="super-kpi" data-kpi-filter="blocked"><span class="kpi-icon orange">!</span><small>Com bloqueios</small><strong>${blocked.length}</strong><em>${blocked.reduce((sum, sprint) => sum + Number(sprint.blocked || 0), 0)} bloqueios abertos</em></button><button class="super-kpi" data-kpi-filter="completed"><span class="kpi-icon green">✓</span><small>Entregas no último mês</small><strong>${completed.length}</strong><em>clique no gráfico para detalhar</em></button><button class="super-kpi"><span class="kpi-icon purple">◒</span><small>Itens prioritários</small><strong>${priorities}</strong><em>Alta ou Crítica</em></button></section><div class="super-main-grid"><section class="super-panel super-systems"><div class="super-panel-title"><div><span class="eyebrow">ACOMPANHAMENTO POR SISTEMA</span><h3>O que está em andamento</h3></div><span>${systems.length} sistemas</span></div><div class="super-system-table"><div class="super-system-head"><span>Sistema</span><span>Sprint em destaque</span><span>Progresso</span><span>Bloqueios</span><span>Saúde</span></div>${systemRows || '<div class="super-empty">Nenhum sistema corresponde ao filtro.</div>'}</div></section><section class="super-panel super-blockers"><div class="super-panel-title"><div><span class="eyebrow">AÇÃO NECESSÁRIA</span><h3>Bloqueios em destaque</h3></div><span>${blocked.length} projetos</span></div><div class="super-blocker-list">${blocked.sort((a, b) => (b.blocked || 0) - (a.blocked || 0)).slice(0, 5).map((sprint) => `<a class="super-blocker" href="#/kanban"><span class="super-alert-icon">!</span><div><strong>${SUPER_ESC(sprint.project || sprint.code)}</strong><small>${Number(sprint.blocked || 0)} bloqueio(s) · ${SUPER_ESC(sprint.nextMilestone || 'Próximo marco não informado')}</small></div><b>${sprint.priorityLevel || 'Média'}</b></a>`).join('') || '<div class="super-empty">Nenhum bloqueio aberto.</div>'}</div></section></div><section class="super-bottom-grid"><section class="super-panel"><div class="super-panel-title"><div><span class="eyebrow">ENTREGAS</span><h3>Último mês</h3></div><span>${completed.length} entregas</span></div>${superChart(completed)}<div class="super-chart-note">Clique em uma barra para abrir as entregas daquela semana.</div><div class="super-detail" data-super-detail hidden></div></section><section class="super-panel super-flow"><div class="super-panel-title"><div><span class="eyebrow">DISTRIBUIÇÃO</span><h3>Onde o portfólio está</h3></div></div>${Object.entries(SUPER_LANES).map(([id, label]) => { const count = filtered.filter((sprint) => sprint.lane === id).length; return `<div class="super-flow-row"><span>${label}</span><i><b style="width:${filtered.length ? Math.round((count / filtered.length) * 100) : 0}%"></b></i><strong>${count}</strong></div>`; }).join('')}</section></section></div>`;
  const systemCards = systems.map((system) => { const items = filtered.filter((sprint) => SUPER_SYSTEM(sprint) === system); const inProgress = items.filter((sprint) => ['development', 'homologation', 'approved', 'billing'].includes(sprint.lane)).length; const delivered = items.filter((sprint) => sprint.lane === 'completed').length; const color = SUPER_COLOR(system); return `<article class="super-system-card" style="--system-color:${SUPER_ESC(color)}"><div><span>${SUPER_ESC(system.slice(0, 2).toUpperCase())}</span><strong>${SUPER_ESC(system)}</strong></div><section><b>${inProgress}</b><small>Sprints em andamento</small></section><section><b>${delivered}</b><small>Sprints entregues</small></section></article>`; }).join('');
  mount.querySelector('.super-systems')?.insertAdjacentHTML('afterbegin', `<div class="super-system-cards">${systemCards || '<div class="super-empty">Nenhum sistema corresponde ao filtro.</div>'}</div>`);
  const deliveryPanel = mount.querySelector('.super-bottom-grid > .super-panel:first-child');
  if (deliveryPanel) {
    const deliveryTitle = deliveryPanel.querySelector('.super-panel-title');
    if (deliveryTitle) deliveryTitle.innerHTML = '<div><span class="eyebrow">ENTREGAS</span><h3>Resumo de entregas</h3></div><span>Últimos 30 dias</span>';
    deliveryPanel.querySelector('.super-chart')?.insertAdjacentHTML('beforebegin', `<div class="super-delivery-summary"><article><span class="kpi-icon blue">↗</span><div><small>Entregas da Semana</small><strong>${weeklyDeliveries.length}</strong><em>últimos 7 dias</em></div></article><article><span class="kpi-icon green">✓</span><div><small>Entregas do Mês</small><strong>${completed.length}</strong><em>últimos 30 dias</em></div></article></div>`);
  }
  const featured = (() => { try { return JSON.parse(localStorage.getItem('painelpro-sprints') || '[]').filter((sprint) => sprint.isFeatured); } catch { return []; } })();
  const featuredPanel = mount.querySelector('.super-blockers');
  if (featuredPanel) {
    featuredPanel.classList.remove('super-blockers');
    featuredPanel.classList.add('super-featured');
    featuredPanel.innerHTML = `<div class="super-panel-title"><div><span class="eyebrow">LEITURA EXECUTIVA</span><h3>Destaques</h3></div><span>${featured.length}</span></div><p class="super-featured-intro">Sprints selecionadas para acompanhamento.</p><div class="gover-feature-list">${featured.map((sprint) => { const system = SUPER_SYSTEM(sprint); return `<button type="button" class="gover-feature-item" data-super-feature-code="${SUPER_ESC(sprint.code)}" style="--feature-color:${SUPER_ESC(SUPER_COLOR(system))}"><span class="gover-feature-system">${SUPER_ESC(system)}</span><span class="gover-feature-meta">${SUPER_ESC(sprint.objective || sprint.project || sprint.code)}</span><strong>${SUPER_ESC(sprint.featuredNote || 'Informação adicional não registrada')}</strong><small>${SUPER_ESC(SUPER_LANE(sprint))} · ${sprint.progress || 0}%</small></button>`; }).join('') || '<div class="super-empty">Nenhum destaque selecionado.</div>'}</div>`;
    featuredPanel.querySelectorAll('[data-super-feature-code]').forEach((button) => { button.onclick = () => { location.hash = '#/kanban'; }; });
  }
  const events = completed;
  mount.querySelector('[data-super-lane]').onchange = (event) => { mount.dataset.laneFilter = event.target.value; renderSuper(); };
  mount.querySelectorAll('[data-kpi-filter]').forEach((button) => button.onclick = () => { mount.dataset.laneFilter = button.dataset.kpiFilter === 'blocked' ? 'all' : button.dataset.kpiFilter === 'completed' ? 'completed' : button.dataset.kpiFilter; renderSuper(); });
  mount.querySelectorAll('[data-delivery-week]').forEach((button) => button.onclick = () => renderSuperDetail(mount, events, Number(button.dataset.deliveryWeek)));
  mount.querySelector('[data-super-detail]')?.addEventListener('click', (event) => { if (event.target.closest('[data-close-super-detail]')) event.currentTarget.hidden = true; });
}

window.addEventListener('hashchange', () => setTimeout(renderSuper, 0));
setTimeout(renderSuper, 80);
