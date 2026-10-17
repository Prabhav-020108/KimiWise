import React, { useState } from 'react';
import { GitBranch, X, Sparkles, ArrowRight, Layers, Workflow, Network, Binary } from 'lucide-react';
import { useStore } from '../../store';
import { agentDrawingService } from '../../services/agentDrawingService';

const PRESETS = [
  {
    title: 'AI & Machine Learning Roadmap',
    icon: Network,
    prompt: 'Create an AIML Roadmap flowchart with Machine Learning, Deep Learning, Neural Networks, Transformers, and Deployment.',
    steps: [
      { label: 'Foundations: Python, Math & Data Prep', type: 'start' },
      { label: 'Classical ML: Regression, Trees & Clustering', type: 'process' },
      { label: 'Deep Learning: Neural Networks & PyTorch', type: 'process' },
      { label: 'Architectures: Transformers, Attention & LLMs', type: 'decision' },
      { label: 'Production: RAG, Fine-Tuning & MLOps', type: 'end' },
    ],
  },
  {
    title: 'Binary Search Algorithm Flowchart',
    icon: Binary,
    prompt: 'Build a step-by-step Flowchart for Binary Search algorithm with Start, Mid calculation, Comparison decision, and End.',
    steps: [
      { label: 'Start: Sorted Array & Target Key', type: 'start' },
      { label: 'Compute Mid = (Low + High) / 2', type: 'process' },
      { label: 'Is Array[Mid] == Target?', type: 'decision' },
      { label: 'If Target < Mid: High = Mid - 1', type: 'process' },
      { label: 'Return Found Index / Not Found', type: 'end' },
    ],
  },
  {
    title: 'Web App Client-Server Architecture',
    icon: Layers,
    prompt: 'Draw a flowchart of Web Client-Server Architecture with Browser, CDN, API Gateway, Microservices, and Database.',
    steps: [
      { label: 'Client: React / Vite SPA Browser', type: 'start' },
      { label: 'Edge Layer: CDN, WAF & DNS', type: 'process' },
      { label: 'API Gateway & JWT Auth Check', type: 'decision' },
      { label: 'Microservices: Node.js Express APIs', type: 'process' },
      { label: 'Database: PostgreSQL & Redis Cache', type: 'end' },
    ],
  },
  {
    title: 'Photosynthesis Biological Cycle',
    icon: Workflow,
    prompt: 'Draw a process diagram of Photosynthesis with Sunlight, Chlorophyll, Water absorption, Carbon fixation, and Glucose release.',
    steps: [
      { label: 'Input: Sunlight (Photons) & H2O Absorption', type: 'start' },
      { label: 'Light Reactions in Thylakoids (ATP/NADPH)', type: 'process' },
      { label: 'CO2 Carbon Fixation via RuBisCO', type: 'decision' },
      { label: 'Calvin Cycle Sugar Synthesis', type: 'process' },
      { label: 'Output: Glucose (Energy) & O2 Released', type: 'end' },
    ],
  },
];

export const DiagramModal: React.FC = () => {
  const { ui, setDiagramModalOpen, setActiveView, addChatMessage } = useStore();
  const [customPrompt, setCustomPrompt] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);

  if (!ui.isDiagramModalOpen) return null;

  const handleGenerate = async (promptText: string) => {
    const prompt = promptText.trim();
    if (!prompt || isBuilding) return;

    setIsBuilding(true);
    setDiagramModalOpen(false);
    setActiveView('board');
    addChatMessage({ id: `u_${Date.now()}`, role: 'user', text: prompt, timestamp: Date.now() });

    try {
      await agentDrawingService.drawOnCanvas(prompt);
      addChatMessage({
        id: `a_${Date.now()}`,
        role: 'model',
        text: `I've created the whiteboard visual lesson for "${prompt}". Take a look at the interactive canvas!`,
        timestamp: Date.now(),
        model: 'KimiWise Agent',
      });
    } catch (err: any) {
      console.warn('Diagram generator error:', err);
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/90 shadow-2xl shadow-slate-900/15 rounded-3xl p-6 w-full max-w-lg select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <GitBranch size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Whiteboard Diagram Builder</h2>
              <p className="text-xs text-slate-400">Instantly generate flowcharts and mindmaps</p>
            </div>
          </div>
          <button
            onClick={() => setDiagramModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Custom Input */}
        <div className="mt-4">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Prompt / Topic
          </label>
          <div className="mt-1.5 flex gap-2">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGenerate(customPrompt);
              }}
              placeholder="e.g. Draw a flowchart of Binary Search..."
              className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
            />
            <button
              onClick={() => handleGenerate(customPrompt)}
              disabled={!customPrompt.trim() || isBuilding}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/25 transition-all disabled:opacity-40"
            >
              <Sparkles size={14} />
              <span>Generate</span>
            </button>
          </div>
        </div>

        {/* Presets */}
        <div className="mt-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Quick Educational Templates
          </div>
          <div className="space-y-2">
            {PRESETS.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.title}
                  onClick={() => handleGenerate(p.prompt)}
                  disabled={isBuilding}
                  className="w-full text-left p-3 rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/50 flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                        {p.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {p.prompt}
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
