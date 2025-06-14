# InstanceBridgeMCP

This project implements a simple Model Context Protocol (MCP) server that allows local or remote LLM agents to register and interact with each other. It provides an orchestrator agent built on top of the OpenAI API and demonstrates the Agent2Agent protocol.

## Features

- Register agent instances via `/register`
- List registered agents via `/agents`
- Send messages between agents via `/message`
- Orchestrator agent uses [OpenAI responses API](https://platform.openai.com/docs/api-reference/responses) to coordinate interactions

The server is implemented in Node.js using Express. It can run locally or be deployed remotely.

## Usage

Install dependencies and start the server:

```bash
npm install
npm start
```

Set `OPENAI_API_KEY` in your environment to enable orchestrator functionality.

## References

- [MCP Schema](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/schema/2025-03-26/schema.json)
- [Sample LLM List](https://modelcontextprotocol.io/llms-full.txt)
- [OpenAI responses API](https://platform.openai.com/docs/api-reference/responses)
- [Agent2Agent Protocol Guide](https://platform.openai.com/docs/guides/tools-remote-mcp#page-top)
