import type { RegistrationRepository, RegistryEntity, RegistryState, RegistryType } from '../repositories/contracts/RegistrationRepository';

export class RegistrationService {
  constructor(private readonly repository: RegistrationRepository) {}

  list<T extends RegistryEntity>(type: RegistryType): T[] { return this.repository.list<T>(type); }

  save<T extends RegistryEntity>(type: RegistryType, item: T): void {
    const current = this.repository.list(type).filter((entry) => entry.id !== item.id && entry.name.trim().toLocaleLowerCase('pt-BR') !== item.name.trim().toLocaleLowerCase('pt-BR'));
    if (!item.name.trim()) throw new Error('O nome do cadastro é obrigatório.');
    this.repository.replaceAll({ ...this.state(), [type]: [...current, { ...item, name: item.name.trim() }] });
  }

  remove(type: RegistryType, id: string, isReferenced: (id: string) => boolean = () => false): void {
    if (isReferenced(id)) throw new Error('O cadastro está vinculado e não pode ser excluído.');
    this.repository.replaceAll({ ...this.state(), [type]: this.repository.list(type).filter((entry) => entry.id !== id) });
  }

  private state(): RegistryState {
    return {
      projects: this.repository.list('projects'),
      pos: this.repository.list('pos'),
      managers: this.repository.list('managers'),
      cgticAnalysts: this.repository.list('cgticAnalysts'),
      businessAnalysts: this.repository.list('businessAnalysts'),
      priorities: this.repository.list('priorities'),
      labels: this.repository.list('labels'),
      teamMembers: this.repository.list('teamMembers'),
    };
  }
}

