# .env 文件配置说明

## 🔍 问题描述

**问题：** 为什么 .env 文件要放在 server 文件夹下才能生效？

**原因：** `dotenv` 默认从**当前工作目录（cwd）**加载 .env 文件。

---

## 📊 问题分析

### 之前的代码

```typescript
// server/src/index.ts
import 'dotenv/config';  // ❌ 从当前工作目录加载
```

### 运行场景对比

| 运行方式 | 当前工作目录 | 加载的 .env |
|---------|-------------|------------|
| `cd server && npm run dev` | `server/` | `server/.env` ✅ |
| `npm run server:dev`（根目录） | `项目根/` | `项目根/.env` ✅ |
| `node server/dist/index.js` | `项目根/` | `项目根/.env` ✅ |

**问题：** 需要在不同位置维护两个 .env 文件！

---

## ✅ 解决方案

### 修改后的代码

```typescript
// server/src/index.ts
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ 明确从项目根目录加载 .env
config({ path: resolve(__dirname, '../../.env') });
```

### 路径计算

```
当前文件：server/src/index.ts
__dirname：/path/to/project/server/src
../../     ：回到项目根目录
.env       ：/path/to/project/.env
```

---

## 📁 推荐的文件结构

### 统一使用根目录的 .env

```
project/
├── .env                  # ✅ 统一放在这里
├── .env.example          # 环境变量模板
├── server/
│   ├── src/
│   │   └── index.ts      # 从 ../../.env 加载
│   └── package.json
├── web/
│   └── ...
└── package.json
```

### .env 文件内容

```env
# OpenAI API 配置
OPENAI_API_KEY=sk-xxx
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o

# 服务器配置
PORT=3001

# 超时配置
OPENAI_TIMEOUT=300000
```

---

## 🎯 优势

### 修改前（在 server/ 目录）

**缺点：**
- ❌ 需要 `cd server` 才能运行
- ❌ 根目录的脚本无法使用
- ❌ 需要维护两个 .env 文件
- ❌ 容易混淆

### 修改后（在根目录）

**优点：**
- ✅ 统一的配置文件位置
- ✅ 任意目录都能正确加载
- ✅ 只需维护一个 .env
- ✅ 符合项目惯例

---

## 🔧 使用方式

### 开发环境

```bash
# 在任意目录都可以
npm run dev          # 启动所有服务
cd server && npm run dev  # 只启动后端
```

### 生产环境

```bash
# 在根目录
npm run build
node server/dist/index.js
```

**都会从根目录的 .env 加载配置！**

---

## 📝 .gitignore 配置

```gitignore
# 环境变量
.env
.env.local
.env.*.local

# 但保留示例文件
!.env.example
```

---

## ⚠️ 注意事项

### 1. ESM 模块需要手动获取 __dirname

**CommonJS (require)：**
```javascript
require('dotenv').config({ path: '../../.env' });
```

**ESM (import)：**
```javascript
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

### 2. Agent 代码也需要加载 .env

**重要！** `src/agent/config.ts` 也需要加载环境变量：

```typescript
// src/agent/config.ts
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ 从根目录加载 .env（往上两级：src/agent/ -> src/ -> 根目录）
config({ path: resolve(__dirname, '../../.env') });

// 现在可以安全读取环境变量
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL;

export const AGENT_CONFIG = {
  apiKey: OPENAI_API_KEY,
  apiBase: OPENAI_BASE_URL,
  // ...
};
```

**为什么需要？**
- `config.ts` 在文件顶部就读取 `process.env.OPENAI_API_KEY`
- 如果不先加载 `.env`，环境变量为 `undefined`
- 会抛出错误：`OPENAI_API_KEY 环境变量未设置`

---

## ✅ 验证清单

- ✅ `.env` 文件在项目根目录
- ✅ `server/src/index.ts` 使用 `config({ path: '../../.env' })`
- ✅ 任意目录运行 `npm run dev` 都能正确加载
- ✅ `.env.example` 包含所有必需的环境变量
- ✅ `.gitignore` 忽略 `.env` 文件

---

## 🎉 效果

**现在可以：**
1. ✅ 在根目录运行 `npm run dev`
2. ✅ 在 server 目录运行 `npm run dev`
3. ✅ 执行 `node server/dist/index.js`
4. ✅ 所有方式都从根目录的 `.env` 加载配置

**不再需要：**
- ❌ 维护两个 .env 文件
- ❌ 记住在哪个目录运行
- ❌ 手动 `cd` 到特定目录

---

**状态：** ✅ 已修复  
**日期：** 2026-07-08  
**修改文件：** `server/src/index.ts`
