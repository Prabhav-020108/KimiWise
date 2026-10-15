import React, { useState } from 'react';
import { HelpCircle, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
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
    <div className="w-full h-full p-4 md:p-6 max-w-3xl mx-auto space-y-6 overflow-y-auto">
      {/* Quiz Generator Bar */}
      <div className="p-5 rounded-2xl bg-card/60 backdrop-blur-md border border-border/80 shadow-sm space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <HelpCircle size={17} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Interactive Quiz Arena</h2>
            <p className="text-[11px] text-muted-foreground">Generate instant multi-choice questions powered by Gemma 4.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter any topic (e.g. Graph Algorithms, Python OOP, SQL Joins)..."
            className="flex-1 bg-muted/40 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
          />
          <button
            onClick={handleGenerate}
            disabled={!topic.trim() || isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-40 transition-all shadow-xs shrink-0"
          >
            <Sparkles size={13} />
            <span>{isLoading ? 'Generating...' : 'Generate'}</span>
          </button>
        </div>
      </div>

      {/* Quiz Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-foreground text-sm">{currentQuiz.title}</h3>
          <span className="text-xs text-muted-foreground">{currentQuiz.questions.length} Questions</span>
        </div>

        {currentQuiz.questions.map((q, qIdx) => (
          <div key={q.id || qIdx} className="p-5 rounded-2xl border border-border/80 bg-card/40 backdrop-blur-md space-y-3">
            <p className="text-xs font-semibold text-foreground leading-relaxed">
              {qIdx + 1}. {q.question}
            </p>

            <div className="space-y-2">
              {q.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[qIdx] === optIdx;
                const isCorrect = q.correctIndex === optIdx;

                let stateClass = 'hover:border-primary/50 text-foreground border-border/60 bg-muted/20';
                if (showResults) {
                  if (isCorrect) stateClass = 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400 font-semibold';
                  else if (isSelected) stateClass = 'border-rose-500/60 bg-rose-500/10 text-rose-400';
                } else if (isSelected) {
                  stateClass = 'border-primary bg-primary/10 text-primary font-semibold';
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => {
                      if (!showResults) {
                        setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
                      }
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${stateClass}`}
                  >
                    <span>{opt}</span>
                    {showResults && isCorrect && <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />}
                    {showResults && isSelected && !isCorrect && <XCircle size={15} className="text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {showResults && q.explanation && (
              <p className="text-[11px] text-muted-foreground bg-muted/30 p-2.5 rounded-xl border border-border/40">
                💡 {q.explanation}
              </p>
            )}
          </div>
        ))}

        <div className="flex justify-end pt-2">
          <button
            onClick={() => setShowResults(!showResults)}
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/90 transition-all shadow-sm"
          >
            {showResults ? 'Hide Results' : 'Check Answers'}
          </button>
        </div>
      </div>
    </div>
  );
};
