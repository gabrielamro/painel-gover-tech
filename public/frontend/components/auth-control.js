import { AuthService } from '../services/auth.js';

export function mountAuthControl() {
  if (!AuthService.enabled) return;
  const host = document.querySelector('.top-actions');
  if (!host || host.querySelector('[data-auth-control]')) return;
  const control = document.createElement('div');
  control.dataset.authControl = 'true';
  control.className = 'auth-control';
  const render = (session) => {
    control.innerHTML = session?.user
      ? `<span class="auth-user">${session.user.email || 'Usuário autenticado'}</span><button type="button" class="secondary-button" data-auth-logout>Sair</button>`
      : '<button type="button" class="secondary-button" data-auth-login>Entrar</button>';
    control.querySelector('[data-auth-logout]')?.addEventListener('click', async () => { await AuthService.signOut(); render(null); });
    control.querySelector('[data-auth-login]')?.addEventListener('click', async () => {
      const email = window.prompt('E-mail do Supabase:');
      if (!email) return;
      const password = window.prompt('Senha:');
      if (!password) return;
      try { await AuthService.signIn(email, password); render(await AuthService.session()); window.location.reload(); }
      catch (error) { window.alert(error.message || 'Não foi possível entrar.'); }
    });
  };
  host.prepend(control);
  AuthService.session().then(render);
  AuthService.onChange(render);
}

