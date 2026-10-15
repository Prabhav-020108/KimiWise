import React, { useState } from 'react';
import { Send, Sparkles, Bot, User, Trash2 } from 'lucide-react';
import { useStore } from '../../store';
import { aiService } from '../../services/aiService';

export const ChatView: React.FC = () => {
  const { chat, addChatMessage, clearChat, setChatTyping } = useStore();
  const [input, setInput] = useState('');

  const sendQuery = async (queryText: string) => {
    if (!queryText.trim() || chat.isTyping) return;
    const textToSend = queryText.trim();
    setInput('');

    addChatMessage({
      id: crypto.randomUUID(),
      role: 'user',
      text: textToSend,
      timestamp: Date.now(),
    });

    setChatTyping(true);
    try {
      const history = chat.messages.map((m) => ({ role: m.role, text: m.text }));
      const response = await aiService.chat(textToSend, history);
      addChatMessage({
        id: crypto.randomUUID(),
        role: 'model',
        text: response.textResponse,
        model: response.model,
        latencyMs: response.latencyMs,
        timestamp: Date.now(),
      });
    } catch (err) {
      addChatMessage({
        id: crypto.randomUUID(),
        role: 'model',
        text: `Error connecting to Gemma 4: ${String(err)}`,
        timestamp: Date.now(),
      });
    } finally {
      setChatTyping(false);
    }
  };

  const handleSend = () => {
    sendQuery(input);
  };

  const samplePrompts = [
    'Explain Dijkstra\'s algorithm with a real-life analogy',
    'How can I structure a 45-min Python intro lesson?',
    'What are common pitfalls students have with recursion?',
  ];

  return (
    <div className="w-full h-full flex flex-col max-w-4xl mx-auto p-4 md:p-6 overflow-hidden bg-slate-50 select-none">
      {/* Chat Header Banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm shrink-0 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-xs">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">Gemma 4 Multimodal Assistant</h2>
            <p className="text-[11px] text-slate-500">Ask anything about algorithms, code, or teaching concepts.</p>
          </div>
        </div>

        {chat.messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors rounded-xl border border-slate-200/80 bg-white shadow-xs cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Clear Chat</span>
          </button>
        )}
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto py-2 space-y-3 custom-scrollbar pr-1">
        {chat.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-xs">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">How can Gemma 4 help today?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Ask coding questions, request lesson plans, or explore computer science analogies.
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full pt-2">
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => sendQuery(prompt)}
                  className="text-left px-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-700 text-xs font-medium transition-all shadow-xs flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate">&quot;{prompt}&quot;</span>
                  <span className="text-blue-600 opacity-0 group-hover:opacity-100 text-xs font-bold transition-opacity">
                    Ask →
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          chat.messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 text-xs leading-relaxed ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot size={15} />
                </div>
              )}
              <div
                className={`max-w-[80%] p-4 rounded-2xl whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs shadow-sm shadow-blue-500/20 font-medium'
                    : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs shadow-xs'
                }`}
              >
                {msg.text}
                {msg.latencyMs && (
                  <div
                    className={`mt-2 text-[10px] font-medium ${
                      msg.role === 'user' ? 'text-blue-100 opacity-80' : 'text-slate-400'
                    }`}
                  >
                    {msg.model || 'Gemma 4'} • {msg.latencyMs}ms
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <User size={15} />
                </div>
              )}
            </div>
          ))
        )}
        {chat.isTyping && (
          <div className="flex gap-3 text-xs items-center text-slate-500">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-xs">
              <Bot size={15} />
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="pt-2 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 p-1.5 rounded-2xl border border-slate-200/90 bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Gemma 4 anything..."
            className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || chat.isTyping}
            className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 transition-all shadow-sm shadow-blue-500/25 active:scale-95 cursor-pointer shrink-0"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};
