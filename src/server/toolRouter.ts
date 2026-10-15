import type { CanvasObjectData } from '../types';
import { SYSTEM_PROMPTS } from '../constants';

// ── Canvas Tool Declarations for Gemma 4 Function Calling ─────────────────────

export const CANVAS_TOOLS = [
  {
    name: 'create_shape',
    description: 'Draw a geometric shape on the whiteboard canvas.',
    parameters: {
      type: 'object',
      properties: {
        shape: {
          type: 'string',
          enum: ['rectangle', 'circle', 'triangle', 'diamond', 'star', 'arrow'],
          description: 'The type of shape to create.',
        },
        x: { type: 'number', description: 'X position on canvas (0-1200).' },
        y: { type: 'number', description: 'Y position on canvas (0-800).' },
        width: { type: 'number', description: 'Width of the shape in pixels.' },
        height: { type: 'number', description: 'Height of the shape in pixels.' },
        fill: { type: 'string', description: 'Fill color (CSS hex, e.g. "#4f46e5").' },
        stroke: { type: 'string', description: 'Stroke/border color.' },
        strokeWidth: { type: 'number', description: 'Border width in pixels.' },
        label: { type: 'string', description: 'Optional text label inside the shape.' },
        id: { type: 'string', description: 'Unique identifier for the element.' },
      },
      required: ['shape', 'x', 'y', 'width', 'height'],
    },
  },
  {
    name: 'write_text',
    description: 'Add a text element to the whiteboard.',
    parameters: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'The text content to display.' },
        x: { type: 'number', description: 'X position on canvas.' },
        y: { type: 'number', description: 'Y position on canvas.' },
        fontSize: { type: 'number', description: 'Font size in pixels (12-72).' },
        color: { type: 'string', description: 'Text color (CSS hex).' },
        fontWeight: { type: 'string', enum: ['normal', 'bold'], description: 'Font weight.' },
        id: { type: 'string', description: 'Unique identifier for the element.' },
      },
      required: ['text', 'x', 'y'],
    },
  },
  {
    name: 'draw_arrow',
    description: 'Draw a connecting arrow between two points on the canvas.',
    parameters: {
      type: 'object',
      properties: {
        x1: { type: 'number', description: 'Start X position.' },
        y1: { type: 'number', description: 'Start Y position.' },
        x2: { type: 'number', description: 'End X position.' },
        y2: { type: 'number', description: 'End Y position.' },
        color: { type: 'string', description: 'Arrow color (CSS hex).' },
        strokeWidth: { type: 'number', description: 'Line width in pixels.' },
        label: { type: 'string', description: 'Optional label on the arrow.' },
        id: { type: 'string', description: 'Unique identifier.' },
      },
      required: ['x1', 'y1', 'x2', 'y2'],
    },
  },
  {
    name: 'render_html',
    description: 'Place a rich HTML DOM element on the canvas (for charts, tables, code blocks, etc.).',
    parameters: {
      type: 'object',
      properties: {
        html: { type: 'string', description: 'HTML string to render. Use inline Tailwind classes.' },
        x: { type: 'number', description: 'X position on canvas.' },
        y: { type: 'number', description: 'Y position on canvas.' },
        width: { type: 'number', description: 'Element width in pixels.' },
        height: { type: 'number', description: 'Element height in pixels.' },
        componentType: {
          type: 'string',
          enum: ['card', 'code', 'table', 'chart', 'formula', 'image', 'custom'],
          description: 'Type of DOM component being placed.',
        },
        id: { type: 'string', description: 'Unique identifier.' },
      },
      required: ['html', 'x', 'y', 'width', 'height'],
    },
  },
  {
    name: 'delete_object',
    description: 'Remove an existing element from the canvas by its ID.',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ID of the element to delete.' },
      },
      required: ['id'],
    },
  },
  {
    name: 'pan_camera',
    description: 'Move the canvas viewport to focus on a specific area.',
    parameters: {
      type: 'object',
      properties: {
        x: { type: 'number', description: 'Target X center position.' },
        y: { type: 'number', description: 'Target Y center position.' },
        zoom: { type: 'number', description: 'Zoom level (0.25–3.0).' },
      },
      required: ['x', 'y'],
    },
  },
  {
    name: 'create_mindmap',
    description: 'Generate a mind map on the canvas from a topic and subtopics.',
    parameters: {
      type: 'object',
      properties: {
        centerX: { type: 'number', description: 'Center X of the mindmap.' },
        centerY: { type: 'number', description: 'Center Y of the mindmap.' },
        topic: { type: 'string', description: 'Main topic in the center node.' },
        subtopics: {
          type: 'array',
          description: 'Array of subtopic strings.',
          items: { type: 'string' },
        },
        colorScheme: {
          type: 'string',
          enum: ['purple', 'blue', 'green', 'orange', 'red'],
          description: 'Color theme for the mindmap.',
        },
      },
      required: ['centerX', 'centerY', 'topic', 'subtopics'],
    },
  },
  {
    name: 'create_flowchart',
    description: 'Create a flowchart with connected nodes representing a process or algorithm.',
    parameters: {
      type: 'object',
      properties: {
        startX: { type: 'number', description: 'Starting X position.' },
        startY: { type: 'number', description: 'Starting Y position.' },
        nodes: {
          type: 'array',
          description: 'Array of flowchart nodes.',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              label: { type: 'string' },
              type: { type: 'string', enum: ['start', 'process', 'decision', 'end'] },
              nextIds: { type: 'array', items: { type: 'string' } },
              yesId: { type: 'string' },
              noId: { type: 'string' },
            },
          },
        },
      },
      required: ['startX', 'startY', 'nodes'],
    },
  },
  {
    name: 'clear_canvas',
    description: 'Clear all elements from the canvas for a fresh start.',
    parameters: {
      type: 'object',
      properties: {
        confirm: { type: 'boolean', description: 'Must be true to confirm clearing.' },
      },
      required: ['confirm'],
    },
  },
];

// ── System Instruction Builder ────────────────────────────────────────────────

export const buildSystemInstruction = (
  canvasObjects: CanvasObjectData[],
  viewport: { width: number; height: number; zoom: number },
  domElements: Record<string, unknown> = {}
): string => {
  const objectSummary =
    canvasObjects.length > 0
      ? `\nCurrent canvas has ${canvasObjects.length} element(s): ${canvasObjects
          .slice(0, 10)
          .map((o) => `${o.type}@(${Math.round(o.left)},${Math.round(o.top)})`)
          .join(', ')}${canvasObjects.length > 10 ? '...' : ''}`
      : '\nCanvas is empty.';

  const domSummary =
    Object.keys(domElements).length > 0
      ? `\nDOM overlay elements: ${Object.keys(domElements).length} element(s).`
      : '';

  return `${SYSTEM_PROMPTS.boardAgent}

CANVAS CONTEXT:
- Viewport: ${viewport.width}×${viewport.height}px at zoom ${viewport.zoom.toFixed(2)}x
- Canvas coordinate range: 0-${viewport.width}px (width), 0-${viewport.height}px (height)${objectSummary}${domSummary}

FUNCTION CALLING RULES:
1. Use function calls to place ALL visual content — text, shapes, charts, code blocks.
2. Space elements thoughtfully — avoid overlap. Use the full canvas area.
3. Always respond with a helpful text explanation alongside any function calls.
4. For mindmaps: use create_mindmap. For flowcharts: use create_flowchart.
5. Use render_html for rich content like tables, code blocks, or formatted explanations.
6. Color palette (dark theme): background #0f0f1a, accents #6366f1, #22c55e, #f59e0b, #ec4899
7. Text should be white (#ffffff) or light gray (#94a3b8) for contrast.`;
};

// ── Tool Execution ────────────────────────────────────────────────────────────

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
}

export interface ExecutedAction {
  type: string;
  payload: Record<string, unknown>;
  id: string;
}

/**
 * Translate Gemma function calls into KimiWise canvas action payloads.
 * The frontend canvas manager receives these and applies them to Fabric.js.
 */
export const executeToolCalls = (calls: ToolCall[]): ExecutedAction[] => {
  const actions: ExecutedAction[] = [];

  for (const call of calls) {
    const id = (call.args.id as string) || crypto.randomUUID();

    switch (call.name) {
      case 'create_shape':
        actions.push({
          type: 'CREATE_SHAPE',
          id,
          payload: {
            shape: call.args.shape || 'rectangle',
            x: Number(call.args.x) || 100,
            y: Number(call.args.y) || 100,
            width: Number(call.args.width) || 200,
            height: Number(call.args.height) || 100,
            fill: (call.args.fill as string) || '#4f46e5',
            stroke: (call.args.stroke as string) || '#818cf8',
            strokeWidth: Number(call.args.strokeWidth) || 2,
            label: (call.args.label as string) || '',
            id,
          },
        });
        break;

      case 'write_text':
        actions.push({
          type: 'WRITE_TEXT',
          id,
          payload: {
            text: (call.args.text as string) || '',
            x: Number(call.args.x) || 100,
            y: Number(call.args.y) || 100,
            fontSize: Number(call.args.fontSize) || 18,
            color: (call.args.color as string) || '#ffffff',
            fontWeight: (call.args.fontWeight as string) || 'normal',
            id,
          },
        });
        break;

      case 'draw_arrow':
        actions.push({
          type: 'DRAW_ARROW',
          id,
          payload: {
            x1: Number(call.args.x1) || 0,
            y1: Number(call.args.y1) || 0,
            x2: Number(call.args.x2) || 100,
            y2: Number(call.args.y2) || 100,
            color: (call.args.color as string) || '#94a3b8',
            strokeWidth: Number(call.args.strokeWidth) || 2,
            label: (call.args.label as string) || '',
            id,
          },
        });
        break;

      case 'render_html':
        actions.push({
          type: 'RENDER_HTML',
          id,
          payload: {
            html: (call.args.html as string) || '',
            x: Number(call.args.x) || 100,
            y: Number(call.args.y) || 100,
            width: Number(call.args.width) || 400,
            height: Number(call.args.height) || 200,
            componentType: (call.args.componentType as string) || 'custom',
            id,
          },
        });
        break;

      case 'delete_object':
        actions.push({ type: 'DELETE_OBJECT', id, payload: { id: call.args.id as string } });
        break;

      case 'pan_camera':
        actions.push({
          type: 'PAN_CAMERA',
          id,
          payload: {
            x: Number(call.args.x) || 0,
            y: Number(call.args.y) || 0,
            zoom: Math.min(3, Math.max(0.25, Number(call.args.zoom) || 1)),
          },
        });
        break;

      case 'create_mindmap':
        actions.push({
          type: 'CREATE_MINDMAP',
          id,
          payload: {
            centerX: Number(call.args.centerX) || 600,
            centerY: Number(call.args.centerY) || 400,
            topic: (call.args.topic as string) || 'Topic',
            subtopics: (call.args.subtopics as string[]) || [],
            colorScheme: (call.args.colorScheme as string) || 'purple',
            id,
          },
        });
        break;

      case 'create_flowchart':
        actions.push({
          type: 'CREATE_FLOWCHART',
          id,
          payload: {
            startX: Number(call.args.startX) || 100,
            startY: Number(call.args.startY) || 100,
            nodes: call.args.nodes || [],
            id,
          },
        });
        break;

      case 'clear_canvas':
        if (call.args.confirm === true) {
          actions.push({ type: 'CLEAR_CANVAS', id, payload: {} });
        }
        break;

      default:
        console.warn(`[toolRouter] Unknown tool call: ${call.name}`);
    }
  }

  return actions;
};
