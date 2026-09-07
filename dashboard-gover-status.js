const GOVERNANCE_STATUS_LANES = {
  planning: 'Em Planejamento',
  planned: 'Planejado',
  development: 'Em Desenvolvimento',
  homologation: 'Em Homologação',
  approved: 'Homologado',
  billing: 'Aguardando Faturamento',
  completed: 'Faturado',
};
const readGovernanceSprints = () => { try { return JSON.parse(localStorage.getItem('painelpro-sprints')) || []; } catch { return []; } };

function scopeGoverStatusCards() {
  if (!location.hash.includes('/dashboard')) return;
  const section = document.querySelector('.gover-section');
  const grid = section?.querySelector('.system-grid');
  if (!section || !grid) return;
  // A própria organização dos cards altera o DOM e dispara o observer.
  // Interrompa cedo quando a seção já foi processada para evitar um ciclo
  // infinito de mutações que trava a aba ao abrir o Dashboard.
  if (section.dataset.statusScoped === 'true') return;
  section.dataset.statusScoped = 'true';
  const sprints = readGovernanceSprints();
  const byCode = new Map(sprints.map((sprint) => [sprint.code, sprint]));
  const cards = [...section.querySelectorAll('.system-card')];
  if (!cards.length) return;
  cards.forEach((card) => {
    const code = card.querySelector('.system-head small:not(.gover-sprint-label)')?.textContent.split(' · ')[0].trim();
    const sprint = byCode.get(code);
    const status = card.querySelector('.system-status');
    const statusLabel = `● ${GOVERNANCE_STATUS_LANES[sprint?.lane] || ''}`;
    if (status && sprint && status.textContent !== statusLabel) status.textContent = statusLabel;
    card.dataset.goverLane = sprint?.lane || '';
  });
  const groups = Object.entries(GOVERNANCE_STATUS_LANES).map(([lane, label]) => {
    const group = document.createElement('section');
    group.className = 'gover-status-group';
    group.dataset.goverStatusGroup = lane;
    const heading = document.createElement('div');
    heading.className = 'gover-status-group-title';
    heading.innerHTML = `<h3>${label}</h3><span></span>`;
    group.append(heading);
    const groupGrid = document.createElement('div');
    groupGrid.className = 'system-grid';
    cards.filter((card) => card.dataset.goverLane === lane).forEach((card) => groupGrid.append(card));
    heading.querySelector('span').textContent = `${groupGrid.children.length} sprint${groupGrid.children.length === 1 ? '' : 's'}`;
    group.append(groupGrid);
    return group;
  });
  grid.replaceWith(...groups);
}

new MutationObserver(scopeGoverStatusCards).observe(document.body, { childList: true, subtree: true });
window.addEventListener('hashchange', () => setTimeout(scopeGoverStatusCards, 80));
setInterval(scopeGoverStatusCards, 500);
