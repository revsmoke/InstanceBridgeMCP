const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

const agents = new Map();

app.post('/register', (req, res) => {
  const { id, name, url } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'id required' });
  }
  agents.set(id, { id, name, url });
  res.json({ registered: id });
});

app.get('/agents', (req, res) => {
  res.json(Array.from(agents.values()));
});

async function orchestrate(messages) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY missing');
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages,
    }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${text}`);
  }
  const data = await response.json();
  return data.choices[0].message.content;
}

app.post('/message', async (req, res) => {
  const { from, to, content } = req.body;
  if (!from || !to || !content) {
    return res.status(400).json({ error: 'from, to and content required' });
  }
  if (to === 'orchestrator') {
    try {
      const reply = await orchestrate([
        { role: 'system', content: 'You are the orchestrator agent coordinating other agents according to the Agent2Agent protocol.' },
        { role: 'user', content }
      ]);
      return res.json({ reply });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  const target = agents.get(to);
  if (!target) return res.status(404).json({ error: 'target not found' });
  // In a real implementation we would forward the message via Agent2Agent protocol
  // For demonstration we just return it
  res.json({ delivered: true, to });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`MCP server listening on port ${PORT}`);
});
