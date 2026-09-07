import type { ReactNode } from 'react';
import type { TooltipContentProps } from 'recharts';
import { chartTheme } from './chartTheme';

interface Props extends Partial<TooltipContentProps<number, string>> {
  valueFormatter?: (value: number, name: string) => string;
  labelFormatter?: (label: ReactNode) => ReactNode;
}

export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter = (value) => String(value),
  labelFormatter = (value) => value,
}: Props) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        minWidth: 132,
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
      <strong style={{ display: 'block', marginBottom: 5, fontWeight: 700 }}>
        {labelFormatter(label)}
      </strong>
      {payload.map((entry) => (
        <div
          key={`${String(entry.dataKey)}-${entry.name}`}
          style={{ display: 'flex', justifyContent: 'space-between', gap: 14, marginTop: 3 }}
        >
          <span style={{ color: entry.color || chartTheme.muted }}>{entry.name}</span>
          <strong style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {valueFormatter(Number(entry.value || 0), String(entry.name || ''))}
          </strong>
        </div>
      ))}
    </div>
  );
}
