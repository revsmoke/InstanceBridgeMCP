const express = require('express');
const OpenAI = require('openai');
const WebSocket = require('ws');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const agents = new Map();

// Setup OpenAI client
const openaiApiKey = process.env.OPENAI_API_KEY;
let openai;
if (openaiApiKey) {
  openai = new OpenAI({ apiKey: openaiApiKey });
}

// Register an agent
app.post('/register', (req, res) => {
  const { id, url } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Agent id required' });
  }
  agents.set(id, { id, url });
  res.json({ status: 'registered', id });
});

// List registered agents
app.get('/agents', (req, res) => {
  res.json({ agents: Array.from(agents.values()) });
});

// Orchestrator uses OpenAI to respond to messages
app.post('/interact', async (req, res) => {
  const { from, to, message } = req.body;
  if (!from || !to || !message) {
    return res.status(400).json({ error: 'from, to, and message required' });
  }
  const toAgent = agents.get(to);
  if (!toAgent) {
    return res.status(404).json({ error: 'Target agent not found' });
  }

  // simple orchestrator via OpenAI
  if (!openai) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are the orchestrator for agent communication using the Agent2Agent protocol.' },
        { role: 'user', content: message }
      ]
    });
    const reply = completion.data.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error('OpenAI error:', err.message);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// WebSocket for A2A direct interactions
const wss = new WebSocket.Server({ noServer: true });
wss.on('connection', ws => {
  ws.on('message', async data => {
    const { to, message } = JSON.parse(data);
    const toAgent = agents.get(to);
    if (toAgent && toAgent.ws) {
      toAgent.ws.send(JSON.stringify({ from: 'ws', message }));
    } else {
      ws.send(JSON.stringify({ error: 'agent not connected' }));
    }
  });
});

const server = app.listen(PORT, () => {
  console.log(`MCP server listening on port ${PORT}`);
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, ws => {
    const params = new URLSearchParams(request.url.replace('/?', ''));
    const id = params.get('id');
    if (id) {
      agents.set(id, { id, ws });
      wss.emit('connection', ws, request);
    } else {
      socket.destroy();
    }
  });
});
