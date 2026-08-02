'use server'

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '../utils/supabase/server';
import { SpeechService } from '../services/speech.service';
import { UpdateSpeechDTO } from '../types/database';

export async function createSpeechAction() {
    const supabase = createClient(await cookies());
    
    // Create speech with default values
    const newSpeech = await SpeechService.create(supabase, {
        title: 'Novo Discurso',
        description: null,
        type: 'SPEECH',
        cover_image_url: null,
        blocks: [
            {
                id: crypto.randomUUID(),
                level: 1,
                content: '# Clique para editar\n\nComece a escrever seu discurso aqui.'
            }
        ]
    });
    
    // Revalidate dashboard before redirect
    revalidatePath('/dashboard');
    
    // Redirect to edit page (throws, so code after this won't run)
    redirect(`/dashboard/edit/${newSpeech.id}`);
}

export async function updateSpeechAction(id: string, payload: UpdateSpeechDTO) {
    try {
        const supabase = createClient(await cookies());
        
        // Chamamos a nossa Camada de Serviço injetando o cliente servidor
        const updatedSpeech = await SpeechService.update(supabase, id, payload);
        
        // Limpa o cache da página do editor e da página de apresentação
        revalidatePath('/dashboard');
        revalidatePath(`/present/${id}`);
        
        return { success: true, data: updatedSpeech };
    } catch (error) {
        console.error(error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}