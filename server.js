import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env.local first, then fallback to .env
dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const NVIDIA_MODEL   = 'openai/gpt-oss-20b';

app.use(cors());
app.use(express.json());

// ──────────────────────────────────────────────
// POST /api/chat  — streaming SSE endpoint
// ──────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, stream = false } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const apiKey = process.env.NVIDIA_API_KEY;

    // ── Mock mode when no key is configured ──
    if (!apiKey || apiKey === 'your_nvidia_api_key_here') {
      const lastMessage = messages[messages.length - 1]?.content || '';
      return res.json({
        reply: `(Mock Mode) NVIDIA API key not configured. You said: "${lastMessage}"`,
      });
    }

    // ── Streaming mode ──
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      const nvidiaRes = await fetch(NVIDIA_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'text/event-stream',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: NVIDIA_MODEL,
          messages,
          temperature: 1,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
          max_tokens: 4096,
          stream: true,
          reasoning_effort: 'medium',
        }),
      });

      if (!nvidiaRes.ok) {
        const errorText = await nvidiaRes.text();
        console.error('NVIDIA API Error:', errorText);
        res.write(`data: [ERROR] ${errorText}\n\n`);
        res.end();
        return;
      }

      // Pipe the NVIDIA SSE stream back to the client
      const reader = nvidiaRes.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(decoder.decode(value, { stream: true }));
      }

      res.end();
      return;
    }

    // ── Non-streaming mode ──
    const nvidiaRes = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        messages,
        temperature: 1,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 4096,
        stream: false,
        reasoning_effort: 'medium',
      }),
    });

    if (!nvidiaRes.ok) {
      const errorData = await nvidiaRes.json().catch(() => ({}));
      console.error('NVIDIA API Error:', errorData);
      return res.status(nvidiaRes.status).json({ error: 'Failed to fetch response from NVIDIA AI' });
    }

    const data = await nvidiaRes.json();
    res.json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Using model: ${NVIDIA_MODEL} via NVIDIA NIM API`);
});
