import { create } from 'zustand';
import type {
  AiPreference,
  AiRuntimeMode,
  AgentState,
  BoardSession,
  CanvasObjectData,
  ChatMessage,
  CodeTutorMessage,
  CreatorTool,
  DomElementState,
  LessonPlan,
  OcrResult,
  Quiz,
  StudentProgress,
  TeacherInsight,
  VoiceConfig,
} from './types';

// ── AI Status ────────────────────────────────────────────────────────────────

interface AiStatusState {
  runtimeMode: AiRuntimeMode;
  preference: AiPreference;
  isConnected: boolean;
  isChecking: boolean;
  lastChecked: number;
  errorMessage: string | null;
  activeModel: string;
}

// ── Canvas ───────────────────────────────────────────────────────────────────

interface CanvasState {
  activeTool: CreatorTool;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  fontSize: number;
  currentPageIndex: number;
  totalPages: number;
  canvasObjects: CanvasObjectData[];
  domElements: Record<string, DomElementState>;
  isDrawing: boolean;
  zoom: number;
}

// ── Session / Board ──────────────────────────────────────────────────────────

interface SessionState {
  currentSession: BoardSession | null;
  recentSessions: BoardSession[];
  isSaving: boolean;
  lastSaved: number | null;
}

// ── Collaboration ────────────────────────────────────────────────────────────

interface CollabState {
  roomId: string | null;
  isHost: boolean;
  connectedPeers: number;
  isCollabActive: boolean;
}

// ── Voice ────────────────────────────────────────────────────────────────────

interface VoiceState {
  isRecording: boolean;
  isProcessing: boolean;
  transcript: string;
  voiceConfig: VoiceConfig;
  audioLevel: number;
}

// ── Chat ─────────────────────────────────────────────────────────────────────

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  isChatOpen: boolean;
}

// ── Code Lab ─────────────────────────────────────────────────────────────────

interface CodeLabState {
  code: string;
  language: string;
  output: string;
  isRunning: boolean;
  ocrResult: OcrResult | null;
  isOcrProcessing: boolean;
  tutorMessages: CodeTutorMessage[];
  isTutorTyping: boolean;
}

// ── Lesson ───────────────────────────────────────────────────────────────────

interface LessonState {
  activeLessonPlan: LessonPlan | null;
  isGeneratingLesson: boolean;
  isLessonPanelOpen: boolean;
}

// ── Teacher Dashboard ────────────────────────────────────────────────────────

interface TeacherState {
  students: StudentProgress[];
  insights: TeacherInsight[];
  isInsightsLoading: boolean;
  isDashboardOpen: boolean;
  activeQuiz: Quiz | null;
}

// ── UI / Layout ──────────────────────────────────────────────────────────────

interface UIState {
  isSidebarOpen: boolean;
  isMobileNavOpen: boolean;
  activeView: 'board' | 'codelab' | 'teacher' | 'quiz' | 'chat' | 'settings';
  theme: 'dark' | 'light';
  notifications: Notification[];
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
}

// ── Combined Store ───────────────────────────────────────────────────────────

interface KimiWiseStore {
  // State slices
  ai: AiStatusState;
  canvas: CanvasState;
  session: SessionState;
  collab: CollabState;
  voice: VoiceState;
  chat: ChatState;
  codeLab: CodeLabState;
  lesson: LessonState;
  teacher: TeacherState;
  ui: UIState;
  agent: AgentState;

  // AI Status Actions
  setAiStatus: (status: Partial<AiStatusState>) => void;
  setAiPreference: (pref: AiPreference) => void;

  // Canvas Actions
  setActiveTool: (tool: CreatorTool) => void;
  setStrokeColor: (color: string) => void;
  setFillColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setZoom: (zoom: number) => void;
  setCanvasObjects: (objects: CanvasObjectData[]) => void;
  setDomElements: (elements: Record<string, DomElementState>) => void;

  // Session Actions
  setCurrentSession: (session: BoardSession | null) => void;
  addRecentSession: (session: BoardSession) => void;

  // Voice Actions
  setRecording: (isRecording: boolean) => void;
  setTranscript: (transcript: string) => void;
  setAudioLevel: (level: number) => void;
  setVoiceConfig: (config: Partial<VoiceConfig>) => void;

  // Chat Actions
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  setChatOpen: (open: boolean) => void;
  setChatTyping: (typing: boolean) => void;

  // Code Lab Actions
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  setOutput: (output: string) => void;
  setIsRunning: (running: boolean) => void;
  setOcrResult: (result: OcrResult | null) => void;
  setOcrProcessing: (processing: boolean) => void;
  addTutorMessage: (message: CodeTutorMessage) => void;
  clearTutorChat: () => void;

  // Lesson Actions
  setLessonPlan: (plan: LessonPlan | null) => void;
  setLessonGenerating: (gen: boolean) => void;
  setLessonPanelOpen: (open: boolean) => void;

  // Teacher Actions
  setStudents: (students: StudentProgress[]) => void;
  setInsights: (insights: TeacherInsight[]) => void;
  setDashboardOpen: (open: boolean) => void;
  setActiveQuiz: (quiz: Quiz | null) => void;

  // UI Actions
  setSidebarOpen: (open: boolean) => void;
  setActiveView: (view: UIState['activeView']) => void;
  toggleTheme: () => void;
  addNotification: (notif: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;

  // Agent Actions
  setAgentState: (state: Partial<AgentState>) => void;
  addAgentLog: (log: string) => void;
}

// ── Store Implementation ─────────────────────────────────────────────────────

const defaultVoiceConfig: VoiceConfig = {
  autoStopSeconds: 10,
  autoSubmit: true,
  noiseSuppression: true,
  echoCancellation: true,
  language: 'en-IN',
  silenceDetectionTimeout: 2,
};

export const useStore = create<KimiWiseStore>()((set) => ({
  // ── Initial State ──────────────────────────────────────────────────────────

  ai: {
    runtimeMode: 'unavailable',
    preference: 'auto',
    isConnected: false,
    isChecking: false,
    lastChecked: 0,
    errorMessage: null,
    activeModel: '',
  },

  canvas: {
    activeTool: 'SELECT',
    strokeColor: '#ffffff',
    fillColor: 'transparent',
    strokeWidth: 2,
    fontSize: 16,
    currentPageIndex: 0,
    totalPages: 1,
    canvasObjects: [],
    domElements: {},
    isDrawing: false,
    zoom: 1,
  },

  session: {
    currentSession: null,
    recentSessions: [],
    isSaving: false,
    lastSaved: null,
  },

  collab: {
    roomId: null,
    isHost: false,
    connectedPeers: 0,
    isCollabActive: false,
  },

  voice: {
    isRecording: false,
    isProcessing: false,
    transcript: '',
    voiceConfig: defaultVoiceConfig,
    audioLevel: 0,
  },

  chat: {
    messages: [],
    isTyping: false,
    isChatOpen: false,
  },

  codeLab: {
    code: '# Write your code here\nprint("Hello, KimiWise!")',
    language: 'python',
    output: '',
    isRunning: false,
    ocrResult: null,
    isOcrProcessing: false,
    tutorMessages: [],
    isTutorTyping: false,
  },

  lesson: {
    activeLessonPlan: null,
    isGeneratingLesson: false,
    isLessonPanelOpen: false,
  },

  teacher: {
    students: [],
    insights: [],
    isInsightsLoading: false,
    isDashboardOpen: false,
    activeQuiz: null,
  },

  ui: {
    isSidebarOpen: true,
    isMobileNavOpen: false,
    activeView: 'board',
    theme: 'light',
    notifications: [],
  },

  agent: {
    cursorPosition: { x: 0, y: 0 },
    isThinking: false,
    isActing: false,
    currentAction: null,
    logs: [],
    agentMessage: null,
  },

  // ── AI Status Actions ──────────────────────────────────────────────────────

  setAiStatus: (status) =>
    set((s) => ({ ai: { ...s.ai, ...status } })),

  setAiPreference: (pref) =>
    set((s) => ({ ai: { ...s.ai, preference: pref } })),

  // ── Canvas Actions ─────────────────────────────────────────────────────────

  setActiveTool: (tool) =>
    set((s) => ({ canvas: { ...s.canvas, activeTool: tool } })),

  setStrokeColor: (color) =>
    set((s) => ({ canvas: { ...s.canvas, strokeColor: color } })),

  setFillColor: (color) =>
    set((s) => ({ canvas: { ...s.canvas, fillColor: color } })),

  setStrokeWidth: (width) =>
    set((s) => ({ canvas: { ...s.canvas, strokeWidth: width } })),

  setZoom: (zoom) =>
    set((s) => ({ canvas: { ...s.canvas, zoom } })),

  setCanvasObjects: (objects) =>
    set((s) => ({ canvas: { ...s.canvas, canvasObjects: objects } })),

  setDomElements: (elements) =>
    set((s) => ({ canvas: { ...s.canvas, domElements: elements } })),

  // ── Session Actions ────────────────────────────────────────────────────────

  setCurrentSession: (session) =>
    set((s) => ({ session: { ...s.session, currentSession: session } })),

  addRecentSession: (session) =>
    set((s) => ({
      session: {
        ...s.session,
        recentSessions: [session, ...s.session.recentSessions.filter((r) => r.id !== session.id)].slice(0, 10),
      },
    })),

  // ── Voice Actions ──────────────────────────────────────────────────────────

  setRecording: (isRecording) =>
    set((s) => ({ voice: { ...s.voice, isRecording } })),

  setTranscript: (transcript) =>
    set((s) => ({ voice: { ...s.voice, transcript } })),

  setAudioLevel: (audioLevel) =>
    set((s) => ({ voice: { ...s.voice, audioLevel } })),

  setVoiceConfig: (config) =>
    set((s) => ({ voice: { ...s.voice, voiceConfig: { ...s.voice.voiceConfig, ...config } } })),

  // ── Chat Actions ───────────────────────────────────────────────────────────

  addChatMessage: (message) =>
    set((s) => ({ chat: { ...s.chat, messages: [...s.chat.messages, message] } })),

  clearChat: () =>
    set((s) => ({ chat: { ...s.chat, messages: [] } })),

  setChatOpen: (isChatOpen) =>
    set((s) => ({ chat: { ...s.chat, isChatOpen } })),

  setChatTyping: (isTyping) =>
    set((s) => ({ chat: { ...s.chat, isTyping } })),

  // ── Code Lab Actions ───────────────────────────────────────────────────────

  setCode: (code) =>
    set((s) => ({ codeLab: { ...s.codeLab, code } })),

  setLanguage: (language) =>
    set((s) => ({ codeLab: { ...s.codeLab, language } })),

  setOutput: (output) =>
    set((s) => ({ codeLab: { ...s.codeLab, output } })),

  setIsRunning: (isRunning) =>
    set((s) => ({ codeLab: { ...s.codeLab, isRunning } })),

  setOcrResult: (ocrResult) =>
    set((s) => ({ codeLab: { ...s.codeLab, ocrResult } })),

  setOcrProcessing: (isOcrProcessing) =>
    set((s) => ({ codeLab: { ...s.codeLab, isOcrProcessing } })),

  addTutorMessage: (message) =>
    set((s) => ({ codeLab: { ...s.codeLab, tutorMessages: [...s.codeLab.tutorMessages, message] } })),

  clearTutorChat: () =>
    set((s) => ({ codeLab: { ...s.codeLab, tutorMessages: [] } })),

  // ── Lesson Actions ─────────────────────────────────────────────────────────

  setLessonPlan: (activeLessonPlan) =>
    set((s) => ({ lesson: { ...s.lesson, activeLessonPlan } })),

  setLessonGenerating: (isGeneratingLesson) =>
    set((s) => ({ lesson: { ...s.lesson, isGeneratingLesson } })),

  setLessonPanelOpen: (isLessonPanelOpen) =>
    set((s) => ({ lesson: { ...s.lesson, isLessonPanelOpen } })),

  // ── Teacher Actions ────────────────────────────────────────────────────────

  setStudents: (students) =>
    set((s) => ({ teacher: { ...s.teacher, students } })),

  setInsights: (insights) =>
    set((s) => ({ teacher: { ...s.teacher, insights } })),

  setDashboardOpen: (isDashboardOpen) =>
    set((s) => ({ teacher: { ...s.teacher, isDashboardOpen } })),

  setActiveQuiz: (activeQuiz) =>
    set((s) => ({ teacher: { ...s.teacher, activeQuiz } })),

  // ── UI Actions ─────────────────────────────────────────────────────────────

  setSidebarOpen: (isSidebarOpen) =>
    set((s) => ({ ui: { ...s.ui, isSidebarOpen } })),

  setActiveView: (activeView) =>
    set((s) => ({ ui: { ...s.ui, activeView } })),

  toggleTheme: () =>
    set((s) => ({ ui: { ...s.ui, theme: s.ui.theme === 'dark' ? 'light' : 'dark' } })),

  addNotification: (notif) =>
    set((s) => ({
      ui: {
        ...s.ui,
        notifications: [
          ...s.ui.notifications,
          { ...notif, id: crypto.randomUUID(), timestamp: Date.now() },
        ],
      },
    })),

  removeNotification: (id) =>
    set((s) => ({
      ui: { ...s.ui, notifications: s.ui.notifications.filter((n) => n.id !== id) },
    })),

  // ── Agent Actions ──────────────────────────────────────────────────────────

  setAgentState: (agentState) =>
    set((s) => ({ agent: { ...s.agent, ...agentState } })),

  addAgentLog: (log) =>
    set((s) => ({ agent: { ...s.agent, logs: [...s.agent.logs.slice(-49), log] } })),
}));
