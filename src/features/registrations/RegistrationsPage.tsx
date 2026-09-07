import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  FormControlLabel,
  Switch,
  Tooltip,
} from '@mui/material';
import { Pencil, Plus, Trash2, X, Save, UserCheck, Shield } from 'lucide-react';
import { useSprints } from '../../app/providers/SprintProvider';
import { sprintSystem } from '../../domain/sprint/queries';
import { LocalStorageRegistrationRepository } from '../../repositories/local-storage/LocalStorageRegistrationRepository';
import { migrateRegistrations } from '../../services/migration/registrationMigration';
import { PfMonthlyRepository } from '../../repositories/local-storage/PfMonthlyRepository';
import { contractWithCalculatedRealized } from '../../domain/contract/analytics';
import {
  applyStandardSystemColors,
  defaultSystemColor,
  syncSystemColorCache,
} from '../../domain/project/colors';

import { contractRepository } from '../../repositories/local-storage/LocalStorageContractRepository';
import type { ProjectContract } from '../../domain/contract/model';

export type RegistryType =
  | 'Equipe (Devs / QAs)'
  | 'Contratos do Projeto'
  | 'Sistemas / Projetos'
  | 'Gerentes de Projetos'
  | 'POs'
  | 'Analistas CGTIC'
  | 'Analistas de Negócio'
  | 'Prioridades'
  | 'Etiquetas';

export type RegistryItem = {
  id: string;
  name: string;
  role?: string;
  color?: string;
  manager?: string;
  po?: string;
  active?: boolean;
  modules?: RegistryItem[];
  moduleId?: string;
  moduleName?: string;
  projectId?: string;
  // Campos para Contrato
  code?: string;
  contractType?: 'DESENVOLVIMENTO' | 'SUSTENTACAO';
  totalPf?: number;
  realizedPf?: number;
  startMonth?: string;
  endMonth?: string;
  yearPeriod?: number;
  status?: 'VIGENTE' | 'RENOVADO' | 'ENCERRADO';
};

const types: RegistryType[] = [
  'Equipe (Devs / QAs)',
  'Contratos do Projeto',
  'Sistemas / Projetos',
  'Gerentes de Projetos',
  'POs',
  'Analistas CGTIC',
  'Analistas de Negócio',
  'Prioridades',
  'Etiquetas',
];

const STANDARD_ROLES = [
  'Desenvolvedor Frontend',
  'Desenvolvedor Backend',
  'Desenvolvedor Fullstack',
  'QA / Analista de Testes',
  'Tech Lead',
  'DevOps / SRE',
  'UX / UI Designer',
  'Outro',
];

const registrationRepository = new LocalStorageRegistrationRepository();

const moduleRules: Array<[string, string]> = [
  ['SCIEX IMPORTAÇÃO', 'SCIEX|Importação'],
  ['SCIEX EXPORTAÇÃO', 'SCIEX|Exportação'],
  ['SCIEX PORTAL ÚNICO', 'SCIEX|Portal Único'],
  ['SAGAT ANÁLISE', 'SAGAT|Análise'],
  ['SAGAT RECEPÇÃO', 'SAGAT|Recepção'],
  ['SIMNAC (MOBILE)', 'SIMNAC|Mobile'],
  ['SIMNAC (WEB)', 'SIMNAC|Web'],
  ['SIMNAC MOBILE', 'SIMNAC|Mobile'],
  ['SIMNAC WEB', 'SIMNAC|Web'],
  ['SIMNAC APP', 'SIMNAC|Mobile'],
  ['SPR-MEAAP', 'SPR|MEAAP'],
  ['SPR-MCPP', 'SPR|MCPP'],
  ['SPR-MPPB', 'SPR|MPPB'],
  ['SPR-MAPI', 'SPR|MAPI'],
  ['SPR-MCI', 'SPR|MCI'],
];

const catalogProjects: Array<{ project: string; modules?: string[] }> = [
  { project: 'SCIEX', modules: ['Importação', 'Exportação', 'Portal Único'] },
  { project: 'SCME' },
  { project: 'SIMNAC', modules: ['Mobile', 'Web'] },
  { project: 'CADSUF' },
  { project: 'SAC' },
  { project: 'Mobile – APP de Vistoria' },
  { project: 'SAGAT', modules: ['Análise', 'Recepção'] },
  { project: 'Sistema de Projetos' },
  { project: 'SPR', modules: ['MEAAP', 'MAPI', 'MCPP', 'MCI', 'MPPB'] },
  { project: 'Sustentação' },
];

function splitProjectModule(value: string): { project: string; module?: string } {
  const normalized = value.trim().toLocaleUpperCase('pt-BR');
  const rule = moduleRules.find(([source]) => normalized === source);
  if (rule) {
    const [project, module] = rule[1].split('|');
    return { project, module };
  }
  const separator = value.split(/\s+-\s+/);
  return separator.length === 2 ? { project: separator[0].trim(), module: separator[1].trim() } : { project: value.trim() };
}

function load(): Record<RegistryType, RegistryItem[]> {
  const migrated = migrateRegistrations(window.localStorage).state;
  return {
    'Equipe (Devs / QAs)': (migrated.teamMembers || []) as RegistryItem[],
    'Contratos do Projeto': [],
    'Sistemas / Projetos': applyStandardSystemColors((migrated.projects || []) as RegistryItem[]),
    'Gerentes de Projetos': (migrated.managers || []) as RegistryItem[],
    POs: (migrated.pos || []) as RegistryItem[],
    'Analistas CGTIC': (migrated.cgticAnalysts || []) as RegistryItem[],
    'Analistas de Negócio': (migrated.businessAnalysts || []) as RegistryItem[],
    Prioridades: (migrated.priorities || []) as RegistryItem[],
    Etiquetas: (migrated.labels || []) as RegistryItem[],
  };
}

export function RegistrationsPage() {
  const { sprints } = useSprints();
  const [active, setActive] = useState<RegistryType>('Equipe (Devs / QAs)');
  const [data, setData] = useState<Record<RegistryType, RegistryItem[]>>(() => load());
  const [contracts, setContracts] = useState<ProjectContract[]>(() => contractRepository.list());
  const [form, setForm] = useState<RegistryItem | null>(null);
  const macroRecords = useMemo(() => new PfMonthlyRepository().list(), []);

  const derived = useMemo<Record<RegistryType, RegistryItem[]>>(
    () => {
      const projects = new Map<string, RegistryItem>();
      catalogProjects.forEach(({ project, modules }) => {
        const id = `project-${project.toLocaleLowerCase('pt-BR')}`;
        projects.set(project.toLocaleLowerCase('pt-BR'), {
          id,
          name: project,
          color: defaultSystemColor(project),
          modules: (modules || []).map((name) => ({ id: `module-${id}-${name}`, name, projectId: id, active: true })),
        });
      });
      sprints.forEach((sprint) => {
        const { project, module } = splitProjectModule(sprintSystem(sprint));
        const key = project.toLocaleLowerCase('pt-BR');
        const current = projects.get(key) || { id: `project-${key}`, name: project, color: defaultSystemColor(project), modules: [] };
        if (module && !current.modules?.some((item) => item.name.toLocaleLowerCase('pt-BR') === module.toLocaleLowerCase('pt-BR'))) {
          current.modules = [...(current.modules || []), { id: `module-${key}-${module}`, name: module, projectId: current.id, active: true }];
        }
        projects.set(key, current);
      });
      return {
      'Equipe (Devs / QAs)': [],
      'Contratos do Projeto': [],
      'Sistemas / Projetos': [...projects.values()],
      'Gerentes de Projetos': [
        ...new Set(sprints.map((s) => s.projectManager || s.manager).filter((name): name is string => Boolean(name)).concat(macroRecords.map((record) => record.manager).filter((name): name is string => Boolean(name)))),
      ].map((name) => ({ id: name, name })),
      POs: [...new Set(sprints.map((s) => s.po).filter(Boolean) as string[])].map((name) => ({ id: name, name })),
      'Analistas CGTIC': [
        ...new Set(sprints.map((s) => s.technicalLead).filter((name): name is string => Boolean(name)).concat(macroRecords.map((record) => record.cgticAnalyst).filter((name): name is string => Boolean(name)))),
      ].map((name) => ({ id: name, name })),
      'Analistas de Negócio': [
        ...new Set(sprints.map((s) => s.businessAnalyst).filter(Boolean) as string[]),
      ].map((name) => ({ id: name, name })),
      Prioridades: ['Baixa', 'Média', 'Alta', 'Crítica'].map((name) => ({ id: name, name })),
      Etiquetas: [...new Set(sprints.flatMap((s) => s.labels || []))].map((name) => ({ id: name, name })),
      };
    },
    [sprints, macroRecords]
  );

  const contractItems = useMemo<RegistryItem[]>(() => {
    return contracts.map((storedContract) => {
      const c = contractWithCalculatedRealized(storedContract, macroRecords);
      return ({
      id: c.id,
      name: c.name,
      code: c.code,
      contractType: c.type,
      totalPf: c.totalPf,
      realizedPf: c.realizedPf,
      startMonth: c.startMonth,
      endMonth: c.endMonth,
      yearPeriod: c.yearPeriod,
      status: c.status,
      active: c.status === 'VIGENTE',
      });
    });
  }, [contracts, macroRecords]);

  const projectItems = useMemo(() => {
    const byName = new Map<string, RegistryItem>();
    [...derived['Sistemas / Projetos'], ...data['Sistemas / Projetos']].forEach((item) => {
      const normalized = splitProjectModule(item.name);
      const normalizedModule = normalized.module ? { id: `module-${normalized.project}-${normalized.module}`, name: normalized.module, projectId: item.id, active: true } : undefined;
      const normalizedItem = normalized.project !== item.name || normalizedModule
        ? { ...item, name: normalized.project, modules: [...(item.modules || []), ...(normalizedModule ? [normalizedModule] : [])] }
        : item;
      const key = normalizedItem.name.trim().toLocaleLowerCase('pt-BR');
      const current = byName.get(key);
      if (!current) {
        byName.set(key, { ...normalizedItem, modules: [...(normalizedItem.modules || [])] });
        return;
      }
      const modules = [...(current.modules || [])];
      (normalizedItem.modules || []).forEach((module) => {
        if (!modules.some((candidate) => candidate.name.toLocaleLowerCase('pt-BR') === module.name.toLocaleLowerCase('pt-BR'))) modules.push(module);
      });
      byName.set(key, { ...current, ...normalizedItem, modules });
    });
    return [...byName.values()];
  }, [data, derived]);

  const items =
    active === 'Contratos do Projeto'
      ? contractItems
      : active === 'Sistemas / Projetos'
      ? projectItems
      : data[active]?.length
      ? data[active]
      : derived[active];

  useEffect(() => {
    const derivedProjects = derived['Sistemas / Projetos'];
    const currentProjects = data['Sistemas / Projetos'];
    const enrichedProjects = [...currentProjects];
    derivedProjects.forEach((derivedProject) => {
      const index = enrichedProjects.findIndex((project) => project.name.toLocaleLowerCase('pt-BR') === derivedProject.name.toLocaleLowerCase('pt-BR'));
      if (index < 0) enrichedProjects.push(derivedProject);
      else if (derivedProject.modules?.length && !enrichedProjects[index].modules?.length) enrichedProjects[index] = { ...enrichedProjects[index], modules: derivedProject.modules };
    });
    if (JSON.stringify(enrichedProjects) !== JSON.stringify(currentProjects)) {
      setData((current) => ({ ...current, 'Sistemas / Projetos': enrichedProjects }));
    }
  }, [data, derived]);

  useEffect(() => {
    const projects = applyStandardSystemColors(data['Sistemas / Projetos']);
    registrationRepository.replaceAll({
      projects,
      modules: projects.flatMap((project) => (project.modules || []).map((module) => ({ ...module, projectId: project.id }))),
      managers: data['Gerentes de Projetos'],
      pos: data.POs,
      cgticAnalysts: data['Analistas CGTIC'],
      businessAnalysts: data['Analistas de Negócio'],
      priorities: data.Prioridades,
      labels: data.Etiquetas,
      teamMembers: data['Equipe (Devs / QAs)'],
    });
    syncSystemColorCache(projects);
  }, [data]);

  const save = () => {
    if (!form?.name.trim()) return;
    if (active === 'Contratos do Projeto') {
      const contract: ProjectContract = {
        id: form.id || `contract-${Date.now()}`,
        code: form.code || `CONT-${Date.now()}`,
        name: form.name.trim(),
        type: form.contractType || 'DESENVOLVIMENTO',
        totalPf: Number(form.totalPf) || 8000,
        realizedPf: Number(form.realizedPf) || 0,
        startMonth: form.startMonth || 'Outubro',
        endMonth: form.endMonth || 'Setembro',
        yearPeriod: Number(form.yearPeriod) || 2,
        startDate: '2024-10-01',
        endDate: '2026-09-30',
        status: form.status || 'VIGENTE',
      };
      contractRepository.save(contract);
      setContracts(contractRepository.list());
      setForm(null);
      return;
    }
    if (active === 'Sistemas / Projetos') {
      setData((current) => {
        const projectId = form.id || `project-${Date.now()}`;
        const existing = (current[active] || []).find((item) => item.id === projectId);
        const modules = [...(existing?.modules || [])];
        if (form.moduleName?.trim()) {
          const moduleId = form.moduleId || `module-${Date.now()}`;
          const nextModule = { id: moduleId, name: form.moduleName.trim(), projectId, active: true };
          const index = modules.findIndex((item) => item.id === moduleId);
          if (index >= 0) modules[index] = nextModule;
          else modules.push(nextModule);
        }
        const [project] = applyStandardSystemColors([{
          ...existing,
          ...form,
          id: projectId,
          color: form.color || existing?.color || defaultSystemColor(form.name),
          moduleId: undefined,
          moduleName: undefined,
          modules,
          active: form.active !== false,
        }]);
        return { ...current, [active]: [...(current[active] || []).filter((item) => item.id !== projectId), project] };
      });
      setForm(null);
      return;
    }
    setData((current) => ({
      ...current,
      [active]: [
        ...(current[active] || []).filter((item) => item.id !== form.id),
        {
          ...form,
          id: form.id || `${active.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
          active: form.active !== false,
          role: active === 'Equipe (Devs / QAs)' ? (form.role || 'Desenvolvedor Fullstack') : undefined,
        },
      ],
    }));
    setForm(null);
  };

  const remove = (id: string) => {
    if (active === 'Contratos do Projeto') {
      contractRepository.remove(id);
      setContracts(contractRepository.list());
      return;
    }
    setData((current) => ({
      ...current,
      [active]: (current[active] || []).filter((item) => item.id !== id),
    }));
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, background: 'var(--bg, #f7f9fc)', minHeight: 'calc(100vh - 70px)' }}>
      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: '1px solid #e2e8f0' }} elevation={0}>
        {/* Action Header */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<Plus size={15} />}
            onClick={() => {
              if (active === 'Contratos do Projeto') {
                setForm({
                  id: '',
                  name: '',
                  code: `CONT-${Date.now().toString().slice(-4)}`,
                  contractType: 'DESENVOLVIMENTO',
                  totalPf: 8000,
                  realizedPf: 0,
                  startMonth: 'Outubro',
                  endMonth: 'Setembro',
                  yearPeriod: 2,
                  status: 'VIGENTE',
                });
                return;
              }
              setForm({
                id: '',
                name: '',
                role: active === 'Equipe (Devs / QAs)' ? 'Desenvolvedor Frontend' : undefined,
                color: active === 'Sistemas / Projetos' ? undefined : '#2563eb',
                moduleName: active === 'Sistemas / Projetos' ? '' : undefined,
                active: true,
              });
            }}
          >
            Novo Cadastro
          </Button>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={active}
            onChange={(_, val) => {
              setActive(val);
              setForm(null);
            }}
            variant="scrollable"
            scrollButtons="auto"
          >
            {types.map((type) => (
              <Tab
                key={type}
                label={type}
                value={type}
                sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Table */}
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <Table aria-label="Tabela de cadastros">
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.6875rem', color: 'text.secondary', textTransform: 'uppercase' }}>
                  Nome
                </TableCell>
                {active === 'Contratos do Projeto' && (
                  <>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.6875rem', color: 'text.secondary', textTransform: 'uppercase' }}>
                      Código
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.6875rem', color: 'text.secondary', textTransform: 'uppercase' }}>
                      Modalidade / Tipo
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.6875rem', color: 'text.secondary', textTransform: 'uppercase' }}>
                      Teto de PF
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.6875rem', color: 'text.secondary', textTransform: 'uppercase' }}>
                      Realizado / Saldo
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.6875rem', color: 'text.secondary', textTransform: 'uppercase' }}>
                      Vigência
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.6875rem', color: 'text.secondary', textTransform: 'uppercase' }}>
                      Status
                    </TableCell>
                  </>
                )}
                {active === 'Equipe (Devs / QAs)' && (
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.6875rem', color: 'text.secondary', textTransform: 'uppercase' }}>
                    Cargo / Papel
                  </TableCell>
                )}
                {active === 'Equipe (Devs / QAs)' && (
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.6875rem', color: 'text.secondary', textTransform: 'uppercase' }}>
                    Status
                  </TableCell>
                )}
                {active === 'Sistemas / Projetos' && (
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.6875rem', color: 'text.secondary', textTransform: 'uppercase' }}>
                    PO Vinculado
                  </TableCell>
                )}
                {active === 'Sistemas / Projetos' && (
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.6875rem', color: 'text.secondary', textTransform: 'uppercase' }}>
                    Módulos
                  </TableCell>
                )}
                {active === 'POs' && (
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.6875rem', color: 'text.secondary', textTransform: 'uppercase' }}>
                    Gerente Vinculado
                  </TableCell>
                )}
                {(active === 'Sistemas / Projetos' || active === 'Etiquetas') && (
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.6875rem', color: 'text.secondary', textTransform: 'uppercase' }}>
                    Cor do Sistema
                  </TableCell>
                )}
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.6875rem', color: 'text.secondary', textTransform: 'uppercase' }}>
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {items.length > 0 ? (
                items.map((item) => {
                  const isQA = item.role?.includes('QA');
                  const isLead = item.role?.includes('Lead');

                  return (
                    <TableRow key={item.id} hover>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {item.name}
                      </TableCell>

                      {active === 'Contratos do Projeto' && (
                        <>
                          <TableCell>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                              {item.code}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={item.contractType === 'DESENVOLVIMENTO' ? 'Desenvolvimento & Melhorias' : 'Sustentação & Suporte'}
                              size="small"
                              sx={{
                                fontSize: '0.6875rem',
                                fontWeight: 700,
                                bgcolor: item.contractType === 'DESENVOLVIMENTO' ? '#eff6ff' : '#faf5ff',
                                color: item.contractType === 'DESENVOLVIMENTO' ? '#1d4ed8' : '#6d28d9',
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {item.totalPf} PF
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                {item.realizedPf} PF entregues
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6875rem' }}>
                                Faltam {(item.totalPf || 0) - (item.realizedPf || 0)} PF
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              {item.startMonth} a {item.endMonth} ({item.yearPeriod}º Ano)
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={item.status || 'VIGENTE'}
                              size="small"
                              color={item.status === 'VIGENTE' ? 'success' : 'default'}
                              sx={{ fontSize: '0.6875rem', fontWeight: 700 }}
                            />
                          </TableCell>
                        </>
                      )}

                      {active === 'Equipe (Devs / QAs)' && (
                        <TableCell>
                          <Chip
                            label={item.role || 'Desenvolvedor'}
                            size="small"
                            sx={{
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              bgcolor: isQA ? '#fdf2f8' : isLead ? '#eff6ff' : '#f0fdf4',
                              color: isQA ? '#be185d' : isLead ? '#1d4ed8' : '#15803d',
                            }}
                          />
                        </TableCell>
                      )}

                      {active === 'Equipe (Devs / QAs)' && (
                        <TableCell>
                          <Chip
                            label={item.active !== false ? 'Ativo' : 'Inativo'}
                            size="small"
                            color={item.active !== false ? 'success' : 'default'}
                            variant="outlined"
                            sx={{ fontSize: '0.6875rem', fontWeight: 600 }}
                          />
                        </TableCell>
                      )}

                      {active === 'Sistemas / Projetos' && (
                        <TableCell sx={{ color: 'text.secondary' }}>
                          {item.po || 'Não informado'}
                        </TableCell>
                      )}

                      {active === 'Sistemas / Projetos' && (
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5 }}>
                            {item.modules?.length ? item.modules.map((module) => (
                              <Box key={module.id} sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                <Chip label={module.name} size="small" sx={{ fontSize: '0.6875rem', bgcolor: '#f1f5f9' }} />
                                <Tooltip title={`Editar módulo ${module.name}`} arrow>
                                  <IconButton size="small" onClick={() => setForm({ ...item, moduleId: module.id, moduleName: module.name })}>
                                    <Pencil size={11} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            )) : <Typography variant="caption" color="text.secondary">Nenhum módulo</Typography>}
                          </Box>
                        </TableCell>
                      )}

                      {active === 'POs' && (
                        <TableCell sx={{ color: 'text.secondary' }}>
                          {item.manager || 'Não informado'}
                        </TableCell>
                      )}

                      {(active === 'Sistemas / Projetos' || active === 'Etiquetas') && (
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 14,
                                height: 14,
                                borderRadius: '50%',
                                bgcolor: item.color || '#2563eb',
                                border: '1px solid rgba(0,0,0,0.1)',
                              }}
                            />
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {item.color || '#2563eb'}
                            </Typography>
                          </Box>
                        </TableCell>
                      )}

                      <TableCell align="right">
                        <Box sx={{ display: 'inline-flex', gap: 0.5 }}>
                          <Tooltip title="Editar" arrow>
                            <IconButton size="small" onClick={() => setForm(item)}>
                              <Pencil size={14} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir" arrow>
                            <IconButton size="small" color="error" onClick={() => remove(item.id)}>
                              <Trash2 size={14} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={active === 'Contratos do Projeto' ? 8 : active === 'Sistemas / Projetos' ? 6 : 5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    Nenhum item cadastrado nesta categoria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog de Cadastro/Edição */}
      <Dialog
        open={Boolean(form)}
        onClose={() => setForm(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          backdrop: {
            style: {
              backgroundColor: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(4px)',
            },
          },
        }}
      >
        <DialogTitle sx={{ p: 3, pb: 1, fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700 }}>
          {form?.id ? 'Editar Cadastro' : 'Novo Cadastro'}
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Nome"
            placeholder={active === 'Contratos do Projeto' ? 'Ex: Contrato 1 — Desenvolvimento de Software' : 'Ex: Lucas Almeida'}
            required
            fullWidth
            value={form?.name || ''}
            onChange={(e) => form && setForm({ ...form, name: e.target.value })}
            autoFocus
          />

          {active === 'Contratos do Projeto' && (
            <>
              <TextField
                label="Código do Contrato"
                fullWidth
                value={form?.code || ''}
                onChange={(e) => form && setForm({ ...form, code: e.target.value })}
              />
              <TextField
                select
                label="Modalidade / Tipo"
                fullWidth
                value={form?.contractType || 'DESENVOLVIMENTO'}
                onChange={(e) => form && setForm({ ...form, contractType: e.target.value as 'DESENVOLVIMENTO' | 'SUSTENTACAO' })}
              >
                <MenuItem value="DESENVOLVIMENTO">Desenvolvimento e Melhorias de Software</MenuItem>
                <MenuItem value="SUSTENTACAO">Sustentação e Suporte Operacional</MenuItem>
              </TextField>
              <TextField
                label="Teto Contratual de Pontos de Função (PF)"
                type="number"
                fullWidth
                value={form?.totalPf ?? 8000}
                onChange={(e) => form && setForm({ ...form, totalPf: Number(e.target.value) })}
              />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                O PF realizado é calculado automaticamente pelas competências faturadas, de outubro de 2025 até julho de 2026.
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                <TextField
                  label="Mês Início"
                  value={form?.startMonth || 'Outubro'}
                  onChange={(e) => form && setForm({ ...form, startMonth: e.target.value })}
                />
                <TextField
                  label="Mês Fim"
                  value={form?.endMonth || 'Setembro'}
                  onChange={(e) => form && setForm({ ...form, endMonth: e.target.value })}
                />
              </Box>
              <TextField
                label="Ano de Vigência"
                type="number"
                value={form?.yearPeriod ?? 2}
                onChange={(e) => form && setForm({ ...form, yearPeriod: Number(e.target.value) })}
              />
              <TextField
                select
                label="Status da Vigência"
                fullWidth
                value={form?.status || 'VIGENTE'}
                onChange={(e) => form && setForm({ ...form, status: e.target.value as 'VIGENTE' | 'RENOVADO' | 'ENCERRADO' })}
              >
                <MenuItem value="VIGENTE">Vigente (Em Execução)</MenuItem>
                <MenuItem value="RENOVADO">Renovado para Próximo Ciclo</MenuItem>
                <MenuItem value="ENCERRADO">Encerrado</MenuItem>
              </TextField>
            </>
          )}

          {active === 'Equipe (Devs / QAs)' && (
            <>
              <TextField
                select
                label="Cargo / Papel"
                fullWidth
                value={form?.role || 'Desenvolvedor Frontend'}
                onChange={(e) => form && setForm({ ...form, role: e.target.value })}
              >
                {STANDARD_ROLES.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </TextField>

              <FormControlLabel
                control={
                  <Switch
                    checked={form?.active !== false}
                    onChange={(e) => form && setForm({ ...form, active: e.target.checked })}
                  />
                }
                label="Membro ativo na equipe"
              />
            </>
          )}

          {active === 'Sistemas / Projetos' && (
            <>
              <TextField
                label="PO Vinculado"
                fullWidth
                value={form?.po || ''}
                onChange={(e) => form && setForm({ ...form, po: e.target.value })}
              />
              <TextField
                label={form?.moduleId ? 'Módulo em edição' : 'Módulo (opcional)'}
                placeholder="Ex: Importação"
                fullWidth
                value={form?.moduleName || ''}
                onChange={(e) => form && setForm({ ...form, moduleName: e.target.value })}
                helperText={form?.moduleId ? `Vinculado ao projeto ${form.name}` : 'Cadastre o módulo junto com o projeto ou deixe em branco.'}
              />
            </>
          )}

          {active === 'POs' && (
            <TextField
              label="Gerente Vinculado"
              fullWidth
              value={form?.manager || ''}
              onChange={(e) => form && setForm({ ...form, manager: e.target.value })}
            />
          )}

          {(active === 'Sistemas / Projetos' || active === 'Etiquetas') && (
            <TextField
              label={active === 'Sistemas / Projetos' ? 'Cor do Sistema' : 'Cor da Etiqueta'}
              type="color"
              fullWidth
              value={form?.color || '#2563eb'}
              onChange={(e) => form && setForm({ ...form, color: e.target.value })}
              helperText={active === 'Sistemas / Projetos' ? 'A cor é herdada pelos módulos e aplicada aos cards, dashboards e relatórios.' : undefined}
            />
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
          <Button variant="outlined" onClick={() => setForm(null)}>
            Cancelar
          </Button>
          <Button variant="contained" startIcon={<Save size={14} />} onClick={save}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
