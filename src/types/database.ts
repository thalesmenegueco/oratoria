import { SupabaseClient } from '@supabase/supabase-js';

// Reflete o ENUM do banco
export type SpeechType = 'COMMENT' | 'SPEECH';

// Estrutura do bloco JSONB
export interface SpeechBlock {
    id: string; // Recomendado usar crypto.randomUUID() ao criar no front
    level: 1 | 2 | 3;
    content: string;
}

// Representa a linha do banco de dados
export interface Speech {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    type: SpeechType;
    cover_image_url: string | null;
    blocks: SpeechBlock[]; // O Array JSONB
    created_at: string;
    updated_at: string;
}

// Tipagem para criação (omite id, user_id e timestamps gerados pelo banco)
export type CreateSpeechDTO = Omit<Speech, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

// Tipagem para atualização (tudo opcional)
export type UpdateSpeechDTO = Partial<CreateSpeechDTO>;

// Tipo utilitário genérico para o cliente Supabase
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TypedSupabaseClient = SupabaseClient<any, "public", any>;