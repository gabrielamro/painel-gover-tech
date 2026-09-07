const FEATURED_KEY = 'painelpro-sprints';
const FEATURED_TYPE_LABELS = { sprint: 'Sprint em destaque', delivery: 'Entrega', blocker: 'Bloqueio', decision: 'Decisão' };
const FEATURED_COLORS = ['#2f72d2', '#7a55d8', '#159a68', '#d6811f', '#d2577d', '#27869e', '#6a7f33', '#a454b6'];

const featuredRead = () => { try { return JSON.parse(localStorage.getItem(FEATURED_KEY)) || []; } catch { return []; } };
const featuredSave = (sprints) => localStorage.setItem(FEATURED_KEY, JSON.stringify(sprints));
const featuredEsc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
const featuredColor = (system) => { let hash = 0; for (const char of system) hash = (hash * 31 + char.charCodeAt(0)) | 0; return FEATURED_COLORS[Math.abs(hash) % FEATURED_COLORS.length]; };
const featuredCodeFromDrawer = () => {
  const drawer = document.querySelector('.drawer-v2');
  if (!drawer) return undefined;
  if (drawer.dataset.sprintCode) return drawer.dataset.sprintCode;
  const headerCode = drawer.querySelector('.drawer-header')?.textContent.match(/OS-\d+/)?.[0];
  if (headerCode) return headerCode;
  const objective = drawer.querySelector('.drawer-header h2')?.textContent.trim();
  const card = [...document.querySelectorAll('.sprint-card[data-code]')].find((item) => item.querySelector('.sprint-title, .objective')?.textContent.trim() === objective);
  return card?.dataset.code;
};

function logFeaturedAction(action, code, details) {
  try {
    const database = JSON.parse(localStorage.getItem('painelpro-db') || '{}');
    database.auditLogs ||= [];
    database.auditLogs.push({ id: `ALT-${Date.now()}`, action, entity: 'SprintHighlight', entityId: code, details, user: 'Camila Pereira', createdAt: new Date().toISOString() });
    localStorage.setItem('painelpro-db', JSON.stringify(database));
  } catch { /* persistência da auditoria não deve impedir a alteração principal */ }
}

function wireHighlightPopup() {
  const drawer = document.querySelector('.drawer-v2');
  const summary = drawer?.querySelector('[data-popup-panel="summary"]');
  const nav = drawer?.querySelector('.drawer-tabs');
  if (!drawer || !summary || !nav || drawer.dataset.featuredWired === 'true') return;
  const code = featuredCodeFromDrawer();
  const sprint = featuredRead().find((item) => item.code === code);
  if (!sprint) return;
  drawer.dataset.featuredWired = 'true';
  const tab = document.createElement('button');
  tab.className = 'drawer-tab';
  tab.type = 'button';
  tab.dataset.popupTab = 'featured';
  tab.textContent = 'Destaque';
  nav.append(tab);
  summary.insertAdjacentHTML('beforeend', '<div class="featured-toggle featured-toggle-summary"><label><input type="checkbox" data-featured-check> Exibir no Dashboard Gover</label><span>Marque para habilitar a aba de informação executiva.</span></div>');
  const panel = document.createElement('section');
  panel.className = 'drawer-panel hidden featured-panel';
  panel.dataset.popupPanel = 'featured';
  panel.innerHTML = `<label class="featured-note-label">Informação executiva<textarea data-featured-note maxlength="280" ${sprint.isFeatured ? '' : 'disabled'} placeholder="Contexto, decisão ou entrega que merece destaque...">${featuredEsc(sprint.featuredNote || '')}</textarea><small><span data-featured-count>${(sprint.featuredNote || '').length}</span>/280 caracteres</small></label><div class="featured-actions"><button type="button" class="secondary-button" data-featured-remove ${sprint.isFeatured ? '' : 'disabled'}>Remover destaque</button><button type="button" class="primary-small" data-featured-save>Salvar destaque</button></div>`;
  drawer.querySelector('.drawer-v2')?.append(panel) || drawer.append(panel);
  const check = summary.querySelector('[data-featured-check]');
  check.checked = Boolean(sprint.isFeatured);
  const note = panel.querySelector('[data-featured-note]');
  const remove = panel.querySelector('[data-featured-remove]');
  const count = panel.querySelector('[data-featured-count]');
  const updateEnabled = () => { note.disabled = !check.checked; remove.disabled = !check.checked; tab.disabled = !check.checked; if (!check.checked) panel.classList.add('hidden'); };
  const setPanel = (name) => { nav.querySelectorAll('.drawer-tab').forEach((item) => item.classList.toggle('active', item.dataset.popupTab === name)); drawer.querySelectorAll('[data-popup-panel]').forEach((item) => item.classList.toggle('hidden', item.dataset.popupPanel !== name)); };
  check.onchange = updateEnabled;
  note.oninput = () => { count.textContent = note.value.length; };
  tab.onclick = () => { if (!tab.disabled) setPanel('featured'); };
  nav.querySelectorAll('.drawer-tab:not([data-featured-bound])').forEach((item) => { item.dataset.featuredBound = 'true'; item.onclick = () => setPanel(item.dataset.popupTab); });
  panel.querySelector('[data-featured-save]').onclick = () => {
    const data = featuredRead();
    const target = data.find((item) => item.code === code);
    if (!target) return;
    const wasFeatured = Boolean(target.isFeatured);
    target.isFeatured = check.checked;
    target.featuredNote = note.value.trim();
    target.featuredType = target.featuredType || 'sprint';
    target.featuredAt = target.featuredAt || (check.checked ? new Date().toISOString() : null);
    target.featuredUpdatedAt = new Date().toISOString();
    target.featuredBy = 'Camila Pereira';
    featuredSave(data);
    logFeaturedAction(check.checked ? (wasFeatured ? 'SPRINT_HIGHLIGHT_UPDATED' : 'SPRINT_HIGHLIGHT_ADDED') : 'SPRINT_HIGHLIGHT_REMOVED', code, { isFeatured: target.isFeatured, note: target.featuredNote });
    window.dispatchEvent(new CustomEvent('featured-sprint-updated', { detail: { code } }));
    updateEnabled();
    tab.textContent = check.checked ? 'Destaque ✓' : 'Destaque';
  };
  remove.onclick = () => { check.checked = false; updateEnabled(); panel.querySelector('[data-featured-save]').click(); setPanel('summary'); };
  tab.textContent = check.checked ? 'Destaque ✓' : 'Destaque';
  tab.disabled = !check.checked;
}

function wireCardHighlightMenu() {
  document.querySelectorAll('.sprint-card .card-context-menu').forEach((menu) => {
    if (menu.querySelector('[data-featured-menu]')) return;
    const card = menu.closest('.sprint-card[data-code]');
    if (!card) return;
    const code = card.dataset.code;
    const item = featuredRead().find((sprint) => sprint.code === code);
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.featuredMenu = code;
    button.textContent = item?.isFeatured ? 'Remover destaque' : 'Destacar card';
    button.onclick = (event) => {
      event.stopPropagation();
      const data = featuredRead();
      const target = data.find((sprint) => sprint.code === code);
      if (!target) return;
      const nextState = !target.isFeatured;
      target.isFeatured = nextState;
      target.featuredType = target.featuredType || 'sprint';
      target.featuredAt = target.featuredAt || (nextState ? new Date().toISOString() : null);
      target.featuredUpdatedAt = new Date().toISOString();
      target.featuredBy = 'Camila Pereira';
      featuredSave(data);
      logFeaturedAction(nextState ? 'SPRINT_HIGHLIGHT_ADDED' : 'SPRINT_HIGHLIGHT_REMOVED', code, { source: 'card-context-menu' });
      window.dispatchEvent(new CustomEvent('featured-sprint-updated', { detail: { code } }));
      menu.classList.add('hidden');
      if (nextState) setTimeout(() => card.click(), 0);
    };
    menu.append(button);
  });
}

function renderFeaturedSidebar() {
  if (!location.hash.includes('/dashboard')) return;
  const dashboard = document.querySelector('.gover-dashboard');
  if (!dashboard || dashboard.querySelector('.gover-feature-sidebar')) return;
  const items = featuredRead().filter((sprint) => sprint.isFeatured);
  const sorted = items.sort((a, b) => Number(b.blocked || 0) - Number(a.blocked || 0) || new Date(b.featuredUpdatedAt || 0) - new Date(a.featuredUpdatedAt || 0));
  const aside = document.createElement('aside');
  aside.className = 'gover-feature-sidebar';
  aside.innerHTML = `<div class="gover-feature-heading"><div><span class="eyebrow">LEITURA EXECUTIVA</span><h2>Destaques</h2></div><span>${items.length}</span></div><p class="gover-feature-intro">Sprints e entregas selecionadas para acompanhamento.</p><div class="gover-feature-list">${sorted.map((sprint) => { const system = sprint.system || sprint.project?.split(' - Sprint')[0] || 'Sistema'; const type = FEATURED_TYPE_LABELS[sprint.featuredType] || FEATURED_TYPE_LABELS.sprint; return `<button type="button" class="gover-feature-item" data-feature-code="${featuredEsc(sprint.code)}" style="--feature-color:${featuredColor(system)}"><span class="gover-feature-system">${featuredEsc(system)}</span><span class="gover-feature-meta">${featuredEsc(sprint.project?.split(' - ').pop() || `Sprint ${sprint.sprintNumber || ''}`)} · ${type}</span><strong>${featuredEsc(sprint.featuredNote || 'Informação adicional não registrada')}</strong><small>${featuredEsc(sprint.lane === 'development' ? 'Em desenvolvimento' : sprint.lane === 'homologation' ? 'Em homologação' : 'Atualização da Sprint')} · ${sprint.progress || 0}%</small></button>`; }).join('') || '<div class="gover-feature-empty"><span>☆</span><p>Nenhum destaque selecionado.</p><small>Abra uma Sprint, acesse a aba Destaque e marque “Exibir no Dashboard Gover”.</small></div>'}</div>`;
  dashboard.append(aside);
  aside.addEventListener('click', (event) => { const button = event.target.closest('[data-feature-code]'); if (!button) return; const code = button.dataset.featureCode; location.hash = '#/kanban'; setTimeout(() => document.querySelector(`.sprint-card[data-code="${code}"]`)?.click(), 160); });
}

const featureObserver = new MutationObserver(() => { wireHighlightPopup(); wireCardHighlightMenu(); renderFeaturedSidebar(); });
featureObserver.observe(document.body, { childList: true, subtree: true });
window.addEventListener('hashchange', () => setTimeout(() => { wireHighlightPopup(); wireCardHighlightMenu(); renderFeaturedSidebar(); }, 100));
window.addEventListener('featured-sprint-updated', () => renderFeaturedSidebar());
setInterval(() => { wireHighlightPopup(); wireCardHighlightMenu(); renderFeaturedSidebar(); }, 500);
