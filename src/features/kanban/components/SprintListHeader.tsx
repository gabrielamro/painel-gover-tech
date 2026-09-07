export function SprintListHeader() {
  return (
    <thead className="sprint-list-thead">
      <tr className="sprint-list-header-row">
        <th scope="col" className="sprint-col-seq text-center" style={{ width: '42px' }}>
          #
        </th>
        <th scope="col" className="sprint-col-system" style={{ minWidth: '150px' }}>
          Sistema / Sprint
        </th>
        <th scope="col" className="sprint-col-os" style={{ width: '110px' }}>
          OS
        </th>
        <th scope="col" className="sprint-col-objective" style={{ minWidth: '220px' }}>
          Objetivo
        </th>
        <th scope="col" className="sprint-col-po" style={{ width: '130px' }}>
          PO
        </th>
        <th scope="col" className="sprint-col-deadline" style={{ width: '95px' }}>
          Prazo
        </th>
        <th scope="col" className="sprint-col-progress" style={{ width: '110px' }}>
          Progresso
        </th>
        <th scope="col" className="sprint-col-tasks text-center" style={{ width: '65px' }}>
          Tasks
        </th>
        <th scope="col" className="sprint-col-blocked text-center" style={{ width: '75px' }}>
          Bloqueios
        </th>
        <th scope="col" className="sprint-col-pf text-center" style={{ width: '80px' }}>
          PF
        </th>
        <th scope="col" className="sprint-col-lane" style={{ width: '140px' }}>
          Situação
        </th>
        <th scope="col" className="sprint-col-actions text-right" style={{ width: '150px' }}>
          Ações
        </th>
      </tr>
    </thead>
  );
}
