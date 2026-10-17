import React, { useRef, useEffect } from 'react';
import { Sparkles, Bot, Trash2 } from 'lucide-react';
import { useStore } from '../../store';
import { aiService } from '../../services/aiService';
import { agentDrawingService, parseEducationalPrompt } from '../../services/agentDrawingService';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

export const ChatPanel: React.FC = () => {
  const { chat, addChatMessage, clearChat, setChatTyping, ai } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages, chat.isTyping]);

  const handleSendMessage = async (text: string, imageUrl?: string) => {
    if ((!text.trim() && !imageUrl) || chat.isTyping) return;

    const trimmed = text.trim();
    const userMessageId = crypto.randomUUID();
    addChatMessage({
      id: userMessageId,
      role: 'user',
      text: trimmed,
      imageUrl,
      timestamp: Date.now(),
    });

    setChatTyping(true);

    // Check if the user is asking to create or draw a whiteboard visual
    const isVisualRequest = /(flowchart|roadmap|diagram|mindmap|draw|canvas|whiteboard|architecture|workflow|chart|teach|explain|concept|pipeline|process|steps|breakdown)/i.test(trimmed);

    // If visual request, launch the Drawing Agent immediately
    if (isVisualRequest) {
      agentDrawingService.drawOnCanvas(trimmed);
    }

    try {
      // Build history for multi-turn conversation
      const history = chat.messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      let responseText = '';
      let latencyMs = 0;
      let model = ai.activeModel || 'Gemma 4';

      if (imageUrl) {
        // If image is attached, run OCR/Vision or multimodal prompt
        const startTime = Date.now();
        const ocrRes = await aiService.performOcr(imageUrl);
        const visionPrompt = trimmed
          ? `[Student provided an image with the query]: ${trimmed}\n\n[Vision Extracted Content]:\n${ocrRes.extractedCode}\n\n[Explanation]: ${ocrRes.explanation}`
          : `[Student provided an image for analysis]:\n\n[Vision Extracted Content]:\n${ocrRes.extractedCode}\n\n${ocrRes.explanation}`;

        const chatRes = await aiService.chat(visionPrompt, history);
        responseText = chatRes.textResponse;
        latencyMs = Date.now() - startTime;
        model = 'Gemma 4 Vision';
      } else {
        const chatRes = await aiService.chat(trimmed, history);
        responseText = chatRes.textResponse;
        latencyMs = chatRes.latencyMs;
        model = chatRes.model || 'Gemma 4';
      }

      // If user requested a visual flowchart/diagram, enrich response with clear structured steps
      if (isVisualRequest) {
        const diagramData = parseEducationalPrompt(trimmed);
        const stepsMarkdown = diagramData.nodes
          .map((n, i) => `${i + 1}. **${n.label}**${n.sublabel ? ` — *${n.sublabel}*` : ''}`)
          .join('\n');

        responseText = `I've created the whiteboard visual lesson for **"${diagramData.title}"**!\n\nThe AI Drawing Agent is actively illustrating the flowchart on the interactive canvas with each phase:\n\n${stepsMarkdown}\n\nTake a look at the interactive canvas to watch the agent draw!`;
      }

      addChatMessage({
        id: crypto.randomUUID(),
        role: 'model',
        text: responseText,
        model,
        latencyMs,
        timestamp: Date.now(),
      });
    } catch (err: any) {
      addChatMessage({
        id: crypto.randomUUID(),
        role: 'model',
        text: `Error connecting to Gemma 4: ${err?.message || String(err)}`,
        timestamp: Date.now(),
      });
    } finally {
      setChatTyping(false);
    }
  };

  const samplePrompts = [
    {
      title: 'Real-World Algorithm Analogy',
      prompt: 'Explain Dijkstra\'s shortest-path algorithm using a real-life analogy (like a city GPS or package delivery).',
    },
    {
      title: 'Curriculum Lesson Design',
      prompt: 'How can I structure a 45-minute interactive Python intro lesson for high school students?',
    },
    {
      title: 'Recursion Pitfalls & Visual Debug',
      prompt: 'What are the top 3 common pitfalls students encounter with recursive algorithms, and how can I help them visualize the call stack?',
    },
    {
      title: 'Time & Space Complexity',
      prompt: 'Explain the difference between O(n log n) and O(n^2) sorting algorithms with practical examples.',
    },
  ];

  return (
    <div className="w-full h-full flex flex-col max-w-4xl mx-auto p-3 sm:p-5 overflow-hidden bg-slate-50 select-none">
      {/* ── Chat Header Banner ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm shrink-0 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-xs">
            <Bot size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Gemma 4 Multimodal Assistant
              </h2>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">
                Multi-Turn Chat
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Ask coding questions, request lesson plans, or upload screenshots & handwriting.
            </p>
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

      {/* ── Messages Stream ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-2 space-y-3 custom-scrollbar pr-1">
        {chat.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-xs">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
                How can Gemma 4 help today?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Explore computer science concepts, prepare classroom lessons, or attach an image to analyze.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full pt-2">
              {samplePrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.prompt)}
                  className="text-left p-3 rounded-xl border border-slate-200/90 bg-white hover:bg-blue-50/70 hover:border-blue-300 text-slate-700 transition-all shadow-xs flex flex-col justify-between group cursor-pointer"
                >
                  <span className="font-bold text-[11px] text-slate-900 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </span>
                  <span className="text-[10px] text-slate-500 line-clamp-2 mt-1 leading-normal">
                    &quot;{item.prompt}&quot;
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          chat.messages.map((msg, idx) => (
            <ChatMessage
              key={msg.id || idx}
              message={msg}
              isLatest={idx === chat.messages.length - 1}
            />
          ))
        )}

        {/* Typing indicator */}
        {chat.isTyping && (
          <div className="flex gap-3 text-xs items-center text-slate-500">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-xs">
              <Bot size={15} />
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] text-slate-500 font-medium ml-1">
                Gemma 4 is reasoning...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Bar ────────────────────────────────────────────────────── */}
      <div className="pt-2 shrink-0">
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={chat.isTyping}
        />
        <div className="flex items-center justify-between px-2 pt-1.5 text-[10px] text-slate-400">
          <span>Gemma 4 Multimodal Intelligence</span>
          <span>Press Enter to send, Shift+Enter for new line</span>
        </div>
      </div>
    </div>
  );
};
