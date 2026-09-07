import { AuthService } from '../services/auth.js';

export function mountAuthStatus(target) {
  if (!target || !AuthService.enabled) return () => {};
  const render = (session) => {
    target.innerHTML = session?.user ? '<button type="button" data-auth-logout>Sair</button>' : '<span>Não autenticado</span>';
    target.querySelector('[data-auth-logout]')?.addEventListener('click', () => AuthService.signOut());
  };
  AuthService.session().then(render);
  return AuthService.onChange(render);
}

