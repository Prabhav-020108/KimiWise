import 'dotenv/config';

// Suppress @google/genai SDK false-positive warnings
const _warn = console.warn.bind(console);
console.warn = (...args: unknown[]) => {
  const msg = typeof args[0] === 'string' ? args[0] : '';
  if (msg.includes('non-text parts') && msg.includes('functionCall')) return;
  _warn(...args);
};

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer } from 'http';
import { Server } from 'socket.io';
import os from 'os';
import { aiRouter } from './aiRouter';
import { codeLabRouter } from './codeLabRouter';
import { CONFIG } from '../constants';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketInterServerEvents,
  SocketData,
  RoomState,
  CanvasJson,
  DomElementState,
  ViewportTransform,
  CollabUser,
} from '../types';

// ── Room persistence ──────────────────────────────────────────────────────────

const ROOMS_FILE =
  process.env.ROOMS_FILE_PATH ||
  path.join(process.cwd(), CONFIG.server.roomsPersistenceFile);

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let isSaving = false;
let pendingSave = false;

function saveRooms(rooms: Map<string, RoomState>): void {
  if (isSaving) { pendingSave = true; return; }
  if (saveTimeout) return;

  saveTimeout = setTimeout(async () => {
    saveTimeout = null;
    isSaving = true;
    try {
      const data = JSON.stringify(Array.from(rooms.entries()));
      const tmp = `${ROOMS_FILE}.tmp`;
      await fs.promises.writeFile(tmp, data, 'utf8');
      await fs.promises.rename(tmp, ROOMS_FILE);
    } catch (e) {
      console.error('[server] Failed to save rooms:', e);
    } finally {
      isSaving = false;
      if (pendingSave) { pendingSave = false; saveRooms(rooms); }
    }
  }, 2000);
}

function loadRooms(): Map<string, RoomState> {
  try {
    if (fs.existsSync(ROOMS_FILE)) {
      const data = fs.readFileSync(ROOMS_FILE, 'utf8');
      return new Map(JSON.parse(data) as [string, RoomState][]);
    }
  } catch (e) {
    console.error('[server] Failed to load rooms:', e);
  }
  return new Map();
}

// ── Server bootstrap ──────────────────────────────────────────────────────────

async function startServer(): Promise<void> {
  const app = express();
  const PORT = Number(process.env.SERVER_PORT || process.env.PORT || CONFIG.server.defaultPort);

  const allowedOrigin =
    process.env.ALLOWED_ORIGIN ||
    (process.env.NODE_ENV === 'production' ? false : '*');

  const httpServer = createServer(app);
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    SocketInterServerEvents,
    SocketData
  >(httpServer, {
    cors: { origin: allowedOrigin, methods: ['GET', 'POST'] },
  });

  const rooms = loadRooms();

  // ── Socket.IO — Real-time board collaboration ─────────────────────────────

  const roomPeers = new Map<string, Map<string, CollabUser>>();

  io.on('connection', (socket) => {
    console.log(`[socket] Connected: ${socket.id}`);

    socket.on('join-room', (roomId: string, user?: CollabUser) => {
      if (typeof roomId !== 'string' || !roomId.trim() || roomId.length > 128) return;
      socket.join(roomId);
      socket.data.roomId = roomId;

      if (!roomPeers.has(roomId)) {
        roomPeers.set(roomId, new Map());
      }
      const peersMap = roomPeers.get(roomId)!;

      const palette = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
      const collabUser: CollabUser = user || {
        id: socket.id,
        name: peersMap.size === 0 ? 'Teacher (Host)' : `Student ${peersMap.size + 1}`,
        color: palette[peersMap.size % palette.length],
        isHost: peersMap.size === 0,
      };

      socket.data.user = collabUser;
      peersMap.set(socket.id, collabUser);

      if (!rooms.has(roomId)) {
        rooms.set(roomId, { state: [], viewports: {}, domElements: {}, lastViewport: null, currentSlideIndex: 0 });
        saveRooms(rooms);
      }

      const room = rooms.get(roomId)!;
      socket.emit('canvas-init', room.state as CanvasJson, room.currentSlideIndex || 0);
      if (room.lastViewport) {
        socket.emit('viewport-update', { socketId: 'host', viewport: room.lastViewport });
      }
      if (room.domElements) {
        socket.emit('dom-elements-init', room.domElements);
      }

      // Broadcast room info with active peers to all room members
      io.to(roomId).emit('room-info', {
        roomId,
        peerCount: peersMap.size,
        peers: Array.from(peersMap.values()),
      });

      console.log(`[socket] "${collabUser.name}" (${socket.id}) joined room: ${roomId} [${peersMap.size} online]`);
    });

    socket.on('leave-room', (roomId: string) => {
      if (typeof roomId !== 'string' || !roomId.trim()) return;
      socket.leave(roomId);
      const peersMap = roomPeers.get(roomId);
      if (peersMap) {
        peersMap.delete(socket.id);
        io.to(roomId).emit('room-info', {
          roomId,
          peerCount: peersMap.size,
          peers: Array.from(peersMap.values()),
        });
        socket.to(roomId).emit('remote-cursor-remove', { socketId: socket.id });
      }
    });

    socket.on('canvas-update', ({ roomId, data, slideIndex }: { roomId: string; data: CanvasJson; slideIndex?: number }) => {
      if (typeof roomId !== 'string' || !roomId.trim() || roomId.length > 128) return;
      const room = rooms.get(roomId);
      if (room) {
        room.state = data;
        if (slideIndex !== undefined) room.currentSlideIndex = slideIndex;
        saveRooms(rooms);
      }
      socket.to(roomId).emit('canvas-update', data, slideIndex);
    });

    socket.on('slide-change', ({ roomId, slideIndex }: { roomId: string; slideIndex: number }) => {
      if (typeof roomId !== 'string' || !roomId.trim()) return;
      const room = rooms.get(roomId);
      if (room) {
        room.currentSlideIndex = slideIndex;
        saveRooms(rooms);
      }
      socket.to(roomId).emit('slide-change', slideIndex);
    });

    socket.on('cursor-update', ({ roomId, cursor, user }: { roomId: string; cursor: { x: number; y: number }; user: CollabUser }) => {
      if (typeof roomId !== 'string' || !roomId.trim() || !cursor) return;
      socket.to(roomId).emit('remote-cursor', {
        socketId: socket.id,
        cursor,
        user: user || socket.data.user || { id: socket.id, name: 'Participant', color: '#2563eb' },
      });
    });

    socket.on('viewport-update', ({ roomId, viewport }: { roomId: string; viewport: ViewportTransform }) => {
      if (typeof roomId !== 'string' || !roomId.trim() || !viewport) return;
      const room = rooms.get(roomId);
      if (room) {
        room.viewports[socket.id] = viewport;
        room.lastViewport = viewport;
        saveRooms(rooms);
      }
      socket.to(roomId).emit('viewport-update', { socketId: socket.id, viewport });
    });

    socket.on('dom-elements-update', ({ roomId, domElements }: { roomId: string; domElements: Record<string, DomElementState> }) => {
      if (typeof roomId !== 'string' || !roomId.trim() || !domElements) return;
      const room = rooms.get(roomId);
      if (room) { room.domElements = domElements; saveRooms(rooms); }
      socket.to(roomId).emit('dom-elements-update', domElements);
    });

    socket.on('disconnect', () => {
      const roomId = socket.data.roomId;
      if (roomId) {
        const peersMap = roomPeers.get(roomId);
        if (peersMap) {
          peersMap.delete(socket.id);
          io.to(roomId).emit('room-info', {
            roomId,
            peerCount: peersMap.size,
            peers: Array.from(peersMap.values()),
          });
          socket.to(roomId).emit('remote-cursor-remove', { socketId: socket.id });
        }
      }
      console.log(`[socket] Disconnected: ${socket.id}`);
    });
  });

  // ── REST API routes ───────────────────────────────────────────────────────

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      app: 'KimiWise',
      env: process.env.NODE_ENV || 'development',
      aiMode: process.env.AI_MODE || 'auto',
      version: process.env.npm_package_version || '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/network-info', (_req, res) => {
    const interfaces = os.networkInterfaces();
    const addresses: string[] = [];
    for (const name of Object.keys(interfaces)) {
      for (const iface of (interfaces[name] || [])) {
        if (iface.family === 'IPv4' && !iface.internal) {
          addresses.push(iface.address);
        }
      }
    }
    const port = process.env.SERVER_PORT || process.env.PORT || PORT;
    const primaryIp = addresses[0] || 'localhost';
    res.json({
      primaryIp,
      addresses,
      port: Number(port),
      primaryUrl: `http://${primaryIp}:${port}`,
      hostname: os.hostname(),
    });
  });

  app.use('/api/ai', aiRouter);
  app.use('/api/codelab', codeLabRouter);

  // ── Vite dev middleware / static prod serve ───────────────────────────────

  const distPath = process.env.APP_DIST_PATH || path.join(process.cwd(), 'dist');
  const hasDistBuild = fs.existsSync(path.join(distPath, 'index.html'));

  if (process.env.NODE_ENV !== 'production' || !hasDistBuild) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    // Serve SPA shell for all non-API HTML requests
    app.use(async (req, res, next) => {
      const url = req.originalUrl;
      const accept = req.headers.accept || '';
      if (
        accept.includes('text/html') &&
        !url.startsWith('/api') &&
        !url.startsWith('/@') &&
        !url.includes('.')
      ) {
        try {
          const indexPath = path.join(process.cwd(), 'index.html');
          let template = await fs.promises.readFile(indexPath, 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
          return;
        } catch (e) {
          return next(e);
        }
      }
      next();
    });

    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get(/^\/(?!api).*/, (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // ── Start listening ───────────────────────────────────────────────────────

  httpServer.listen(PORT, CONFIG.server.host, () => {
    const bar = '─'.repeat(50);
    console.log(`\n┌${bar}┐`);
    console.log(`│  🧠 KimiWise AI Classroom — Server Started        │`);
    console.log(`├${bar}┤`);
    console.log(`│  Local:   http://localhost:${PORT}${' '.repeat(Math.max(0, 21 - String(PORT).length))}│`);
    const hasKey = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.API_KEY);
    console.log(`│  AI Mode: ${hasKey ? 'Gemma 4 (Cloud) ✓' : 'Ollama (Local) ○'}${' '.repeat(Math.max(0, 31 - (hasKey ? 17 : 16)))}│`);
    console.log(`└${bar}┘\n`);
  });
}

startServer().catch((err) => {
  console.error('[server] Fatal startup error:', err);
  process.exit(1);
});
