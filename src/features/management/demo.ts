import type { Sprint } from '../../domain/sprint/model';

// Isolated presentation fixture. Never written to the operational repositories.
const projects = ['SIMNAC','SIMNAC','SAGAT','SAGAT','SCIEX','SCIEX','SCIEX','SPR','SPR','SPR','CADSUF','SAC'];
const modules = ['Web','Mobile','Recepção','Análise','Importação','Exportação','Portal Único','MEAAP','MCPP','MAPI','',''];
const titles = ['Consultar solicitações','Receber notificações','Protocolar documentos','Validar documentos','Conferir documentos','Acompanhar processos','Integrar consultas','Revisar cadastro','Validar propostas','Consultar indicadores','Atualizar cadastro','Acompanhar solicitações'];
const dates = ['08-14','08-07','08-21','08-21','08-14','08-28','09-04','08-07','08-28','08-14','08-07','09-11'];
export const DEMO_NOW = new Date(2026, 7, 5, 10, 35);
export const demoSprints: Sprint[] = projects.map((projectName, i) => ({
  code: `DEMO-${i+1}`, labels: ['Temporário'], isTemporary: true, project: projectName, projectName, module: modules[i], objective: titles[i],
  lane: [1,4,9].includes(i) ? 'homologation' : 'development',
  stageLabel: [7,10].includes(i) ? 'Aguardando aceite' : undefined,
  teamId: `team-${i+1}`, teamName: `Time ${String(i+1).padStart(2,'0')}`,
  progress: 50, health: 80, end: `2026-${dates[i]}`, risks: [3,8].includes(i) ? 1 : 0,
  riskReason: i === 3 ? 'Regra pendente' : i === 8 ? 'Acesso pendente' : undefined,
  needsClientDecision: [3,8].includes(i), isFeatured: [1,3,8].includes(i),
  featuredNote: i === 3 ? 'Validar regra de documentos • Cliente até 10/08' : i === 8 ? 'Liberar acesso à integração • Cliente até 12/08' : 'Homologação disponível',
}));
['SIMNAC','SAGAT','SCIEX','SPR','CADSUF','SAC'].forEach((projectName,i) => {
  for(let j=0;j<[4,3,4,3,2,2][i];j++) demoSprints.push({code:`DEMO-DEL-${i}-${j}`,labels:['Temporário'],isTemporary:true,project:projectName,projectName,objective:`Melhoria aceita ${j+1}`,lane:'completed',progress:100,health:100,acceptedAt:'2026-07-20'});
});
