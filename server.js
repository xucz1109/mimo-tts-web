#!/usr/bin/env node
/**
 * MiMo TTS Web — Backend Server
 *
 * Exposes a single-page web UI for text-to-speech via the MiMo v2 TTS API.
 *
 * Env vars:
 *   MIMO_API_KEY      (required) MiMo platform API key
 *   MIMO_API_ENDPOINT (optional) Override API endpoint
 *   MIMO_TTS_MODEL    (optional) Override model name
 *   PORT              (optional) HTTP port, default 3210
 */

const express = require('express');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3210;

// Parse JSON bodies (1 MB limit)
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Health ─────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  const hasKey = !!process.env.MIMO_API_KEY;
  res.json({ status: 'ok', hasApiKey: hasKey });
});

// ── TTS endpoint ───────────────────────────────────────────────────────────
app.post('/api/tts', async (req, res) => {
  try {
    const { text, style } = req.body;

    // Validate
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'text is required' });
    }
    if (text.length > 10000) {
      return res.status(400).json({ error: 'text too long (max 10000 chars)' });
    }

    // Prepare temp files
    const id = crypto.randomUUID();
    const tmpDir = os.tmpdir();
    const outPath = path.join(tmpDir, `tts_${id}.wav`);

    // Build command — call the TTS script
    const scriptPath = path.join(__dirname, 'scripts', 'tts_to_wav.sh');
    const args = [scriptPath, text.trim(), outPath];
    if (style && typeof style === 'string' && style.trim()) {
      args.push(style.trim());
    }

    // Pass API key via env
    const env = { ...process.env };
    if (!env.MIMO_API_KEY) {
      // Try reading from openclaw.json
      const openclawConfig = path.join(os.homedir(), '.openclaw', 'openclaw.json');
      if (fs.existsSync(openclawConfig)) {
        try {
          const config = JSON.parse(fs.readFileSync(openclawConfig, 'utf8'));
          env.MIMO_API_KEY = config.models?.providers?.xiaomi?.apiKey;
        } catch { /* ignore */ }
      }
    }

    if (!env.MIMO_API_KEY) {
      return res.status(500).json({ error: 'MIMO_API_KEY not configured. Set it as env var or in ~/.openclaw/openclaw.json' });
    }

    // Execute TTS
    let stderr = '';
    try {
      execFileSync('bash', args, {
        env,
        timeout: 120000, // 2 min
        maxBuffer: 50 * 1024 * 1024,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    } catch (err) {
      stderr = (err.stderr || err.message || '').toString();
      // Clean up temp file
      try { fs.unlinkSync(outPath); } catch {}
      return res.status(500).json({ error: stderr || 'TTS generation failed' });
    }

    // Read result
    if (!fs.existsSync(outPath) || fs.statSync(outPath).size === 0) {
      return res.status(500).json({ error: 'TTS returned empty file' });
    }

    const wavBuffer = fs.readFileSync(outPath);
    const fileBase64 = wavBuffer.toString('base64');
    const fileSize = wavBuffer.length;

    // Cleanup
    try { fs.unlinkSync(outPath); } catch {}

    return res.json({
      success: true,
      audio: fileBase64,
      size: fileSize,
      filename: `tts_${id}.wav`,
    });
  } catch (err) {
    console.error('TTS error:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
});

// ── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎙️  MiMo TTS Web listening on http://localhost:${PORT}`);
});
