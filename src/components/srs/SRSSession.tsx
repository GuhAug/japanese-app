"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";

type SRSItem = { id: string; type: string };

// Derive the display character from itemId
function getCharacter(itemId: string): { front: string; back: string } {
  const kanaMap: Record<string, string> = {
    "hira-a":"あ","hira-i":"い","hira-u":"う","hira-e":"え","hira-o":"お",
    "hira-ka":"か","hira-ki":"き","hira-ku":"く","hira-ke":"け","hira-ko":"こ",
    "hira-sa":"さ","hira-shi":"し","hira-su":"す","hira-se":"せ","hira-so":"そ",
    "hira-ta":"た","hira-chi":"ち","hira-tsu":"つ","hira-te":"て","hira-to":"と",
    "hira-na":"な","hira-ni":"に","hira-nu":"ぬ","hira-ne":"ね","hira-no":"の",
    "hira-ha":"は","hira-hi":"ひ","hira-fu":"ふ","hira-he":"へ","hira-ho":"ほ",
    "hira-ma":"ま","hira-mi":"み","hira-mu":"む","hira-me":"め","hira-mo":"も",
    "hira-ya":"や","hira-yu":"ゆ","hira-yo":"よ",
    "hira-ra":"ら","hira-ri":"り","hira-ru":"る","hira-re":"れ","hira-ro":"ろ",
    "hira-wa":"わ","hira-wo":"を","hira-n":"ん",
    "hira-ga":"が","hira-gi":"ぎ","hira-gu":"ぐ","hira-ge":"げ","hira-go":"ご",
    "hira-za":"ざ","hira-ji":"じ","hira-zu":"ず","hira-ze":"ぜ","hira-zo":"ぞ",
    "hira-da":"だ","hira-de":"で","hira-do":"ど",
    "hira-ba":"ば","hira-bi":"び","hira-bu":"ぶ","hira-be":"べ","hira-bo":"ぼ",
    "hira-pa":"ぱ","hira-pi":"ぴ","hira-pu":"ぷ","hira-pe":"ぺ","hira-po":"ぽ",
    "hira-kya":"きゃ","hira-kyu":"きゅ","hira-kyo":"きょ",
    "hira-sha":"しゃ","hira-shu":"しゅ","hira-sho":"しょ",
    "hira-cha":"ちゃ","hira-chu":"ちゅ","hira-cho":"ちょ",
    "hira-nya":"にゃ","hira-nyu":"にゅ","hira-nyo":"にょ",
    "hira-hya":"ひゃ","hira-hyu":"ひゅ","hira-hyo":"ひょ",
    "hira-mya":"みゃ","hira-myu":"みゅ","hira-myo":"みょ",
    "hira-rya":"りゃ","hira-ryu":"りゅ","hira-ryo":"りょ",
    "kata-a":"ア","kata-i":"イ","kata-u":"ウ","kata-e":"エ","kata-o":"オ",
    "kata-ka":"カ","kata-ki":"キ","kata-ku":"ク","kata-ke":"ケ","kata-ko":"コ",
    "kata-sa":"サ","kata-shi":"シ","kata-su":"ス","kata-se":"セ","kata-so":"ソ",
    "kata-ta":"タ","kata-chi":"チ","kata-tsu":"ツ","kata-te":"テ","kata-to":"ト",
    "kata-na":"ナ","kata-ni":"ニ","kata-nu":"ヌ","kata-ne":"ネ","kata-no":"ノ",
    "kata-ha":"ハ","kata-hi":"ヒ","kata-fu":"フ","kata-he":"ヘ","kata-ho":"ホ",
    "kata-ma":"マ","kata-mi":"ミ","kata-mu":"ム","kata-me":"メ","kata-mo":"モ",
    "kata-ya":"ヤ","kata-yu":"ユ","kata-yo":"ヨ",
    "kata-ra":"ラ","kata-ri":"リ","kata-ru":"ル","kata-re":"レ","kata-ro":"ロ",
    "kata-wa":"ワ","kata-wo":"ヲ","kata-n":"ン",
  };
  const vocabMap: Record<string, [string, string]> = {
    "vocab-ohayou":["おはよう","Ohayou (Bom dia)"],
    "vocab-konnichiwa":["こんにちは","Konnichiwa (Boa tarde)"],
    "vocab-konbanwa":["こんばんは","Konbanwa (Boa noite)"],
    "vocab-oyasumi":["おやすみ","Oyasumi (Boa noite / dormir)"],
    "vocab-sayounara":["さようなら","Sayounara (Tchau)"],
    "vocab-mata":["またね","Mata ne (Até logo)"],
    "vocab-arigatou":["ありがとう","Arigatou (Obrigado)"],
    "vocab-sumimasen":["すみません","Sumimasen (Com licença)"],
    "vocab-gomen":["ごめんなさい","Gomen nasai (Desculpe)"],
    "vocab-douitashimashite":["どういたしまして","Dou itashimashite (De nada)"],
    "vocab-onegaishimasu":["おねがいします","Onegaishimasu (Por favor)"],
    "vocab-hai":["はい","Hai (Sim)"],
    "vocab-iie":["いいえ","Iie (Não)"],
    "vocab-hajimemashite":["はじめまして","Hajimemashite (Prazer)"],
    "vocab-watashi":["わたし","Watashi (Eu)"],
    "vocab-namae":["なまえ","Namae (Nome)"],
    "vocab-desu":["です","Desu (É/Sou)"],
    "vocab-yoroshiku":["よろしく","Yoroshiku (Conto com você)"],
    "vocab-1":["いち","Ichi (1)"],"vocab-2":["に","Ni (2)"],"vocab-3":["さん","San (3)"],
    "vocab-4":["よん","Yon (4)"],"vocab-5":["ご","Go (5)"],"vocab-6":["ろく","Roku (6)"],
    "vocab-7":["なな","Nana (7)"],"vocab-8":["はち","Hachi (8)"],"vocab-9":["きゅう","Kyuu (9)"],
    "vocab-10":["じゅう","Juu (10)"],
  };

  if (kanaMap[itemId]) {
    const romaji = itemId.replace(/^(hira|kata)-/, "");
    return { front: kanaMap[itemId], back: romaji };
  }
  if (vocabMap[itemId]) {
    return { front: vocabMap[itemId][0], back: vocabMap[itemId][1] };
  }
  return { front: itemId, back: "?" };
}

export function SRSSession({ initialItems }: { initialItems: SRSItem[] }) {
  const router = useRouter();
  const [items] = useState(initialItems);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);
  const [finished, setFinished] = useState(false);

  if (initialItems.length === 0) {
    return (
      <div className="max-w-md mx-auto p-6 text-center animate-fade-in">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Sem revisões pendentes!</h1>
        <p className="text-muted mb-6">Você está em dia com suas revisões. Continue as lições para adicionar novos itens.</p>
        <Button onClick={() => router.push("/dashboard")}>Voltar ao início</Button>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="max-w-md mx-auto p-6 text-center animate-bounce-in">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Revisão Concluída!</h1>
        <p className="text-muted mb-2">{done} cartões revisados</p>
        <p className="text-sm text-gold-500 mb-6">+{done * 3} XP ganhos</p>
        <Button onClick={() => router.push("/dashboard")} className="w-full">Voltar ao início</Button>
      </div>
    );
  }

  const current = items[index];
  const { front, back } = getCharacter(current.id);
  const progress = Math.round((index / items.length) * 100);

  async function handleQuality(quality: number) {
    await fetch("/api/srs/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: current.id, quality }),
    });
    setDone(d => d + 1);
    if (index + 1 >= items.length) {
      setFinished(true);
    } else {
      setIndex(i => i + 1);
      setFlipped(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-muted hover:text-slate-700 dark:hover:text-slate-200">←</button>
        <div className="flex-1"><ProgressBar value={progress} size="sm" color="indigo" /></div>
        <span className="text-xs text-muted">{index + 1}/{items.length}</span>
      </div>

      <div className="text-center mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          {current.type === "hiragana" ? "ひ Hiragana" : current.type === "katakana" ? "カ Katakana" : "📝 Vocabulário"}
        </span>
      </div>

      {/* Card */}
      <div
        className="card-bg rounded-2xl p-8 text-center cursor-pointer mb-6 min-h-40 flex items-center justify-center hover:shadow-md transition-all"
        onClick={() => setFlipped(!flipped)}
      >
        <p className="text-6xl jp font-bold text-slate-900 dark:text-white">{flipped ? back : front}</p>
      </div>

      {!flipped ? (
        <p className="text-center text-sm text-muted mb-4">Clique no cartão para ver a resposta</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => handleQuality(0)} className="py-3 rounded-xl border-2 border-red-300 text-red-600 dark:text-red-400 font-medium text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            😵 Errei
          </button>
          <button onClick={() => handleQuality(2)} className="py-3 rounded-xl border-2 border-orange-300 text-orange-500 dark:text-orange-400 font-medium text-sm hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
            😓 Difícil
          </button>
          <button onClick={() => handleQuality(4)} className="py-3 rounded-xl border-2 border-emerald-400 text-emerald-600 dark:text-emerald-400 font-medium text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
            😊 Bom
          </button>
          <button onClick={() => handleQuality(5)} className="py-3 rounded-xl border-2 border-indigo-400 text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
            🌟 Fácil
          </button>
        </div>
      )}
    </div>
  );
}
