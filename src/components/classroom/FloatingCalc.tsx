import React, { useState } from 'react';
import { RotateCcw, X, Divide, Minus, Plus, Equal, Percent, Calculator } from 'lucide-react';
import { useStore } from '../../store';

export const FloatingCalc: React.FC = () => {
  const { ui, setCalcOpen } = useStore();
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [isDone, setIsDone] = useState(false);

  if (!ui.isCalcOpen) return null;

  const handleNumber = (num: string) => {
    if (isDone || display === '0') {
      setDisplay(num);
      setIsDone(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
    setIsDone(false);
  };

  const calculate = () => {
    try {
      const fullEquation = equation + display;
      const cleanExpr = fullEquation.replace(/×/g, '*').replace(/÷/g, '/');
      const sanitized = cleanExpr.replace(/[^0-9+\-*/.%]/g, '');
      const result = new Function(`return (${sanitized})`)();
      if (!isFinite(result) || isNaN(result)) {
        setDisplay('Error');
      } else {
        setDisplay(String(Number(result.toFixed(8))));
      }
      setEquation('');
      setIsDone(true);
    } catch {
      setDisplay('Error');
      setEquation('');
      setIsDone(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
    setIsDone(false);
  };

  const btnClass = 'flex items-center justify-center py-2.5 text-sm font-bold rounded-xl transition-all active:scale-95 shadow-xs select-none cursor-pointer';
  const numClass = `${btnClass} bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80`;
  const opClass = `${btnClass} bg-blue-600 text-white hover:bg-blue-700`;
  const actionClass = `${btnClass} bg-slate-100 text-slate-600 hover:bg-slate-200`;

  return (
    <div className="fixed right-6 top-24 z-50 w-72 bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-2xl shadow-slate-900/10 rounded-3xl p-4 select-none animate-in fade-in slide-in-from-top-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Calculator size={16} />
          </div>
          <span className="text-xs font-bold text-slate-800">Classroom Calculator</span>
        </div>
        <button
          onClick={() => setCalcOpen(false)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Display Screen */}
      <div className="flex flex-col justify-end p-3 my-3 bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden">
        <div className="text-right text-slate-400 text-xs h-4 mb-0.5 font-mono truncate">
          {equation}
        </div>
        <div className="text-right text-2xl font-black text-slate-800 tracking-tight font-mono truncate">
          {display}
        </div>
      </div>

      {/* Button Grid */}
      <div className="grid grid-cols-4 gap-1.5">
        <button onClick={clear} className={actionClass} title="Reset"><RotateCcw size={14} /></button>
        <button onClick={() => setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display)} className={actionClass}>+/-</button>
        <button onClick={() => handleOperator('%')} className={actionClass}><Percent size={14} /></button>
        <button onClick={() => handleOperator('÷')} className={opClass}><Divide size={16} /></button>

        <button onClick={() => handleNumber('7')} className={numClass}>7</button>
        <button onClick={() => handleNumber('8')} className={numClass}>8</button>
        <button onClick={() => handleNumber('9')} className={numClass}>9</button>
        <button onClick={() => handleOperator('×')} className={opClass}><X size={16} /></button>

        <button onClick={() => handleNumber('4')} className={numClass}>4</button>
        <button onClick={() => handleNumber('5')} className={numClass}>5</button>
        <button onClick={() => handleNumber('6')} className={numClass}>6</button>
        <button onClick={() => handleOperator('-')} className={opClass}><Minus size={16} /></button>

        <button onClick={() => handleNumber('1')} className={numClass}>1</button>
        <button onClick={() => handleNumber('2')} className={numClass}>2</button>
        <button onClick={() => handleNumber('3')} className={numClass}>3</button>
        <button onClick={() => handleOperator('+')} className={opClass}><Plus size={16} /></button>

        <button onClick={() => handleNumber('0')} className={`${numClass} col-span-2`}>0</button>
        <button onClick={() => (display.includes('.') ? null : setDisplay(display + '.'))} className={numClass}>.</button>
        <button onClick={calculate} className={`${opClass} bg-emerald-600 hover:bg-emerald-700`}><Equal size={16} /></button>
      </div>
    </div>
  );
};
