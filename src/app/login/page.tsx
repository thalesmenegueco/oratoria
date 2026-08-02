'use client';

import { useState } from 'react';
import { signIn } from '../../actions/auth.actions';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn(email, password);
            if (result?.error) {
                setError(result.error);
            }
        } catch {
            setError('Ocorreu um erro. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#092047] px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2 font-atkinson">
                        Oratoria
                    </h1>
                    <p className="text-[#b7c1de]">Entre na sua conta</p>
                </div>

                <div className="bg-[#092047] border border-[#0b468c]/30 rounded-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[#b7c1de] mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#0b468c]/30 rounded-lg text-white focus:outline-none focus:border-[#ac61b9] transition-colors"
                                placeholder="seu@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[#b7c1de] mb-2">
                                Palavra-passe
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#0b468c]/30 rounded-lg text-white focus:outline-none focus:border-[#ac61b9] transition-colors"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0b468c] hover:bg-[#0b468c]/80 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'A entrar...' : 'Entrar'}
                        </button>
                    </form>
                    
                    {/*<div className="mt-6 text-center">
                        <p className="text-[#b7c1de] text-sm">
                            Não tem conta?{' '}
                            <Link href="/signup" className="text-[#ac61b9] hover:underline font-semibold">
                                Criar conta
                            </Link>
                        </p>
                    </div>*/}
                </div>
            </div>
        </div>
    );
}
