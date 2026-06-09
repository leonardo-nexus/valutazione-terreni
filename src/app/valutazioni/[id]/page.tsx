import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLang, getDict } from '@/lib/i18n'
import { getInputDefault } from '@/lib/valutazione/defaults'
import { GUIDE } from '@/lib/valutazione/guide'
import Valutatore from '@/app/valuta/Valutatore'
import type { InputValutazione } from '@/lib/valutazione/types'

export async function generateMetadata() {
  const t = getDict(await getLang())
  return { title: `Proenesys · ${t.nav.app}` }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('proenesys_valutazioni')
    .select('id,nome,input')
    .eq('id', id)
    .single()
  if (!data) notFound()

  const lang = await getLang()
  const t = getDict(lang)

  return (
    <main className="mx-auto max-w-6xl p-6">
      <header className="mb-7">
        <p className="section-title">{t.page.eyebrowMod}</p>
        <h1 className="brand-font mt-1 text-4xl font-semibold">{data.nome}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{t.page.sottotitoloMod}</p>
      </header>
      <Valutatore
        t={t}
        guide={GUIDE[lang]}
        defaultInput={getInputDefault(lang)}
        initial={{ id: data.id, nome: data.nome, input: data.input as InputValutazione }}
      />
    </main>
  )
}
