import React, { useState } from 'react';
import { Settings, Sparkles, HardDrive, ShieldCheck, KeyRound, Check } from 'lucide-react';
import { useStore } from '../../store';
import { CONFIG } from '../../constants';

export const SettingsView: React.FC = () => {
  const { ai, setAiPreference, setAiStatus } = useStore();
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem('kimiwise_custom_key', apiKeyInput.trim());
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
      setAiStatus({ isConnected: true, runtimeMode: 'gemma' });
    }
  };

  return (
    <div className="w-full h-full p-4 md:p-6 max-w-2xl mx-auto space-y-5 overflow-y-auto bg-slate-50 select-none">
      {/* Header Banner */}
      <div className="flex items-center gap-3.5 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-xs">
          <Settings size={22} />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">AI & Runtime Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">Configure Gemma 4 cloud credentials, local Ollama endpoints, and preferences.</p>
        </div>
      </div>

      {/* Model Preference Selection */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Provider Mode</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'auto' as const, label: 'Auto Detect', desc: 'Gemma 4 first, fallback to Ollama', icon: Sparkles },
            { id: 'gemma' as const, label: 'Gemma 4 Cloud', desc: 'Google AI Studio API', icon: ShieldCheck },
            { id: 'ollama' as const, label: 'Ollama Local', desc: 'Offline local inference', icon: HardDrive },
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected = ai.preference === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setAiPreference(mode.id)}
                className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 cursor-pointer ${
                  isSelected
                    ? 'border-2 border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-blue-50/50 hover:border-blue-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon size={16} className={isSelected ? 'text-blue-600' : 'text-slate-500'} />
                  {isSelected && <Check size={14} className="text-blue-600" />}
                </div>
                <div className="font-bold text-xs text-slate-900">{mode.label}</div>
                <div className="text-[10px] leading-tight text-slate-500">{mode.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* API Key Input */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3.5">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <KeyRound size={15} className="text-blue-600" />
          <span>Google AI Studio API Key</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          You can provide an API key directly in the browser if it wasn&apos;t set in the server environment (.env).
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="AIzaSy..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-xs"
          />
          <button
            onClick={handleSaveKey}
            className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500 transition-all shadow-sm shadow-blue-500/25 shrink-0 active:scale-95 cursor-pointer"
          >
            {isSaved ? 'Saved!' : 'Save Key'}
          </button>
        </div>
      </div>

      {/* Model Specs Table */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Configuration</h3>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Primary Model:</span>
            <span className="font-mono font-bold text-slate-800">{CONFIG.ai.gemma.model}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Local Model:</span>
            <span className="font-mono font-bold text-slate-800">{CONFIG.ai.ollama.model}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Ollama Endpoint:</span>
            <span className="font-mono font-bold text-slate-800">{CONFIG.ai.ollama.defaultBaseUrl}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-500 font-medium">Max Output Tokens:</span>
            <span className="font-mono font-bold text-slate-800">{CONFIG.ai.gemma.generation.maxOutputTokens}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
