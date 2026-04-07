#!/usr/bin/env node

/**
 * 高级微调MCP工具测试脚本
 * 测试新增的calculate_advanced_finetuning_vram工具
 */

const { spawn } = require('child_process');
const path = require('path');

// 测试数据
const testCases = [
  {
    name: "NLP模型测试 - LLaMA-7B LoRA微调",
    data: {
      modelType: "nlp",
      modelSize: 7.0,
      architectureType: "LLaMA",
      precision: "fp16",
      batchSize: 4,
      sequenceLength: 2048,
      learningRate: 2e-5,
      optimizer: "adamw",
      trainingEpochs: 3,
      hiddenSize: 4096,
      numLayers: 32,
      loraRank: 16,
      loraAlpha: 32
    }
  },
  {
    name: "多模态模型测试 - LLaVA微调",
    data: {
      modelType: "multimodal",
      modelSize: 7.0,
      architectureType: "LLaVA",
      precision: "fp16",
      batchSize: 8,
      sequenceLength: 1024,
      learningRate: 1e-5,
      optimizer: "adamw",
      trainingEpochs: 5,
      imageResolution: 336,
      patchSize: 14,
      visionFeatureDim: 1024
    }
  },
  {
    name: "MoE模型测试 - Switch Transformer",
    data: {
      modelType: "moe",
      modelSize: 8.0,
      architectureType: "Switch Transformer",
      precision: "bf16",
      batchSize: 16,
      sequenceLength: 2048,
      learningRate: 3e-5,
      optimizer: "adamw",
      trainingEpochs: 2,
      numExperts: 8,
      numActiveExperts: 2,
      expertCapacityFactor: 1.25
    }
  },
  {
    name: "CNN模型测试 - ResNet微调",
    data: {
      modelType: "cnn",
      modelSize: 0.05,
      architectureType: "ResNet",
      precision: "fp32",
      batchSize: 64,
      learningRate: 1e-3,
      optimizer: "sgd",
      trainingEpochs: 100,
      inputImageSize: 224,
      kernelSize: 3
    }
  }
];

async function testMCPTool(testCase) {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 测试: ${testCase.name}`);
    console.log('📊 参数:', JSON.stringify(testCase.data, null, 2));
    
    const curlArgs = [
      '-X', 'POST',
      'http://localhost:3000/api/mcp/tools/call',
      '-H', 'Content-Type: application/json',
      '-d', JSON.stringify({
        name: 'calculate_advanced_finetuning_vram',
        arguments: testCase.data
      })
    ];
    
    const curl = spawn('curl', curlArgs);
    let output = '';
    let error = '';
    
    curl.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    curl.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    curl.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          console.log('✅ 测试成功');
          console.log('📈 结果:', JSON.stringify(result, null, 2));
          resolve(result);
        } catch (parseError) {
          console.log('❌ JSON解析失败:', parseError.message);
          console.log('原始输出:', output);
          reject(parseError);
        }
      } else {
        console.log('❌ 请求失败:', error);
        reject(new Error(`curl failed with code ${code}: ${error}`));
      }
    });
  });
}

async function runTests() {
  console.log('🚀 开始测试高级微调MCP工具...');
  console.log('🌐 确保服务器运行在 http://localhost:3000');
  
  // 等待服务器启动
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (const testCase of testCases) {
    try {
      await testMCPTool(testCase);
      passedTests++;
    } catch (error) {
      console.log(`❌ 测试失败: ${testCase.name}`);
      console.log('错误:', error.message);
    }
    
    // 测试间隔
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 测试总结:');
  console.log(`✅ 通过: ${passedTests}/${totalTests}`);
  console.log(`❌ 失败: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！高级微调MCP工具工作正常。');
    process.exit(0);
  } else {
    console.log('⚠️  部分测试失败，请检查服务器状态和配置。');
    process.exit(1);
  }
}

// 检查服务器是否运行
async function checkServer() {
  return new Promise((resolve) => {
    const curl = spawn('curl', ['-s', 'http://localhost:3000/api/health']);
    curl.on('close', (code) => {
      resolve(code === 0);
    });
  });
}

async function main() {
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ 服务器未运行，请先启动服务器: npm run dev');
    process.exit(1);
  }
  
  await runTests();
}

if (require.main === module) {
  main().catch(console.error);
}
