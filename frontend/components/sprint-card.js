const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));

export function renderSprintCard(sprint, { laneLabel = '', healthLabel = '' } = {}) {
  const system = sprint.system || sprint.project;
  return `<article class="sprint-card" data-code="${escapeHtml(sprint.code)}" draggable="true"><div class="card-top"><span class="system-badge" data-system="${escapeHtml(system)}">${escapeHtml(system)}</span><span class="health-pill">${escapeHtml(healthLabel || `${sprint.health}/100`)}</span></div><h3>${escapeHtml(sprint.objective)}</h3><p>${escapeHtml(sprint.code)} · ${escapeHtml(sprint.po || 'PO não informado')}</p><div class="progress-bar"><span style="width:${Math.max(0, Math.min(100, Number(sprint.progress || 0)))}%"></span></div><footer><span>${Number(sprint.progress || 0)}% · ${escapeHtml(laneLabel)}</span><span>${Number(sprint.blocked || 0)} bloqueio(s)</span></footer></article>`;
}

