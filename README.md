# 🎙️ MiMo TTS Web

基于 [MiMo v2 TTS](https://xiaomimimo.com) 的文字转语音 Web 应用。输入文本，选择风格，一键生成语音，支持在线试听和下载 WAV 文件。

## 截图

![UI Preview](https://img.shields.io/badge/MiMo-TTS-purple)

## ✨ 功能

- **文字转语音** — 输入文本，调用 MiMo v2 TTS API 生成语音
- **多种风格** — 支持开心、悲伤、东北话、粤语等预设风格，也可自定义
- **在线试听** — 生成后直接在网页上播放
- **下载 WAV** — 一键下载标准 WAV 格式音频文件
- **键盘快捷键** — `Ctrl + Enter` 快速生成

## 🚀 快速开始

### 1. 安装依赖

```bash
cd mimo-tts-web
npm install
```

### 2. 配置 API Key

需要 MiMo 平台的 API Key。任选一种方式：

**方式 A：环境变量**

```bash
export MIMO_API_KEY="your-api-key-here"
```

**方式 B：OpenClaw 配置**

如果你已安装 OpenClaw，API Key 可以从 `~/.openclaw/openclaw.json` 自动读取。

### 3. 启动

```bash
npm start
```

访问 `http://localhost:3210`

### 4. 自定义端口

```bash
PORT=8080 npm start
```

## 🎨 预设风格

| 风格 | 说明 |
|------|------|
| 😊 开心 | 欢快愉悦的语气 |
| 😢 悲伤 | 低沉哀伤的语气 |
| 🐢 语速慢 | 慢速清晰的播报 |
| 🤫 悄悄话 | 轻声细语 |
| 🌲 东北话 | 地道东北口音 |
| 🌶️ 四川话 | 四川方言 |
| 🧋 台湾腔 | 软糯台湾腔调 |
| 🥟 粤语 | 广东话 |
| ⚔️ 像个大将军 | 威严霸气 |
| ⏹️ 自定义 | 输入任意风格描述 |

## 📁 项目结构

```
mimo-tts-web/
├── server.js          # Express 后端
├── public/
│   └── index.html     # 前端页面
├── scripts/
│   └── tts_to_wav.sh  # MiMo TTS 调用脚本
├── package.json
└── README.md
```

## ⚙️ 环境变量

| 变量 | 必需 | 说明 |
|------|------|------|
| `MIMO_API_KEY` | ✅ | MiMo API 密钥 |
| `MIMO_API_ENDPOINT` | ❌ | 自定义 API 端点 |
| `MIMO_TTS_MODEL` | ❌ | 自定义模型名称（默认 `mimo-v2-audio-tts`）|
| `PORT` | ❌ | 服务端口（默认 `3210`）|

## 📄 License

MIT
