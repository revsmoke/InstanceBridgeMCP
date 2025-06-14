# InstanceBridgeMCP

This project provides a minimal Model Context Protocol (MCP) server written in Node.js. The server allows LLM agent instances to register and interact with each other. An orchestrator agent uses the OpenAI API to facilitate conversations between agents following the Agent2Agent protocol.

## Features

- **Agent Registration** – Agents can register via HTTP and connect via WebSocket for Agent2Agent communication.
- **Local or Remote Server** – Run locally for development or deploy as a remote MCP server.
- **Orchestrator Agent** – Utilizes OpenAI's API to generate responses and coordinate interactions.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Provide an `OPENAI_API_KEY` environment variable to enable the orchestrator.

3. Start the server:

```bash
node index.js
```

The server listens on port `3000` by default.

## API Endpoints

- `POST /register` – Register an agent `{ id, url }`.
- `GET /agents` – List registered agents.
- `POST /interact` – Send a message between agents and get an orchestrated response using OpenAI.

WebSocket connections can be made to `ws://HOST:PORT?id=AGENT_ID` for realtime Agent2Agent messaging.

## References

- [MCP LLMs Full List](https://modelcontextprotocol.io/llms-full.txt)
- [MCP Schema](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/schema/2025-03-26/schema.json)
- [OpenAI Responses API](https://platform.openai.com/docs/api-reference/responses)
- [Tools & Remote MCP Guide](https://platform.openai.com/docs/guides/tools-remote-mcp#page-top)
