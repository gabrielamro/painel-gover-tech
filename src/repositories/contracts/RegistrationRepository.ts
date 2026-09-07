import type { BusinessAnalyst, CgticAnalyst, Label, ProjectModule, ProductOwner, Project, ProjectManager, Priority, TeamMember } from '../../domain/registration/model';

export type RegistryEntity = Project | ProjectModule | ProductOwner | ProjectManager | CgticAnalyst | BusinessAnalyst | Priority | Label | TeamMember;
export type RegistryType = 'projects' | 'modules' | 'pos' | 'managers' | 'cgticAnalysts' | 'businessAnalysts' | 'priorities' | 'labels' | 'teamMembers';
export type RegistryState = Omit<Record<RegistryType, RegistryEntity[]>, 'modules'> & { modules?: RegistryEntity[] };

export interface RegistrationRepository {
  list<T extends RegistryEntity>(type: RegistryType): T[];
  replaceAll(state: RegistryState): void;
}
