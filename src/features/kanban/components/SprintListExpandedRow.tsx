import type { ReactNode } from 'react';

interface SprintListExpandedRowProps {
  sprintCode: string;
  colSpan?: number;
  children: ReactNode;
}

export function SprintListExpandedRow({
  sprintCode,
  colSpan = 12,
  children,
}: SprintListExpandedRowProps) {
  return (
    <tr
      id={`sprint-expanded-${sprintCode}`}
      className="sprint-list-expanded-row"
      role="region"
      aria-label={`Quadro de tarefas expandido da Sprint ${sprintCode}`}
    >
      <td
        colSpan={colSpan}
        style={{
          padding: '8px 12px 16px 12px',
          backgroundColor: '#eff6ff',
          borderBottom: '2px solid #bfdbfe',
        }}
      >
        {children}
      </td>
    </tr>
  );
}
