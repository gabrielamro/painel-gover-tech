import type { TooltipContentProps } from 'recharts';
import { chartTheme } from '../../../components/charts/chartTheme';

export interface SystemModuleMetric {
  name: string;
  pf: number;
}

interface SystemDeliveryPayload {
  name: string;
  modules: SystemModuleMetric[];
}

export function SystemDeliveryTooltip({ active, payload }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null;

  const metric = payload[0].payload as SystemDeliveryPayload | undefined;
  if (!metric) return null;

  return (
    <div
      style={{
        minWidth: 176,
        padding: '8px 10px',
        border: `1px solid ${chartTheme.grid}`,
        borderRadius: 8,
        background: chartTheme.surface,
        boxShadow: '0 4px 8px rgb(15 23 42 / 10%)',
        color: chartTheme.text,
        fontFamily: 'DM Sans, system-ui, sans-serif',
        fontSize: 11,
      }}
    >
      <strong style={{ display: 'block', marginBottom: 5, fontWeight: 700 }}>{metric.name}</strong>
      {payload.map((entry) => (
        <div key={`${String(entry.dataKey)}-${entry.name}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 14, marginTop: 3 }}>
          <span style={{ color: entry.color || chartTheme.muted }}>{entry.name}</span>
          <strong style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {Number(entry.value || 0).toLocaleString('pt-BR')} PF
          </strong>
        </div>
      ))}
      {metric.modules.length > 0 && (
        <div style={{ borderTop: `1px solid ${chartTheme.grid}`, marginTop: 7, paddingTop: 6 }}>
          <span style={{ color: chartTheme.muted, fontWeight: 600 }}>Módulos incluídos</span>
          {metric.modules.map((module) => (
            <div key={module.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 14, marginTop: 3 }}>
              <span>{module.name}</span>
              <strong style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                {module.pf.toLocaleString('pt-BR')} PF
              </strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
