import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

const features = [
  { icon: "あ", title: "Hiragana & Katakana", desc: "Aprenda os dois silabários com mnemônicos, flashcards e exercícios interativos." },
  { icon: "漢", title: "Kanji Progressivo", desc: "Kanji do JLPT N5 ao N3, apresentado com leituras, significado e exemplos em contexto." },
  { icon: "🎮", title: "Gamificação Real", desc: "XP, níveis, streak diário e badges — progresso que você vê e sente a cada sessão." },
  { icon: "🃏", title: "Revisão Espaçada (SRS)", desc: "Algoritmo SM-2 para que você nunca esqueça o que aprendeu, revisando no momento certo." },
  { icon: "📝", title: "Provas com Feedback", desc: "Mini-testes, provas de módulo e simulados JLPT com análise detalhada de erros." },
  { icon: "🇧🇷", title: "100% em Português", desc: "Todo o conteúdo em PT-BR, com exemplos contextualizados para falantes nativos." },
];

const steps = [
  { num: "01", title: "Crie sua conta grátis", desc: "Em segundos, sem cartão de crédito." },
  { num: "02", title: "Escolha sua lição", desc: "Comece pelo hiragana e avance no seu ritmo." },
  { num: "03", title: "Pratique todo dia", desc: "5-10 minutos diários são suficientes para progredir." },
  { num: "04", title: "Alcance o N3", desc: "Do zero ao intermediário com uma trilha estruturada." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-surface-900 dark:via-surface-800 dark:to-indigo-950" />
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 dark:bg-indigo-900/40 px-4 py-1.5 text-sm text-indigo-700 dark:text-indigo-300 mb-6">
            <span>🎌</span> Aprenda japonês do zero ao JLPT N3
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
            Nihongo Master
          </h1>
          <p className="text-2xl jp text-indigo-600 dark:text-indigo-400 mb-6 font-bold">日本語マスター</p>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
            O app de aprendizado de japonês mais completo em português brasileiro.
            Teoria, prática e gamificação reunidos em uma trilha progressiva do zero à fluência intermediária.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl text-lg transition-all shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5">
              Começar grátis →
            </Link>
            <Link href="/login" className="border border-slate-300 dark:border-surface-600 text-slate-700 dark:text-slate-200 font-semibold px-8 py-3.5 rounded-xl text-lg hover:bg-slate-50 dark:hover:bg-surface-700 transition-all">
              Já tenho conta
            </Link>
          </div>
          <p className="text-sm text-muted mt-4">Bloco 1 completo — Hiragana, Katakana e primeiras frases — 100% grátis</p>
        </div>

        {/* Floating kana */}
        <div className="absolute top-10 left-10 text-6xl jp text-indigo-200 dark:text-indigo-800 select-none font-bold opacity-60">あ</div>
        <div className="absolute top-20 right-12 text-5xl jp text-purple-200 dark:text-purple-900 select-none font-bold opacity-60">ア</div>
        <div className="absolute bottom-10 left-20 text-4xl jp text-indigo-300 dark:text-indigo-800 select-none font-bold opacity-50">漢</div>
        <div className="absolute bottom-16 right-8 text-5xl jp text-purple-300 dark:text-purple-900 select-none font-bold opacity-50">語</div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-2">Tudo que você precisa para aprender japonês</h2>
        <p className="text-center text-muted mb-10">Uma experiência didática completa, do silabário ao JLPT N3</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card-bg rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="text-3xl jp mb-3">{f.icon}</div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">{f.title}</h3>
              <p className="text-sm text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-indigo-50 dark:bg-surface-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-10">Como funciona</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-3">{s.num}</div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">{s.title}</h3>
                <p className="text-sm text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <p className="text-5xl jp font-bold text-indigo-600 dark:text-indigo-400 mb-4">始めよう！</p>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Pronto para começar?</h2>
          <p className="text-muted mb-8">Junte-se a milhares de estudantes brasileiros aprendendo japonês de verdade.</p>
          <Link href="/register" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-10 py-4 rounded-xl text-lg transition-all shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 inline-block">
            Criar conta grátis
          </Link>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] py-8 text-center text-sm text-muted">
        <p>© 2026 Nihongo Master · Feito com 🎌 para falantes de português</p>
      </footer>
    </div>
  );
}
