/**
 * 简单的MCP测试脚本
 */

const BASE_URL = 'http://localhost:3001/api/mcp';

async function testMCP() {
  console.log('🚀 开始测试MCP服务器...\n');

  // 测试1: 服务器状态
  console.log('📊 测试1: 检查服务器状态');
  try {
    const response = await fetch(BASE_URL);
    const data = await response.json();
    console.log('✅ 服务器状态:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ 服务器状态检查失败:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试2: MCP初始化
  console.log('🔧 测试2: MCP初始化');
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'test-client',
            version: '1.0.0'
          }
        },
        id: 1
      })
    });

    const data = await response.json();
    console.log('✅ MCP初始化成功:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ MCP初始化失败:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试3: 列出资源
  console.log('📚 测试3: 列出资源');
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'resources/list',
        params: {},
        id: 2
      })
    });

    const data = await response.json();
    console.log('✅ 资源列表:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ 获取资源列表失败:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试4: 列出工具
  console.log('🔨 测试4: 列出工具');
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/list',
        params: {},
        id: 3
      })
    });

    const data = await response.json();
    console.log('✅ 工具列表:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ 获取工具列表失败:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试5: 列出提示模板
  console.log('💬 测试5: 列出提示模板');
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'prompts/list',
        params: {},
        id: 4
      })
    });

    const data = await response.json();
    console.log('✅ 提示模板列表:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ 获取提示模板列表失败:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试6: 调用GPU推荐工具
  console.log('🎯 测试6: 调用GPU推荐工具');
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'recommend_gpu',
          arguments: {
            vramRequired: 16,
            useCase: 'training',
            multiGPU: false
          }
        },
        id: 5
      })
    });

    const data = await response.json();
    console.log('✅ GPU推荐结果:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ GPU推荐工具调用失败:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试7: 读取模型资源
  console.log('📖 测试7: 读取模型资源');
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'resources/read',
        params: {
          uri: 'models://nlp'
        },
        id: 6
      })
    });

    const data = await response.json();
    console.log('✅ 模型资源内容:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ 读取模型资源失败:', error.message);
  }

  console.log('\n🎉 MCP测试完成！');
}

// 运行测试
testMCP().catch(console.error);
