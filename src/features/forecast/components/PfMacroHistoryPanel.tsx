import { Database, UserRound } from 'lucide-react';
import type { CSSProperties } from 'react';
import { formatPF } from '../../../domain/billing/format';
import { pfDisplayName, type PfMonthlyRecord } from '../../../domain/pf/model';

interface Props {
  records: PfMonthlyRecord[];
  month: string;
  project?: string;
  manager?: string;
  getSystemColor: (system: string) => string;
}

export function PfMacroHistoryPanel({ records, month, project, manager, getSystemColor }: Props) {
  const visible = records.filter((record) => (!project || project === 'all' || pfDisplayName(record) === project || record.project === project) && (!manager || manager === 'all' || record.manager === manager));
  const grouped = [...new Map(visible.map((record) => [pfDisplayName(record), record])).values()]
    .map((first) => {
      const group = visible.filter((record) => pfDisplayName(record) === pfDisplayName(first));
      return {
        name: pfDisplayName(first),
        project: first.project,
        module: first.module,
        current: group.filter((record) => record.month === month).reduce((sum, record) => sum + record.detailedPf, 0),
        total: group.reduce((sum, record) => sum + record.detailedPf, 0),
        manager: first.manager,
        analyst: first.cgticAnalyst,
        months: new Set(group.map((record) => record.month)).size,
      };
    })
    .sort((a, b) => b.total - a.total);

  return (
    <section className="pf-macro-panel" aria-label="Histórico macro de PF detalhado">
      <div className="pf-macro-panel__header">
        <div>
          <span className="pf-section-kicker"><Database size={13} /> CARGA HISTÓRICA</span>
          <h2>PF detalhado por Projeto e Módulo</h2>
          <p>Valores realizados/faturados importados da planilha histórica.</p>
        </div>
        <span className="pf-macro-panel__count">{visible.length} registros</span>
      </div>
      {grouped.length ? (
        <div className="pf-macro-grid">
          {grouped.map((item) => (
            <article
              className="pf-macro-card"
              key={item.name}
              style={{ '--pf-system-color': getSystemColor(item.project) } as CSSProperties}
            >
              <div className="pf-macro-card__title" title={item.name}>{item.name}</div>
              <div className="pf-macro-card__values">
                <div><small>{month === '' ? 'Mês selecionado' : 'No mês selecionado'}</small><strong>{formatPF(item.current)} PF</strong></div>
                <div><small>Acumulado carregado</small><strong>{formatPF(item.total)} PF</strong></div>
              </div>
              <div className="pf-macro-card__meta"><UserRound size={12} /> {item.manager || 'Gerente não informado'} · {item.analyst || 'Analista não informado'} · {item.months} meses</div>
            </article>
          ))}
        </div>
      ) : <p className="pf-macro-empty">Nenhum registro histórico encontrado para os filtros atuais.</p>}
    </section>
  );
}
