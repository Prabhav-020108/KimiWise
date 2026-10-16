import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Bot, User, Copy, Check, Sparkles, Clock } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../../types';

interface ChatMessageProps {
  message: ChatMessageType;
  isLatest?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === 'model';
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (codeText: string) => {
    navigator.clipboard.writeText(codeText).then(() => {
      setCopiedCode(codeText);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`flex gap-3 text-xs leading-relaxed transition-all ${
        isModel ? 'justify-start' : 'justify-end'
      }`}
    >
      {isModel && (
        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <Bot size={15} />
        </div>
      )}

      <div className={`max-w-[85%] md:max-w-[78%] flex flex-col ${isModel ? 'items-start' : 'items-end'}`}>
        {/* Optional Image attachment preview */}
        {message.imageUrl && (
          <div className="mb-2 overflow-hidden rounded-xl border border-slate-200/90 shadow-xs max-w-xs">
            <img
              src={message.imageUrl}
              alt="Uploaded context"
              className="max-h-48 w-auto object-contain bg-slate-100"
            />
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`p-4 rounded-2xl whitespace-pre-wrap break-words text-xs shadow-xs ${
            isModel
              ? 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs shadow-xs'
              : 'bg-blue-600 text-white rounded-tr-xs shadow-sm shadow-blue-500/20 font-medium'
          }`}
        >
          {isModel ? (
            <div className="prose prose-xs max-w-none text-slate-800 prose-headings:font-bold prose-headings:text-slate-900 prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');
                    if (!inline && match) {
                      const isCopied = copiedCode === codeString;
                      return (
                        <div className="my-2 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-[11px] shadow-sm">
                          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-400 select-none">
                            <span className="font-semibold uppercase text-[10px] tracking-wider text-blue-400">
                              {match[1]}
                            </span>
                            <button
                              onClick={() => handleCopy(codeString)}
                              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer text-[10px]"
                            >
                              {isCopied ? (
                                <>
                                  <Check size={11} className="text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={11} />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-3 overflow-x-auto text-slate-100 font-mono leading-relaxed">
                            <code>{children}</code>
                          </pre>
                        </div>
                      );
                    }
                    return (
                      <code
                        className="bg-slate-100 text-blue-700 px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold border border-slate-200/70"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>
          ) : (
            <span>{message.text}</span>
          )}
        </div>

        {/* Footer Meta Badge: Timestamp + Model + Latency */}
        <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {formattedTime}
          </span>
          {isModel && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1 text-blue-600 font-semibold">
                <Sparkles size={10} />
                {message.model || 'Gemma 4'}
              </span>
              {message.latencyMs && (
                <>
                  <span>•</span>
                  <span>{message.latencyMs}ms</span>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {!isModel && (
        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <User size={15} />
        </div>
      )}
    </div>
  );
};
