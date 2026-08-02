import {
    Speech,
    CreateSpeechDTO,
    UpdateSpeechDTO,
    TypedSupabaseClient
} from '../types/database';

export const SpeechService = {
    /**
     * Busca todos os discursos do usuário (Ideal para o /dashboard)
     */
    async getAll(supabase: TypedSupabaseClient): Promise<Speech[]> {
        const { data, error } = await supabase
            .from('speeches')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) throw new Error(`Erro ao buscar discursos: ${error.message}`);
        return data as Speech[];
    },

    /**
     * Busca um discurso específico pelo ID (Ideal para o Modo Palco e Editor)
     */
    async getById(supabase: TypedSupabaseClient, id: string): Promise<Speech> {
        // Query without .single() to avoid the coercion error
        const { data, error } = await supabase
            .from('speeches')
            .select('*')
            .eq('id', id);

        if (error) {
            throw new Error(`Erro ao buscar discurso ${id}: ${error.message}`);
        }

        if (!data || data.length === 0) {
            throw new Error(`Discurso ${id} não encontrado. Verifique se o discurso existe e se você tem permissão para acessá-lo (RLS policy).`);
        }

        if (data.length > 1) {
            throw new Error(`Múltiplos discursos encontrados com ID ${id}. Inconsistência no banco de dados.`);
        }

        return data[0] as Speech;
    },

    /**
     * Cria um novo discurso
     */
    async create(supabase: TypedSupabaseClient, payload: CreateSpeechDTO): Promise<Speech> {
        const { data, error } = await supabase
            .from('speeches')
            .insert([
                {
                    title: payload.title,
                    description: payload.description,
                    type: payload.type,
                    cover_image_url: payload.cover_image_url,
                    blocks: payload.blocks || [],
                }
            ])
            .select()
            .single();

        if (error) throw new Error(`Erro ao criar discurso: ${error.message}`);
        return data as Speech;
    },

    /**
     * Atualiza um discurso (Título, descrição ou a ordem/conteúdo dos blocos)
     */
    async update(supabase: TypedSupabaseClient, id: string, payload: UpdateSpeechDTO): Promise<Speech> {
        const { data, error } = await supabase
            .from('speeches')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Erro ao atualizar discurso ${id}: ${error.message}`);
        return data as Speech;
    },

    /**
     * Deleta um discurso
     */
    async delete(supabase: TypedSupabaseClient, id: string): Promise<void> {
        const { error } = await supabase
            .from('speeches')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Erro ao deletar discurso ${id}: ${error.message}`);
    }
};