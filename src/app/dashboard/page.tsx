import { createClient } from '../../utils/supabase/server';
import { cookies } from 'next/headers';
import { SpeechService } from '../../services/speech.service';
import { Speech } from '../../types/database';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { signOut } from '../../actions/auth.actions';
import { createSpeechAction } from '../../actions/speech.actions';

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
        <div className="max-w-6xl mx-auto p-8 pb-16 font-inter">
            <header className="mb-16 flex items-center justify-between">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {speeches.map((speech) => (
                        <Link 
                            key={speech.id} 
                            href={`/present/${speech.id}`}
                            className="block group"
                        >
                            <div className="bg-[#092047] border border-[#0b468c]/30 rounded-xl p-6 h-full transition-all hover:border-[#ac61b9] hover:shadow-[0_0_20px_rgba(172,97,185,0.25)] hover:scale-[1.02]">
                                <h2 className="text-2xl font-bold text-white mb-2 font-atkinson group-hover:text-[#ac61b9] transition-colors">
                                    {speech.title}
                                </h2>
                                <p className="text-sm text-[#b7c1de]/70 mb-4 line-clamp-2">
                                    {speech.description || 'Sem descrição.'}
                                </p>
                                <div className="text-xs font-semibold px-3 py-1 bg-[#63345e] text-white w-fit rounded-full">
                                    {speech.type === 'SPEECH' ? 'DISCURSO' : 'COMENTÁRIO'}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}