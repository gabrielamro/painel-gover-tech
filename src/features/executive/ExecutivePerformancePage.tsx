import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  Shield,
  FileText,
  Calendar,
  DollarSign,
  Package,
  Wrench,
} from 'lucide-react';
import { useSprints } from '../../app/providers/SprintProvider';
import { contractRepository } from '../../repositories/local-storage/LocalStorageContractRepository';
import { PfMonthlyRepository } from '../../repositories/local-storage/PfMonthlyRepository';
import { contractWithCalculatedRealized } from '../../domain/contract/analytics';
import { DEFAULT_CONTRACTS } from '../../domain/contract/model';
import { ExecutiveBurnupChart } from './components/ExecutiveBurnupChart';
import {
  ExecutiveSystemsComparisonChart,
  LATEST_BILLED_MONTH,
  formatMonthLabel,
} from './components/ExecutiveSystemsComparisonChart';
import { ExecutiveVisualPipeline } from './components/ExecutiveVisualPipeline';
import { SprintDetailsModal } from '../sprints/components/SprintDetailsModal';
import { KpiCard } from './components/KpiCard';
import { KpiBadge } from './components/KpiBadge';
import { SemiGauge } from './components/SemiGauge';
import { MiniLineChart } from './components/MiniLineChart';
import { MiniBarChart } from './components/MiniBarChart';
import { DonutChart } from './components/DonutChart';
import { StatusOperacionalCard } from './components/StatusOperacionalCard';
import { kpiColors } from './components/kpi-tokens';

export function ExecutivePerformancePage() {
  const {
    sprints,
    updateSprint,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
    auditLogs,
  } = useSprints();
  const contracts = useMemo(() => contractRepository.list(), []);
  const contractPfRecords = useMemo(() => new PfMonthlyRepository().list(), []);
  const [selectedSprintCode, setSelectedSprintCode] = useState<string | null>(null);

  const storedDevContract = contracts.find((c) => c.type === 'DESENVOLVIMENTO')
    || DEFAULT_CONTRACTS.find((c) => c.type === 'DESENVOLVIMENTO')!;

  const storedSustContract = contracts.find((c) => c.type === 'SUSTENTACAO')
    || DEFAULT_CONTRACTS.find((c) => c.type === 'SUSTENTACAO')!;

  const devContract = contractWithCalculatedRealized(storedDevContract, contractPfRecords);
  const sustContract = contractWithCalculatedRealized(storedSustContract, contractPfRecords);

  const devRemaining = Math.max(0, devContract.totalPf - devContract.realizedPf);
  const devPercent = Math.min(100, Math.round((devContract.realizedPf / devContract.totalPf) * 100));

  const sustRemaining = Math.max(0, sustContract.totalPf - sustContract.realizedPf);
  const sustPercent = Math.min(100, Math.round((sustContract.realizedPf / sustContract.totalPf) * 100));
  const combinedTotal = devContract.totalPf + sustContract.totalPf;
  const combinedRealized = devContract.realizedPf + sustContract.realizedPf;
  const combinedRemaining = Math.max(0, combinedTotal - combinedRealized);
  const combinedPercent = combinedTotal
    ? Math.min(100, Math.round((combinedRealized / combinedTotal) * 100))
    : 0;

  const latestDeliveryMonth = formatMonthLabel(LATEST_BILLED_MONTH, 'long');

  const { latestDeliveredPf, latestImprovementsCount, latestGrowthPercent } = useMemo(() => {
    try {
      const records = contractPfRecords;
      const latestRecords = records.filter(
        (record) => record.month === LATEST_BILLED_MONTH && (record.detailedPf || 0) > 0
      );
      const previousMonth = '2026-06';
      const previousRecords = records.filter(
        (record) => record.month === previousMonth && (record.detailedPf || 0) > 0
      );
      const latestSum = latestRecords.reduce((acc, record) => acc + (record.detailedPf || 0), 0);
      const previousSum = previousRecords.reduce((acc, record) => acc + (record.detailedPf || 0), 0);
      const growth = previousSum > 0 ? Math.round(((latestSum - previousSum) / previousSum) * 100) : 0;

      return {
        latestDeliveredPf: latestSum,
        latestImprovementsCount: latestRecords.length,
        latestGrowthPercent: growth,
      };
    } catch {
      return { latestDeliveredPf: 0, latestImprovementsCount: 0, latestGrowthPercent: 0 };
    }
  }, [contractPfRecords]);

  const selectedSprint = selectedSprintCode
    ? sprints.find((s) => s.code === selectedSprintCode) || null
    : null;

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
      {/* 1. Linha Principal de Indicadores — 5 Cards Modernos SLIM (Recharts + Material UI) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))',
            lg: 'repeat(5, minmax(0, 1fr))',
          },
          gap: 1.5,
        }}
      >
        {/* Card 1: Contratos Consolidados com Recharts SemiGauge */}
        <KpiCard
          icon={<FileText size={14} />}
          title="CONTRATO CONSOLIDADO"
          sx={{ order: 3 }}
          badge={
            <KpiBadge bg={kpiColors.blueLight} color={kpiColors.blue}>
              {combinedPercent}%
            </KpiBadge>
          }
        >
          <Box sx={{ mt: 0.5, mb: 0.5 }}>
            <Typography
              sx={{
                fontSize: '26px',
                fontWeight: 700,
                color: kpiColors.blue,
                lineHeight: 1.1,
              }}
            >
              {combinedRealized} PF
            </Typography>
            <Typography
              variant="caption"
              sx={{ display: 'block', mt: 0.35, color: kpiColors.slate, fontSize: '10.5px', fontWeight: 600 }}
            >
              Desenvolvimento + Sustentação
            </Typography>
          </Box>
          <SemiGauge
            percent={combinedPercent}
            remainingPf={combinedRemaining}
            totalPf={combinedTotal}
          />
        </KpiCard>

        {/* Card 2: Faturamento Acumulado com Sparkline Recharts */}
        <KpiCard
          icon={<DollarSign size={14} />}
          title="PROJETO DESENVOLVIMENTO"
          sx={{ order: 1 }}
          badge={
            <KpiBadge bg="#DCFCE7" color="#16A34A">
              {devPercent}% ↑
            </KpiBadge>
          }
        >
          <Box sx={{ mt: 0.5 }}>
            <Typography
              sx={{
                fontSize: '26px',
                fontWeight: 700,
                color: kpiColors.blue,
                lineHeight: 1.1,
              }}
            >
              {devContract.realizedPf} PF
            </Typography>
          </Box>

          <Box sx={{ my: 0.8 }}>
            <LinearProgress
              variant="determinate"
              value={devPercent}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: '#F1F5F9',
                '& .MuiLinearProgress-bar': {
                  bgcolor: kpiColors.blue,
                  borderRadius: 3,
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontSize: '11px',
                color: kpiColors.slate,
                display: 'block',
                mt: 0.6,
              }}
            >
              Faltam <strong>{devRemaining} PF</strong> de {devContract.totalPf} PF
            </Typography>
          </Box>

          <MiniLineChart color={kpiColors.blue} />
        </KpiCard>

        {/* Card 3: Entregas Último Mês com Recharts Mini BarChart */}
        <KpiCard
          icon={<Package size={14} />}
          iconBg="#F0FDF4"
          iconColor="#16A34A"
          title="ENTREGAS ÚLTIMO MÊS"
          sx={{ order: 4 }}
          badge={
            <KpiBadge bg="#DCFCE7" color="#16A34A">
              +{latestGrowthPercent}% ↗
            </KpiBadge>
          }
        >
          <Box sx={{ mt: 0.5 }}>
            <Typography
              sx={{
                fontSize: '26px',
                fontWeight: 700,
                color: kpiColors.green,
                lineHeight: 1.1,
              }}
            >
              +{latestDeliveredPf.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} PF
            </Typography>
          </Box>

          <Box sx={{ my: 0.5 }}>
            <MiniBarChart color={kpiColors.greenBright} />
          </Box>

          <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 0.2 }}>
            <Typography
              variant="caption"
              sx={{
                fontSize: '11px',
                color: kpiColors.slate,
                display: 'block',
              }}
            >
              {latestImprovementsCount} melhorias homologadas
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: '11px',
                color: kpiColors.slate,
                display: 'block',
              }}
            >
              Última entrega: {latestDeliveryMonth}
            </Typography>
          </Box>
        </KpiCard>

        {/* Card 4: Melhorias em Andamento com Recharts Donut */}
        <KpiCard
          icon={<Wrench size={14} />}
          iconBg="#FFFBEB"
          iconColor="#F59E0B"
          title="MELHORIAS EM ANDAMENTO"
          sx={{ order: 5 }}
        >
          <Box sx={{ mt: 0.5, mb: 0.5 }}>
            <Typography
              sx={{
                fontSize: '26px',
                fontWeight: 700,
                color: kpiColors.slateDark,
                lineHeight: 1.1,
              }}
            >
              18 OSs
            </Typography>
          </Box>

          <DonutChart
            items={[
              { label: 'Execução', value: 10, color: kpiColors.blue },
              { label: 'Validação', value: 5, color: kpiColors.orange },
              { label: 'Backlog', value: 3, color: '#CBD5E1' },
            ]}
          />
        </KpiCard>

        {/* Card 5: Projeto Sustentação com Sparkline Recharts */}
        <KpiCard
          icon={<Shield size={14} />}
          iconBg="#FAF5FF"
          iconColor="#8B5CF6"
          title="PROJETO SUSTENTAÇÃO"
          sx={{ order: 2 }}
          badge={
            <KpiBadge bg="#F3E8FF" color="#8B5CF6">
              {sustPercent}%
            </KpiBadge>
          }
        >
          <Box sx={{ mt: 0.5 }}>
            <Typography
              sx={{
                fontSize: '26px',
                fontWeight: 700,
                color: '#7C3AED',
                lineHeight: 1.1,
              }}
            >
              {sustContract.realizedPf} PF
            </Typography>
          </Box>

          <Box sx={{ my: 0.8 }}>
            <LinearProgress
              variant="determinate"
              value={sustPercent}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: '#F1F5F9',
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#8B5CF6',
                  borderRadius: 3,
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontSize: '11px',
                color: kpiColors.slate,
                display: 'block',
                mt: 0.6,
              }}
            >
              Consumido de {sustContract.totalPf} PF
            </Typography>
          </Box>

          <MiniLineChart color="#8B5CF6" />

          <Typography
            variant="caption"
            sx={{
              fontSize: '11px',
              color: kpiColors.slate,
              display: 'block',
              mt: 'auto',
            }}
          >
            Saldo {sustRemaining} PF
          </Typography>
        </KpiCard>
      </Box>

      {/* 2. Seção Gráfica e Operacional (2 Colunas: Status Operacional + Distribuição por Sistema) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1.15fr' },
          gap: 1.5,
        }}
      >
        <StatusOperacionalCard sprints={sprints} />
        <ExecutiveSystemsComparisonChart sprints={sprints} />
      </Box>

      {/* 3. Pipeline Dinâmico de Produção (Cards Otimizados de Alta Densidade) */}
      <ExecutiveVisualPipeline
        sprints={sprints}
        onSelectSprint={(code) => setSelectedSprintCode(code)}
      />

      {/* 4. Detalhamento dos Contratos — Contrato 1 e Contrato 2 no Fim da Página */}
      <Paper
        elevation={0}
        sx={{
          p: 1.8,
          borderRadius: 2,
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Calendar size={15} color="#64748b" />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem' }}>
              Vigência Contratual: <strong>{devContract.startMonth} a {devContract.endMonth} ({devContract.yearPeriod}º Ano)</strong>
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            href="#/cadastros"
            sx={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'none', py: 0.3, px: 1, borderRadius: 1.5 }}
          >
            Gerenciar Contratos no Cadastro
          </Button>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 1.5,
          }}
        >
          {/* Card Contrato 1: Desenvolvimento */}
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              border: '1px solid #e2e8f0',
              bgcolor: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.8,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <FileText size={15} color="#2563eb" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.8125rem' }}>
                  Contrato 1 (Dev & Melhorias)
                </Typography>
              </Box>
              <Chip
                label={`${devPercent}% Consumido`}
                size="small"
                sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 700, height: 20, fontSize: '0.625rem' }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                Realizado: <strong>{devContract.realizedPf} PF</strong> de <strong>{devContract.totalPf} PF</strong>
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                Faltam <strong>{devRemaining} PF</strong>
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={devPercent}
              sx={{ height: 5, borderRadius: 2.5, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: '#2563eb' } }}
            />
          </Paper>

          {/* Card Contrato 2: Sustentação */}
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              border: '1px solid #e2e8f0',
              bgcolor: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.8,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Shield size={15} color="#7c3aed" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.8125rem' }}>
                  Contrato 2 (Sustentação)
                </Typography>
              </Box>
              <Chip
                label={`${sustPercent}% Consumido`}
                size="small"
                sx={{ bgcolor: '#faf5ff', color: '#6d28d9', fontWeight: 700, height: 20, fontSize: '0.625rem' }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                Realizado: <strong>{sustContract.realizedPf} PF</strong> de <strong>{sustContract.totalPf} PF</strong>
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                Faltam <strong>{sustRemaining} PF</strong>
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={sustPercent}
              sx={{ height: 5, borderRadius: 2.5, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: '#7c3aed' } }}
            />
          </Paper>
        </Box>
      </Paper>

      {/* Modal de Detalhes da Sprint quando um card for clicado */}
      {selectedSprint && (
        <SprintDetailsModal
          sprint={selectedSprint}
          onClose={() => setSelectedSprintCode(null)}
          onUpdate={(changes) => updateSprint(selectedSprint.code, changes)}
          onCreateTask={createTask}
          onUpdateTask={updateTask}
          onMoveTask={moveTask}
          onDeleteTask={deleteTask}
          auditLogs={auditLogs(selectedSprint.code)}
        />
      )}
    </Box>
  );
}
