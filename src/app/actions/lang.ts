'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { LANG_COOKIE, type Lang } from '@/lib/i18n'

export async function setLang(lang: Lang, _formData?: FormData) {
  const c = await cookies()
  c.set(LANG_COOKIE, lang === 'es' ? 'es' : 'it', { path: '/', maxAge: 60 * 60 * 24 * 365 })
  revalidatePath('/', 'layout')
}
