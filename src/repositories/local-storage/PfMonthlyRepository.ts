import { PF_HISTORY_STORAGE_KEY, pfDisplayName, type PfMonthlyRecord } from '../../domain/pf/model';
import { normalizeProjectManagerName, WILLIAM_DANGELO } from '../../domain/people/projectManager';
import type { Sprint } from '../../domain/sprint/model';

const months = ['2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12'];

type SeedRow = { project: string; module?: string; analyst: string; manager: string; row: number; values: Array<[number, number?]> };

const seedRows: SeedRow[] = [
  { project: 'SCIEX', analyst: 'Francisco Eronildo', manager: WILLIAM_DANGELO, row: 1, values: [[1, 32.75,], [4, 202.3], [8, 45], [9, 35], [10, 30], [11, 169], [12, 95]] },
  { project: 'SCIEX', module: 'Importação', analyst: 'Francisco Eronildo', manager: WILLIAM_DANGELO, row: 2, values: [[14, 39], [15, 20]] },
  { project: 'SCIEX', module: 'Exportação', analyst: 'Francisco Eronildo', manager: WILLIAM_DANGELO, row: 3, values: [[13, 127], [14, 0], [15, 140]] },
  { project: 'SCIEX', module: 'Portal Único', analyst: 'Francisco Eronildo', manager: WILLIAM_DANGELO, row: 4, values: [[13, 110], [14, 0], [15, 110]] },
  { project: 'SPR', module: 'MEAAP / MCPP / MPPB', analyst: 'Luiz Gustavo', manager: WILLIAM_DANGELO, row: 5, values: [[0, 258.45], [2, 30], [4, 135.75], [5, 41], [6, 63.5], [8, 45], [9, 95], [10, 0], [11, 35], [12, 35], [13, 45], [15, 0], [16, 63.45], [17, 36.75]] },
  { project: 'SPR', module: 'MAPI / MCI', analyst: 'Luiz Gustavo', manager: WILLIAM_DANGELO, row: 6, values: [[0, 4.5], [2, 74.5], [4, 55], [5, 38.5], [8, 85], [9, 50], [10, 31], [11, 45], [12, 55], [13, 75]] },
  { project: 'SAGAT', module: 'Análise', analyst: 'Enio Souza', manager: 'Adilson', row: 7, values: [[0, 20.5], [1, 60.6], [2, 303.4], [3, 38], [4, 45.5], [6, 73.75], [7, 110], [8, 105], [9, 88.25], [10, 50], [11, 40], [12, 40], [13, 80]] },
  { project: 'SAGAT', module: 'Recepção', analyst: 'Enio Souza', manager: 'Adilson', row: 8, values: [[8, 30], [9, 40], [10, 40], [11, 40], [12, 40], [13, 150]] },
  { project: 'SIMNAC', module: 'Mobile', analyst: 'Francisco Canindé', manager: 'Adilson', row: 9, values: [[1, 22], [3, 95.95], [4, 10.05], [5, 21], [6, 43.5], [7, 60], [8, 30], [9, 59], [10, 54], [11, 70], [12, 80], [13, 100]] },
  { project: 'SIMNAC', module: 'Web', analyst: 'Francisco Canindé', manager: 'Adilson', row: 10, values: [[1, 81.5], [3, 41.3], [4, 54.25], [5, 85.75], [6, 60], [7, 30], [8, 82.1], [9, 62], [10, 100], [11, 80], [12, 150], [13, 40]] },
  { project: 'CADSUF', analyst: 'Paulo Peres', manager: 'Adilson', row: 11, values: [[1, 58], [2, 38.75], [3, 111.75], [4, 29.45], [5, 32.5], [6, 55], [7, 65], [8, 40], [9, 70], [10, 40], [11, 30], [12, 40], [13, 40]] },
  { project: 'SAC', analyst: 'Aurílio Pinto', manager: 'Adilson', row: 12, values: [[1, 97.4], [2, 104], [3, 88.25], [4, 116], [5, 142.74], [6, 9], [7, 133.7], [8, 70], [9, 85], [10, 40], [11, 100], [12, 70], [13, 100]] },
  { project: 'Sustentação', analyst: 'Equipe SUS', manager: 'Gabriel', row: 13, values: [[1, 136.35], [2, 183.1], [3, 337.95], [4, 337.75], [5, 303.45], [6, 246.15], [7, 295.65], [8, 203], [9, 217.3], [10, 267.55], [11, 133.9], [12, 322.5]] },
];

const seed = (): PfMonthlyRecord[] => {
  const importedAt = '2026-09-02T00:00:00.000Z';
  return seedRows.flatMap((row) => row.values.map(([monthIndex, detailedPf]) => ({
    id: `macro-pf-${row.row}-${months[monthIndex]}`,
    project: row.project,
    module: row.module,
    month: months[monthIndex],
    estimatedPf: 0,
    detailedPf: detailedPf || 0,
    manager: row.manager,
    cgticAnalyst: row.analyst,
    source: 'Planilha histórica de PF mensal',
    sourceRow: row.row,
    importedAt,
  })));
};

export class PfMonthlyRepository {
  constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'> = window.localStorage) {}

  list(): PfMonthlyRecord[] {
    try {
      const stored = JSON.parse(this.storage.getItem(PF_HISTORY_STORAGE_KEY) || 'null');
      if (Array.isArray(stored)) {
        const records = (stored as PfMonthlyRecord[]).map((record) => ({
          ...record,
          manager: normalizeProjectManagerName(record.manager),
        }));
        if (JSON.stringify(records) !== JSON.stringify(stored)) this.replaceAll(records);
        return records;
      }
    } catch {
      // Rebuild from the source seed when storage is malformed.
    }
    const records = seed();
    this.storage.setItem(PF_HISTORY_STORAGE_KEY, JSON.stringify(records));
    return records;
  }

  replaceAll(records: PfMonthlyRecord[]): void {
    this.storage.setItem(PF_HISTORY_STORAGE_KEY, JSON.stringify(records.map((record) => ({
      ...record,
      manager: normalizeProjectManagerName(record.manager),
    }))));
  }
}

export function macroRecordsToSprints(records: PfMonthlyRecord[]): Sprint[] {
  const groups = [...new Map(records.map((record) => [pfDisplayName(record), record])).values()];
  return groups.map((first) => {
    const group = records.filter((record) => pfDisplayName(record) === pfDisplayName(first));
    const months = group.map((record) => record.month).sort();
    const slug = pfDisplayName(first).replace(/[^a-z0-9]+/gi, '-').toUpperCase();
    return {
      code: `MACRO-${slug}`,
      project: `${pfDisplayName(first)} - Histórico`,
      system: pfDisplayName(first),
      projectName: first.project,
      module: first.module,
      sprintNumber: 0,
      serviceOrder: 'Histórico',
      objective: `PF detalhado faturado em ${group.length} competências`,
      lane: 'completed',
      progress: 100,
      expectedProgress: 100,
      health: 100,
      functionPoints: 0,
      detailedFunctionPoints: group.reduce((sum, record) => sum + record.detailedPf, 0),
      projectManager: first.manager,
      technicalLead: first.cgticAnalyst,
      tasks: 0,
      completedTasks: 0,
      blocked: 0,
      impediments: 0,
      risks: 0,
      deliveries: 1,
      labels: ['Histórico', 'Faturado'],
      start: months[0],
      end: months[months.length - 1],
      lastUpdated: first.importedAt,
      enteredLaneAt: first.importedAt,
      taskItems: [],
    } satisfies Sprint;
  });
}

export function mergeMacroSprints(sprints: Sprint[], records: PfMonthlyRecord[]): Sprint[] {
  const macroCards = macroRecordsToSprints(records);
  const existingCodes = new Set(sprints.map((sprint) => sprint.code));
  return [...sprints, ...macroCards.filter((card) => !existingCodes.has(card.code))];
}
