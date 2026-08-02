'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { ChevronLeft, ChevronRight, X, PenLine } from 'lucide-react';
import type { SpeechBlock } from '../types/database';

interface PresentModeProps {
    title: string;
    blocks: SpeechBlock[];
    speechId?: string;
}

export default function PresentMode({ title, blocks, speechId }: PresentModeProps) {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsHydrated(true);
    }, []);

    // Lógica simples do Cronômetro
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setTimeElapsed((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Navegação com transição
    const handleNext = useCallback(() => {
        if (currentIndex < blocks.length - 1 && !isTransitioning) {
            setDirection('forward');
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentIndex(currentIndex + 1);
                setIsTransitioning(false);
            }, 300);
        }
    }, [currentIndex, blocks.length, isTransitioning]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0 && !isTransitioning) {
            setDirection('backward');
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentIndex(currentIndex - 1);
                setIsTransitioning(false);
            }, 300);
        }
    }, [currentIndex, isTransitioning]);

    // Navegação por teclado
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    handlePrev();
                    break;
                case 'ArrowRight':
                case ' ': // Space bar
                    e.preventDefault();
                    handleNext();
                    break;
                case 'Escape':
                    e.preventDefault();
                    if (speechId) {
                        router.push(`/dashboard/edit/${speechId}`);
                    }
                    break;
                case 'Home':
                    e.preventDefault();
                    setCurrentIndex(0);
                    break;
                case 'End':
                    e.preventDefault();
                    setCurrentIndex(blocks.length - 1);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, blocks.length, speechId, handleNext, handlePrev, router]);

    if (!blocks || blocks.length === 0) {
        return <div className="p-8 text-[#b7c1de]">Nenhum conteúdo encontrado.</div>;
    }

    if (!isHydrated) {
        return (
            <div className="relative w-full h-[95dvh] bg-[#092047] text-[#b7c1de] overflow-hidden select-none font-atkinson" style={{ height: '95dvh' }}>
                <div className="flex h-full items-center justify-center px-6 text-center">
                    <p className="text-sm uppercase tracking-[0.3em] text-[#0b468c]">
                        Carregando apresentação…
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="relative w-full h-[95dvh] bg-[1a1a1a] text-[#b7c1de] overflow-hidden select-none font-atkinson" style={{ height: '95dvh' }}>
                
                {/* --- CABEÇALHO & CRONÔMETRO --- */}
                <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-40 bg-gradient-to-b from-[#092047] via-[#092047]/50 to-transparent pointer-events-auto">
                <h1 className="text-base md:text-lg font-semibold tracking-wider text-[#0b468c] uppercase truncate flex-1">
                    {title}
                </h1>
                
                <div className="flex items-center gap-4">
                    {/* Cronômetro interativo */}
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsTimerRunning(!isTimerRunning);
                        }}
                        onDoubleClick={(e) => {
                            e.stopPropagation();
                            setTimeElapsed(0);
                            setIsTimerRunning(false);
                        }}
                        className={`text-3xl font-bold font-inter tabular-nums px-5 py-2 rounded-full transition-all duration-200 ${
                            isTimerRunning 
                                ? 'text-[#ac61b9] bg-[#ac61b9]/10 animate-pulse' 
                                : 'text-[#63345e] hover:bg-[#63345e]/10'
                        }`}
                    >
                        {formatTime(timeElapsed)}
                    </button>

                    {/* Edit Button */}
                    {speechId && (
                        <button
                            onClick={() => router.push(`/dashboard/edit/${speechId}`)}
                            className="w-10 h-10 rounded-full bg-white/10 p-1 hover:bg-white/20 
                                transition-all duration-200 flex items-center justify-center"
                            aria-label="Editar discurso"
                        >
                            <PenLine className="w-4 h-4 text-[#929ab1]" />
                        </button>
                    )}
                </div>
            </div>

            {/* --- PONTOS DE PROGRESSO COM EFEITO DE BRILHO --- */}
            <div className="absolute top-20 left-0 w-full flex justify-center gap-2 z-40 px-6">
                {blocks.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                            idx === currentIndex 
                                ? 'w-10 bg-[#ac61b9] shadow-[0_0_8px_rgba(172,97,185,0.5)]' 
                                : idx < currentIndex 
                                    ? 'w-2 bg-[#ac61b9]/50' 
                                    : 'w-2 bg-[#0b468c]'
                        }`} 
                    />
                ))}
            </div>

            {/* --- ÁREA DE CONTEÚDO CENTRAL COM TRANSIÇÃO --- */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 md:p-12 lg:p-16 pb-36 pointer-events-none">
                <div className={`w-full max-w-4xl transition-all duration-300 ease-in-out ${
                    isTransitioning 
                        ? direction === 'forward' 
                            ? '-translate-x-8 opacity-0' 
                            : 'translate-x-8 opacity-0'
                        : 'translate-x-0 opacity-100'
                }`}>
                    {/* Renderização do Markdown com tipografia aprimorada */}
                    <div className="prose prose-invert max-w-none
                        prose-headings:font-bold prose-headings:text-[#ac61b9] 
                        prose-headings:mb-6 prose-headings:leading-tight
                        prose-h1:text-4xl md:prose-h1:text-5xl lg:prose-h1:text-6xl
                        prose-h2:text-3xl md:prose-h2:text-4xl lg:prose-h2:text-5xl
                        prose-h3:text-2xl md:prose-h3:text-3xl lg:prose-h3:text-4xl
                        prose-p:text-2xl md:prose-p:text-3xl lg:prose-p:text-4xl
                        prose-p:leading-[1.6] prose-p:tracking-wide prose-p:text-[#d4ddf4]
                        prose-strong:text-white prose-strong:font-extrabold
                        prose-li:text-2xl md:prose-li:text-3xl lg:prose-li:text-4xl
                        prose-li:mb-4
                        prose-ul:mb-8 prose-ol:mb-8
                    ">
                        <ReactMarkdown>
                            {blocks[currentIndex].content}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
            </div>

            {/* --- BOTTOM NAVIGATION BAR --- */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#092047]/95 border-t border-[#0b468c]/30 border pointer-events-auto">
                <div className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
                    
                    {/* Previous Button */}
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="flex items-center gap-2 px-4 py-2 rounded-full 
                            bg-[#ac61b9]/20 hover:bg-[#ac61b9]/30 text-[#b7c1de]
                            transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed
                            border border-[#ac61b9]/30 disabled:bg-[#0b468c]/10 disabled:border-[#0b468c]/20"
                        aria-label="Bloco anterior"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">Anterior</span>
                    </button>

                    {/* Progress Indicator */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="font-inter text-xl tabular-nums">
                            <span className="text-[#ac61b9] font-bold">{currentIndex + 1}</span>
                            <span className="text-[#0b468c] mx-2">/</span>
                            <span className="text-[#b7c1de]">{blocks.length}</span>
                        </div>
                        {/* Mini progress bar */}
                        <div className="w-32 h-1 bg-[#0b468c]/30 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-[#ac61b9] transition-all duration-300"
                                style={{ width: `${((currentIndex + 1) / blocks.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Next Button */}
                    <button
                        onClick={handleNext}
                        disabled={currentIndex === blocks.length - 1}
                        className="flex items-center gap-2 px-4 py-2 rounded-full 
                            bg-[#ac61b9]/20 hover:bg-[#ac61b9]/30 text-[#b7c1de]
                            transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed
                            border border-[#ac61b9]/30 disabled:bg-[#0b468c]/10 disabled:border-[#0b468c]/20"
                        aria-label="Próximo bloco"
                    >
                        <span className="text-sm font-medium">Próximo</span>
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </>
    );
}
