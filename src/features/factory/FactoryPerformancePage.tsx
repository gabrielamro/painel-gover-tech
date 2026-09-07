import { Box, Typography, Paper, Chip, LinearProgress } from '@mui/material';
import { Zap, CheckCircle2, Clock, Building2 } from 'lucide-react';
import { useSprints } from '../../app/providers/SprintProvider';
import { FactoryMonthlyThroughputChart } from './components/FactoryMonthlyThroughputChart';
import { FactorySystemsDeliveryChart } from './components/FactorySystemsDeliveryChart';
import { FactoryActiveSprintsDeadlines } from './components/FactoryActiveSprintsDeadlines';

export function FactoryPerformancePage() {
  const { sprints } = useSprints();

  // Quantitativo de Sprints entregues vs em andamento
  const completedCount = sprints.filter((s) => s.lane === 'completed' || s.lane === 'approved' || s.lane === 'billing').length || 76;
  const wipCount = sprints.filter((s) => s.lane === 'development' || s.lane === 'homologation').length || 14;

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        background: 'var(--bg, #f7f9fc)',
        minHeight: 'calc(100vh - 70px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      {/* 1. Top Ribbon — Saúde, Velocidade & Cadência da Fábrica */}
      <Paper
        elevation={0}
        sx={{
          p: '6px 14px',
          borderRadius: 2,
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <Zap size={13} color="#16a34a" />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem' }}>
              Ritmo da Fábrica:
            </Typography>
            <Chip
              label="8.4 Sprints / Mês (Vazão Média)"
              size="small"
              sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700, height: 20, fontSize: '0.6875rem' }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <Building2 size={13} color="#2563eb" />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem' }}>
              Capacidade Simultânea:
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.75rem' }}>
              5 de 5 Sistemas em Produção Ativa
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <CheckCircle2 size={13} color="#7c3aed" />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem' }}>
              Taxa de Assertividade:
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.75rem' }}>
              96.2% de Entregas no Prazo
            </Typography>
          </Box>
        </Box>

        <Chip
          label="Operação Fábrica de Software"
          size="small"
          sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 700, fontSize: '0.6875rem', height: 20 }}
        />
      </Paper>

      {/* 2. Hero KPIs Operacionais (Proporções Compactas do Design System) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 1.5,
        }}
      >
        {/* KPI 1: Total de Sprints Entregues */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.4px', fontSize: '0.6875rem' }}>
              TOTAL DE SPRINTS ENTREGUES
            </Typography>
            <Chip
              label="84% Concluído"
              size="small"
              sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: '0.625rem', height: 18 }}
            />
          </Box>
          <Box sx={{ my: 0.2 }}>
            <Typography variant="h2" sx={{ fontSize: '1.4rem', fontWeight: 700, color: 'primary.main', m: 0, lineHeight: 1.15 }}>
              {completedCount} Sprints
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6875rem', display: 'block', mt: 0.2 }}>
              <strong>+14 Sprints</strong> entregues no último mês
            </Typography>
          </Box>
          <Box sx={{ mt: 0.8 }}>
            <LinearProgress
              variant="determinate"
              value={84}
              sx={{ height: 4, borderRadius: 2, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' } }}
            />
          </Box>
        </Paper>

        {/* KPI 2: Sprints em Andamento */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.4px', fontSize: '0.6875rem' }}>
              SPRINTS EM ANDAMENTO
            </Typography>
            <Chip
              label="WIP Ativo"
              size="small"
              sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 700, fontSize: '0.625rem', height: 18 }}
            />
          </Box>
          <Box sx={{ my: 0.2 }}>
            <Typography variant="h2" sx={{ fontSize: '1.4rem', fontWeight: 700, color: '#4f46e5', m: 0, lineHeight: 1.15 }}>
              {wipCount} Sprints
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6875rem', display: 'block', mt: 0.2 }}>
              8 em Desenvolvimento · 6 em Homologação
            </Typography>
          </Box>
          <Box sx={{ mt: 0.8, display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4f46e5' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#4f46e5', fontSize: '0.6875rem' }}>
              Todas dentro do cronograma pactuado
            </Typography>
          </Box>
        </Paper>

        {/* KPI 3: Throughput do Último Mês */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.4px', fontSize: '0.6875rem' }}>
              THROUGHPUT DO ÚLTIMO MÊS
            </Typography>
            <Chip
              label="Recorde Mensal"
              size="small"
              sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: '0.625rem', height: 18 }}
            />
          </Box>
          <Box sx={{ my: 0.2 }}>
            <Typography variant="h2" sx={{ fontSize: '1.4rem', fontWeight: 700, color: 'success.main', m: 0, lineHeight: 1.15 }}>
              14 Sprints
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6875rem', display: 'block', mt: 0.2 }}>
              Faturadas e aceitas pelo cliente
            </Typography>
          </Box>
          <Box sx={{ mt: 0.8, display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main', fontSize: '0.6875rem' }}>
              +35% acima da média histórica
            </Typography>
          </Box>
        </Paper>

        {/* KPI 4: Lead Time Médio */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.4px', fontSize: '0.6875rem' }}>
              LEAD TIME MÉDIO
            </Typography>
            <Chip
              label="Alta Velocidade"
              size="small"
              sx={{ bgcolor: '#faf5ff', color: '#6d28d9', fontWeight: 700, fontSize: '0.625rem', height: 18 }}
            />
          </Box>
          <Box sx={{ my: 0.2 }}>
            <Typography variant="h2" sx={{ fontSize: '1.4rem', fontWeight: 700, color: 'secondary.main', m: 0, lineHeight: 1.15 }}>
              18.5 Dias
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6875rem', display: 'block', mt: 0.2 }}>
              Tempo médio de ciclo por Sprint
            </Typography>
          </Box>
          <Box sx={{ mt: 0.8, display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <Clock size={11} color="#7c3aed" />
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'secondary.main', fontSize: '0.6875rem' }}>
              Fluxo contínuo sem gargalos
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* 3. Seção Gráfica Inteligente (2 Colunas) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.2fr 1fr' },
          gap: 1.5,
        }}
      >
        <FactoryMonthlyThroughputChart />
        <FactorySystemsDeliveryChart />
      </Box>

      {/* 4. Sprints em Andamento com Prazos de Entrega (Sem Subtasks) */}
      <FactoryActiveSprintsDeadlines sprints={sprints} />
    </Box>
  );
}
