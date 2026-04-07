# LLM VRAM Calculator

<div align="center">
  <h1>🧠 AI VRAM Calculator</h1>
  <p>Professional VRAM requirement calculation tool for Large Language Models and Multimodal Models</p>
  
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![Next.js](https://img.shields.io/badge/Next.js-15.3-black)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-19.0-blue)](https://reactjs.org/)
  
  [GitHub Repository](https://github.com/farromars/vram-calculator) | [Report Issues](https://github.com/farromars/vram-calculator/issues) | [Feature Request](https://github.com/farromars/vram-calculator/issues)
</div>

---

## 📖 Language / 语言

**English** | [中文](README.zh.md)

---

## 📖 Table of Contents

- [What's New](#-whats-new-in-this-version)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [VRAM Calculation Formulas](#-vram-calculation-formulas)
- [Supported Models](#-supported-models)
- [Quick Start](#-quick-start)
- [Docker Deployment](#-docker-deployment)
- [Server Deployment](#-server-deployment)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [MCP Protocol Support](#-mcp-protocol-support)
- [Contributing](#-contributing)
- [License](#-license)

## 🆕 What's New in This Version

This version is a significant secondary development based on the original open-source project, with the following major improvements:

### UI/UX Overhaul
- **Tencent Cloud Design System**: Full UI redesign aligned with TDesign (brand blue `#0052D9`), glassmorphism cards, gradient backgrounds with floating light orbs
- **Chinese Localization**: Complete interface in Chinese, removed language switching
- **Artistic Visual Style**: Background grid patterns, floating gradient orbs with breathing animations, glass-effect navigation bar, gradient brand logo

### Performance Estimation Engine (NEW)
- **Performance & Memory Card**: Donut chart showing VRAM usage percentage + real-time TPS/TTFT/throughput estimation
- **Based on alibaba/InferSim formulas**: Decode phase (memory bandwidth bound) and prefill phase (compute bound)
- **MFU auto-estimation by GPU architecture**: Hopper 0.40, Blackwell 0.35, Ada 0.22-0.30
- **Full scenario support**: Works across all 6 calculation modes (inference, training, fine-tuning, GRPO, multimodal, advanced fine-tuning)

### Tencent Cloud GPU Integration
- **GPU database replaced**: 15 mainstream datacenter GPU models (B200, H800, A800, A100, L40S, V100, RTX 5090D/4090/3090, T4, etc.)
- **Added bandwidth & FP16 TFLOPS data** for all GPUs (used by performance estimation)
- **Removed market price and cloud service price columns** — replaced with memory bandwidth and FP16 compute power

### GPU Selection & Multi-GPU
- **All GPU cards are clickable** — click to select, performance card updates in real-time
- **GPU count slider (1-8 cards)** replaces the old multi-GPU toggle switch
- **Total VRAM = single card × count**, with communication overhead note for multi-GPU

### Help & Documentation
- **New Help/FAQ page** (`/help`) with calculation principles and reference papers
- **New QA.md** — comprehensive project documentation covering integration plan, module details, tech stack explanation, and improvement areas

## ✨ Features

### Core Features
- **🎯 Six Calculation Modes**: Inference, Fine-tuning, Training, GRPO, Multimodal, Advanced Fine-tuning
- **📊 Precise Calculations**: VRAM calculation formulas based on latest engineering practices and unified LLM framework
- **🔧 Advanced Fine-tuning**: Dedicated calculator for NLP, Multimodal, MoE, and CNN models with parameter-level control
- **🎨 Visualization**: Pie charts showing VRAM composition for intuitive understanding of each component's proportion
- **💾 History Records**: Automatic saving of calculation history with comparison analysis support
- **🔧 Configuration Presets**: 12+ preset templates for quick calculation start
- **📱 Responsive Design**: Perfect adaptation for mobile and desktop

### Advanced Features
- **⚡ PWA Support**: Installable as local application with offline usage support
- **🔗 Result Sharing**: Generate sharing links and export calculation reports
- **⌨️ Keyboard Shortcuts**: Improve operational efficiency
- **🤖 MCP Protocol Support**: Support for Model Context Protocol, enabling AI assistants to directly call VRAM calculation functions

### Data Support
- **130+ Pre-trained Models**: Covering mainstream Chinese and international open-source models with intelligent classification
- **22+ Multimodal Models**: Supporting Qwen2.5-VL, QwQ-VL, LLaVA, Whisper, etc.
- **12+ Vector Models**: Supporting Qwen3-Embedding, Qwen3-Reranker series
- **15 Datacenter GPU Specs**: From T4 to B200
- **Smart Recommendations**: Recommend suitable GPUs based on VRAM requirements

## 🛠 Tech Stack

- **Framework**: Next.js 15.3 + React 19
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS + Glassmorphism Design
- **UI Components**: TDesign React + Radix UI
- **State Management**: Zustand
- **Animation**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Tools**: ESLint, Prettier

## 📚 Supported Models

### 🤖 NLP/Language Models (95+ models)

#### Qwen Series
- **Qwen2.5**: 0.5B, 1.5B, 3B, 7B, 14B, 32B, 72B
- **Qwen3**: 1.8B, 7B, 14B, 32B, 72B

#### DeepSeek Series  
- **DeepSeek-V3-671B** (Full MoE, 37B active)
- **DeepSeek-R1-671B** (Full reasoning model)
- **DeepSeek-R1-0528** (Latest reasoning model, 685B parameters)
- **DeepSeek-R1 Series**: 1.5B, 7B, 8B, 14B, 32B, 70B
- **DeepSeek-Coder**: 1.3B, 6.7B, 33B

#### Llama Series
- **Llama-3.1**: 8B, 70B, 405B
- **Llama-2**: 7B, 13B, 70B

#### ChatGLM Series
- **GLM-4-Plus** (100B), **GLM-Z1-32B**, **GLM-4-9B**, **ChatGLM3-6B**

#### Other Models
- **Yi Series**: Yi-Lightning (1000B MoE), Yi-Large (100B), Yi-6B, Yi-34B
- **Mistral-7B**, **Mixtral-8x7B**, **Gemma**, **Phi-3**, **CodeLlama**
- **InternLM2.5**, **Baichuan2**, **Spark** series, **MiniMax**, **Moonshot**

### 🎨 Multimodal Models (22+)
- **Qwen2.5-VL Series**, **QwQ-VL-72B**, **LLaVA**, **Whisper**, **Video-LLaMA**, **Phi-4-Multimodal**

### 🔍 Vector Models (12+)
- **Qwen3-Embedding**: 0.6B, 4B, 8B
- **Qwen3-Reranker**: 0.6B, 4B, 8B

## 📐 VRAM Calculation Formulas

Precise calculation formulas based on unified LLM framework. See [detailed documentation](./docs/VRAM_CALCULATION_FORMULAS.md).

### Unified LLM Framework

```
Total VRAM = Model Weights + Optimizer States + Gradients + Activations + Overhead
```

### 1. Inference
```
Total = Quantized Weights + KV Cache + Activations (minimal)
```

### 2. Fine-tuning (Full / LoRA / QLoRA / Prefix)
```
Total = Weights + (P_train × optimizer_factor) + (P_train × gradient_precision) + Activations
```

### 3. Training
```
Total = Weights + Optimizer(AdamW: 2×4B) + Gradients + Activations (with checkpointing)
```

### 4. GRPO
```
Activations = k × SFT_Activations (k = preference group size)
```

### 5. Multimodal
```
Total_Seq_Len = Text + Image_Patches + Audio_Patches + Video_Patches
```

### 6. Advanced Fine-Tuning (NLP / Multimodal / MoE / CNN)

### Performance Estimation (NEW)
```
Decode TPS = GPU_Bandwidth × MFU / Model_Size_GB
TTFT = 2 × Params × Input_Tokens / (FP16_TFLOPS × MFU)
Throughput = TPS × Batch_Size × Batch_Efficiency
```

## 🚀 Quick Start

### Requirements
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/farromars/vram-calculator.git
cd vram-calculator

# Install dependencies
npm install

# Start development server
npm run dev

# Build production version
npm run build

# Start production server
npm start
```

Visit http://localhost:3000 to view the application

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Using Docker Build

```bash
# Build image
docker build -t llm-vram-calculator .

# Run container
docker run -d \
  --name llm-vram-calculator \
  -p 3000:3000 \
  -e NODE_ENV=production \
  --restart unless-stopped \
  llm-vram-calculator
```

## 🌐 Server Deployment

### Option 1: Nginx Reverse Proxy (Recommended)

Configure Nginx to forward domain requests to the local port 3000.

**Step 1: Install Nginx**

```bash
# TencentOS / CentOS
yum install -y nginx
# or
dnf install -y nginx
```

**Step 2: Create configuration file**

```bash
cat > /etc/nginx/conf.d/vram.conf << 'EOF'
server {
    listen 80;
    server_name your-domain.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
```

**Step 3: Start Nginx**

```bash
nginx -t               # Validate configuration
systemctl start nginx
systemctl enable nginx
```

**Step 4: Access**

```
http://your-domain.example.com
```

---

### Option 3: Background Process with pm2 (Use with Option 1)

Keep the service running after SSH disconnects:

```bash
# Install pm2
npm install -g pm2

# Start the service
cd /path/to/vram-calculator
pm2 start "npx next start -H 0.0.0.0 -p 3000" --name vram-calculator

# Enable auto-start on boot
pm2 startup
pm2 save
```

> **Recommended combination**: Option 1 (Nginx) + Option 3 (pm2) — access via `http://your-domain.example.com` without a port number, and the service stays alive after SSH disconnects.

---

## 📁 Project Structure

```
vram-calculator/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Main page
│   │   ├── help/              # Help/FAQ page
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── calculators/       # 6 calculator components
│   │   ├── gpu-recommendations.tsx    # GPU recommendation + selection
│   │   ├── performance-memory-card.tsx # Performance estimation card
│   │   └── ui/               # UI primitives
│   ├── hooks/                # Custom Hooks
│   ├── lib/                  # Data libraries
│   │   ├── models-data.ts    # 130+ models + 15 Tencent Cloud GPUs
│   │   └── i18n.ts           # Chinese localization
│   ├── store/                # Zustand state management
│   ├── types/                # TypeScript types
│   └── utils/                # Utility functions
│       ├── memory-formulas.ts      # VRAM calculation formulas
│       └── performance-estimator.ts # TPS/TTFT estimation engine
├── public/                   # Static assets
├── docs/                    # Documentation
├── mcp-server/              # MCP Protocol server (standalone npm package)
├── docker-compose.yml       # Docker orchestration
├── Dockerfile              # Docker image
└── package.json
```

## 📚 API Documentation

### Health Check

```http
GET /api/health
```

### MCP Endpoint

```http
POST /api/mcp
```

## 🤖 MCP Protocol Support

This project supports [Model Context Protocol (MCP)](https://modelcontextprotocol.io/), enabling AI assistants to directly call VRAM calculation functions.

### Quick Start
```bash
# Install MCP server
npm install -g vram-calculator-mcp-server

# Start MCP server
vram-calculator-mcp
```

### Integration
```json
{
  "mcpServers": {
    "vram-calculator": {
      "command": "vram-calculator-mcp"
    }
  }
}
```

See [MCP Implementation Summary](./MCP_IMPLEMENTATION_SUMMARY.md) and [MCP Usage Examples](./MCP_USAGE_EXAMPLES.md) for details.

## 🤝 Contributing

1. Fork this repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Original Project & Acknowledgments

This project is a secondary development based on the open-source project **[vram-wuhrai](https://github.com/st-lzh/vram-wuhrai)** by **[st-lzh (Wuhr AI Team)](https://github.com/st-lzh)**.

The original project provides:
- Complete VRAM calculation engine (6 calculation modes, 130+ model database)
- GPU recommendation system
- MCP Protocol server implementation
- Project architecture and infrastructure

**Original author**: [st-lzh](https://github.com/st-lzh) / [Wuhr AI Team](https://wuhrai.com)  
**Original repository**: [https://github.com/st-lzh/vram-wuhrai](https://github.com/st-lzh/vram-wuhrai)  
**License**: MIT

We sincerely thank the original author for their excellent open-source contribution.
