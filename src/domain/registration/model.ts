export type HexColor = `#${string}`;

export interface RegistryBase {
  id: string;
  name: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type TeamRole =
  | 'Desenvolvedor Frontend'
  | 'Desenvolvedor Backend'
  | 'Desenvolvedor Fullstack'
  | 'QA / Analista de Testes'
  | 'Tech Lead'
  | 'DevOps / SRE'
  | 'UX / UI Designer'
  | 'Outro';

export interface TeamMember extends RegistryBase {
  role: TeamRole | string;
  email?: string;
  avatarInitials?: string;
}

export interface Project extends RegistryBase {
  color: HexColor;
  modules?: ProjectModule[];
  productOwnerId?: string;
  projectManagerId?: string;
  cgticAnalystId?: string;
  businessAnalystId?: string;
}

export interface ProjectModule extends RegistryBase {
  projectId: string;
  color?: HexColor;
}

export interface ProductOwner extends RegistryBase {
  projectManagerId?: string;
}

export interface ProjectManager extends RegistryBase {}
export interface CgticAnalyst extends RegistryBase {}
export interface BusinessAnalyst extends RegistryBase {}

export interface Priority extends RegistryBase {
  level: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
}

export interface Label extends RegistryBase {
  color: HexColor;
  description?: string;
}
