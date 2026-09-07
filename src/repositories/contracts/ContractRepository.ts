import type { ProjectContract } from '../../domain/contract/model';

export interface ContractRepository {
  list(): ProjectContract[];
  save(contract: ProjectContract): void;
  remove(id: string): void;
  replaceAll(contracts: ProjectContract[]): void;
}
