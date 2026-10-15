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
    <div className="w-full h-full p-4 md:p-6 space-y-5 overflow-y-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-card/80 to-card/40 border border-border/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <GraduationCap size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Teacher Intelligence Hub</h2>
            <p className="text-xs text-muted-foreground">
              Automated lesson plans, real-time student analytics, and Gemma 4 curriculum insights.
            </p>
          </div>
        </div>

        <button
          onClick={() => {}}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-sm hover:bg-primary/90 transition-all self-start sm:self-auto"
        >
          <Sparkles size={14} />
          <span>Generate Lesson Plan</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-border/80 bg-card/40 backdrop-blur-md space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Enrolled Students</span>
            <Users size={16} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">{mockStudents.length}</div>
          <p className="text-[11px] text-emerald-400 font-medium">100% Active in Classroom</p>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/40 backdrop-blur-md space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Average Mastery</span>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">85%</div>
          <p className="text-[11px] text-muted-foreground">+7% from last session</p>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/40 backdrop-blur-md space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Lesson Readiness</span>
            <Award size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">
            {lesson.activeLessonPlan ? 'Ready' : 'Drafting'}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {lesson.activeLessonPlan ? lesson.activeLessonPlan.topic : 'Click to generate with Gemma 4'}
          </p>
        </div>
      </div>

      {/* Student Progress Table */}
      <div className="rounded-2xl border border-border/80 bg-card/40 backdrop-blur-md overflow-hidden">
        <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between text-xs font-bold text-foreground">
          <div className="flex items-center gap-2">
            <BookOpen size={15} className="text-indigo-400" />
            <span>Classroom Roster & Performance</span>
          </div>
        </div>
        <div className="divide-y divide-border/40 text-xs">
          {mockStudents.map((student) => (
            <div key={student.studentId} className="px-5 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
              <div>
                <p className="font-semibold text-foreground">{student.studentName}</p>
                <p className="text-[11px] text-muted-foreground">Needs help with: {student.weakTopics.join(', ')}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-foreground">{student.score}%</span>
                <p className="text-[10px] text-muted-foreground">{student.completedQuizzes} Quizzes taken</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
