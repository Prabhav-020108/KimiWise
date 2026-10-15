import React, { useState } from 'react';
import { HelpCircle, Sparkles, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { useStore } from '../../store';
import { aiService } from '../../services/aiService';

export const QuizView: React.FC = () => {
  const { teacher, setActiveQuiz } = useStore();
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim() || isLoading) return;
    setIsLoading(true);
    setSelectedAnswers({});
    setShowResults(false);
    try {
      const res = await aiService.generateQuiz(topic, 3);
      if (res.quiz) {
        setActiveQuiz(res.quiz);
      }
    } catch (err) {
      console.error('Quiz generation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentQuiz = teacher.activeQuiz || {
    id: 'sample',
    title: 'Data Structures & Algorithms Basics',
    questions: [
      {
        id: 'q1',
        question: 'What is the average time complexity of searching an element in a balanced Binary Search Tree (BST)?',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
        correctIndex: 2,
        explanation: 'In a balanced BST, half of the remaining nodes are discarded at each step, yielding logarithmic O(log n) time.',
      },
    ],
  };

  return (
    <div className="w-full h-full p-4 md:p-6 max-w-3xl mx-auto space-y-6 overflow-y-auto bg-slate-50 select-none">
      {/* Quiz Generator Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <HelpCircle size={18} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">Interactive Quiz Arena</h2>
            <p className="text-[11px] text-slate-500">Generate instant multi-choice questions powered by Gemma 4.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleGenerate();
            }}
            placeholder="Enter any topic (e.g. Graph Algorithms, Python OOP, SQL Joins)..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-xs"
          />
          <button
            onClick={handleGenerate}
            disabled={!topic.trim() || isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500 disabled:opacity-40 transition-all shadow-sm shadow-blue-500/25 shrink-0 active:scale-95 cursor-pointer"
          >
            <Sparkles size={13} />
            <span>{isLoading ? 'Generating...' : 'Generate'}</span>
          </button>
        </div>
      </div>

      {/* Quiz Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-slate-900 text-sm">{currentQuiz.title}</h3>
          <span className="text-xs text-slate-400 font-semibold">{currentQuiz.questions.length} Questions</span>
        </div>

        {currentQuiz.questions.map((q, qIdx) => (
          <div
            key={q.id || qIdx}
            className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4"
          >
            <p className="text-xs font-bold text-slate-800 leading-relaxed">
              {qIdx + 1}. {q.question}
            </p>

            <div className="space-y-2">
              {q.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[qIdx] === optIdx;
                const isCorrect = q.correctIndex === optIdx;

                let stateClass =
                  'border-slate-200 bg-slate-50/60 hover:bg-blue-50/50 hover:border-blue-300 text-slate-700';
                if (showResults) {
                  if (isCorrect) {
                    stateClass = 'border-2 border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-xs';
                  } else if (isSelected) {
                    stateClass = 'border-2 border-rose-500 bg-rose-50 text-rose-900 font-medium';
                  }
                } else if (isSelected) {
                  stateClass = 'border-2 border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs';
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => {
                      if (!showResults) {
                        setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
                      }
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${stateClass}`}
                  >
                    <span>{opt}</span>
                    {showResults && isCorrect && (
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    )}
                    {showResults && isSelected && !isCorrect && (
                      <XCircle size={16} className="text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {showResults && q.explanation && (
              <p className="text-[11.5px] text-slate-600 bg-blue-50/70 p-3 rounded-xl border border-blue-200/80 leading-relaxed font-medium">
                💡 <span className="font-bold text-blue-800">Explanation:</span> {q.explanation}
              </p>
            )}
          </div>
        ))}

        <div className="flex justify-end pt-2">
          <button
            onClick={() => setShowResults(!showResults)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition-all shadow-sm shadow-blue-500/25 active:scale-95 cursor-pointer"
          >
            <span>{showResults ? 'Hide Results' : 'Check Answers'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
