import { createClient } from '../utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  
  // If user is authenticated, redirect to dashboard
  if (user) {
    redirect('/dashboard');
  }
  
  // If not authenticated, show welcome page
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#092047]">
      <div className="text-center max-w-2xl px-8">
        <h1 className="text-5xl font-bold text-white mb-4 font-atkinson">
          Oratoria
        </h1>
        <p className="text-xl text-[#b7c1de] mb-8">
          A sua ferramenta pessoal para discursos impecáveis.
        </p>
        <div className="space-y-4">
          <p className="text-[#b7c1de]/70">
            Organize os seus discursos, pratique com confiança e apresente com excelência.
          </p>
          <div className="mt-8">
            <a 
              href="/login" 
              className="inline-block bg-[#0b468c] hover:bg-[#0b468c]/80 text-white px-8 py-4 rounded-lg font-semibold transition-colors text-lg"
            >
              Entrar no Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
