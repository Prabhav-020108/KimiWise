import React, { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Plus,
  Search,
  BookOpen,
  X,
  Loader2,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import { useStore } from '../../store';
import { aiService } from '../../services/aiService';
import { StudentCard } from './StudentCard';
import type { StudentProgress, TeacherInsight } from '../../types';

interface TeacherDashboardProps {
  onOpenLessonPlanner?: () => void;
  onTargetedQuiz?: (topic: string) => void;
}

const DEFAULT_DEMO_STUDENTS: StudentProgress[] = [
  {
    id: 's1',
    name: 'Aarav Sharma',
    avatar: '',
    quizzesCompleted: 6,
    avgScore: 92,
    lastActive: Date.now() - 1000 * 60 * 30,
    strengths: ['Arrays', 'Functions', 'Hash Maps'],
    areasToImprove: ['Recursion'],
  },
  {
    id: 's2',
    name: 'Diya Patel',
    avatar: '',
    quizzesCompleted: 5,
    avgScore: 85,
    lastActive: Date.now() - 1000 * 60 * 90,
    strengths: ['Conditional Logic', 'Strings'],
    areasToImprove: ['Time Complexity', 'Big-O'],
  },
  {
    id: 's3',
    name: 'Rohan Verma',
    avatar: '',
    quizzesCompleted: 3,
    avgScore: 68,
    lastActive: Date.now() - 1000 * 60 * 120,
    strengths: ['Basic Syntax', 'Variables'],
    areasToImprove: ['Pointers', 'Memory Allocation', 'Nested Loops'],
  },
  {
    id: 's4',
    name: 'Ananya Iyer',
    avatar: '',
    quizzesCompleted: 7,
    avgScore: 95,
    lastActive: Date.now() - 1000 * 60 * 15,
    strengths: ['Binary Trees', 'Sorting Algorithms', 'OOP'],
    areasToImprove: ['Dynamic Programming'],
  },
  {
    id: 's5',
    name: 'Kabir Mehta',
    avatar: '',
    quizzesCompleted: 4,
    avgScore: 74,
    lastActive: Date.now() - 1000 * 60 * 200,
    strengths: ['Loops', 'List Comprehensions'],
    areasToImprove: ['Recursion', 'Base Cases'],
  },
];

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onOpenLessonPlanner,
  onTargetedQuiz,
}) => {
  const { teacher, setStudents, setInsights } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'needsHelp' | 'highAchievers'>('all');
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentScore, setNewStudentScore] = useState(80);
  const [newStudentWeakTopics, setNewStudentWeakTopics] = useState('');

  // Initialize demo students if store is empty
  useEffect(() => {
    if (!teacher.students || teacher.students.length === 0) {
      setStudents(DEFAULT_DEMO_STUDENTS);
    }
  }, [teacher.students, setStudents]);

  const activeStudents: StudentProgress[] =
    teacher.students.length > 0 ? (teacher.students as unknown as StudentProgress[]) : DEFAULT_DEMO_STUDENTS;

  // Compute metrics
  const totalStudents = activeStudents.length;
  const avgClassScore = Math.round(
    activeStudents.reduce((sum, s) => sum + (s.avgScore || 0), 0) / (totalStudents || 1)
  );
  const stuckStudents = activeStudents.filter((s) => (s.avgScore || 0) < 75);

  // Common errors / topics
  const weakTopicCounts: Record<string, number> = {};
  activeStudents.forEach((s) => {
    (s.areasToImprove || []).forEach((t) => {
      weakTopicCounts[t] = (weakTopicCounts[t] || 0) + 1;
    });
  });
  const topStruggles = Object.entries(weakTopicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Filter students
  const filteredStudents = activeStudents.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterMode === 'needsHelp') return (s.avgScore || 0) < 75;
    if (filterMode === 'highAchievers') return (s.avgScore || 0) >= 85;
    return true;
  });

  // Fetch Gemma 4 Teacher Insights
  const handleAnalyzeInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      const res = await aiService.getTeacherInsights(activeStudents);
      if (res.insights && Array.isArray(res.insights)) {
        setInsights(res.insights as TeacherInsight[]);
      }
    } catch (err) {
      console.error('Insights generation error:', err);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const newStudent: StudentProgress = {
      id: `s_${Date.now()}`,
      name: newStudentName.trim(),
      avatar: '',
      quizzesCompleted: 1,
      avgScore: Number(newStudentScore) || 75,
      lastActive: Date.now(),
      strengths: ['Variables', 'Syntax'],
      areasToImprove: newStudentWeakTopics
        ? newStudentWeakTopics.split(',').map((t) => t.trim())
        : ['Recursion'],
    };

    setStudents([newStudent, ...activeStudents]);
    setNewStudentName('');
    setNewStudentWeakTopics('');
    setShowAddModal(false);
  };

  const handleTargetedPractice = (student: StudentProgress) => {
    if (student.areasToImprove && student.areasToImprove.length > 0 && onTargetedQuiz) {
      onTargetedQuiz(student.areasToImprove[0]);
    }
  };

  return (
    <div className="w-full h-full p-4 sm:p-6 space-y-5 overflow-y-auto bg-slate-50 select-none">
      {/* ── Top Header Bar ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-xs">
            <Users size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Teacher Intelligence Dashboard
              </h2>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">
                Classroom Analytics
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live student mastery, AI error pattern detection, and automated curriculum recommendations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Plus size={14} className="text-blue-600" />
            <span>Add Student</span>
          </button>

          {onOpenLessonPlanner && (
            <button
              onClick={onOpenLessonPlanner}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm shadow-blue-500/25 transition-all cursor-pointer active:scale-95"
            >
              <BookOpen size={14} />
              <span>Lesson Planner</span>
            </button>
          )}
        </div>
      </div>

      {/* ── KPI Stat Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Enrolled Students</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={14} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalStudents}</div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            100% active this week
          </p>
        </div>

        {/* Average Mastery */}
        <div className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Average Mastery</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={14} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{avgClassScore}%</div>
          <p className="text-[11px] text-slate-400 font-medium">+6% vs last week</p>
        </div>

        {/* Needs Assistance */}
        <div className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Needs Intervention</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={14} />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600">{stuckStudents.length}</div>
          <p className="text-[11px] text-rose-600 font-semibold">
            {stuckStudents.length > 0 ? 'Struggling with Recursion / Loops' : 'All students on track'}
          </p>
        </div>

        {/* Top Class Struggle */}
        <div className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Top Struggle Topic</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Lightbulb size={14} />
            </div>
          </div>
          <div className="text-base font-black text-slate-800 truncate">
            {topStruggles[0]?.[0] || 'Recursion'}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {topStruggles[0]?.[1] || 2} students impacted
          </p>
        </div>
      </div>

      {/* ── Gemma 4 AI Teaching Insights ─────────────────────────────────── */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-xs">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">
                Gemma 4 Curriculum & Pedagogy Insights
              </h3>
              <p className="text-[11px] text-slate-400">
                Automated recommendations based on real-time classroom error patterns
              </p>
            </div>
          </div>

          <button
            onClick={handleAnalyzeInsights}
            disabled={isGeneratingInsights}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200/70 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-40"
          >
            {isGeneratingInsights ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Analyzing class...</span>
              </>
            ) : (
              <>
                <Sparkles size={13} />
                <span>Analyze with Gemma 4</span>
              </>
            )}
          </button>
        </div>

        {/* Insights list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {teacher.insights && teacher.insights.length > 0 ? (
            teacher.insights.map((insight, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      insight.priority === 'high'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : insight.priority === 'medium'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {insight.priority} Priority
                  </span>
                  <CheckCircle2 size={13} className="text-slate-400" />
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {insight.message}
                </p>
                {insight.relatedStudents && insight.relatedStudents.length > 0 && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    Focus: {insight.relatedStudents.join(', ')}
                  </span>
                )}
              </div>
            ))
          ) : (
            <>
              <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/40 flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                    High Priority
                  </span>
                  <Sparkles size={13} className="text-blue-600" />
                </div>
                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                  3 students are stuck on <strong>Recursion</strong>. Introduce the Russian Matryoshka doll analogy or call-stack diagram before moving to tree traversals.
                </p>
                <span className="text-[10px] text-slate-500 font-medium">
                  Impacted: Rohan Verma, Kabir Mehta, Aarav Sharma
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                    Medium Priority
                  </span>
                  <Sparkles size={13} className="text-blue-600" />
                </div>
                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                  Diya Patel has mastered Big-O theory but needs hands-on benchmarks. Assign an interactive sorting race in Code Lab.
                </p>
                <span className="text-[10px] text-slate-500 font-medium">
                  Impacted: Diya Patel
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                    Extension
                  </span>
                  <Sparkles size={13} className="text-emerald-600" />
                </div>
                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                  Ananya Iyer is ready for advanced <strong>Dynamic Programming</strong>. Suggest memoization exercises on Fibonacci numbers.
                </p>
                <span className="text-[10px] text-slate-500 font-medium">
                  Impacted: Ananya Iyer
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Student Roster Search & Grid ─────────────────────────────────── */}
      <div className="space-y-4">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm text-slate-900">
              Student Roster & Progress
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              ({filteredStudents.length} of {totalStudents})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Pills */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 text-xs">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterMode('needsHelp')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  filterMode === 'needsHelp'
                    ? 'bg-white text-rose-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Needs Help
              </button>
              <button
                onClick={() => setFilterMode('highAchievers')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  filterMode === 'highAchievers'
                    ? 'bg-white text-emerald-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Top 85%+
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student..."
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-xs w-36 sm:w-48"
              />
            </div>
          </div>
        </div>

        {/* Student Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onTargetedPractice={handleTargetedPractice}
            />
          ))}
        </div>
      </div>

      {/* ── Add Student Modal ────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-extrabold text-sm text-slate-900">
                <Users size={16} className="text-blue-600" />
                <span>Add Student to Class</span>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g. Maya Sundaram"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Initial Mastery Score ({newStudentScore}%)
                </label>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={newStudentScore}
                  onChange={(e) => setNewStudentScore(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Topics Needing Practice (comma separated)
                </label>
                <input
                  type="text"
                  value={newStudentWeakTopics}
                  onChange={(e) => setNewStudentWeakTopics(e.target.value)}
                  placeholder="e.g. Recursion, Pointer Arithmetic"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-xs cursor-pointer"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
