/*
import { createClient } from '../../../utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <ul>
      {todos?.map((todo) => (
        <li key={todo.id}>{todo.name}</li>
      ))}
    </ul>
  )
}*/


import { createClient } from '../../../utils/supabase/server';
import { cookies } from 'next/headers';
import { SpeechService } from '../../../services/speech.service';
import PresentMode from '../../../components/PresentMode';
import { notFound } from 'next/navigation';

export default async function PresentationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    console.log(`[present/[id]] ID recebido da URL:`, id, `(tipo: ${typeof id})`);
    
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user) {
        console.error(`[present/${id}] SESSÃO INVÁLIDA:`, userError?.message ?? 'Usuário não autenticado');
        notFound();
        return;
    }
    
    console.log(`[present/${id}] Usuário autenticado: ${userData.user.id}`);
    
    // Debug: Tentar buscar TODOS os discursos para comparar
    const { data: allSpeeches } = await supabase.from('speeches').select('id, title');
    console.log(`[present/${id}] Todos os discursos disponíveis:`, allSpeeches);
    
    let speech;
    try {
        speech = await SpeechService.getById(supabase, id);
    } catch (error) {
        console.error(`[present/${id}] ERRO ao buscar discurso:`, error instanceof Error ? error.message : error);
        
        if (error instanceof Error) {
            if (error.message.includes('PGRST116') || error.message.includes('No rows')) {
                console.error(`[present/${id}] Nenhum registro encontrado. RLS ou ID inválido.`);
            }
        }
        
        notFound();
    }
    
    return (
        <main className="bg-[#1a1a1a] flex justify-center">
            <PresentMode title={speech.title} blocks={speech.blocks} speechId={id} />
        </main>
    );
}
