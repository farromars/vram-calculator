#!/usr/bin/env node

/**
 * VRAM Calculator MCP Server
 * Standalone Model Context Protocol server for AI VRAM calculation and GPU recommendation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListResourcesRequestSchema, ListToolsRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { VRAMCalculatorServer } from './server.js';

async function main() {
  // Create the VRAM calculator server
  const vramServer = new VRAMCalculatorServer();
  
  // Create MCP server
  const server = new Server(
    {
      name: 'vram-calculator-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        resources: {},
        tools: {},
        prompts: {},
      },
    }
  );

  // Register handlers
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return vramServer.listResources();
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    return vramServer.readResource(request.params.uri);
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return vramServer.listTools();
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    return vramServer.callTool(request.params.name, request.params.arguments || {});
  });

  // Connect to stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('VRAM Calculator MCP Server running on stdio');
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.error('Shutting down VRAM Calculator MCP Server...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('Shutting down VRAM Calculator MCP Server...');
  process.exit(0);
});

// Start the server
main().catch((error) => {
  console.error('Failed to start VRAM Calculator MCP Server:', error);
  process.exit(1);
});
