import React from 'react';
import { Code2, Camera, Play, Sparkles, FileCode } from 'lucide-react';
import { useStore } from '../../store';

export const CodeLabView: React.FC = () => {
  const { codeLab, setCode, setOutput, setIsRunning } = useStore();

  const handleRunCode = () => {
    setIsRunning(true);
    try {
      // Basic safe client-side execution for demonstration
      let captured = '';
      const originalLog = console.log;
      console.log = (...args) => {
        captured += args.join(' ') + '\n';
      };
      // eslint-disable-next-line no-new-func
      const fn = new Function(codeLab.code);
      fn();
      console.log = originalLog;
      setOutput(captured || 'Program executed successfully (no output).');
    } catch (err) {
      setOutput(`Error: ${String(err)}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="w-full h-full p-4 md:p-6 flex flex-col gap-4 overflow-hidden">
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-card/60 backdrop-blur-md p-4 rounded-2xl border border-border/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Code2 size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Code Lab & Vision OCR</h2>
            <p className="text-xs text-muted-foreground">
              Write code or upload photos of handwritten algorithms for instant Gemma 4 multimodal tutoring.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              /* upload trigger */
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/80 hover:bg-muted/60 text-xs font-semibold text-foreground transition-all"
          >
            <Camera size={14} className="text-indigo-400" />
            <span>Upload Photo (OCR)</span>
          </button>

          <button
            onClick={handleRunCode}
            disabled={codeLab.isRunning}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-semibold shadow-sm transition-all"
          >
            <Play size={14} />
            <span>{codeLab.isRunning ? 'Running...' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      {/* Editor & Output Split View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Code Editor Area */}
        <div className="flex flex-col rounded-2xl border border-border/80 bg-card/40 backdrop-blur-md overflow-hidden">
          <div className="px-4 py-2 border-b border-border/60 bg-muted/30 flex items-center justify-between text-xs font-mono text-muted-foreground">
            <div className="flex items-center gap-2">
              <FileCode size={14} />
              <span>solution.js</span>
            </div>
            <span>JavaScript</span>
          </div>
          <textarea
            value={codeLab.code || '// Write or paste your code here\nfunction greet(name) {\n  console.log("Hello, " + name + "!");\n}\n\ngreet("KimiWise");\n'}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 p-4 bg-transparent font-mono text-xs leading-relaxed text-foreground resize-none focus:outline-hidden"
            placeholder="Type your code or photograph your notebook..."
          />
        </div>

        {/* Output & Tutor Chat Area */}
        <div className="flex flex-col rounded-2xl border border-border/80 bg-card/40 backdrop-blur-md overflow-hidden">
          <div className="px-4 py-2 border-b border-border/60 bg-muted/30 flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Execution Output & AI Tutor</span>
            <div className="flex items-center gap-1 text-[11px] text-indigo-400 font-medium">
              <Sparkles size={12} />
              <span>Gemma 4 Tutor Ready</span>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-foreground/90 whitespace-pre-wrap">
            {codeLab.output || 'Run your code or ask Gemma 4 to analyze handwritten algorithms...'}
          </div>
        </div>
      </div>
    </div>
  );
};
