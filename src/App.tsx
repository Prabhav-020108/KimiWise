import { useEffect } from 'react';
import { useStore } from './store';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { BoardView } from './components/board/BoardView';
import { CodeLabView } from './components/codelab/CodeLabView';
import { TeacherView } from './components/teacher/TeacherView';
import { QuizView } from './components/tools/QuizView';
import { ChatView } from './components/chat/ChatView';
import { SettingsView } from './components/layout/SettingsView';
import { FloatingTimer } from './components/classroom/FloatingTimer';
import { FloatingCalc } from './components/classroom/FloatingCalc';
import { DiagramModal } from './components/classroom/DiagramModal';
import { ToastContainer } from './components/shared/ToastContainer';
import { aiService } from './services/aiService';
import { collabService } from './services/collabService';

export function App() {
  const { ui, setAiStatus } = useStore();

  // Initialize Socket.IO Real-Time Collaboration
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get('room') || params.get('roomId') || 'CLASS-101';
    collabService.init(roomFromUrl);

    return () => {
      collabService.destroy();
    };
  }, []);

  // Probe AI status on mount
  useEffect(() => {
    let isMounted = true;
    const checkAi = async () => {
      setAiStatus({ isChecking: true });
      try {
        const status = await aiService.checkStatus();
        if (isMounted) {
          setAiStatus({
            isConnected: status.gemma.available || status.ollama.online,
            runtimeMode: status.recommendedMode,
            activeModel: status.gemma.available ? status.gemma.model : status.ollama.model || 'none',
            isChecking: false,
            lastChecked: Date.now(),
            errorMessage: null,
          });
        }
      } catch {
        if (isMounted) {
          setAiStatus({
            isConnected: false,
            runtimeMode: 'unavailable',
            isChecking: false,
            errorMessage: 'Unable to reach backend',
          });
        }
      }
    };

    checkAi();
    return () => {
      isMounted = false;
    };
  }, [setAiStatus]);

  // Synchronize dark mode class to html element
  useEffect(() => {
    if (ui.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [ui.theme]);

  return (
    <ErrorBoundary>
      <div className={`h-screen flex flex-col bg-background text-foreground transition-colors overflow-hidden ${ui.theme}`}>
        <Header />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <main className="flex-1 relative overflow-hidden bg-slate-50">
            {/* Whiteboard Canvas is permanently mounted so drawing operations & Fabric canvas persist across view changes */}
            <div className={`w-full h-full ${ui.activeView === 'board' ? 'block' : 'hidden'}`}>
              <BoardView />
            </div>
            {ui.activeView === 'codelab' && <CodeLabView />}
            {ui.activeView === 'teacher' && <TeacherView />}
            {ui.activeView === 'quiz' && <QuizView />}
            {ui.activeView === 'chat' && <ChatView />}
            {ui.activeView === 'settings' && <SettingsView />}

            {/* Floating Classroom Tools & Feedback */}
            <FloatingTimer />
            <FloatingCalc />
            <DiagramModal />
            <ToastContainer />
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
