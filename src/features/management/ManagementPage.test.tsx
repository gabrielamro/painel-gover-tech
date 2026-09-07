// @vitest-environment jsdom
import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ManagementPage } from './ManagementPage';
vi.mock('../../app/providers/SprintProvider',()=>({useSprints:()=>({sprints:[],auditLogs:()=>[]})}));
it('keeps demonstration isolated and opens its details',()=>{
  render(<MemoryRouter><ManagementPage/></MemoryRouter>);
  expect(screen.getByText('Visão da Gestão Suframa')).toBeDefined();
  expect(document.querySelectorAll('.management-card .management-temporary-tag')).toHaveLength(12);
  fireEvent.change(screen.getByLabelText('Origem dos dados'),{target:{value:'real'}});
  expect(screen.getByText(/Nenhuma melhoria ativa/)).toBeDefined();
  fireEvent.change(screen.getByLabelText('Origem dos dados'),{target:{value:'demo'}});
  expect(document.querySelectorAll('.management-card')).toHaveLength(12);
  fireEvent.click(screen.getByText('Consultar solicitações'));
  expect(screen.getByText('Cenário demonstrativo, sem gravação no Kanban.')).toBeDefined();
  fireEvent.click(screen.getByText('Fechar'));
  fireEvent.change(screen.getByLabelText('Origem dos dados'),{target:{value:'real'}});
  expect(document.querySelectorAll('.management-card')).toHaveLength(0);
});
