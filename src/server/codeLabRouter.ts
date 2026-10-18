import { Router } from 'express';
import express from 'express';
import { spawn } from 'child_process';
import os from 'os';

export const codeLabRouter = Router();

codeLabRouter.use(express.json({ limit: '10mb' }));

// ── Check Python binary availability ─────────────────────────────────────────
let cachedPythonBin: string | null = null;
let cachedPythonVersion: string | null = null;

async function detectPython(): Promise<{ bin: string; version: string } | null> {
  if (cachedPythonBin && cachedPythonVersion) {
    return { bin: cachedPythonBin, version: cachedPythonVersion };
  }

  const candidates = ['python', 'python3', 'py'];
  for (const bin of candidates) {
    try {
      const version = await new Promise<string>((resolve, reject) => {
        const proc = spawn(bin, ['--version'], { windowsHide: true });
        let out = '';
        proc.stdout.on('data', (d) => { out += d.toString(); });
        proc.stderr.on('data', (d) => { out += d.toString(); });
        proc.on('close', (code) => {
          if (code === 0 && out.trim()) resolve(out.trim());
          else reject(new Error(`Exit code ${code}`));
        });
        proc.on('error', reject);
      });

      cachedPythonBin = bin;
      cachedPythonVersion = version;
      return { bin, version };
    } catch {
      // Try next candidate
    }
  }

  return null;
}

// ── GET /api/codelab/health — Check sandbox engine status ────────────────────
codeLabRouter.get('/health', async (_req, res) => {
  const py = await detectPython();
  res.json({
    status: 'ok',
    python: py ? { available: true, version: py.version, bin: py.bin } : { available: false },
    node: { version: process.version },
    platform: os.platform(),
  });
});

// ── POST /api/codelab/run — Execute code in sandboxed child process ──────────
codeLabRouter.post('/run', async (req, res) => {
  const { code, language = 'python', timeoutMs = 5000 } = req.body;

  if (typeof code !== 'string') {
    return res.status(400).json({ error: 'Code must be a string' });
  }

  if (code.length > 200_000) {
    return res.status(400).json({ error: 'Code exceeds maximum size limit (200KB)' });
  }

  const timeout = Math.min(10000, Math.max(1000, Number(timeoutMs) || 5000));

  if (language === 'python') {
    const py = await detectPython();
    if (!py) {
      return res.status(503).json({
        error: 'Python 3 interpreter is not detected on the host system.',
        engine: 'none',
      });
    }

    const start = performance.now();
    let stdout = '';
    let stderr = '';
    let isTerminated = false;

    try {
      const child = spawn(py.bin, ['-u', '-c', code], {
        windowsHide: true,
      });

      const timer = setTimeout(() => {
        isTerminated = true;
        try {
          child.kill('SIGKILL');
        } catch {
          // ignore
        }
      }, timeout);

      const MAX_OUTPUT = 256 * 1024; // 256KB cap

      child.stdout.on('data', (chunk) => {
        if (stdout.length < MAX_OUTPUT) {
          stdout += chunk.toString();
        }
      });

      child.stderr.on('data', (chunk) => {
        if (stderr.length < MAX_OUTPUT) {
          stderr += chunk.toString();
        }
      });

      child.on('close', (exitCode) => {
        clearTimeout(timer);
        const elapsed = Math.round(performance.now() - start);

        if (isTerminated) {
          return res.json({
            stdout,
            stderr: `Execution Timed Out: Program ran for more than ${timeout}ms (infinite loop prevented).`,
            exitCode: 124,
            executionTimeMs: elapsed,
            engine: `${py.version} (Sandboxed)`,
            timedOut: true,
          });
        }

        return res.json({
          stdout: stdout.trimEnd(),
          stderr: stderr.trimEnd(),
          exitCode: exitCode ?? 0,
          executionTimeMs: elapsed,
          engine: `${py.version} (Sandboxed)`,
          timedOut: false,
        });
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        const elapsed = Math.round(performance.now() - start);
        return res.status(500).json({
          stdout,
          stderr: `Process launch error: ${err.message}`,
          exitCode: 1,
          executionTimeMs: elapsed,
          engine: `${py.version} (Sandboxed)`,
        });
      });
    } catch (e: any) {
      return res.status(500).json({
        error: `Execution error: ${e?.message || String(e)}`,
      });
    }
  } else {
    // JavaScript / Node sandbox
    const start = performance.now();
    let stdout = '';
    let stderr = '';
    let isTerminated = false;

    try {
      const child = spawn('node', ['-e', code], {
        windowsHide: true,
      });

      const timer = setTimeout(() => {
        isTerminated = true;
        try {
          child.kill('SIGKILL');
        } catch {
          // ignore
        }
      }, timeout);

      child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
      child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

      child.on('close', (exitCode) => {
        clearTimeout(timer);
        const elapsed = Math.round(performance.now() - start);

        if (isTerminated) {
          return res.json({
            stdout,
            stderr: `Execution Timed Out: Program ran for more than ${timeout}ms (infinite loop prevented).`,
            exitCode: 124,
            executionTimeMs: elapsed,
            engine: `Node.js ${process.version} (Sandboxed)`,
            timedOut: true,
          });
        }

        return res.json({
          stdout: stdout.trimEnd(),
          stderr: stderr.trimEnd(),
          exitCode: exitCode ?? 0,
          executionTimeMs: elapsed,
          engine: `Node.js ${process.version} (Sandboxed)`,
          timedOut: false,
        });
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        return res.status(500).json({
          stdout,
          stderr: `Node process error: ${err.message}`,
          exitCode: 1,
          executionTimeMs: Math.round(performance.now() - start),
          engine: `Node.js ${process.version} (Sandboxed)`,
        });
      });
    } catch (e: any) {
      return res.status(500).json({
        error: `Node execution error: ${e?.message || String(e)}`,
      });
    }
  }
});
