import { Layers, TrendingUp, CheckCircle2, Clock, FileSpreadsheet } from 'lucide-react';
import { formatPF } from '../../../domain/billing/format';

export interface PfKpiSummary {
  estimatedPf: number;
  detailedPf: number;
  developmentCount: number;
  deliveredCount: number;
  waitingBillingPf: number;
}

interface Props {
  summary: PfKpiSummary;
  monthName: string;
}

export function PfFinancialKpis({ summary, monthName }: Props) {
  return (
    <section className="pf-kpis-grid" aria-label="Indicadores financeiros de PF">
      {/* 1. PF previstos no mês */}
      <div className="pf-kpi-card">
        <div className="pf-kpi-icon blue">
          <Layers size={20} />
        </div>
        <div className="pf-kpi-content">
          <small>PF previstos no mês</small>
          <strong>{formatPF(summary.estimatedPf)}</strong>
          <em>Estimativa de {monthName}</em>
        </div>
      </div>

      {/* 2. OSs em desenvolvimento */}
      <div className="pf-kpi-card">
        <div className="pf-kpi-icon purple">
          <TrendingUp size={20} />
        </div>
        <div className="pf-kpi-content">
          <small>OSs em desenvolvimento</small>
          <strong>{summary.developmentCount}</strong>
          <em>Em execução técnica</em>
        </div>
      </div>

      {/* 3. OSs entregues */}
      <div className="pf-kpi-card">
        <div className="pf-kpi-icon green">
          <CheckCircle2 size={20} />
        </div>
        <div className="pf-kpi-content">
          <small>OSs entregues</small>
          <strong>{summary.deliveredCount}</strong>
          <em className="success">Em homologação ou faturadas</em>
        </div>
      </div>

      {/* 4. PF aguardando faturamento */}
      <div className="pf-kpi-card">
        <div className="pf-kpi-icon orange">
          <Clock size={20} />
        </div>
        <div className="pf-kpi-content">
          <small>Aguardando faturamento</small>
          <strong>{formatPF(summary.waitingBillingPf)}</strong>
          <em>Prontos para faturar</em>
        </div>
      </div>

      {/* 5. Total de PF detalhado */}
      <div className="pf-kpi-card">
        <div className="pf-kpi-icon teal">
          <FileSpreadsheet size={20} />
        </div>
        <div className="pf-kpi-content">
          <small>Total de PF detalhado</small>
          <strong>{formatPF(summary.detailedPf)}</strong>
          <em>Contagem detalhada</em>
        </div>
      </div>
    </section>
  );
}
