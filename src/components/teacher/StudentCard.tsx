import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import type { StudentProgress } from '../../types';

interface StudentCardProps {
  student: StudentProgress;
  onTargetedPractice?: (student: StudentProgress) => void;
}

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-rose-100 text-rose-700 border-rose-200',
];

const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

export const StudentCard: React.FC<StudentCardProps> = ({ student, onTargetedPractice }) => {
  const [expanded, setExpanded] = useState(false);

  // Pick stable avatar color based on name
  const colorIndex = Math.abs(
    student.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % AVATAR_COLORS.length;
  const avatarClass = AVATAR_COLORS[colorIndex];

  // Score styling
  const score = student.avgScore || 0;
  let progressColor = 'bg-blue-600';
  let badgeColor = 'text-blue-600 bg-blue-50 border-blue-200/80';
  if (score >= 85) {
    progressColor = 'bg-emerald-500';
    badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200/80';
  } else if (score < 70) {
    progressColor = 'bg-amber-500';
    badgeColor = 'text-amber-700 bg-amber-50 border-amber-200/80';
  }

  const level =
    score >= 85 ? 'Advanced' : score >= 70 ? 'Intermediate' : 'Beginner';

  return (
    <div className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between select-none">
      <div>
        {/* Header: Avatar, Name, Level badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs border shadow-xs ${avatarClass}`}
            >
              {getInitials(student.name)}
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 tracking-tight">
                {student.name}
              </h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${badgeColor}`}>
                  {level}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock size={10} />
                  Active today
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-lg font-black text-slate-900">{score}%</span>
            <p className="text-[10px] text-slate-400 font-medium">Mastery</p>
          </div>
        </div>

        {/* Animated Mastery Progress Bar */}
        <div className="mt-3.5 space-y-1">
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
              style={{ width: `${Math.min(score, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span>{student.quizzesCompleted} Quizzes Taken</span>
            <span>Target: 100%</span>
          </div>
        </div>

        {/* Weak Topics */}
        {student.areasToImprove && student.areasToImprove.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <AlertCircle size={10} className="text-amber-500" />
              Needs Practice:
            </p>
            <div className="flex flex-wrap gap-1">
              {student.areasToImprove.map((topic, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Strengths (Collapsed/Expanded) */}
        {expanded && student.strengths && student.strengths.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <CheckCircle2 size={10} className="text-emerald-500" />
              Mastered Concepts:
            </p>
            <div className="flex flex-wrap gap-1">
              {student.strengths.map((str, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                >
                  {str}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <span>{expanded ? 'Less Info' : 'Details'}</span>
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {onTargetedPractice && (
          <button
            onClick={() => onTargetedPractice(student)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200/70 text-[11px] font-bold transition-all cursor-pointer shadow-xs"
          >
            <Sparkles size={11} />
            <span>Targeted Practice</span>
          </button>
        )}
      </div>
    </div>
  );
};
