import React, { useState } from 'react';
import { Send, Sparkles, Bot, User, Trash2 } from 'lucide-react';
import { useStore } from '../../store';
import { aiService } from '../../services/aiService';

export const ChatView: React.FC = () => {
  const { chat, addChatMessage, clearChat, setChatTyping } = useStore();
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim() || chat.isTyping) return;
    const userText = input.trim();
    setInput('');

    addChatMessage({
      id: crypto.randomUUID(),
      role: 'user',
      text: userText,
      timestamp: Date.now(),
    });

    setChatTyping(true);
    try {
      const history = chat.messages.map((m) => ({ role: m.role, text: m.text }));
      const response = await aiService.chat(userText, history);
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

  return (
    <div className="w-full h-full flex flex-col max-w-4xl mx-auto p-4 md:p-6 overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Bot size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Gemma 4 Multimodal Assistant</h2>
            <p className="text-[11px] text-muted-foreground">Ask anything about algorithms, code, or teaching concepts.</p>
          </div>
        </div>

        {chat.messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-muted/50"
          >
            <Trash2 size={13} />
            <span>Clear Chat</span>
          </button>
        )}
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3 custom-scrollbar">
        {chat.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Sparkles size={24} />
            </div>
            <h3 className="font-bold text-foreground text-sm">How can Gemma 4 help today?</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Try asking: &quot;Explain Dijkstra&apos;s algorithm with a real-life analogy&quot; or &quot;How can I structure a 45-min Python intro lesson?&quot;
            </p>
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
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={14} />
                </div>
              )}
              <div
                className={`max-w-[80%] p-3.5 rounded-2xl whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-tr-xs shadow-sm'
                    : 'bg-card/70 border border-border/80 text-foreground rounded-tl-xs shadow-xs'
                }`}
              >
                {msg.text}
                {msg.latencyMs && (
                  <div className="mt-1.5 text-[10px] text-muted-foreground opacity-75">
                    {msg.model || 'Gemma 4'} • {msg.latencyMs}ms
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <User size={14} />
                </div>
              )}
            </div>
          ))
        )}
        {chat.isTyping && (
          <div className="flex gap-3 text-xs items-center text-muted-foreground">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <Bot size={14} />
            </div>
            <div className="p-3 rounded-2xl bg-card border border-border/80 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="pt-3 border-t border-border/80 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 p-1.5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md focus-within:border-primary transition-all"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Gemma 4 anything..."
            className="flex-1 bg-transparent px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={!input.trim() || chat.isTyping}
            className="p-2 rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-40 transition-all shadow-xs"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};
