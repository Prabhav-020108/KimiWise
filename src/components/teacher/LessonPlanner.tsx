import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  GitBranch,
  HelpCircle,
  FileText,
  Loader2,
  Layers,
} from 'lucide-react';
import { useStore } from '../../store';
import { aiService } from '../../services/aiService';
import type { LessonPlan, LessonStep, LessonPhase, LessonContentType } from '../../types';

interface LessonPlannerProps {
  onBackToDashboard?: () => void;
  onNavigateToBoard?: (step: LessonStep) => void;
  onNavigateToQuiz?: (topic: string) => void;
}

export const LessonPlanner: React.FC<LessonPlannerProps> = ({
  onBackToDashboard,
  onNavigateToBoard,
  onNavigateToQuiz,
}) => {
  const { lesson, setLessonPlan, setActiveView } = useStore();
  const [subject, setSubject] = useState('Computer Science');
  const [topic, setTopic] = useState('Binary Search Trees');
  const [gradeLevel, setGradeLevel] = useState('High School');
  const [duration, setDuration] = useState(45);
  const [isLoading, setIsLoading] = useState(false);

  const quickTopics = [
    { label: 'Binary Search Trees', subject: 'Computer Science' },
    { label: 'Recursion & Call Stacks', subject: 'Computer Science' },
    { label: 'Sorting Algorithms (Quick vs Merge)', subject: 'Computer Science' },
    { label: 'Newtonian Mechanics', subject: 'Physics' },
    { label: 'Cellular Respiration', subject: 'Biology' },
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const res = await aiService.generateLessonPlan(subject, topic);
      const rawPlan = (res as any).plan;

      if (rawPlan) {
        const rawSteps = rawPlan.steps || [];
        const plannedSteps: LessonStep[] = rawSteps.map((s: any, idx: number) => ({
          id: `step_${Date.now()}_${idx}`,
          phase: (s.phase as LessonPhase) || 'core',
          title: s.title || `Step ${idx + 1}`,
          contentType: (s.contentType as LessonContentType) || 'mindmap',
          status: 'planned',
          suggestion: s.suggestion || 'Present key concepts and guide interactive discussion.',
        }));

        const newPlan: LessonPlan = {
          id: `plan_${Date.now()}`,
          subject: rawPlan.subject || subject,
          topic: rawPlan.topic || topic,
          gradeLevel: rawPlan.gradeLevel || gradeLevel,
          phase: 'planning',
          plannedSteps,
          completedSteps: [],
          createdAt: Date.now(),
        };

        setLessonPlan(newPlan);
      }
    } catch (err) {
      console.error('Failed to generate lesson plan:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentPlan = lesson.activeLessonPlan;

  const toggleStepCompleted = (stepId: string) => {
    if (!currentPlan) return;
    const isCompleted = currentPlan.completedSteps.includes(stepId);
    const updatedCompleted = isCompleted
      ? currentPlan.completedSteps.filter((id) => id !== stepId)
      : [...currentPlan.completedSteps, stepId];

    const updatedSteps = currentPlan.plannedSteps.map((step) =>
      step.id === stepId
        ? { ...step, status: (isCompleted ? 'planned' : 'created') as 'planned' | 'created' }
        : step
    );

    setLessonPlan({
      ...currentPlan,
      plannedSteps: updatedSteps,
      completedSteps: updatedCompleted,
    });
  };

  const getContentTypeIcon = (type: LessonContentType) => {
    switch (type) {
      case 'mindmap':
      case 'flowchart':
        return <GitBranch size={13} className="text-blue-500" />;
      case 'quiz':
        return <HelpCircle size={13} className="text-purple-500" />;
      case 'comparison':
        return <Layers size={13} className="text-amber-500" />;
      default:
        return <FileText size={13} className="text-emerald-500" />;
    }
  };

  const getPhaseBadge = (phase: LessonPhase) => {
    switch (phase) {
      case 'intro':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'core':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'practice':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'closing':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="w-full h-full p-4 sm:p-6 space-y-5 overflow-y-auto bg-slate-50 select-none">
      {/* ── Top Header Bar ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-xs">
            <BookOpen size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                AI Lesson Plan Generator
              </h2>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">
                Gemma 4 Curriculum
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Structured multi-phase teaching plans with interactive whiteboard & quiz links.
            </p>
          </div>
        </div>

        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
          >
            ← Back to Roster
          </button>
        )}
      </div>

      {/* ── Generator Form ───────────────────────────────────────────────── */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Subject */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            {/* Topic */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Lesson Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Binary Search Trees"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            {/* Grade Level */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Target Level</label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
              >
                <option value="Middle School">Middle School (Grades 6-8)</option>
                <option value="High School">High School (Grades 9-12)</option>
                <option value="Undergraduate">Undergraduate / College</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes (Standard)</option>
                <option value={60}>60 Minutes</option>
                <option value={90}>90 Minutes (Double Block)</option>
              </select>
            </div>
          </div>

          {/* Quick topic starter pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Popular Topics:
            </span>
            {quickTopics.map((qt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTopic(qt.label);
                  setSubject(qt.subject);
                }}
                className={`text-[10.5px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
                  topic === qt.label
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
                }`}
              >
                {qt.label}
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/25 active:scale-95 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Generating with Gemma 4...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Generate Full Lesson Plan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Generated Plan View ──────────────────────────────────────────── */}
      {currentPlan ? (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Plan Meta Overview */}
          <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">
                  {currentPlan.subject}
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                  {currentPlan.gradeLevel} • {duration} Minutes
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mt-1">
                {currentPlan.topic}
              </h3>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs font-bold text-slate-700">
                  {currentPlan.completedSteps.length} of {currentPlan.plannedSteps.length} Steps
                </span>
                <p className="text-[10px] text-slate-400">Classroom Readiness</p>
              </div>
              <div className="w-32 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      (currentPlan.completedSteps.length /
                        (currentPlan.plannedSteps.length || 1)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-3">
            {currentPlan.plannedSteps.map((step, idx) => {
              const isCompleted = currentPlan.completedSteps.includes(step.id);
              return (
                <div
                  key={step.id || idx}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCompleted
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200/90 bg-white shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleStepCompleted(step.id)}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border transition-colors cursor-pointer mt-0.5 ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'bg-white border-slate-300 text-transparent hover:border-blue-400'
                      }`}
                      title="Toggle completed"
                    >
                      <CheckCircle2 size={16} />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPhaseBadge(
                            step.phase
                          )}`}
                        >
                          {step.phase}
                        </span>

                        <span className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                          {getContentTypeIcon(step.contentType)}
                          <span className="uppercase text-[9px]">{step.contentType}</span>
                        </span>
                      </div>

                      <h4
                        className={`text-xs font-bold mt-1 ${
                          isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'
                        }`}
                      >
                        {idx + 1}. {step.title}
                      </h4>
                      <p className="text-[11.5px] text-slate-500 mt-0.5 leading-relaxed">
                        {step.suggestion}
                      </p>
                    </div>
                  </div>

                  {/* Actions for Step */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {step.contentType === 'quiz' ? (
                      <button
                        onClick={() => {
                          if (onNavigateToQuiz) onNavigateToQuiz(currentPlan.topic);
                          else setActiveView('quiz');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 text-xs font-bold border border-purple-200 transition-all cursor-pointer shadow-xs"
                      >
                        <HelpCircle size={12} />
                        <span>Launch Quiz</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (onNavigateToBoard) onNavigateToBoard(step);
                          else setActiveView('board');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-bold border border-blue-200 transition-all cursor-pointer shadow-xs"
                      >
                        <GitBranch size={12} />
                        <span>Draw on Board</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-2xl border border-dashed border-slate-300 bg-white/50 text-center space-y-2">
          <BookOpen size={28} className="mx-auto text-slate-400" />
          <h4 className="text-xs font-bold text-slate-700">No Active Lesson Plan</h4>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Choose a subject and topic above, then click &ldquo;Generate Full Lesson Plan&rdquo; to build an interactive teaching curriculum with Gemma 4.
          </p>
        </div>
      )}
    </div>
  );
};
