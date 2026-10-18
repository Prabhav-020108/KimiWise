import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  Trophy,
  X,
  Loader2,
  Share2,
  User,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '../../store';
import { aiService } from '../../services/aiService';
import type { Quiz, QuizQuestion, QuizSubmissionRecord } from '../../types';

interface QuizToolProps {
  embedded?: boolean;
  initialTopic?: string;
  onClose?: () => void;
  onSendToBoard?: (quiz: Quiz) => void;
}

export const QuizTool: React.FC<QuizToolProps> = ({
  embedded = false,
  initialTopic = '',
  onClose,
  onSendToBoard,
}) => {
  const { teacher, setActiveQuiz, setActiveView, recordQuizSubmission, setActiveStudentId } = useStore();
  const [topic, setTopic] = useState(initialTopic || '');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('High School');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<QuizSubmissionRecord | null>(null);

  const activeStudent =
    teacher.students.find((s) => s.id === (teacher.activeStudentId || 's1')) ||
    teacher.students[0] || {
      id: 's1',
      name: 'Aarav Sharma',
      avgScore: 92,
      quizzesCompleted: 6,
    };

  const quickTopics = [
    'Graph Algorithms & Trees',
    'Python OOP & Classes',
    'SQL Joins & Indexing',
    'Time & Space Complexity',
    'Web Security (XSS & CSRF)',
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim() || isLoading) return;

    setIsLoading(true);
    setSelectedAnswers({});
    setShowResults(false);
    setLastSubmission(null);

    try {
      const res = await aiService.generateQuiz(topic.trim(), questionCount);
      if (res.quiz) {
        const rawQuiz = res.quiz as any;
        const formattedQuiz: Quiz = {
          id: `quiz_${Date.now()}`,
          title: rawQuiz.title || `${topic} Quiz`,
          questions: (rawQuiz.questions || []).map((q: any) => ({
            type: 'multiple_choice',
            question: q.question,
            options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
            correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
            expectedAnswer: q.explanation || q.expectedAnswer,
          })),
          createdAt: Date.now(),
        };

        setActiveQuiz(formattedQuiz);
      }
    } catch (err) {
      console.error('Quiz generation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentQuiz: Quiz = teacher.activeQuiz || {
    id: 'sample',
    title: 'Data Structures & Algorithms Basics',
    questions: [
      {
        type: 'multiple_choice',
        question:
          'What is the average time complexity of searching an element in a balanced Binary Search Tree (BST)?',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
        correctIndex: 2,
        expectedAnswer:
          'In a balanced BST, half of the remaining nodes are discarded at each step, yielding logarithmic O(log n) time.',
      },
      {
        type: 'multiple_choice',
        question:
          'Which data structure uses the Last-In, First-Out (LIFO) principle?',
        options: ['Queue', 'Stack', 'Linked List', 'Hash Map'],
        correctIndex: 1,
        expectedAnswer:
          'A Stack operates on a LIFO basis where the last element inserted is the first one removed.',
      },
      {
        type: 'multiple_choice',
        question:
          'What happens if a recursive function does not define a valid base case?',
        options: [
          'It compiles with a warning',
          'It triggers a Stack Overflow runtime error',
          'It returns 0 by default',
          'It executes in O(1) time',
        ],
        correctIndex: 1,
        expectedAnswer:
          'Without a base case, recursion proceeds infinitely until the call stack memory limit is exceeded, crashing with a Stack Overflow.',
      },
    ],
    createdAt: Date.now(),
  };

  // Calculate score
  const totalQuestions = currentQuiz.questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  let correctCount = 0;
  if (showResults) {
    currentQuiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });
  }
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const handleRetake = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setLastSubmission(null);
  };

  const handleCheckAnswers = () => {
    if (!showResults) {
      let calculatedCorrect = 0;
      currentQuiz.questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctIndex) {
          calculatedCorrect++;
        }
      });
      const calculatedPercent =
        totalQuestions > 0 ? Math.round((calculatedCorrect / totalQuestions) * 100) : 0;

      const record = recordQuizSubmission({
        studentId: activeStudent.id,
        studentName: activeStudent.name,
        quizTitle: currentQuiz.title,
        topic: topic.trim() || currentQuiz.title.replace(/ Quiz$/i, '') || 'Computer Science',
        scorePercent: calculatedPercent,
        correctCount: calculatedCorrect,
        totalQuestions,
      });

      setLastSubmission(record);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleSendToWhiteboard = () => {
    if (onSendToBoard) {
      onSendToBoard(currentQuiz);
    } else {
      setActiveView('board');
    }
  };

  return (
    <div
      className={`flex flex-col space-y-5 select-none ${
        embedded ? 'p-2' : 'w-full h-full p-4 md:p-6 max-w-3xl mx-auto overflow-y-auto bg-slate-50'
      }`}
    >
      {/* ── Header Banner ─────────────────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-xs">
              <HelpCircle size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Interactive Quiz Arena
                </h2>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">
                  Gemma 4 Assessment
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Generate instant multi-choice assessments with automated grading and explanations.
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Student Active Taker Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <User size={13} />
            </div>
            <span className="text-slate-600 font-semibold text-xs">Active Student:</span>
            <select
              value={activeStudent.id}
              onChange={(e) => setActiveStudentId(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-xs"
            >
              {teacher.students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} (Avg: {st.avgScore || 0}%)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium self-end sm:self-auto">
            <span>{activeStudent.quizzesCompleted || 0} Quizzes completed</span>
            <span>•</span>
            <span className="font-bold text-slate-700">{activeStudent.avgScore || 0}% Class Mastery</span>
          </div>
        </div>

        {/* Generator Controls */}
        <form onSubmit={handleGenerate} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter topic (e.g. Graph Algorithms, Python OOP, SQL Joins)..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-xs"
            />

            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
            >
              <option value={3}>3 Questions</option>
              <option value={5}>5 Questions</option>
              <option value={8}>8 Questions</option>
            </select>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
            >
              <option value="Middle School">Middle School</option>
              <option value="High School">High School</option>
              <option value="Undergraduate">College / Advanced</option>
            </select>

            <button
              type="submit"
              disabled={!topic.trim() || isLoading}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500 disabled:opacity-40 transition-all shadow-sm shadow-blue-500/25 shrink-0 active:scale-95 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  <span>Generate Quiz</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Starter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Suggestions:
            </span>
            {quickTopics.map((qt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTopic(qt)}
                className={`text-[10.5px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
                  topic === qt
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
                }`}
              >
                {qt}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* ── Score Mastery Banner (when results checked) ────────────────────── */}
      {showResults && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-lg border shadow-xs shrink-0 mt-0.5 ${
                scorePercent >= 80
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : scorePercent >= 60
                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                  : 'bg-amber-50 text-amber-600 border-amber-200'
              }`}
            >
              <Trophy size={20} />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-black text-slate-900">
                  Score: {correctCount} / {totalQuestions} ({scorePercent}%)
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    scorePercent >= 80
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : scorePercent >= 60
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {scorePercent >= 80 ? 'Mastery Achieved' : scorePercent >= 60 ? 'Competent' : 'Needs Practice'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {scorePercent >= 80
                  ? 'Outstanding performance! You have grasped this topic thoroughly.'
                  : 'Review the explanations below to solidify your understanding.'}
              </p>

              {/* Real-time Teacher Analytics Sync Notification */}
              <div className="flex flex-wrap items-center gap-2 pt-1.5 text-[11px]">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Synced to Teacher Hub for {lastSubmission?.studentName || activeStudent.name}
                </span>
                <span className="text-slate-500 font-medium">
                  {scorePercent >= 80
                    ? `✓ Topic "${lastSubmission?.topic || topic || 'Concepts'}" recorded in Strengths`
                    : `⚠️ Topic "${lastSubmission?.topic || topic || 'Concepts'}" recorded in Needs Practice`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <button
              onClick={() => setActiveView('teacher')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <span>View in Teacher Hub</span>
              <ExternalLink size={12} />
            </button>
            <button
              onClick={handleRetake}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs transition-all cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Retake</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Quiz Content & Questions ───────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-slate-900 text-sm">{currentQuiz.title}</h3>
          <span className="text-xs text-slate-400 font-semibold">
            {answeredCount} of {totalQuestions} Answered
          </span>
        </div>

        {currentQuiz.questions.map((q: QuizQuestion, qIdx: number) => (
          <div
            key={qIdx}
            className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3.5"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-bold text-slate-800 leading-relaxed">
                {qIdx + 1}. {q.question}
              </p>
              {showResults && (
                <span className="shrink-0 mt-0.5">
                  {selectedAnswers[qIdx] === q.correctIndex ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={11} /> Correct
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <XCircle size={11} /> Incorrect
                    </span>
                  )}
                </span>
              )}
            </div>

            <div className="space-y-2">
              {(q.options || []).map((opt: string, optIdx: number) => {
                const isSelected = selectedAnswers[qIdx] === optIdx;
                const isCorrect = q.correctIndex === optIdx;

                let stateClass =
                  'border-slate-200 bg-slate-50/60 hover:bg-blue-50/50 hover:border-blue-300 text-slate-700';

                if (showResults) {
                  if (isCorrect) {
                    stateClass =
                      'border-2 border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-xs';
                  } else if (isSelected) {
                    stateClass =
                      'border-2 border-rose-500 bg-rose-50 text-rose-900 font-medium';
                  }
                } else if (isSelected) {
                  stateClass =
                    'border-2 border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs';
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

            {/* Explanation callout */}
            {showResults && q.expectedAnswer && (
              <p className="text-[11.5px] text-slate-600 bg-blue-50/70 p-3 rounded-xl border border-blue-200/80 leading-relaxed font-medium">
                💡 <span className="font-bold text-blue-800">Explanation:</span> {q.expectedAnswer}
              </p>
            )}
          </div>
        ))}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleSendToWhiteboard}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Share2 size={13} className="text-blue-600" />
            <span>Send to Whiteboard</span>
          </button>

          <button
            onClick={handleCheckAnswers}
            disabled={answeredCount === 0 && !showResults}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 disabled:opacity-40 transition-all shadow-sm shadow-blue-500/25 active:scale-95 cursor-pointer"
          >
            <span>{showResults ? 'Hide Results' : 'Check Answers'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizTool;
