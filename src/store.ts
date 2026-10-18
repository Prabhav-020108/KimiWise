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
  QuizSubmissionRecord,
  StudentProgress,
  TeacherInsight,
  VoiceConfig,
  CollabUser,
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

export interface SlideData {
  id: string;
  name: string;
  canvasJson?: any;
}

interface CanvasState {
  activeTool: CreatorTool;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  fontSize: number;
  currentPageIndex: number;
  totalPages: number;
  slides: SlideData[];
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

export interface RemoteCursor {
  x: number;
  y: number;
  name: string;
  color: string;
  lastSeen: number;
}

interface CollabState {
  roomId: string | null;
  isHost: boolean;
  connectedPeers: number;
  isCollabActive: boolean;
  peers: CollabUser[];
  myUser: CollabUser;
  remoteCursors: Record<string, RemoteCursor>;
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
  recentSubmissions: QuizSubmissionRecord[];
  activeStudentId: string | null;
}

// ── UI / Layout ──────────────────────────────────────────────────────────────

interface UIState {
  isSidebarOpen: boolean;
  isMobileNavOpen: boolean;
  activeView: 'board' | 'codelab' | 'teacher' | 'quiz' | 'chat' | 'settings';
  theme: 'dark' | 'light';
  notifications: Notification[];
  isTimerOpen: boolean;
  isCalcOpen: boolean;
  isDiagramModalOpen: boolean;
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
  addSlide: (customName?: string) => void;
  setSlide: (index: number) => void;
  deleteSlide: (index: number) => void;

  // Session Actions
  setCurrentSession: (session: BoardSession | null) => void;
  addRecentSession: (session: BoardSession) => void;

  // Collaboration Actions
  setCollabState: (state: Partial<CollabState>) => void;
  setRoomId: (roomId: string) => void;
  setConnectedPeers: (peers: number) => void;
  setRemoteCursor: (socketId: string, cursor: { x: number; y: number }, user: CollabUser) => void;
  removeRemoteCursor: (socketId: string) => void;
  clearRemoteCursors: () => void;

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
  setActiveStudentId: (studentId: string | null) => void;
  recordQuizSubmission: (submission: {
    studentId?: string;
    studentName?: string;
    quizTitle: string;
    topic: string;
    scorePercent: number;
    correctCount: number;
    totalQuestions: number;
  }) => QuizSubmissionRecord;

  // UI Actions
  setSidebarOpen: (open: boolean) => void;
  setActiveView: (view: UIState['activeView']) => void;
  setTimerOpen: (open: boolean) => void;
  setCalcOpen: (open: boolean) => void;
  setDiagramModalOpen: (open: boolean) => void;
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
  language: 'en-US',
  silenceDetectionTimeout: 2,
};

export const INITIAL_DEMO_STUDENTS: StudentProgress[] = [
  {
    id: 's1',
    name: 'Aarav Sharma',
    avatar: '',
    quizzesCompleted: 6,
    avgScore: 92,
    lastActive: Date.now() - 1000 * 60 * 30,
    strengths: ['Arrays', 'Functions', 'Hash Maps'],
    areasToImprove: ['Recursion'],
  },
  {
    id: 's2',
    name: 'Diya Patel',
    avatar: '',
    quizzesCompleted: 5,
    avgScore: 85,
    lastActive: Date.now() - 1000 * 60 * 90,
    strengths: ['Conditional Logic', 'Strings'],
    areasToImprove: ['Time Complexity', 'Big-O'],
  },
  {
    id: 's3',
    name: 'Rohan Verma',
    avatar: '',
    quizzesCompleted: 3,
    avgScore: 68,
    lastActive: Date.now() - 1000 * 60 * 120,
    strengths: ['Basic Syntax', 'Variables'],
    areasToImprove: ['Pointers', 'Memory Allocation', 'Nested Loops'],
  },
  {
    id: 's4',
    name: 'Ananya Iyer',
    avatar: '',
    quizzesCompleted: 7,
    avgScore: 95,
    lastActive: Date.now() - 1000 * 60 * 15,
    strengths: ['Binary Trees', 'Sorting Algorithms', 'OOP'],
    areasToImprove: ['Dynamic Programming'],
  },
  {
    id: 's5',
    name: 'Kabir Mehta',
    avatar: '',
    quizzesCompleted: 4,
    avgScore: 74,
    lastActive: Date.now() - 1000 * 60 * 200,
    strengths: ['Loops', 'List Comprehensions'],
    areasToImprove: ['Recursion', 'Base Cases'],
  },
];

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
    strokeColor: '#1e1b4b',
    fillColor: 'transparent',
    strokeWidth: 3,
    fontSize: 16,
    currentPageIndex: 0,
    totalPages: 1,
    slides: [{ id: 'slide_1', name: 'Slide 1', canvasJson: null }],
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
    roomId: 'CLASS-101',
    isHost: true,
    connectedPeers: 1,
    isCollabActive: false,
    peers: [],
    myUser: {
      id: 'local_' + Math.random().toString(36).substring(2, 7),
      name: 'Teacher (Host)',
      color: '#2563eb',
      isHost: true,
    },
    remoteCursors: {},
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
    students: INITIAL_DEMO_STUDENTS,
    insights: [],
    isInsightsLoading: false,
    isDashboardOpen: false,
    activeQuiz: null,
    recentSubmissions: [],
    activeStudentId: 's1',
  },

  ui: {
    isSidebarOpen: true,
    isMobileNavOpen: false,
    activeView: 'board',
    theme: 'light',
    notifications: [],
    isTimerOpen: false,
    isCalcOpen: false,
    isDiagramModalOpen: false,
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

  addSlide: (customName?: string) => {
    const fCanvas = typeof window !== 'undefined' ? (window as any).__KIMIWISE_CANVAS__ : null;
    set((s) => {
      const currentIdx = s.canvas.currentPageIndex;
      const currentSlides = [...s.canvas.slides];
      if (fCanvas) {
        currentSlides[currentIdx] = {
          ...currentSlides[currentIdx],
          canvasJson: fCanvas.toJSON(['id', 'selectable', 'sublabel', 'aiBatchId']),
        };
      }
      const newSlide: SlideData = {
        id: `slide_${Date.now()}`,
        name: customName || `Slide ${currentSlides.length + 1}`,
        canvasJson: { objects: [], background: '#ffffff' },
      };
      currentSlides.push(newSlide);
      const newIdx = currentSlides.length - 1;
      if (fCanvas) {
        fCanvas.clear();
        fCanvas.backgroundColor = '#ffffff';
        fCanvas.requestRenderAll();
        (window as any).__KIMIWISE_SYNC_GRID__?.();
      }
      return {
        canvas: {
          ...s.canvas,
          slides: currentSlides,
          currentPageIndex: newIdx,
          totalPages: currentSlides.length,
          canvasObjects: [],
        },
      };
    });
  },

  setSlide: (index: number) => {
    const fCanvas = typeof window !== 'undefined' ? (window as any).__KIMIWISE_CANVAS__ : null;
    set((s) => {
      if (index < 0 || index >= s.canvas.slides.length || index === s.canvas.currentPageIndex) return s;
      const currentIdx = s.canvas.currentPageIndex;
      const currentSlides = [...s.canvas.slides];
      if (fCanvas) {
        currentSlides[currentIdx] = {
          ...currentSlides[currentIdx],
          canvasJson: fCanvas.toJSON(['id', 'selectable', 'sublabel', 'aiBatchId']),
        };
      }
      const targetSlide = currentSlides[index];
      if (fCanvas && targetSlide) {
        if (targetSlide.canvasJson && targetSlide.canvasJson.objects) {
          fCanvas.loadFromJSON(targetSlide.canvasJson, () => {
            fCanvas.backgroundColor = '#ffffff';
            fCanvas.requestRenderAll();
            (window as any).__KIMIWISE_SYNC_GRID__?.();
          });
        } else {
          fCanvas.clear();
          fCanvas.backgroundColor = '#ffffff';
          fCanvas.requestRenderAll();
          (window as any).__KIMIWISE_SYNC_GRID__?.();
        }
      }
      return {
        canvas: {
          ...s.canvas,
          slides: currentSlides,
          currentPageIndex: index,
          totalPages: currentSlides.length,
        },
      };
    });
  },

  deleteSlide: (index: number) => {
    const fCanvas = typeof window !== 'undefined' ? (window as any).__KIMIWISE_CANVAS__ : null;
    set((s) => {
      if (s.canvas.slides.length <= 1) return s;
      const currentSlides = s.canvas.slides.filter((_, i) => i !== index);
      const newIdx = Math.max(0, Math.min(index, currentSlides.length - 1));
      const targetSlide = currentSlides[newIdx];
      if (fCanvas && targetSlide) {
        if (targetSlide.canvasJson && targetSlide.canvasJson.objects) {
          fCanvas.loadFromJSON(targetSlide.canvasJson, () => {
            fCanvas.backgroundColor = '#ffffff';
            fCanvas.requestRenderAll();
          });
        } else {
          fCanvas.clear();
          fCanvas.backgroundColor = '#ffffff';
          fCanvas.requestRenderAll();
        }
      }
      return {
        canvas: {
          ...s.canvas,
          slides: currentSlides,
          currentPageIndex: newIdx,
          totalPages: currentSlides.length,
        },
      };
    });
  },

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

  // ── Collaboration Actions ──────────────────────────────────────────────────

  setCollabState: (collabUpdate) =>
    set((s) => ({ collab: { ...s.collab, ...collabUpdate } })),

  setRoomId: (roomId) =>
    set((s) => ({ collab: { ...s.collab, roomId } })),

  setConnectedPeers: (connectedPeers) =>
    set((s) => ({ collab: { ...s.collab, connectedPeers } })),

  setRemoteCursor: (socketId, cursor, user) =>
    set((s) => ({
      collab: {
        ...s.collab,
        remoteCursors: {
          ...s.collab.remoteCursors,
          [socketId]: {
            x: cursor.x,
            y: cursor.y,
            name: user.name,
            color: user.color,
            lastSeen: Date.now(),
          },
        },
      },
    })),

  removeRemoteCursor: (socketId) =>
    set((s) => {
      const rest = { ...s.collab.remoteCursors };
      delete rest[socketId];
      return { collab: { ...s.collab, remoteCursors: rest } };
    }),

  clearRemoteCursors: () =>
    set((s) => ({ collab: { ...s.collab, remoteCursors: {} } })),

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

  setActiveStudentId: (activeStudentId) =>
    set((s) => ({ teacher: { ...s.teacher, activeStudentId } })),

  recordQuizSubmission: (submission) => {
    const id = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const status =
      submission.scorePercent >= 80
        ? 'mastered'
        : submission.scorePercent >= 60
        ? 'competent'
        : 'needs_practice';

    const record: QuizSubmissionRecord = {
      id,
      studentId: submission.studentId || 's1',
      studentName: submission.studentName || 'Student',
      quizTitle: submission.quizTitle,
      topic: submission.topic || 'General Concepts',
      scorePercent: submission.scorePercent,
      correctCount: submission.correctCount,
      totalQuestions: submission.totalQuestions,
      completedAt: Date.now(),
      status,
    };

    set((s) => {
      const students = s.teacher.students.length > 0 ? [...s.teacher.students] : [];
      let targetStudentIndex = students.findIndex(
        (st) => st.id === record.studentId || st.name.toLowerCase() === record.studentName.toLowerCase()
      );

      if (targetStudentIndex === -1 && students.length > 0) {
        targetStudentIndex = 0;
      }

      if (targetStudentIndex !== -1) {
        const student = students[targetStudentIndex];
        const prevCount = student.quizzesCompleted || 0;
        const prevAvg = student.avgScore || 0;
        const newCount = prevCount + 1;
        const newAvg = Math.round((prevAvg * prevCount + record.scorePercent) / newCount);

        let strengths = [...(student.strengths || [])];
        let areasToImprove = [...(student.areasToImprove || [])];

        const topic = record.topic;
        if (record.scorePercent >= 80) {
          if (!strengths.includes(topic)) strengths.push(topic);
          areasToImprove = areasToImprove.filter((t) => t.toLowerCase() !== topic.toLowerCase());
        } else if (record.scorePercent < 70) {
          if (!areasToImprove.includes(topic)) areasToImprove.push(topic);
          strengths = strengths.filter((t) => t.toLowerCase() !== topic.toLowerCase());
        }

        const recent = [record, ...(student.recentQuizzes || [])].slice(0, 10);

        students[targetStudentIndex] = {
          ...student,
          quizzesCompleted: newCount,
          avgScore: newAvg,
          lastActive: Date.now(),
          strengths,
          areasToImprove,
          recentQuizzes: recent,
        };
        record.studentName = student.name;
        record.studentId = student.id;
      }

      const newInsight: TeacherInsight = {
        message:
          record.scorePercent >= 80
            ? `🌟 ${record.studentName} demonstrated mastery (${record.scorePercent}%) in "${record.topic}".`
            : record.scorePercent >= 60
            ? `📈 ${record.studentName} scored ${record.scorePercent}% in "${record.topic}". Solid progress.`
            : `⚠️ ${record.studentName} scored ${record.scorePercent}% in "${record.topic}". Targeted practice recommended.`,
        priority: record.scorePercent < 60 ? 'high' : record.scorePercent >= 80 ? 'low' : 'medium',
        relatedStudents: [record.studentName],
      };

      const updatedInsights = [
        newInsight,
        ...s.teacher.insights.filter((ins) => ins.message !== newInsight.message),
      ].slice(0, 10);

      const recentSubs = [record, ...s.teacher.recentSubmissions].slice(0, 20);

      return {
        teacher: {
          ...s.teacher,
          students,
          recentSubmissions: recentSubs,
          insights: updatedInsights,
        },
      };
    });

    return record;
  },

  // ── UI Actions ─────────────────────────────────────────────────────────────

  setSidebarOpen: (isSidebarOpen) =>
    set((s) => ({ ui: { ...s.ui, isSidebarOpen } })),

  setActiveView: (activeView) =>
    set((s) => ({ ui: { ...s.ui, activeView } })),

  setTimerOpen: (isTimerOpen) =>
    set((s) => ({ ui: { ...s.ui, isTimerOpen } })),

  setCalcOpen: (isCalcOpen) =>
    set((s) => ({ ui: { ...s.ui, isCalcOpen } })),

  setDiagramModalOpen: (isDiagramModalOpen) =>
    set((s) => ({ ui: { ...s.ui, isDiagramModalOpen } })),

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
