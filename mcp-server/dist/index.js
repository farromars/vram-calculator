#!/usr/bin/env node
"use strict";
/**
 * VRAM Calculator MCP Server
 * Standalone Model Context Protocol server for AI VRAM calculation and GPU recommendation
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const server_js_1 = require("./server.js");
async function main() {
    // Create the VRAM calculator server
    const vramServer = new server_js_1.VRAMCalculatorServer();
    // Create MCP server
    const server = new index_js_1.Server({
        name: 'vram-calculator-mcp-server',
        version: '1.0.0',
    }, {
        capabilities: {
            resources: {},
            tools: {},
            prompts: {},
        },
    });
    // Register handlers
    server.setRequestHandler(types_js_1.ListResourcesRequestSchema, async () => {
        return vramServer.listResources();
    });
    server.setRequestHandler(types_js_1.ReadResourceRequestSchema, async (request) => {
        return vramServer.readResource(request.params.uri);
    });
    server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
        return vramServer.listTools();
    });
    server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
        return vramServer.callTool(request.params.name, request.params.arguments || {});
    });
    // Connect to stdio transport
    const transport = new stdio_js_1.StdioServerTransport();
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
//# sourceMappingURL=index.js.map