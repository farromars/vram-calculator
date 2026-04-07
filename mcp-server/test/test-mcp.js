/**
 * Test script for VRAM Calculator MCP Server
 */

const { spawn } = require('child_process');
const path = require('path');

async function testMCPServer() {
  console.log('🚀 Testing VRAM Calculator MCP Server...\n');

  // Start the MCP server
  const serverPath = path.join(__dirname, '..', 'dist', 'index.js');
  const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let testsPassed = 0;
  let totalTests = 0;

  function sendRequest(request) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 5000);

      let response = '';
      
      const onData = (data) => {
        response += data.toString();
        try {
          const parsed = JSON.parse(response);
          clearTimeout(timeout);
          server.stdout.off('data', onData);
          resolve(parsed);
        } catch (e) {
          // Continue collecting data
        }
      };

      server.stdout.on('data', onData);
      server.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  async function runTest(name, testFn) {
    totalTests++;
    try {
      console.log(`📋 Test ${totalTests}: ${name}`);
      await testFn();
      console.log(`✅ PASSED: ${name}\n`);
      testsPassed++;
    } catch (error) {
      console.log(`❌ FAILED: ${name}`);
      console.log(`   Error: ${error.message}\n`);
    }
  }

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 1: Initialize
  await runTest('MCP Initialization', async () => {
    const response = await sendRequest({
      jsonrpc: '2.0',
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' }
      },
      id: 1
    });

    if (!response.result || !response.result.serverInfo) {
      throw new Error('Invalid initialization response');
    }
  });

  // Test 2: List Resources
  await runTest('List Resources', async () => {
    const response = await sendRequest({
      jsonrpc: '2.0',
      method: 'resources/list',
      params: {},
      id: 2
    });

    if (!response.result || !response.result.resources || response.result.resources.length === 0) {
      throw new Error('No resources returned');
    }
  });

  // Test 3: Read Model Resource
  await runTest('Read NLP Models Resource', async () => {
    const response = await sendRequest({
      jsonrpc: '2.0',
      method: 'resources/read',
      params: { uri: 'models://nlp' },
      id: 3
    });

    if (!response.result || !response.result.contents || response.result.contents.length === 0) {
      throw new Error('No model data returned');
    }

    const modelData = JSON.parse(response.result.contents[0].text);
    if (!modelData.models || modelData.models.length === 0) {
      throw new Error('No models in database');
    }
  });

  // Test 4: List Tools
  await runTest('List Tools', async () => {
    const response = await sendRequest({
      jsonrpc: '2.0',
      method: 'tools/list',
      params: {},
      id: 4
    });

    if (!response.result || !response.result.tools || response.result.tools.length === 0) {
      throw new Error('No tools returned');
    }
  });

  // Test 5: Calculate VRAM
  await runTest('Calculate VRAM for Llama 2 7B', async () => {
    const response = await sendRequest({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'calculate_vram',
        arguments: {
          modelId: 'llama-2-7b',
          mode: 'training',
          batchSize: 4,
          sequenceLength: 2048,
          precision: 'fp16'
        }
      },
      id: 5
    });

    if (!response.result || !response.result.content) {
      throw new Error('No calculation result returned');
    }

    const result = JSON.parse(response.result.content[0].text);
    if (!result.totalVRAM || result.totalVRAM <= 0) {
      throw new Error('Invalid VRAM calculation result');
    }
  });

  // Test 6: GPU Recommendation
  await runTest('GPU Recommendation', async () => {
    const response = await sendRequest({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'recommend_gpu',
        arguments: {
          vramRequired: 16,
          budget: 2000,
          useCase: 'training'
        }
      },
      id: 6
    });

    if (!response.result || !response.result.content) {
      throw new Error('No recommendation result returned');
    }

    const result = JSON.parse(response.result.content[0].text);
    if (!result.recommendations) {
      throw new Error('No GPU recommendations returned');
    }
  });

  // Test 7: Model Comparison
  await runTest('Model Comparison', async () => {
    const response = await sendRequest({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'compare_models',
        arguments: {
          modelIds: ['llama-2-7b', 'qwen2.5-7b'],
          mode: 'inference',
          precision: 'fp16'
        }
      },
      id: 7
    });

    if (!response.result || !response.result.content) {
      throw new Error('No comparison result returned');
    }

    const result = JSON.parse(response.result.content[0].text);
    if (!result.comparisons || result.comparisons.length !== 2) {
      throw new Error('Invalid comparison result');
    }
  });

  // Cleanup
  server.kill();

  // Results
  console.log('🎉 Test Results:');
  console.log(`✅ Passed: ${testsPassed}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - testsPassed}/${totalTests}`);
  
  if (testsPassed === totalTests) {
    console.log('\n🎊 All tests passed! MCP server is working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please check the implementation.');
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run tests
testMCPServer().catch(console.error);
