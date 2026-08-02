import type { Metadata } from 'next';
import { Inter, Atkinson_Hyperlegible } from 'next/font/google';
import './globals.css'; // Este ficheiro deve ter as diretivas @tailwind base, components, utilities

// Configuração otimizada das fontes
const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter' 
});

const atkinson = Atkinson_Hyperlegible({ 
  weight: ['400', '700'], 
  subsets: ['latin'], 
  variable: '--font-atkinson' 
});

export const metadata: Metadata = {
  title: 'Oratoria',
  description: 'A sua ferramenta pessoal para discursos impecáveis.',
  icons: {
    icon: '/favicon.ico', // path relative to public/
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Injetamos as variáveis CSS das fontes diretamente na tag HTML
    <html lang="pt-PT" className={`${inter.variable} ${atkinson.variable}`}>
      {/* O fundo global escuro para evitar "flashes" brancos ao carregar a página */}
      <body className="bg-[#1a1a1a] text-[#b7c1de] min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}