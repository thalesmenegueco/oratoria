'use client';

import { useState } from 'react';
import { signUp } from '../../actions/auth.actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('As palavras-passe não coincidem.');
            setLoading(false);
            return;
        }

        // Validate password length
        if (password.length < 6) {
            setError('A palavra-passe deve ter pelo menos 6 caracteres.');
            setLoading(false);
            return;
        }

        try {
            const result = await signUp(email, password);
            if (result?.error) {
                setError(result.error);
            } else if (result?.success) {
                setSuccess(true);
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
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
                    <p className="text-[#b7c1de]">Crie a sua conta</p>
                </div>

                <div className="bg-[#092047] border border-[#0b468c]/30 rounded-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm">
                                Conta criada com sucesso! A redirecionar para o login...
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

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#b7c1de] mb-2">
                                Confirmar palavra-passe
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#0b468c]/30 rounded-lg text-white focus:outline-none focus:border-[#ac61b9] transition-colors"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || success}
                            className="w-full bg-[#0b468c] hover:bg-[#0b468c]/80 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'A criar conta...' : 'Criar Conta'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-[#b7c1de] text-sm">
                            Já tem conta?{' '}
                            <Link href="/login" className="text-[#ac61b9] hover:underline font-semibold">
                                Entrar
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
