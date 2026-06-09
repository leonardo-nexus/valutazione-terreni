# supabase-starter

Next.js 16 (App Router, TypeScript, Tailwind) + Supabase Auth + esempio CRUD (`notes`) con RLS.

## Setup

1. Crea un progetto Supabase (cloud su [supabase.com](https://supabase.com) **oppure** locale con `supabase start`).
2. Copia URL e anon key in `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

3. Applica la migration in `supabase/migrations/0001_notes.sql` al tuo progetto (SQL editor, `supabase db push` o `psql`).
4. `npm run dev` e apri http://localhost:3000.

## Struttura

- `proxy.ts` &mdash; Proxy Next 16 (ex middleware); rinfresca la sessione e protegge `/notes`.
- `src/lib/supabase/{client,server,proxy}.ts` &mdash; helper `@supabase/ssr` per browser, server e proxy.
- `src/app/{login,signup}/page.tsx` &mdash; auth email/password via Server Actions.
- `src/app/notes/` &mdash; pagina protetta con CRUD minimo su `public.notes` (RLS per `user_id`).

## Note Next 16

- Il vecchio `middleware.ts` ora si chiama `proxy.ts` (root del progetto).
- `cookies()` &egrave; asincrona: `const cookieStore = await cookies()`.
- Consulta `node_modules/next/dist/docs/` per i pattern aggiornati.
