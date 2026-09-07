const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));

const STATUSES = ['A Fazer', 'Em Andamento', 'Bloqueada', 'Concluída'];

export function renderTaskBoard(tasks = []) {
  return `<div class="task-board">${STATUSES.map((status) => {
    const statusTasks = tasks.filter((task) => task.status === status);
    return `<div class="task-column" data-task-status="${status}"><div class="task-column-title">${status}<b>${statusTasks.length}</b></div>${statusTasks.map((task) => `<div class="task" draggable="true" data-task-id="${escapeHtml(task.id)}"><span class="task-check ${task.status === 'Concluída' ? 'done' : ''}">${task.status === 'Concluída' ? '✓' : ''}</span><div><b>${escapeHtml(task.id)} · ${task.points} pts</b><p>${escapeHtml(task.title)}</p><small>${escapeHtml(task.owner)}</small></div></div>`).join('') || '<div class="task-column-empty">Vazia</div>'}</div>`;
  }).join('')}</div>`;
}

