import React from 'react';
import { GraduationCap, Users, BookOpen, Sparkles, TrendingUp, Award } from 'lucide-react';
import { useStore } from '../../store';

export const TeacherView: React.FC = () => {
  const { teacher, lesson } = useStore();

  const mockStudents = teacher.students.length > 0 ? teacher.students : [
    { studentId: '1', studentName: 'Aarav Sharma', score: 92, completedQuizzes: 4, weakTopics: ['Recursion'] },
    { studentId: '2', studentName: 'Diya Patel', score: 85, completedQuizzes: 3, weakTopics: ['Time Complexity'] },
    { studentId: '3', studentName: 'Rohan Verma', score: 78, completedQuizzes: 2, weakTopics: ['Pointers'] },
  ];

  return (
    <div className="w-full h-full p-4 md:p-6 space-y-5 overflow-y-auto bg-slate-50 select-none">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-xs">
            <GraduationCap size={22} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Teacher Intelligence Hub</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated lesson plans, real-time student analytics, and Gemma 4 curriculum insights.
            </p>
          </div>
        </div>

        <button
          onClick={() => {}}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm shadow-blue-500/25 transition-all self-start sm:self-auto active:scale-95 cursor-pointer"
        >
          <Sparkles size={14} />
          <span>Generate Lesson Plan</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Enrolled Students */}
        <div className="p-4.5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Enrolled Students</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{mockStudents.length}</div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            100% Active in Classroom
          </p>
        </div>

        {/* Average Mastery */}
        <div className="p-4.5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Average Mastery</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">85%</div>
          <p className="text-[11px] text-slate-500 font-medium">+7% from last session</p>
        </div>

        {/* Lesson Readiness */}
        <div className="p-4.5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Lesson Readiness</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {lesson.activeLessonPlan ? 'Ready' : 'Drafting'}
          </div>
          <p className="text-[11px] text-slate-500 truncate font-medium">
            {lesson.activeLessonPlan ? lesson.activeLessonPlan.topic : 'Click to generate with Gemma 4'}
          </p>
        </div>
      </div>

      {/* Student Progress Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-800 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <BookOpen size={15} className="text-blue-600" />
            <span>Classroom Roster & Performance</span>
          </div>
          <span className="text-[11px] text-slate-400 font-semibold">{mockStudents.length} Students Active</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {mockStudents.map((student) => (
            <div
              key={student.studentId}
              className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
            >
              <div>
                <p className="font-bold text-slate-800 text-xs">{student.studentName}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Needs help with: <span className="text-slate-600 font-medium">{student.weakTopics.join(', ')}</span>
                </p>
              </div>

              <div className="text-right">
                <span className="font-black text-slate-900 text-sm">{student.score}%</span>
                <p className="text-[10px] text-slate-400 mt-0.5">{student.completedQuizzes} Quizzes taken</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
