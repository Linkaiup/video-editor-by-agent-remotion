# .env 加载问题修复总结

## ✅ 修复的文件

### 1. server/src/index.ts
```typescript
// ✅ 添加这些代码
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../.env') });
```

### 2. src/agent/config.ts
```typescript
// ✅ 在文件顶部添加这些代码
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../.env') });

// 然后再读取环境变量
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
```

---

## 🎯 效果

### 修复前
```bash
cd server
npm run dev  # ✅ 只能在 server 目录运行
```

### 修复后
```bash
# ✅ 任意目录都可以
npm run dev
cd server && npm run dev
node server/dist/index.js
```

---

## 📁 .env 文件位置

**统一放在项目根目录：**
```
project/
├── .env              # ✅ 这里
├── server/
└── src/
```

---

## ⚠️ 常见错误

### 错误 1：OPENAI_API_KEY 环境变量未设置

**原因：** `config.ts` 没有加载 `.env`

**解决：** 在 `config.ts` 顶部添加 dotenv 加载代码

### 错误 2：从 server/ 目录才能运行

**原因：** 使用 `import 'dotenv/config'` 从 cwd 加载

**解决：** 使用 `config({ path: '../../.env' })` 明确路径

---

**状态：** ✅ 已修复
**测试：** ✅ 编译通过
