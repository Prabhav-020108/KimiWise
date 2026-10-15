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
    <div className="w-full h-full p-4 md:p-6 max-w-2xl mx-auto space-y-6 overflow-y-auto">
      <div className="flex items-center gap-3 pb-4 border-b border-border/80">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
          <Settings size={20} />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">AI & Runtime Settings</h2>
          <p className="text-xs text-muted-foreground">Configure Gemma 4 cloud credentials, local Ollama endpoints, and preferences.</p>
        </div>
      </div>

      {/* Model Preference Selection */}
      <div className="p-5 rounded-2xl border border-border/80 bg-card/40 backdrop-blur-md space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">AI Provider Mode</h3>
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
                className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary shadow-xs'
                    : 'border-border/60 hover:border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon size={16} />
                  {isSelected && <Check size={14} className="text-primary" />}
                </div>
                <div className="font-semibold text-xs text-foreground">{mode.label}</div>
                <div className="text-[10px] leading-tight text-muted-foreground">{mode.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* API Key Input */}
      <div className="p-5 rounded-2xl border border-border/80 bg-card/40 backdrop-blur-md space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <KeyRound size={15} className="text-indigo-400" />
          <span>Google AI Studio API Key</span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          You can provide an API key directly in the browser if it wasn&apos;t set in the server environment (.env).
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="AIzaSy..."
            className="flex-1 bg-muted/40 border border-border/70 rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
          />
          <button
            onClick={handleSaveKey}
            className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-xs shrink-0"
          >
            {isSaved ? 'Saved!' : 'Save Key'}
          </button>
        </div>
      </div>

      {/* Model Specs Table */}
      <div className="p-5 rounded-2xl border border-border/80 bg-card/40 backdrop-blur-md space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Configuration</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1.5 border-b border-border/40">
            <span className="text-muted-foreground">Primary Model:</span>
            <span className="font-mono font-medium text-foreground">{CONFIG.ai.gemma.model}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-border/40">
            <span className="text-muted-foreground">Local Model:</span>
            <span className="font-mono font-medium text-foreground">{CONFIG.ai.ollama.model}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-border/40">
            <span className="text-muted-foreground">Ollama Endpoint:</span>
            <span className="font-mono font-medium text-foreground">{CONFIG.ai.ollama.defaultBaseUrl}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground">Max Output Tokens:</span>
            <span className="font-mono font-medium text-foreground">{CONFIG.ai.gemma.generation.maxOutputTokens}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
