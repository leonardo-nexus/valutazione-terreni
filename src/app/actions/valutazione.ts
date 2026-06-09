'use server'

// La valutazione gira QUI, sul server. Il client riceve solo il risultato:
// le formule e la logica non lasciano mai il server (know-how protetto).

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { valuta } from '@/lib/valutazione/engine'
import type { InputValutazione, RisultatoValutazione } from '@/lib/valutazione/types'
import { createClient } from '@/lib/supabase/server'

export async function runValutazione(input: InputValutazione): Promise<RisultatoValutazione> {
  return valuta(input)
}

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { supabase, user }
}

export type SalvaArgs = { id?: string; nome: string; input: InputValutazione }

// Crea o aggiorna. Ricalcola SEMPRE sul server prima di salvare (coerenza).
export async function salvaValutazione({ id, nome, input }: SalvaArgs): Promise<string> {
  const { supabase, user } = await requireUser()
  const risultato = valuta(input)
  const row = {
    user_id: user.id,
    nome: nome.trim() || input.terreno.comune || 'Valutazione',
    comune: input.terreno.comune,
    prezzo_richiesto: input.terreno.prezzoRichiesto,
    esito: risultato.verdettoFinale.esito,
    valore_max: risultato.residuale.valoreMaxTerreno,
    input,
    risultato,
    updated_at: new Date().toISOString(),
  }

  if (id) {
    const { error } = await supabase.from('proenesys_valutazioni').update(row).eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/valutazioni')
    return id
  }
  const { data, error } = await supabase
    .from('proenesys_valutazioni')
    .insert(row)
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/valutazioni')
  return data.id as string
}

export async function eliminaValutazione(id: string, _formData?: FormData): Promise<void> {
  const { supabase } = await requireUser()
  await supabase.from('proenesys_valutazioni').delete().eq('id', id)
  revalidatePath('/valutazioni')
}
