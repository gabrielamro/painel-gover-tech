const goverSystemColors = ['#2f72d2', '#7a55d8', '#159a68', '#d6811f', '#d2577d', '#27869e', '#6a7f33', '#a454b6'];
const goverSystemColor = (system) => { let hash = 0; for (const char of system) hash = (hash * 31 + char.charCodeAt(0)) | 0; return goverSystemColors[Math.abs(hash) % goverSystemColors.length]; };
const goverSystemName = (card) => card.querySelector('.system-head b')?.textContent.split(' - Sprint')[0].trim() || 'Sistema';

function modernizeGoverDashboard() {
  if (!location.hash.includes('/dashboard')) return;
  const section = document.querySelector('.gover-section');
  if (!section || section.dataset.modernized === 'true') return;
  const cards = [...section.querySelectorAll('.system-card')];
  if (!cards.length) return;
  section.dataset.modernized = 'true';
  const systems = [...new Set(cards.map(goverSystemName))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const title = section.querySelector('.gover-section-title');
  const titleNote = title?.querySelector('span');
  const filter = document.createElement('div');
  filter.className = 'gover-system-filters';
  filter.setAttribute('aria-label', 'Filtrar status dos sistemas');
  filter.innerHTML = `<button type="button" class="gover-system-filter active" data-gover-system-filter="Todos">Todos</button>${systems.map((system) => `<button type="button" class="gover-system-filter" data-gover-system-filter="${system}" style="--system-color:${goverSystemColor(system)}">${system}</button>`).join('')}`;
  const situationFilter = document.createElement('select');
  situationFilter.className = 'gover-situation-filter';
  situationFilter.setAttribute('aria-label', 'Filtrar situação da Sprint');
  const situations = ['Em Planejamento', 'Planejado', 'Em Desenvolvimento', 'Em Homologação', 'Homologado', 'Aguardando Faturamento', 'Faturado'];
  situationFilter.innerHTML = `<option value="Todos">Todas as situações</option>${situations.map((situation) => `<option value="${situation}">${situation}</option>`).join('')}`;
  filter.append(situationFilter);
  title?.append(filter);
  cards.forEach((card) => {
    const system = goverSystemName(card);
    const head = card.querySelector('.system-head');
    const avatar = head?.querySelector('.system-avatar');
    const info = head?.querySelector('div');
    if (!head || !info) return;
    const originalName = info.querySelector('b')?.textContent || '';
    const sprintLabel = originalName.includes(' - Sprint') ? originalName.split(' - ')[1] : 'Sprint atual';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'gover-system-button';
    button.dataset.goverSystemFilter = system;
    button.style.setProperty('--system-color', goverSystemColor(system));
    button.textContent = system;
    button.title = `Filtrar ${system}`;
    avatar?.replaceWith(button);
    const name = info.querySelector('b');
    name?.remove();
    const sprint = document.createElement('small');
    sprint.className = 'gover-sprint-label';
    sprint.textContent = sprintLabel;
    info.prepend(sprint);
    card.dataset.goverSystem = system;
  });
  const systemCardCount = {};
  cards.forEach((card) => { const system = card.dataset.goverSystem; systemCardCount[system] = (systemCardCount[system] || 0) + 1; card.dataset.goverSystemPosition = String(systemCardCount[system]); });
  let selectedSituation = 'Todos';
  const setFilter = (system) => {
    filter.querySelectorAll('[data-gover-system-filter]').forEach((button) => button.classList.toggle('active', button.dataset.goverSystemFilter === system));
    section.querySelectorAll('.system-card').forEach((card) => { const situation = card.querySelector('.system-status')?.textContent.replace(/^●\s*/, '').trim(); card.hidden = Number(card.dataset.goverSystemPosition) > 3 || (system !== 'Todos' && card.dataset.goverSystem !== system) || (selectedSituation !== 'Todos' && situation !== selectedSituation); });
    if (titleNote) titleNote.textContent = system === 'Todos' ? `${cards.length} Sprints conectadas ao portfólio` : `${cards.filter((card) => card.dataset.goverSystem === system).length} Sprints de ${system}`;
  };
  filter.addEventListener('click', (event) => { const button = event.target.closest('[data-gover-system-filter]'); if (button) setFilter(button.dataset.goverSystemFilter); });
  situationFilter.addEventListener('change', () => { selectedSituation = situationFilter.value; setFilter(filter.querySelector('.active')?.dataset.goverSystemFilter || 'Todos'); });
  section.addEventListener('click', (event) => { const button = event.target.closest('[data-gover-system-filter]'); if (button && !filter.contains(button)) setFilter(button.dataset.goverSystemFilter); });
  setFilter('Todos');
}

new MutationObserver(modernizeGoverDashboard).observe(document.body, { childList: true, subtree: true });
window.addEventListener('hashchange', () => setTimeout(modernizeGoverDashboard, 80));
setTimeout(modernizeGoverDashboard, 150);
