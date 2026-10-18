// ─── KimiWise — Type Definitions ─────────────────────────────────────────────

// ── Primitives ──────────────────────────────────────────────────────────────

export interface Point {
  x: number;
  y: number;
}

// ── Canvas / Drawing ─────────────────────────────────────────────────────────

export type CreatorTool =
  | 'SELECT'
  | 'PAN'
  | 'PENCIL'
  | 'ERASER'
  | 'TEXT'
  | 'RECTANGLE'
  | 'CIRCLE'
  | 'TRIANGLE'
  | 'LINE'
  | 'ARROW'
  | 'DIAMOND'
  | 'STAR';

export type CanvasJson = Record<string, unknown> | unknown[];
export type ViewportTransform = number[];

export interface CanvasObjectData {
  id: string;
  type: string;
  left: number;
  top: number;
  width?: number;
  height?: number;
  radius?: number;
  fill: string;
  angle?: number;
  htmlContent?: string;
  svgContent?: string;
  imageUrl?: string;
  textContent?: string;
  zIndex?: number;
}

export interface DomElementState {
  id: string;
  html: string;
  componentType?: string;
  config?: Record<string, unknown>;
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  zIndex: number;
}

export interface PageState {
  canvas: object;
  dom: Record<string, DomElementState>;
  previewDataUrl?: string;
}

export interface BoardSession {
  id: string;
  title: string;
  updatedAt: number;
  createdAt: number;
  thumbnail: string;
  sizeBytes: number;
  pages: PageState[];
  messages?: ChatMessage[];
  lessonPlan?: LessonPlan | null;
}

// ── AI / Agent ───────────────────────────────────────────────────────────────

export type AiPreference = 'auto' | 'gemma' | 'gemini' | 'ollama';
export type AiRuntimeMode = 'gemma' | 'gemini' | 'ollama' | 'unavailable';

export interface AgentAction {
  id: string;
  type:
    | 'CREATE_SHAPE'
    | 'CREATE_SVG'
    | 'RENDER_HTML'
    | 'WRITE_TEXT'
    | 'DRAW_PATH'
    | 'DELETE_OBJECT'
    | 'PAN_CAMERA'
    | 'MODIFY_PROPERTY';
  payload: Record<string, unknown>;
  status: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
}

export interface AgentState {
  cursorPosition: Point;
  isThinking: boolean;
  isActing: boolean;
  currentAction: string | null;
  logs: string[];
  agentMessage: string | null;
}

// ── Voice ────────────────────────────────────────────────────────────────────

export type TranscribeMode = 'webspeech' | 'gemini';

export interface VoiceConfig {
  autoStopSeconds: number;
  autoSubmit: boolean;
  noiseSuppression: boolean;
  echoCancellation: boolean;
  language: string;
  silenceDetectionTimeout: number;
}

// ── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  imageUrl?: string;
  timestamp: number;
  model?: string;
  provider?: string;
  latencyMs?: number;
}

// ── OCR / Code Lab ──────────────────────────────────────────────────────────

export interface OcrResult {
  extractedCode: string;
  language: string;
  confidence: number;
  explanation: string;
}

export interface CodeTutorMessage {
  id?: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  model?: string;
}

// ── Lesson Planning ──────────────────────────────────────────────────────────

export type LessonPhase =
  | 'planning'
  | 'intro'
  | 'core'
  | 'practice'
  | 'closing'
  | 'freeform';

export type LessonContentType =
  | 'mindmap'
  | 'flowchart'
  | 'timeline'
  | 'comparison'
  | 'text'
  | 'quiz'
  | 'document';

export interface LessonStep {
  id: string;
  phase: LessonPhase;
  title: string;
  contentType: LessonContentType;
  status: 'planned' | 'created' | 'skipped';
  suggestion: string;
}

export interface LessonPlan {
  id: string;
  subject: string;
  topic: string;
  gradeLevel: string;
  phase: LessonPhase;
  plannedSteps: LessonStep[];
  completedSteps: string[];
  createdAt: number;
}

// ── Quiz ─────────────────────────────────────────────────────────────────────

export interface QuizQuestion {
  type: 'multiple_choice' | 'essay';
  question: string;
  options?: string[];
  correctIndex?: number;
  expectedAnswer?: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  createdAt: number;
}

// ── Student / Teacher Dashboard ──────────────────────────────────────────────

export interface StudentProgress {
  id: string;
  name: string;
  avatar: string;
  quizzesCompleted: number;
  avgScore: number;
  lastActive: number;
  strengths: string[];
  areasToImprove: string[];
}

export interface TeacherInsight {
  message: string;
  priority: 'high' | 'medium' | 'low';
  relatedStudents?: string[];
}

// ── Socket.IO Collaboration ──────────────────────────────────────────────────

export interface CollabUser {
  id: string;
  name: string;
  color: string;
  isHost?: boolean;
}

export interface RemoteCursorData {
  x: number;
  y: number;
  name: string;
  color: string;
  lastSeen: number;
}

export interface RoomState {
  state: CanvasJson;
  slides?: any[];
  currentSlideIndex?: number;
  viewports: Record<string, ViewportTransform>;
  lastViewport?: ViewportTransform | null;
  domElements: Record<string, DomElementState>;
  peers?: Record<string, CollabUser>;
}

export interface ClientToServerEvents {
  'join-room': (roomId: string, user?: CollabUser) => void;
  'leave-room': (roomId: string) => void;
  'canvas-update': (payload: { roomId: string; data: CanvasJson; slideIndex?: number }) => void;
  'slide-change': (payload: { roomId: string; slideIndex: number }) => void;
  'cursor-update': (payload: { roomId: string; cursor: { x: number; y: number }; user: CollabUser }) => void;
  'viewport-update': (payload: { roomId: string; viewport: ViewportTransform }) => void;
  'dom-elements-update': (payload: { roomId: string; domElements: Record<string, DomElementState> }) => void;
}

export interface ServerToClientEvents {
  'canvas-init': (data: CanvasJson, slideIndex?: number) => void;
  'canvas-update': (data: CanvasJson, slideIndex?: number) => void;
  'slide-change': (slideIndex: number) => void;
  'room-info': (payload: { roomId: string; peerCount: number; peers: CollabUser[] }) => void;
  'remote-cursor': (payload: { socketId: string; cursor: { x: number; y: number }; user: CollabUser }) => void;
  'remote-cursor-remove': (payload: { socketId: string }) => void;
  'viewport-update': (payload: { socketId: string; viewport: ViewportTransform }) => void;
  'dom-elements-init': (data: Record<string, DomElementState>) => void;
  'dom-elements-update': (data: Record<string, DomElementState>) => void;
  'sync-error': (payload: { message: string }) => void;
}

export interface SocketInterServerEvents {}
export interface SocketData {
  user?: CollabUser;
  roomId?: string;
}

// ── Global augmentations ─────────────────────────────────────────────────────

declare global {
  interface Window {
    fabric: unknown;
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    mermaid: unknown;
  }
}
