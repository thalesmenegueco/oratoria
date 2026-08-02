import { createClient } from '../../utils/supabase/server';
import { cookies } from 'next/headers';
import { SpeechService } from '../../services/speech.service';
import { Speech } from '../../types/database';
import { notFound } from 'next/navigation';
import { signOut } from '../../actions/auth.actions';
import { createSpeechAction } from '../../actions/speech.actions';
import SpeechCard from '../../components/SpeechCard';

export default async function DashboardPage() {
    const supabase = createClient(await cookies());

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
        console.error('[dashboard] SESSÃO INVÁLIDA:', userError?.message ?? 'Usuário não autenticado');
        notFound();
        return;
    }

    let speeches: Speech[];
    try {
        speeches = await SpeechService.getAll(supabase);
    } catch (error) {
        console.error('[dashboard] ERRO ao buscar discursos:', error instanceof Error ? error.message : error);
        speeches = [];
    }

    return (
        <div className="max-w-6xl mx-auto p-8 pb-8 font-inter">
            <header className="mb-16 flex flex-col justify-between gap-2">
                <div>
                    <h1 className="text-5xl font-bold text-white mb-3 font-atkinson">Os Meus Discursos</h1>
                    <p className="text-lg text-[#b7c1de]/90">Selecione um esboço para iniciar a apresentação.</p>
                </div>
                <div className="flex gap-3">
                    <form action={createSpeechAction}>
                        <button 
                            type="submit"
                            className="bg-[#0b468c] hover:bg-[#0b468c]/80 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                            + Novo Discurso
                        </button>
                    </form>
                    <form action={signOut}>
                        <button 
                            type="submit"
                            className="bg-[#63345e] hover:bg-[#63345e]/80 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Sair
                        </button>
                    </form>
                </div>
            </header>

            {speeches.length === 0 ? (
                <div className="p-12 border-2 border-dashed border-[#b7c1de]/20 rounded-xl text-center">
                    <p className="text-xl text-[#b7c1de]/70">Ainda não tem nenhum discurso criado.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-8">
                    {speeches.map((speech) => (
                        <SpeechCard key={speech.id} speech={speech} />
                    ))}
                </div>
            )}
        </div>
    );
}