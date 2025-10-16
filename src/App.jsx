import React, { useState, useEffect, useRef } from "react";
import QUESTION_BANK from "./data/questions.js";

// Quiz Divertido — single-file React component (Tailwind CSS)
// Recursos:
// - 10 perguntas aleatórias de um banco maior
// - Barra de progresso, pontuação e feedback imediato
// - Timer por pergunta (opcional, pode desligar)
// - Acessível: atalhos 1-4 para alternativas, Enter para confirmar/avançar
// - Design simples e moderno com Tailwind

// 💡 Função para escolher perguntas aleatórias sem repetição
function getRandomQuestions(bank, count = 10) {
  const shuffled = [...bank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const TIMER_PER_QUESTION = 30; // segundos

export default function QuizDivertido() {
  // escolhe 10 perguntas aleatórias ao iniciar ou ao reiniciar o quiz
  const [questions, setQuestions] = useState(() => getRandomQuestions(QUESTION_BANK));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_PER_QUESTION);
  const [useTimer, setUseTimer] = useState(true);
  const confirmRef = useRef(null);

  const current = questions[index];
  const total = questions.length;
  const progress = ((index + (showFeedback !== null ? 1 : 0)) / total) * 100;

  // Timer
  useEffect(() => {
    if (!useTimer || showFeedback !== null) return;
    if (timeLeft <= 0) {
      setShowFeedback(false);
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, useTimer, showFeedback]);

  // Reset timer quando troca de pergunta
  useEffect(() => {
    setTimeLeft(TIMER_PER_QUESTION);
    setSelected(null);
    setShowFeedback(null);
  }, [index]);

  // Atalhos de teclado (1-4, Enter)
  useEffect(() => {
    const onKey = (e) => {
      if (showFeedback === null) {
        if (["1", "2", "3", "4"].includes(e.key)) {
          const i = Number(e.key) - 1;
          if (i >= 0 && i < current.options.length) {
            setSelected(i);
          }
        }
        if (e.key === "Enter") {
          handleConfirm();
        }
      } else if (e.key === "Enter") {
        handleNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showFeedback, current]);

  function handleConfirm() {
    if (showFeedback !== null) return;
    if (selected === null) return;
    const correct = selected === current.answer;
    setShowFeedback(correct);
    if (correct) setScore((s) => s + 1);
    // foca no botão para enter avançar
    setTimeout(() => confirmRef.current?.focus(), 0);
  }

  function handleNext() {
    if (index + 1 < total) {
      setIndex((i) => i + 1);
    }
  }

  // ✅ Apenas esta versão de resetAll deve existir
  function resetAll() {
    setQuestions(getRandomQuestions(QUESTION_BANK)); // novo conjunto aleatório
    setIndex(0);
    setScore(0);
    setSelected(null);
    setShowFeedback(null);
    setTimeLeft(TIMER_PER_QUESTION);
  }

  const finished = index === total - 1 && showFeedback !== null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Quiz Divertido - Perdix</h1>
          <div className="flex items-center gap-2 text-sm">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-600 bg-slate-700"
                checked={useTimer}
                onChange={(e) => setUseTimer(e.target.checked)}
              />
              Timer
            </label>
            <span className="px-2 py-1 rounded-full bg-slate-700/60">Pontuação: {score}</span>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-white/80 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Card */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl shadow-xl p-5 md:p-6">
          {/* Timer */}
          {useTimer && showFeedback === null && (
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm opacity-80">Tempo restante</div>
              <div className="font-mono text-lg">{timeLeft}s</div>
            </div>
          )}

          {/* Pergunta */}
          <div className="mb-4">
            <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">
              Pergunta {index + 1} de {total}
            </div>
            <div className="text-lg md:text-xl font-semibold">{current.q}</div>
          </div>

          {/* Alternativas */}
          <div className="grid gap-3">
            {current.options.map((opt, i) => {
              const isChosen = selected === i;
              const isCorrect = showFeedback !== null && i === current.answer;
              const isWrong = showFeedback === false && isChosen && i !== current.answer;
              return (
                <button
                  key={i}
                  onClick={() => showFeedback === null && setSelected(i)}
                  className={[
                    "w-full text-left px-4 py-3 rounded-xl border transition focus:outline-none focus:ring-2",
                    isCorrect
                      ? "bg-emerald-500/10 border-emerald-400/60 ring-emerald-300"
                      : isWrong
                      ? "bg-rose-500/10 border-rose-400/60 ring-rose-300"
                      : isChosen
                      ? "bg-white/5 border-white/40 ring-white/40"
                      : "bg-slate-800/60 border-white/10 hover:bg-slate-700/50",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex-1 pr-4">
                      <span className="mr-2 opacity-70">{i + 1}.</span>
                      {opt}
                    </span>
                    {isCorrect && (
                      <span className="text-emerald-300 text-sm">✔ Correta</span>
                    )}
                    {isWrong && (
                      <span className="text-rose-300 text-sm">✖ Errada</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback / Ações */}
          <div className="mt-5 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
            <div className="text-sm text-slate-300 min-h-[1.5rem]">
              {showFeedback !== null ? (
                <span>
                  {showFeedback ? "Boa!" : "Quase!"} {current.fact}
                </span>
              ) : (
                <span className="opacity-80">Selecione uma alternativa e confirme.</span>
              )}
            </div>

            <div className="flex gap-2">
              {showFeedback === null ? (
                <button
                  ref={confirmRef}
                  onClick={handleConfirm}
                  disabled={selected === null}
                  className="px-4 py-2 rounded-xl bg-white text-slate-900 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                >
                  Confirmar (Enter)
                </button>
              ) : finished ? (
                <button
                  onClick={resetAll}
                  className="px-4 py-2 rounded-xl bg-white text-slate-900 font-medium hover:opacity-90"
                >
                  Jogar de novo
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 rounded-xl bg-white text-slate-900 font-medium hover:opacity-90"
                >
                  Próxima (Enter)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Resultado final */}
        {finished && (
          <div className="mt-6 bg-slate-900/60 border border-white/10 rounded-2xl p-5">
            <h2 className="text-xl font-bold mb-1">Resultado</h2>
            <p className="text-slate-300 mb-3">
              Você marcou <span className="font-semibold">{score}</span> de {total}.
              {score === total
                ? " Perfeito! Você é uma lenda."
                : score >= total * 0.7
                ? " Mandou muito bem!"
                : score >= total * 0.4
                ? " Dá pra melhorar, bora de novo?"
                : " Todo mundo começa de algum lugar!"}
            </p>
            <div className="flex gap-2">
              <button
                onClick={resetAll}
                className="px-4 py-2 rounded-xl bg-white text-slate-900 font-medium hover:opacity-90"
              >
                Jogar novamente
              </button>
            </div>
          </div>
        )}

        {/* Rodapé */}
        <footer className="mt-6 text-xs text-slate-400 text-center">
          Dica: use as teclas <span className="font-mono">1–4</span> para marcar e <span className="font-mono">Enter</span> para confirmar/avançar.
        </footer>
      </div>
    </div>
  );
}
