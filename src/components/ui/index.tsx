import type { ReactNode } from 'react';
import {
  Button as MuiButton,
  IconButton as MuiIconButton,
  Paper as MuiPaper,
  Chip as MuiChip,
  LinearProgress as MuiLinearProgress,
  TextField as MuiTextField,
  Dialog as MuiDialog,
  Tooltip as MuiTooltip,
  Avatar as MuiAvatar,
  Skeleton as MuiSkeleton,
  Typography,
  Box,
} from '@mui/material';
import {
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  LoaderCircle,
  XCircle,
} from 'lucide-react';

export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'purple';

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  onClick,
  disabled,
  type = 'button',
}: {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
  className?: string;
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}) {
  return (
    <MuiButton
      variant={variant === 'primary' ? 'contained' : variant === 'ghost' ? 'text' : 'outlined'}
      color={variant === 'danger' ? 'error' : 'primary'}
      size={size === 'sm' ? 'small' : 'medium'}
      className={className}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </MuiButton>
  );
}

export function IconButton({
  label,
  children,
  onClick,
  disabled,
}: {
  label: string;
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}) {
  return (
    <MuiTooltip title={label} arrow>
      <MuiIconButton aria-label={label} onClick={onClick} disabled={disabled} size="small">
        {children}
      </MuiIconButton>
    </MuiTooltip>
  );
}

export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <MuiPaper
      elevation={0}
      className={className}
      sx={{
        p: 2.5,
        borderRadius: 2.5,
        border: '1px solid #e2e8f0',
        bgcolor: '#ffffff',
      }}
    >
      {children}
    </MuiPaper>
  );
}

export function CardHeader({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ mb: 1.5, pb: 1, borderBottom: '1px solid #f1f5f9' }}>
      {children}
    </Box>
  );
}

export function CardBody({ children }: { children: ReactNode }) {
  return <Box>{children}</Box>;
}

export function Badge({
  tone = 'neutral',
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  const color =
    tone === 'primary'
      ? 'primary'
      : tone === 'success'
      ? 'success'
      : tone === 'warning'
      ? 'warning'
      : tone === 'danger'
      ? 'error'
      : tone === 'purple'
      ? 'secondary'
      : 'default';

  return <MuiChip label={children} color={color} size="small" sx={{ fontWeight: 600 }} />;
}

export function StatusBadge({
  status,
}: {
  status:
    | 'Em desenvolvimento'
    | 'Em homologação'
    | 'Homologado'
    | 'Aguardando faturamento'
    | 'Faturado';
}) {
  const colorMap: Record<
    typeof status,
    'primary' | 'secondary' | 'success' | 'warning' | 'default'
  > = {
    'Em desenvolvimento': 'primary',
    'Em homologação': 'secondary',
    Homologado: 'success',
    'Aguardando faturamento': 'warning',
    Faturado: 'success',
  };

  return <MuiChip label={status} color={colorMap[status]} size="small" sx={{ fontWeight: 700 }} />;
}

export function ProjectBadge({ project, color }: { project: string; color?: string }) {
  return (
    <MuiChip
      label={project}
      size="small"
      sx={{
        bgcolor: color ? `${color}15` : '#eff6ff',
        color: color || '#1d4ed8',
        fontWeight: 700,
      }}
    />
  );
}

export function LabelBadge({ label, color }: { label: string; color?: string }) {
  return (
    <MuiChip
      label={label}
      size="small"
      variant="outlined"
      sx={{
        borderColor: color || '#cbd5e1',
        color: color || '#334155',
        fontWeight: 600,
      }}
    />
  );
}

export function PriorityBadge({
  priority,
}: {
  priority: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
}) {
  const color =
    priority === 'Crítica'
      ? 'error'
      : priority === 'Alta'
      ? 'warning'
      : priority === 'Média'
      ? 'primary'
      : 'default';

  return <MuiChip label={priority} color={color} size="small" sx={{ fontWeight: 700 }} />;
}

export function ProgressBar({
  value,
  tone = 'primary',
  label,
}: {
  value: number;
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'purple';
  label?: string;
}) {
  const color =
    tone === 'success'
      ? 'success'
      : tone === 'warning'
      ? 'warning'
      : tone === 'danger'
      ? 'error'
      : tone === 'purple'
      ? 'secondary'
      : 'primary';

  return (
    <Box sx={{ width: '100%' }}>
      {label && (
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
          {label}
        </Typography>
      )}
      <MuiLinearProgress
        variant="determinate"
        value={Math.min(100, Math.max(0, value))}
        color={color}
        sx={{ height: 6, borderRadius: 3 }}
      />
    </Box>
  );
}

export function Input(props: React.ComponentProps<typeof MuiTextField>) {
  return <MuiTextField size="small" fullWidth {...props} />;
}

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <MuiPaper
      elevation={0}
      sx={{
        p: '10px 16px',
        borderRadius: 2,
        border: '1px solid #e2e8f0',
        bgcolor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        flexWrap: 'wrap',
      }}
    >
      {children}
    </MuiPaper>
  );
}

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <MuiTooltip title={label} arrow>
      <span>{children}</span>
    </MuiTooltip>
  );
}

export function Avatar({ initials }: { initials: string }) {
  return (
    <MuiAvatar
      sx={{
        width: 32,
        height: 32,
        bgcolor: 'primary.main',
        fontSize: '0.75rem',
        fontWeight: 700,
      }}
    >
      {initials}
    </MuiAvatar>
  );
}

export function MetricCard({
  label,
  value,
  tone = 'primary',
}: {
  label: string;
  value: ReactNode;
  tone?: Tone;
}) {
  const color =
    tone === 'success'
      ? 'success.main'
      : tone === 'warning'
      ? 'warning.main'
      : tone === 'danger'
      ? 'error.main'
      : tone === 'purple'
      ? 'secondary.main'
      : 'primary.main';

  return (
    <Card>
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="h2" sx={{ my: 0.5, fontWeight: 700, color }}>
        {value}
      </Typography>
    </Card>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
      <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
          {description}
        </Typography>
      )}
    </Box>
  );
}

export function Skeleton({ width = '100%' }: { width?: string }) {
  return <MuiSkeleton variant="rectangular" width={width} height={36} sx={{ borderRadius: 1.5 }} />;
}

export function StateIcon({
  state,
}: {
  state: 'success' | 'warning' | 'error' | 'loading' | 'help';
}) {
  const icon = {
    success: <CheckCircle2 size={16} color="#16a34a" />,
    warning: <AlertTriangle size={16} color="#d97706" />,
    error: <XCircle size={16} color="#dc2626" />,
    loading: <LoaderCircle size={16} color="#2563eb" />,
    help: <CircleHelp size={16} color="#64748b" />,
  }[state];
  return <span aria-hidden="true">{icon}</span>;
}

export function Modal({
  open,
  children,
  onClose,
}: {
  open: boolean;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <MuiDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box sx={{ p: 3 }}>{children}</Box>
    </MuiDialog>
  );
}
