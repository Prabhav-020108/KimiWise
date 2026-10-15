import React from 'react';
import { Sparkles, WifiOff, HardDrive, RefreshCw } from 'lucide-react';
import { useStore } from '../../store';
import { aiService } from '../../services/aiService';

export const AiStatusBadge: React.FC = () => {
  const { ai, setAiStatus, setActiveView } = useStore();

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setAiStatus({ isChecking: true });
    try {
      const status = await aiService.checkStatus();
      setAiStatus({
        isConnected: status.gemma.available || status.ollama.online,
        runtimeMode: status.recommendedMode,
        activeModel: status.gemma.available ? status.gemma.model : status.ollama.model || 'none',
        isChecking: false,
        lastChecked: Date.now(),
        errorMessage: null,
      });
    } catch {
      setAiStatus({
        isConnected: false,
        runtimeMode: 'unavailable',
        isChecking: false,
        errorMessage: 'Connection check failed',
      });
    }
  };

  const isGemma = ai.runtimeMode === 'gemma' || (ai.isConnected && ai.activeModel.includes('gemma'));
  const isOllama = ai.runtimeMode === 'ollama';
  const isOnline = ai.isConnected;

  return (
    <div
      onClick={() => setActiveView('settings')}
      title="Click to view AI & Model settings"
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/80 bg-card/60 backdrop-blur-md shadow-xs hover:border-primary/50 transition-all cursor-pointer group select-none text-xs"
    >
      <div className="flex items-center justify-center shrink-0">
        {ai.isChecking ? (
          <RefreshCw size={13} className="text-primary animate-spin" />
        ) : isGemma ? (
          <div className="p-0.5 text-indigo-400">
            <Sparkles size={13} className="animate-pulse" />
          </div>
        ) : isOllama ? (
          <div className="p-0.5 text-emerald-400">
            <HardDrive size={13} />
          </div>
        ) : (
          <div className="p-0.5 text-rose-400">
            <WifiOff size={13} />
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <span
          className={`w-2 h-2 rounded-full ${
            isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'
          }`}
        />
        <span className="font-semibold tracking-tight text-foreground/90">
          {ai.isChecking
            ? 'Checking...'
            : isGemma
            ? 'Gemma 4'
            : isOllama
            ? 'Ollama Local'
            : 'AI Offline'}
        </span>
      </div>

      <button
        onClick={handleRefresh}
        title="Probe AI health"
        className="p-1 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors ml-0.5"
      >
        <RefreshCw size={11} className={ai.isChecking ? 'animate-spin' : ''} />
      </button>
    </div>
  );
};
