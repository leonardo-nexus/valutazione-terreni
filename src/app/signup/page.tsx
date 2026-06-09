import Link from 'next/link'
import { signup } from '@/app/actions/auth'
import { getLang, getDict } from '@/lib/i18n'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const t = getDict(await getLang()).auth

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="brand-font text-3xl font-semibold">{t.registrati}</h1>
      <form action={signup} className="flex flex-col gap-3">
        <input name="email" type="email" required placeholder={t.email} className="field-input" />
        <input name="password" type="password" required minLength={6} placeholder={t.minPwd} className="field-input" />
        <button type="submit" className="gold-btn px-3 py-2.5">{t.crea}</button>
      </form>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <p className="text-sm text-[var(--muted)]">
        {t.haiAccount}{' '}
        <Link href="/login" className="gold-link">{t.accedi}</Link>
      </p>
    </main>
  )
}
