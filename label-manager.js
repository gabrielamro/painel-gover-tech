const storageKey = 'painelpro-labels';
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
const palette = ['#e7a928', '#2f72d2', '#8a5bd8', '#27a66f', '#d65d7a', '#526d82'];
const readLabels = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return stored.map((item, index) => typeof item === 'string' ? { name: item, color: palette[index % palette.length] } : item).filter((item) => item.name);
  } catch { return []; }
};
const saveLabels = (labels) => { localStorage.setItem(storageKey, JSON.stringify(labels)); window.dispatchEvent(new Event('painelpro:labels-updated')); };

function openLabelManager() {
  document.querySelector('.label-modal')?.remove();
  const element = document.createElement('div');
  element.className = 'editor-modal label-modal';
  const render = () => {
    const labels = readLabels();
    element.innerHTML = `<div class="editor-dialog label-dialog"><button class="editor-close" data-label-close>×</button><span class="eyebrow">ETIQUETAS DO PORTFÓLIO</span><h2>Gerenciar etiquetas</h2><p class="label-description">Use etiquetas para sinalizar contexto operacional sem criar novas raias.</p><form data-label-form><div class="label-create-row"><input name="name" placeholder="Ex.: Dependência externa" maxlength="32" required><input name="color" type="color" value="#2f72d2" aria-label="Cor"><button class="primary-small">Criar etiqueta</button></div></form><div class="managed-labels">${labels.length ? labels.map((label, index) => `<div class="managed-label"><i style="background:${esc(label.color || palette[index % palette.length])}"></i><span>${esc(label.name)}</span><button data-label-delete="${esc(label.name)}" aria-label="Excluir ${esc(label.name)}">Excluir</button></div>`).join('') : '<div class="empty-state">Nenhuma etiqueta criada.</div>'}</div></div>`;
    element.querySelector('[data-label-close]').onclick = () => element.remove();
    element.querySelector('[data-label-form]').onsubmit = (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const name = form.get('name').trim(); const labelsNow = readLabels(); if (labelsNow.some((label) => label.name.toLowerCase() === name.toLowerCase())) return; saveLabels([...labelsNow, { name, color: form.get('color') }]); render(); };
    element.querySelectorAll('[data-label-delete]').forEach((button) => button.onclick = () => { const name = button.dataset.labelDelete; const sprints = JSON.parse(localStorage.getItem('painelpro-sprints') || '[]'); const inUse = sprints.some((sprint) => (sprint.labels || []).includes(name)); if (inUse && !window.confirm(`A etiqueta “${name}” está em uso. Removê-la das Sprints também?`)) return; if (inUse) { sprints.forEach((sprint) => { sprint.labels = (sprint.labels || []).filter((label) => label !== name); }); localStorage.setItem('painelpro-sprints', JSON.stringify(sprints)); } saveLabels(readLabels().filter((label) => label.name !== name)); render(); });
  };
  document.body.append(element); render();
}

function wireLabelManager() {
  if (!location.hash.includes('/kanban') || document.querySelector('.label-manager-button')) return;
  const target = document.querySelector('.board-head .filter-button');
  if (!target) return;
  const button = document.createElement('button');
  button.className = 'label-manager-button'; button.type = 'button'; button.textContent = 'Etiquetas'; button.onclick = openLabelManager; target.after(button);
}

new MutationObserver(() => requestAnimationFrame(wireLabelManager)).observe(document.body, { childList: true, subtree: true });
window.addEventListener('hashchange', () => requestAnimationFrame(wireLabelManager));
window.addEventListener('painelpro:open-label-manager', openLabelManager);
