import type { Sprint } from './domain/sprint/model';
import { LocalStorageSprintRepository } from './repositories/local-storage/LocalStorageSprintRepository';
const repository = new LocalStorageSprintRepository();
/** @deprecated Use SprintRepository through SprintService. */
export const loadSprints = (): Sprint[] => repository.list();
/** @deprecated Use SprintRepository through SprintService. */
export const saveSprints = (sprints: Sprint[]): void => repository.replaceAll(sprints);
