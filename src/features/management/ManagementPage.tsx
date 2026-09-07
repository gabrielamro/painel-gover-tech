import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import { Maximize } from 'lucide-react';
import { useSprints } from '../../app/providers/SprintProvider';
import { type Sprint } from '../../domain/sprint/model';
import { PfMonthlyRepository } from '../../repositories/local-storage/PfMonthlyRepository';
import { contractRepository } from '../../repositories/local-storage/LocalStorageContractRepository';
import { contractWithCalculatedRealized, CONTRACT_BILLING_PERIOD_START, LATEST_BILLED_MONTH } from '../../domain/contract/analytics';
import { SprintDetailsModal } from '../sprints/components/SprintDetailsModal';
import { managementMetrics, sprintName, atRisk } from './metrics';
import { demoSprints, DEMO_NOW } from './demo';
import { ManagementKpiGrid } from './components/ManagementKpiGrid';
import { ManagementCharts } from './components/ManagementCharts';
import { ManagementWorkBoard } from './components/ManagementWorkBoard';
import { ManagementSideRail } from './components/ManagementSideRail';
import './management.css';
import './management-theme.css';
import './management-responsive.css';

const pf = (n: number) => n.toLocaleString('pt-BR', {maximumFractionDigits: 2});
const period = (m: string) => new Date(`${m}-02T12:00:00`).toLocaleDateString('pt-BR', {month:'long',year:'numeric'});
export function ManagementPage() {
  const data = useSprints();
  const [demo,setDemo] = useState(true);
  const [page,setPage] = useState(0);
  const [systemPage,setSystemPage] = useState(0);
  const [featuredPage,setFeaturedPage] = useState(0);
  const [selected,setSelected] = useState<string | null>(null);
  const [drill,setDrill] = useState<{title:string;items:Sprint[]} | null>(null);
  const [notice,setNotice] = useState('');
  const now = demo ? DEMO_NOW : new Date();
  const rows = demo ? demoSprints : data.sprints;
  const stats = managementMetrics(rows, now);
  const current = rows.find(s=>s.code===selected);
  const contracts = useMemo(() => {
    const history = new PfMonthlyRepository().list();
    return contractRepository.list().map(c=>contractWithCalculatedRealized(c,history));
  },[]);
  const total = contracts.reduce((n,c)=>n+c.totalPf,0);
  const realized = contracts.reduce((n,c)=>n+c.realizedPf,0);
  const percent = total ? Math.min(100,Math.round(realized/total*100)) : 0;
  const featured = stats.active.filter(s=>s.isFeatured || s.needsClientDecision);
  const pages = Math.max(1,Math.ceil(stats.active.length/12));
  const show = (title:string,items:Sprint[]) => setDrill({title,items});
  const riskCount = stats.forecast.filter(s=>atRisk(s,stats.today)).length;
  const changeMode = (value:boolean) => {setDemo(value);setPage(0);setSystemPage(0);setFeaturedPage(0);setSelected(null);setDrill(null);};
  return <section className="management-screen">
    <header className="management-header"><div><h1>Visão da Gestão Suframa</h1><small>{demo ? 'Cenário demonstrativo • Referência: 05/08/2026' : `Dados do Kanban • ${now.toLocaleDateString('pt-BR')}`}</small></div><nav>
      {demo&&<button className="management-temporary-summary" onClick={()=>show('Cards temporários',demoSprints)}><span className="management-temporary-tag">Temporário</span> {demoSprints.length} cards</button>}
      <select aria-label="Origem dos dados" value={demo?'demo':'real'} onChange={e=>changeMode(e.target.value==='demo')}><option value="real">Dados reais</option><option value="demo">Cards temporários — 12 times</option></select>
      <Link to="/kanban">Kanban</Link><button onClick={()=>{if(document.fullscreenElement) void document.exitFullscreen(); else void document.documentElement.requestFullscreen().catch(()=>setNotice('Tela cheia indisponível neste navegador.'));}}><Maximize size={14}/> Tela cheia</button>
    </nav></header>
    <ManagementKpiGrid
      teams={stats.teams}
      missingTeams={stats.missingTeams}
      delivered={stats.delivered}
      forecast={stats.forecast}
      riskCount={riskCount}
      decisions={stats.decisions}
      previousLabel={period(stats.previous)}
      currentLabel={period(stats.current)}
      onDrill={show}
      contractTotal={total}
      contractRealized={realized}
      contractPercent={percent}
      contractPeriodStart={CONTRACT_BILLING_PERIOD_START}
      contractLatestBilled={LATEST_BILLED_MONTH}
      pfFormatter={pf}
      periodFormatter={period}
    />
    <div className="management-body">
      <ManagementWorkBoard
        rows={stats.active.slice(Math.min(page, pages - 1) * 12, Math.min(page, pages - 1) * 12 + 12)}
        page={page}
        pages={pages}
        today={stats.today}
        isDemo={demo}
        onPrevious={() => setPage(page - 1)}
        onNext={() => setPage(page + 1)}
        onOpen={setSelected}
      />
      <ManagementSideRail
        featured={featured}
        page={featuredPage}
        demo={demo}
        onNext={() => setFeaturedPage((featuredPage + 1) % Math.ceil(featured.length / 3))}
        onOpen={setSelected}
      />
    </div>
    <ManagementCharts systems={stats.systems.slice(systemPage*6,systemPage*6+6)} systemDelivery={stats.systemDelivery} weeks={stats.weeks} previousLabel={period(stats.previous)} currentLabel={period(stats.current)} hasMoreSystems={stats.systems.length>6} onSystemsNext={()=>setSystemPage((systemPage+1)%Math.ceil(stats.systems.length/6))} onDrill={show} deliveredBySystem={name=>stats.delivered.filter(d=>sprintName(d)===name)}/>
    <footer className="management-foot">{notice || (demo?'Operação ilustrativa • Contrato calculado pelo histórico real':'Aceite e faturamento são apurados separadamente • Clique nos indicadores para conferir os registros')}</footer>
    {current&&!demo&&<SprintDetailsModal sprint={current} onClose={()=>setSelected(null)} onUpdate={changes=>data.updateSprint(current.code,changes)} onCreateTask={data.createTask} onUpdateTask={data.updateTask} onMoveTask={data.moveTask} onDeleteTask={data.deleteTask} auditLogs={data.auditLogs(current.code)}/>}
    <Dialog open={Boolean(drill || (demo&&current))} onClose={()=>{setDrill(null);setSelected(null);}} fullWidth maxWidth="sm"><DialogTitle>{drill?.title || current?.objective}</DialogTitle><DialogContent>{demo&&<p>Cenário demonstrativo, sem gravação no Kanban.</p>}{drill?drill.items.length?drill.items.map(s=><p key={s.code}><button onClick={()=>{setDrill(null);setSelected(s.code);}}>{sprintName(s)} • {s.objective}</button></p>):<p>Nenhum registro neste período.</p>:<p>{current?.projectName} • {current?.module} • Entrega {current?.end}</p>}<button onClick={()=>{setDrill(null);setSelected(null);}}>Fechar</button></DialogContent></Dialog>
  </section>;
}
