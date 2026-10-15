import React, { useRef } from 'react';
import { Copy, Check, Trash2, FileCode } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language,
  onChange,
  onClear,
}) => {
  const [copied, setCopied] = React.useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lines = code.split('\n');

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Handle Tab key (indent with 2 spaces)
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      onChange(newCode);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
      return;
    }

    // Auto-close brackets & quotes
    const pairs: Record<string, string> = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
      '`': '`',
    };

    if (pairs[e.key]) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const closing = pairs[e.key];
      e.preventDefault();
      const newCode = code.substring(0, start) + e.key + closing + code.substring(end);
      onChange(newCode);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 shrink-0 select-none">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <FileCode size={14} className="text-blue-400" />
          <span className="font-semibold">
            main.{language === 'python' ? 'py' : language === 'html' ? 'html' : language === 'css' ? 'css' : language === 'typescript' ? 'ts' : 'js'}
          </span>
          <span className="text-[10px] text-slate-500 font-sans uppercase font-bold px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/60 ml-1">
            {language}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono text-slate-500 mr-2">
            {lines.length} lines • {code.length} chars
          </span>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            title="Copy code"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <Check size={12} className="text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Clear Button */}
          {onClear && (
            <button
              onClick={onClear}
              title="Clear editor"
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Editor Body: Line numbers + Textarea */}
      <div className="flex-1 relative flex overflow-hidden font-mono text-xs leading-relaxed">
        {/* Line Numbers Gutter */}
        <div className="w-12 py-3 bg-slate-900/60 border-r border-slate-800/80 text-right pr-3 text-slate-600 select-none overflow-hidden shrink-0">
          {lines.map((_, i) => (
            <div key={i} className="text-[11px] leading-relaxed">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Input Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          placeholder={`// Write or paste your ${language} code here...\n// Or photograph handwritten code with OCR above!`}
          className="flex-1 py-3 px-4 bg-transparent text-slate-100 placeholder:text-slate-600 resize-none focus:outline-none w-full h-full font-mono text-xs leading-relaxed caret-blue-400 selection:bg-blue-600/30 overflow-auto"
        />
      </div>
    </div>
  );
};
