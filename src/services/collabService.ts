import { io, Socket } from 'socket.io-client';
import { useStore } from '../store';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  CollabUser,
  CanvasJson,
} from '../types';

class CollabService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  public isRemoteSyncing = false;
  private currentRoomId = 'CLASS-101';
  private canvasRef: any = null;
  private pendingCanvasTimer: any = null;
  private lastCursorSendTime = 0;
  private cursorCleanupTimer: any = null;

  public init(initialRoomId?: string, canvasInstance?: any) {
    if (initialRoomId) {
      this.currentRoomId = initialRoomId;
      useStore.getState().setRoomId(initialRoomId);
    }
    if (canvasInstance) {
      this.canvasRef = canvasInstance;
    }

    if (this.socket) {
      if (this.socket.connected && initialRoomId) {
        this.joinRoom(initialRoomId);
      }
      return;
    }

    const socketUrl =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:3030';

    console.log(`[collabService] Connecting to ${socketUrl} for room "${this.currentRoomId}"`);

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('[collabService] Socket connected:', this.socket?.id);
      const store = useStore.getState();
      const myUser: CollabUser = {
        ...store.collab.myUser,
        id: this.socket?.id || store.collab.myUser.id,
      };

      store.setCollabState({
        isCollabActive: true,
        myUser,
      });

      this.socket?.emit('join-room', this.currentRoomId, myUser);
    });

    this.socket.on('room-info', (payload) => {
      console.log(`[collabService] Room "${payload.roomId}" info: ${payload.peerCount} online`, payload.peers);
      const store = useStore.getState();
      const isHost = payload.peers.some(
        (p) => p.id === this.socket?.id && p.isHost
      ) || payload.peers[0]?.id === this.socket?.id;

      store.setCollabState({
        connectedPeers: payload.peerCount,
        peers: payload.peers,
        isHost,
      });
    });

    this.socket.on('canvas-init', (data, slideIndex) => {
      if (data && this.canvasRef) {
        this.applyRemoteCanvas(data, slideIndex);
      }
    });

    this.socket.on('canvas-update', (data, slideIndex) => {
      if (data && this.canvasRef) {
        this.applyRemoteCanvas(data, slideIndex);
      }
    });

    this.socket.on('slide-change', (slideIndex) => {
      const store = useStore.getState();
      if (store.canvas.currentPageIndex !== slideIndex) {
        store.setSlide(slideIndex);
      }
    });

    this.socket.on('remote-cursor', (payload) => {
      if (payload.socketId && payload.socketId !== this.socket?.id) {
        useStore.getState().setRemoteCursor(payload.socketId, payload.cursor, payload.user);
      }
    });

    this.socket.on('remote-cursor-remove', (payload) => {
      if (payload.socketId) {
        useStore.getState().removeRemoteCursor(payload.socketId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('[collabService] Disconnected:', reason);
      useStore.getState().setCollabState({
        isCollabActive: false,
        connectedPeers: 1,
      });
    });

    // Background cleanup of inactive stale cursors every 3 seconds
    if (!this.cursorCleanupTimer) {
      this.cursorCleanupTimer = setInterval(() => {
        const store = useStore.getState();
        const now = Date.now();
        const cursors = store.collab.remoteCursors;
        Object.entries(cursors).forEach(([id, cursor]) => {
          if (now - cursor.lastSeen > 6000) {
            store.removeRemoteCursor(id);
          }
        });
      }, 3000);
    }
  }

  public setCanvas(canvas: any) {
    this.canvasRef = canvas;
  }

  public joinRoom(newRoomId: string) {
    if (!newRoomId || typeof newRoomId !== 'string') return;
    const cleanRoom = newRoomId.trim();
    if (this.currentRoomId === cleanRoom && this.socket?.connected) return;

    if (this.socket && this.socket.connected) {
      this.socket.emit('leave-room', this.currentRoomId);
      this.currentRoomId = cleanRoom;
      useStore.getState().setRoomId(cleanRoom);
      useStore.getState().clearRemoteCursors();
      this.socket.emit('join-room', cleanRoom, useStore.getState().collab.myUser);
      console.log(`[collabService] Switched to room "${cleanRoom}"`);
    } else {
      this.currentRoomId = cleanRoom;
      useStore.getState().setRoomId(cleanRoom);
      this.init(cleanRoom);
    }
  }

  public sendCanvasUpdate(canvasJson: CanvasJson, slideIndex?: number) {
    if (this.isRemoteSyncing || !this.socket || !this.socket.connected) return;

    if (this.pendingCanvasTimer) {
      clearTimeout(this.pendingCanvasTimer);
    }

    this.pendingCanvasTimer = setTimeout(() => {
      if (!this.socket || !this.socket.connected) return;
      this.socket.emit('canvas-update', {
        roomId: this.currentRoomId,
        data: canvasJson,
        slideIndex: slideIndex ?? useStore.getState().canvas.currentPageIndex,
      });
    }, 80);
  }

  public sendCursorPosition(x: number, y: number) {
    if (!this.socket || !this.socket.connected) return;
    const now = performance.now();
    if (now - this.lastCursorSendTime < 35) return; // 30-60fps throttle
    this.lastCursorSendTime = now;

    this.socket.emit('cursor-update', {
      roomId: this.currentRoomId,
      cursor: { x, y },
      user: useStore.getState().collab.myUser,
    });
  }

  public sendSlideChange(slideIndex: number) {
    if (!this.socket || !this.socket.connected) return;
    this.socket.emit('slide-change', {
      roomId: this.currentRoomId,
      slideIndex,
    });
  }

  private applyRemoteCanvas(data: CanvasJson, slideIndex?: number) {
    if (!this.canvasRef) return;
    const currentSlide = useStore.getState().canvas.currentPageIndex;

    // If payload specified a different slide, we note it
    if (slideIndex !== undefined && slideIndex !== currentSlide) {
      // Save data to the target slide in store
      const store = useStore.getState();
      const slides = [...store.canvas.slides];
      if (slides[slideIndex]) {
        slides[slideIndex] = { ...slides[slideIndex], canvasJson: data };
        useStore.setState((s) => ({ canvas: { ...s.canvas, slides } }));
      }
      return;
    }

    this.isRemoteSyncing = true;
    try {
      this.canvasRef.loadFromJSON(data, () => {
        this.canvasRef.backgroundColor = 'transparent';
        this.canvasRef.requestRenderAll();
        (window as any).__KIMIWISE_SYNC_GRID__?.();

        // Release lock after render finishes
        setTimeout(() => {
          this.isRemoteSyncing = false;
        }, 100);
      });
    } catch (err) {
      console.warn('[collabService] Failed to load remote canvas data:', err);
      this.isRemoteSyncing = false;
    }
  }

  public destroy() {
    if (this.pendingCanvasTimer) clearTimeout(this.pendingCanvasTimer);
    if (this.cursorCleanupTimer) clearInterval(this.cursorCleanupTimer);
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const collabService = new CollabService();
