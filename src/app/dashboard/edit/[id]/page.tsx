import { createClient } from '../../../../utils/supabase/server';
import { cookies } from 'next/headers';
import { SpeechService } from '../../../../services/speech.service';
import { notFound } from 'next/navigation';
import { EditSpeechForm } from '../../../../components/EditSpeechForm';

export default async function EditSpeechPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = createClient(await cookies());

    // Check authentication
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
        console.error('[edit] SESSÃO INVÁLIDA:', userError?.message ?? 'Usuário não autenticado');
        notFound();
        return;
    }

    // Fetch speech
    let speech;
    try {
        speech = await SpeechService.getById(supabase, id);
    } catch (error) {
        console.error('[edit] ERRO ao buscar discurso:', error instanceof Error ? error.message : error);
        notFound();
    }
    
    return (
        <main className="min-h-screen bg-[#092047] py-8">
            <EditSpeechForm speech={speech} />
        </main>
    );
}
