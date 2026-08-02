'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Speech, SpeechBlock, SpeechType } from '../types/database';
import { updateSpeechAction } from '../actions/speech.actions';

interface EditSpeechFormProps {
    speech: Speech;
}

export function EditSpeechForm({ speech }: EditSpeechFormProps) {
    const [title, setTitle] = useState(speech.title);
    const [description, setDescription] = useState(speech.description || '');
    const [type, setType] = useState<SpeechType>(speech.type);
    const [blocks, setBlocks] = useState<SpeechBlock[]>(speech.blocks);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage(null);

        try {
            const result = await updateSpeechAction(speech.id, {
                title,
                description: description || null,
                type,
                blocks
            });

            if (result.success) {
                setSaveMessage('Salvo com sucesso!');
                setTimeout(() => setSaveMessage(null), 3000);
            } else {
                setSaveMessage(`Erro: ${result.error}`);
            }
        } catch {
            setSaveMessage('Erro ao salvar discurso');
        } finally {
            setIsSaving(false);
        }
    };

    const handleBlockUpdate = (index: number, field: keyof SpeechBlock, value: string | number) => {
        const updatedBlocks = [...blocks];
        updatedBlocks[index] = { ...updatedBlocks[index], [field]: value };
        setBlocks(updatedBlocks);
    };

    const handleBlockDelete = (index: number) => {
        if (blocks.length <= 1) return; // Prevent deletion of last block
        const updatedBlocks = blocks.filter((_, i) => i !== index);
        setBlocks(updatedBlocks);
    };

    const handleAddBlock = () => {
        const newBlock: SpeechBlock = {
            id: crypto.randomUUID(),
            level: 1,
            content: ''
        };
        setBlocks([...blocks, newBlock]);
    };

    return (
        <div className="max-w-5xl mx-auto px-8">
            {/* Header */}
            <header className="mb-8 flex items-center justify-between">
                <h1 className="text-4xl font-bold text-white font-atkinson">Editar Discurso</h1>
                <div className="flex gap-3 items-center">
                    {saveMessage && (
                        <span className={`text-sm ${saveMessage.includes('Erro') ? 'text-red-400' : 'text-green-400'}`}>
                            {saveMessage}
                        </span>
                    )}
                    <Link 
                        href="/dashboard"
                        className="bg-[#63345e] hover:bg-[#63345e]/80 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                        Cancelar
                    </Link>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-[#0b468c] hover:bg-[#0b468c]/80 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </header>

            {/* Metadata Section */}
            <section className="bg-[#092047] border border-[#0b468c]/30 rounded-xl p-6 mb-6">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-semibold text-[#b7c1de] mb-2">
                            Título
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Título do discurso"
                            className="w-full bg-[#092047] border border-[#0b468c]/50 rounded-lg px-4 py-3 text-white placeholder:text-[#b7c1de]/40 focus:outline-none focus:border-[#ac61b9] focus:ring-2 focus:ring-[#ac61b9]/20 transition-all"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-[#b7c1de] mb-2">
                            Descrição
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descrição opcional"
                            rows={3}
                            className="w-full bg-[#092047] border border-[#0b468c]/50 rounded-lg px-4 py-3 text-white placeholder:text-[#b7c1de]/40 focus:outline-none focus:border-[#ac61b9] focus:ring-2 focus:ring-[#ac61b9]/20 transition-all resize-none"
                        />
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-semibold text-[#b7c1de] mb-2">
                            Tipo
                        </label>
                        <select
                            id="type"
                            value={type}
                            onChange={(e) => setType(e.target.value as SpeechType)}
                            className="w-full bg-[#092047] border border-[#0b468c]/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ac61b9] focus:ring-2 focus:ring-[#ac61b9]/20 transition-all"
                        >
                            <option value="SPEECH">Discurso</option>
                            <option value="COMMENT">Comentário</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Blocks Section */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white font-atkinson">Blocos de Conteúdo</h2>
                    <button
                        onClick={handleAddBlock}
                        className="bg-[#0b468c] hover:bg-[#0b468c]/80 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                    >
                        + Adicionar Bloco
                    </button>
                </div>

                <div className="space-y-4">
                    {blocks.map((block, index) => (
                        <div
                            key={block.id}
                            className="bg-[#092047] border border-[#0b468c]/30 rounded-xl p-6"
                        >
                            <div className="flex gap-4">
                                {/* Content */}
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-[#b7c1de] mb-2">
                                        Conteúdo (Markdown)
                                    </label>
                                    <textarea
                                        value={block.content}
                                        onChange={(e) => handleBlockUpdate(index, 'content', e.target.value)}
                                        placeholder="Escreva o conteúdo do bloco em Markdown..."
                                        rows={6}
                                        className="w-full bg-[#092047] border border-[#0b468c]/50 rounded-lg px-4 py-3 text-white placeholder:text-[#b7c1de]/40 focus:outline-none focus:border-[#ac61b9] focus:ring-2 focus:ring-[#ac61b9]/20 transition-all resize-none font-mono text-sm"
                                    />
                                </div>

                                {/* Controls */}
                                <div className="flex flex-col gap-3 w-32">
                                    <div>
                                        <label className="block text-xs font-semibold text-[#b7c1de] mb-2">
                                            Nível
                                        </label>
                                        <div className="flex gap-1">
                                            {[1, 2, 3].map((level) => (
                                                <button
                                                    key={level}
                                                    onClick={() => handleBlockUpdate(index, 'level', level)}
                                                    className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${
                                                        block.level === level
                                                            ? 'bg-[#ac61b9] text-white'
                                                            : 'bg-[#092047] border border-[#0b468c]/50 text-[#b7c1de] hover:border-[#ac61b9]/50'
                                                    }`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleBlockDelete(index)}
                                        disabled={blocks.length <= 1}
                                        className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg font-semibold transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        Deletar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
