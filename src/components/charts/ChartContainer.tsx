import type { ReactElement } from 'react';
import { ResponsiveContainer } from 'recharts';

interface Props {
  children: ReactElement;
  height: number | string;
  label: string;
  className?: string;
}

export function ChartContainer({ children, height, label, className }: Props) {
  return (
    <div
      className={className}
      role="img"
      aria-label={label}
      style={{ width: '100%', height, minWidth: 0 }}
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={80}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}
