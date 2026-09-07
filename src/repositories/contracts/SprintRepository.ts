import type { Sprint } from '../../domain/sprint/model';

export interface SprintRepository {
  list(): Sprint[];
  replaceAll(sprints: Sprint[]): void;
}
