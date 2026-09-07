import { useState } from 'react';
import {
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Tooltip,
  Alert,
  Snackbar,
  LinearProgress,
  CircularProgress,
  Skeleton,
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Checkbox,
  Slider,
  Avatar,
  Badge,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
  ButtonGroup,
  Divider,
} from '@mui/material';
import {
  Plus,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Info,
  Bell,
  Star,
  Layers,
  Clock,
  Shield,
  BookOpenCheck,
  Building2,
  BarChart3,
  UsersRound,
  Download,
} from 'lucide-react';

export function DesignSystemPage() {
  const [tabIndex, setTabIndex] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [switchState, setSwitchState] = useState(true);
  const [checkboxState, setCheckboxState] = useState(true);
  const [selectVal, setSelectVal] = useState('sciex');
  const [sliderVal, setSliderVal] = useState<number>(75);

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, background: 'var(--bg, #f7f9fc)', minHeight: 'calc(100vh - 70px)' }}>
      {/* Action Toolbar */}
      <Box sx={{ mb: 2.5, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1.5 }}>
        <Button
          variant="contained"
          startIcon={<Sparkles size={15} />}
          onClick={() => setSnackbarOpen(true)}
        >
          Testar Notificação Toast
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabIndex} onChange={(_, val) => setTabIndex(val)} aria-label="Design System Tabs">
          <Tab label="Componentes & Ações" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Formulários & Controles" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Data Display & Tabelas" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Feedback & Diálogos" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Tokens & Diretrizes" sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>
      </Box>

      {/* Tab 0: Componentes & Ações */}
      {tabIndex === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Botões */}
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }} elevation={0}>
            <Typography variant="h3" sx={{ mb: 0.5 }}>
              Botões e Ações (MuiButton & ButtonGroup)
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Hierarquia visual clara: Contained (Ação primária), Outlined (Ação secundária), Text (Links e ações discretas).
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
              <Button variant="contained" startIcon={<Plus size={15} />}>
                Nova Sprint
              </Button>
              <Button variant="outlined">Cancelar</Button>
              <Button variant="text" color="primary">
                Ver detalhes
              </Button>
              <Button variant="contained" color="success" startIcon={<CheckCircle size={15} />}>
                Aprovar Tarefa
              </Button>
              <Button variant="contained" color="warning" startIcon={<AlertTriangle size={15} />}>
                Reprovar para Correção
              </Button>
              <Button variant="contained" color="error">
                Remover item
              </Button>
              <Button variant="contained" disabled>
                Salvar (Desabilitado)
              </Button>
              <ButtonGroup variant="outlined" size="small">
                <Button variant="contained">Kanban</Button>
                <Button>Lista</Button>
              </ButtonGroup>
              <IconButton color="primary">
                <Bell size={18} />
              </IconButton>
            </Box>
          </Paper>

          {/* Chips & Badges */}
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }} elevation={0}>
            <Typography variant="h3" sx={{ mb: 0.5 }}>
              Chips & Badges Semânticos (MuiChip)
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Utilizados para estados de tarefas, raias de Kanban, identificadores de sistema e severidade.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Chip label="SCIEX" color="primary" size="small" sx={{ fontWeight: 700 }} />
              <Chip label="CADSUF" color="secondary" size="small" sx={{ fontWeight: 700 }} />
              <Chip label="A Fazer" size="small" sx={{ bgcolor: '#f8fafc', color: '#64748b', fontWeight: 600 }} />
              <Chip label="Em Desenvolvimento" color="primary" size="small" sx={{ fontWeight: 600 }} />
              <Chip label="Em Teste (QA)" color="secondary" size="small" sx={{ fontWeight: 600 }} />
              <Chip label="Em Correção" color="warning" size="small" sx={{ fontWeight: 700 }} />
              <Chip label="Concluída" color="success" size="small" sx={{ fontWeight: 700 }} />
              <Chip icon={<AlertTriangle size={12} />} label="2x Retrabalho" color="error" size="small" sx={{ fontWeight: 700 }} />
              <Chip label="Bloqueada" color="error" variant="outlined" size="small" sx={{ fontWeight: 700 }} />
              <Chip label="Destaque" icon={<Star size={12} />} color="default" size="small" />
            </Box>
          </Paper>

          {/* Cards de Métricas */}
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }} elevation={0}>
            <Typography variant="h3" sx={{ mb: 0.5 }}>
              Cards de Indicadores & KPIs Executivos
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Padrão para dashboards com números em Space Grotesk e rótulos semânticos.
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
              <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }} elevation={0}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Building2 size={14} color="#2563eb" /> PROJETOS ATIVOS
                </Typography>
                <Typography variant="h2" sx={{ mt: 0.5, color: 'text.primary' }}>
                  8
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Sistemas conectados
                </Typography>
              </Paper>

              <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }} elevation={0}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Clock size={14} color="#16a34a" /> ESFORÇO TOTAL
                </Typography>
                <Typography variant="h2" sx={{ mt: 0.5, color: 'success.main' }}>
                  128h
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  96h Dev · 32h QA
                </Typography>
              </Paper>

              <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }} elevation={0}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <AlertTriangle size={14} color="#dc2626" /> IMPEDIMENTOS
                </Typography>
                <Typography variant="h2" sx={{ mt: 0.5, color: 'error.main' }}>
                  3
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Requerem ação do gestor
                </Typography>
              </Paper>

              <Paper sx={{ p: 2.5, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }} elevation={0}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <BarChart3 size={14} color="#7c3aed" /> PREVISÃO DE PF
                </Typography>
                <Typography variant="h2" sx={{ mt: 0.5, color: 'secondary.main' }}>
                  240 PF
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Competência Setembro
                </Typography>
              </Paper>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Tab 1: Formulários & Controles */}
      {tabIndex === 1 && (
        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }} elevation={0}>
          <Typography variant="h3" sx={{ mb: 0.5 }}>
            Campos de Formulário & Controles MUI
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Campos com validação, seletores padronizados, sliders de progresso, switches e checkboxes.
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5, maxWidth: 800 }}>
            <TextField label="Nome da Sprint / OS" placeholder="Ex: OS 15930" fullWidth />
            <TextField
              select
              label="Sistema"
              value={selectVal}
              onChange={(e) => setSelectVal(e.target.value)}
              fullWidth
            >
              <MenuItem value="sciex">SCIEX Exportação</MenuItem>
              <MenuItem value="cadsuf">CADSUF</MenuItem>
              <MenuItem value="simnac">SIMNAC WEB</MenuItem>
              <MenuItem value="sagat">Sagat - Recepção</MenuItem>
            </TextField>
            <TextField label="Pontos de Função (PF)" type="number" defaultValue={35} fullWidth />
            <TextField
              label="Data de Entrega"
              type="date"
              defaultValue="2026-09-30"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />

            {/* Slider de Progresso */}
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' }, px: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Ajuste de Progresso: {sliderVal}%
              </Typography>
              <Slider
                value={sliderVal}
                onChange={(_, val) => setSliderVal(val as number)}
                min={0}
                max={100}
                valueLabelDisplay="auto"
                sx={{ color: 'primary.main', mt: 1 }}
              />
            </Box>

            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <TextField
                label="Objetivo da Sprint"
                multiline
                rows={3}
                placeholder="Descreva a entrega de valor esperada..."
                fullWidth
              />
            </Box>

            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' }, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControlLabel
                control={<Switch checked={switchState} onChange={(e) => setSwitchState(e.target.checked)} />}
                label="Sprint Destaque (Leitura Executiva)"
              />
              <FormControlLabel
                control={<Checkbox checked={checkboxState} onChange={(e) => setCheckboxState(e.target.checked)} />}
                label="Critério de Aceite Atendido (Definition of Done)"
              />
            </Box>
          </Box>
        </Paper>
      )}

      {/* Tab 2: Data Display & Tabelas */}
      {tabIndex === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Tabela MUI com TableContainer */}
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }} elevation={0}>
            <Typography variant="h3" sx={{ mb: 0.5 }}>
              Tabelas Corporativas (MuiTable com Ordenação)
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Estrutura com cabeçalhos ordenáveis, chips semânticos e barras de progresso lineares.
            </Typography>

            <TableContainer sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>
                      <TableSortLabel active direction="asc">Sistema</TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Situação</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Responsável</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">Progresso</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">Horas Dev / QA</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow hover>
                    <TableCell sx={{ fontWeight: 700 }}>SCIEX Exportação</TableCell>
                    <TableCell>
                      <Chip label="Em Desenvolvimento" color="primary" size="small" sx={{ fontWeight: 600 }} />
                    </TableCell>
                    <TableCell>Lucas Almeida (Dev)</TableCell>
                    <TableCell align="center" sx={{ minWidth: 140 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress variant="determinate" value={80} sx={{ flex: 1, height: 6, borderRadius: 3 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>80%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">24h dev · 8h qa</TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell sx={{ fontWeight: 700 }}>CADSUF</TableCell>
                    <TableCell>
                      <Chip label="Em Teste" color="secondary" size="small" sx={{ fontWeight: 600 }} />
                    </TableCell>
                    <TableCell>Marina Santos (QA)</TableCell>
                    <TableCell align="center" sx={{ minWidth: 140 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress variant="determinate" value={100} color="secondary" sx={{ flex: 1, height: 6, borderRadius: 3 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>100%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">16h dev · 6h qa</TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell sx={{ fontWeight: 700 }}>SIMNAC WEB</TableCell>
                    <TableCell>
                      <Chip label="Em Correção" color="warning" size="small" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>Rafael Costa (Dev)</TableCell>
                    <TableCell align="center" sx={{ minWidth: 140 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress variant="determinate" value={45} color="warning" sx={{ flex: 1, height: 6, borderRadius: 3 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>45%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">12h dev · 4h qa</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Avatares & Badges */}
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }} elevation={0}>
            <Typography variant="h3" sx={{ mb: 2 }}>
              Avatares e Badges de Notificação
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              <Badge color="primary" variant="dot">
                <Avatar sx={{ bgcolor: 'primary.main', fontSize: '0.8125rem', fontWeight: 700 }}>CP</Avatar>
              </Badge>
              <Badge badgeContent={4} color="error">
                <Avatar sx={{ bgcolor: 'secondary.main', fontSize: '0.8125rem', fontWeight: 700 }}>LA</Avatar>
              </Badge>
              <Avatar sx={{ bgcolor: '#16a34a', fontSize: '0.8125rem', fontWeight: 700 }}>MS</Avatar>
              <Avatar sx={{ bgcolor: '#d97706', fontSize: '0.8125rem', fontWeight: 700 }}>RC</Avatar>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Tab 3: Feedback & Diálogos */}
      {tabIndex === 3 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Alertas */}
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }} elevation={0}>
            <Typography variant="h3" sx={{ mb: 0.5 }}>
              Alertas e Notificações (MuiAlert)
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Mensagens semânticas contextuais para sucesso, avisos de qualidade, erros críticos e informações.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Alert severity="success">Sprint homologada e aprovada para faturamento com sucesso.</Alert>
              <Alert severity="warning">Esta tarefa foi reprovada pelo QA e retornou para a raia Em Correção (Retrabalho).</Alert>
              <Alert severity="error">Impedimento crítico: bloqueio de infraestrutura aguardando liberação do cliente.</Alert>
              <Alert severity="info">A competência de Setembro possui 14 OSs programadas no valor total de 420 PF.</Alert>
            </Box>
          </Paper>

          {/* Skeletons */}
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }} elevation={0}>
            <Typography variant="h3" sx={{ mb: 0.5 }}>
              Skeletons de Carregamento Assíncrono (MuiSkeleton)
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Exibidos automaticamente durante lazy loading de rotas e carregamento de dados.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxWidth: 500 }}>
              <Skeleton variant="text" width="60%" height={30} />
              <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
              <Skeleton variant="rounded" width="40%" height={24} />
            </Box>
          </Paper>

          {/* Diálogo */}
          <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }} elevation={0}>
            <Typography variant="h3" sx={{ mb: 0.5 }}>
              Modais e Diálogos de Confirmação (MuiDialog)
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Diálogos com cantos arredondados (14px), fundo com backdrop blur e ações padronizadas.
            </Typography>
            <Button variant="contained" onClick={() => setOpenModal(true)}>
              Abrir Exemplo de Diálogo
            </Button>
          </Paper>
        </Box>
      )}

      {/* Tab 4: Tokens & Diretrizes de Engenharia */}
      {tabIndex === 4 && (
        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }} elevation={0}>
          <Typography variant="h3" sx={{ mb: 0.5 }}>
            Diretrizes de Governança & Padrão Material UI
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Normas arquiteturais obrigatórias para o frontend do Painel Gover Tech.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info" icon={<Shield size={18} />}>
              <strong>Regra Oficial:</strong> Todo componente novo ou refatoração no sistema deve utilizar exclusivamente o <strong>Material UI (MUI v6)</strong> integrado ao tema <code>executiveTheme.ts</code>. Não criar inputs ou botões HTML puros despadronizados.
            </Alert>

            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }} elevation={0}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                🎨 PALETA DE CORES EXECUTIVA
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
                <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: '#2563eb', color: '#ffffff' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>Primary (#2563EB)</Typography>
                  <Typography variant="caption">Botões principais, links e foco</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: '#7c3aed', color: '#ffffff' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>Secondary (#7C3AED)</Typography>
                  <Typography variant="caption">QA / Testes e Homologação</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: '#16a34a', color: '#ffffff' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>Success (#16A34A)</Typography>
                  <Typography variant="caption">Faturado, Concluído e Aceite</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: '#d97706', color: '#ffffff' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>Warning (#D97706)</Typography>
                  <Typography variant="caption">Retrabalho e Em Correção</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: '#dc2626', color: '#ffffff' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>Error (#DC2626)</Typography>
                  <Typography variant="caption">Impedimentos e Bloqueios</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: '#102a43', color: '#ffffff' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>Text Primary (#102A43)</Typography>
                  <Typography variant="caption">Títulos e contrastes fortes</Typography>
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }} elevation={0}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                ✍️ TIPOGRAFIA EXECUTIVA
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                • <strong>Space Grotesk:</strong> Aplicada em cabeçalhos (<code>h1</code>, <code>h2</code>, <code>h3</code>, <code>h4</code>) e números de KPIs executivos.<br />
                • <strong>DM Sans:</strong> Aplicada em textos corporativos, parágrafos, tabelas, inputs e labels para legibilidade técnica.
              </Typography>
            </Paper>
          </Box>
        </Paper>
      )}

      {/* Exemplo de Modal MUI */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth>
        <Box sx={{ p: 3 }}>
          <DialogTitle sx={{ p: 0, mb: 1, fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700 }}>
            Confirmação de Ação
          </DialogTitle>
          <DialogContent sx={{ p: 0, mb: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Tem certeza que deseja mover esta Sprint para a situação Homologado? Os analistas receberão uma notificação automática.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 0, gap: 1 }}>
            <Button variant="outlined" onClick={() => setOpenModal(false)}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={() => setOpenModal(false)}>
              Confirmar
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Exemplo de Snackbar Toast */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          Notificação disparada no padrão Material UI com sucesso!
        </Alert>
      </Snackbar>
    </Box>
  );
}
