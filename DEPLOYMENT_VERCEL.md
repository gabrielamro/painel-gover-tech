# Publicação na Vercel

## Configuração

1. Importe este repositório na Vercel.
2. Em **Settings → Environment Variables**, adicione para Preview e Production:

```env
SUPABASE_URL=https://bwlmaibvydjuggqwoojt.supabase.co
SUPABASE_ANON_KEY=<chave pública publishable>
PAINELPRO_DATA_SOURCE=api
```

3. Faça um novo deploy.
4. Valide `https://seu-dominio.vercel.app/api/health`.
5. Crie um usuário em Supabase → Authentication → Users e teste login no aplicativo.

## Segurança

- Não publique `.env.local`.
- Não configure `sb_secret` ou `service_role` no frontend.
- Mantenha RLS habilitado no Supabase.
- A chave publishable/anon é a única chave usada pelo navegador e pelas funções atuais.

## Estado

O schema já foi executado no projeto Supabase. A publicação na Vercel ainda depende de autenticar a conta Vercel e escolher o repositório/domínio de produção.

