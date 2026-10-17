// ── IndexedDB-backed storage service for KimiWise ─────────────────────────────
// Persists: board sessions, user preferences, Code Lab history

const DB_NAME = 'kimiwise-db';
const DB_VERSION = 1;

const STORES = {
  sessions: 'sessions',      // board canvas JSON + chat history
  prefs:    'preferences',   // theme, voice config, custom API key
  codelab:  'codelab',       // saved code snippets
} as const;

type StoreName = typeof STORES[keyof typeof STORES];

// ── Open / upgrade DB ──────────────────────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      for (const store of Object.values(STORES)) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store);
        }
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror  = () => reject(req.error);
  });
}

// ── Generic CRUD ───────────────────────────────────────────────────────────────

async function get<T>(store: StoreName, key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx  = db.transaction(store, 'readonly');
      const req = tx.objectStore(store).get(key);
      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror   = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function set<T>(store: StoreName, key: string, value: T): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx  = db.transaction(store, 'readwrite');
      const req = tx.objectStore(store).put(value, key);
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[storageService] set failed:', err);
  }
}

async function remove(store: StoreName, key: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx  = db.transaction(store, 'readwrite');
      const req = tx.objectStore(store).delete(key);
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[storageService] remove failed:', err);
  }
}

// ── Session API ────────────────────────────────────────────────────────────────

export interface BoardSession {
  id: string;
  name: string;
  canvasJSON: string;
  messages: Array<{ role: string; text: string }>;
  savedAt: number;
}

export const sessionStorage = {
  async save(session: BoardSession): Promise<void> {
    await set(STORES.sessions, session.id, session);
  },

  async load(id: string): Promise<BoardSession | null> {
    return get<BoardSession>(STORES.sessions, id);
  },

  async remove(id: string): Promise<void> {
    return remove(STORES.sessions, id);
  },

  async loadLatest(): Promise<BoardSession | null> {
    return get<BoardSession>(STORES.sessions, 'latest');
  },

  async saveLatest(session: Omit<BoardSession, 'id'>): Promise<void> {
    await set(STORES.sessions, 'latest', { ...session, id: 'latest' });
  },
};

// ── Preferences API ────────────────────────────────────────────────────────────

export interface UserPrefs {
  theme: 'light' | 'dark';
  customApiKey?: string;
  voiceLanguage: string;
  autoSaveEnabled: boolean;
}

const DEFAULT_PREFS: UserPrefs = {
  theme: 'light',
  voiceLanguage: 'en-IN',
  autoSaveEnabled: true,
};

export const prefStorage = {
  async load(): Promise<UserPrefs> {
    const stored = await get<UserPrefs>(STORES.prefs, 'user');
    return { ...DEFAULT_PREFS, ...stored };
  },

  async save(prefs: Partial<UserPrefs>): Promise<void> {
    const current = await this.load();
    await set(STORES.prefs, 'user', { ...current, ...prefs });
  },
};

// ── Code Lab history API ───────────────────────────────────────────────────────

export interface SavedSnippet {
  id: string;
  code: string;
  language: string;
  label: string;
  savedAt: number;
}

export const snippetStorage = {
  async save(snippet: SavedSnippet): Promise<void> {
    await set(STORES.codelab, snippet.id, snippet);
  },

  async load(id: string): Promise<SavedSnippet | null> {
    return get<SavedSnippet>(STORES.codelab, id);
  },

  async remove(id: string): Promise<void> {
    return remove(STORES.codelab, id);
  },
};

export const storageService = {
  session: sessionStorage,
  prefs:   prefStorage,
  snippet: snippetStorage,
};
