function updateExecutiveTab() { if (!location.hash.includes('/kanban')) return; const item = document.querySelector('.nav-item[href="#/dashboard"] span'); if (item && item.textContent !== 'Análise Executiva') item.textContent = 'Análise Executiva'; }
new MutationObserver(updateExecutiveTab).observe(document.body, { childList: true, subtree: true });
setInterval(updateExecutiveTab, 1000);
