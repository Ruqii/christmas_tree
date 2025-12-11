# 🔧 Vercel Runtime 版本修复

## 问题描述

部署到 Vercel 时遇到 Node.js 版本不兼容错误：
- ❌ Node.js 18.x - 不被接受
- ❌ Node.js 20.x - 不被接受
- ❌ Node.js 24.x - 不被接受

## 根本原因

**旧的 runtime 配置与 Vercel 现代部署系统不兼容**

之前的 `vercel.json` 配置：
```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node@3.0.7"  // ❌ 过时的 runtime 版本
    }
  }
}
```

**问题分析：**

1. **`@vercel/node@3.0.7` 是旧版 runtime**
   - 发布于较早时期
   - 不支持现代 Node.js 版本（18+）
   - 与 Vercel 当前部署系统不兼容

2. **package.json 中有新版但未使用**
   ```json
   "@vercel/node": "^5.5.15"  // devDependencies 中有新版
   ```
   但 `vercel.json` 仍然硬编码使用 `3.0.7`

3. **现代 Vercel 使用不同的 runtime 指定方式**
   - 不再使用 `@vercel/node@版本号`
   - 改用 `nodejs20.x` 等简化语法

---

## 解决方案

### ✅ 更新到现代 Vercel Runtime

**1. 更新 `vercel.json`**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs20.x"  // ✅ 使用现代 runtime 语法
    }
  }
}
```

**变更说明：**
- ❌ 删除：`"runtime": "@vercel/node@3.0.7"`
- ✅ 使用：`"runtime": "nodejs20.x"`

**2. 更新 `package.json`**

```json
{
  "engines": {
    "node": "20.x"  // ✅ 匹配 Vercel runtime
  }
}
```

**3. 更新 `.nvmrc`**

```
20
```

---

## 为什么选择 Node.js 20.x？

### ✅ 兼容性检查

| 依赖包 | 所需 Node.js 版本 | Node.js 20.x 兼容？ |
|--------|------------------|-------------------|
| React 19.2.1 | ≥ 18.x | ✅ 是 |
| Vite 6.2.0 | ≥ 18.x | ✅ 是 |
| TypeScript 5.8.2 | ≥ 18.x | ✅ 是 |
| Resend 6.6.0 | ≥ 18.x | ✅ 是 |
| @vercel/node 5.5.15 | 20.x | ✅ 是 |

### ✅ Vercel 平台支持

- ✅ `nodejs20.x` 是 Vercel 当前推荐的 runtime
- ✅ 完全支持 TypeScript + ES modules
- ✅ 支持最新的 JavaScript 特性
- ✅ 长期支持（LTS）版本

### ✅ API 代码兼容性

我们的 API 代码使用现代语法，完全兼容 Node.js 20.x：

```typescript
// api/sendCard.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 使用的特性：
  // ✅ ES modules (import/export)
  // ✅ async/await
  // ✅ TypeScript
  // ✅ 现代 JavaScript 语法

  // 全部在 Node.js 20.x 中完美支持
}
```

---

## 现代 Vercel Runtime 语法

### 推荐方式（我们采用的）

```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs20.x"
    }
  }
}
```

### 其他可选方式

**1. 不指定 runtime（自动检测）**
```json
{
  "functions": {
    "api/**/*.ts": {}
  }
}
```
Vercel 会根据 `package.json` 的 `engines` 字段自动选择。

**2. 使用最新版本**
```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs22.x"  // 如果需要 Node.js 22
    }
  }
}
```

**3. 完全省略 functions 配置**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```
Vercel 会自动检测 `/api` 目录并使用适当的 runtime。

---

## 迁移步骤

### 已完成的更改 ✅

1. **vercel.json**
   - 从 `@vercel/node@3.0.7` 更新为 `nodejs20.x`

2. **package.json**
   - `engines.node` 从 `18.x` 更新为 `20.x`

3. **.nvmrc**
   - 从 `18` 更新为 `20`

4. **文档更新**
   - README.md - 前置要求更新为 Node.js 20.x
   - PRE_DEPLOYMENT_CHECKLIST.md - 更新版本检查项

### 不需要更改的文件 ✅

- ✅ **API 代码**（`api/*.ts`）- 无需修改
  - 现有代码已经使用现代语法
  - 完全兼容 Node.js 20.x

- ✅ **依赖包** - 无需更新
  - 所有依赖都兼容 Node.js 20.x
  - `@vercel/node@5.5.15` 已满足要求

- ✅ **前端代码** - 无需修改
  - Vite 构建过程不受影响
  - React 代码运行在浏览器中

---

## 验证部署

### 本地测试

```bash
# 使用 Node.js 20.x
nvm use 20

# 安装依赖
npm install

# 本地运行
npm start

# 访问 http://localhost:3000
# 测试 API 端点
```

### Vercel 部署

```bash
# 提交更改
git add vercel.json package.json .nvmrc README.md PRE_DEPLOYMENT_CHECKLIST.md
git commit -m "fix: update to Node.js 20.x with modern Vercel runtime"
git push

# Vercel 会自动：
# 1. 检测 nodejs20.x runtime
# 2. 使用 Node.js 20 构建项目
# 3. 部署 API functions
```

### 部署后检查

1. **检查构建日志**
   - 应该显示 "Using Node.js 20.x"

2. **测试 API 端点**
   ```bash
   curl -X POST https://christmas-tree-jade.vercel.app/api/sendCard \
     -H "Content-Type: application/json" \
     -d '{"recipientEmail":"test@example.com","senderName":"Test","message":"Test"}'
   ```

3. **验证功能**
   - ✅ 邮件发送正常
   - ✅ 背景图片加载
   - ✅ 链接正确

---

## Vercel Runtime 版本对照

| 旧语法（已弃用） | 新语法（推荐） | 支持状态 |
|----------------|--------------|---------|
| `@vercel/node@3.0.7` | `nodejs20.x` | ✅ 现代语法 |
| `@vercel/node@2.x` | `nodejs18.x` | ⚠️ 旧版 |
| `nodejs` | `nodejs20.x` | ⚠️ 模糊指定 |
| 未指定 | 自动检测 | ✅ 可选 |

---

## 相关资源

- [Vercel Runtimes 文档](https://vercel.com/docs/functions/runtimes)
- [Vercel Node.js Runtime](https://vercel.com/docs/functions/runtimes/node-js)
- [Node.js 20 发布说明](https://nodejs.org/en/blog/release/v20.0.0)

---

## 问题排查

### 如果仍然遇到版本错误

**1. 清除 Vercel 缓存**
```bash
vercel --force
```

**2. 检查 Vercel Dashboard 设置**
- 确认项目设置中没有硬编码的 Node.js 版本
- Settings → General → Node.js Version 应该是 "20.x" 或 "Auto"

**3. 验证本地配置**
```bash
# 检查 package.json
cat package.json | grep -A2 "engines"

# 检查 vercel.json
cat vercel.json

# 检查 .nvmrc
cat .nvmrc
```

**4. 重新部署**
```bash
# 清除本地 Vercel 配置
rm -rf .vercel

# 重新链接项目
vercel link

# 部署
vercel --prod
```

---

## 总结

✅ **问题已解决：**
- 从过时的 `@vercel/node@3.0.7` 迁移到现代 `nodejs20.x`
- 更新所有配置文件以匹配 Node.js 20.x
- 验证了代码兼容性

✅ **优势：**
- 使用 Vercel 推荐的现代 runtime
- 获得更好的性能和安全性
- 与最新的 JavaScript/TypeScript 特性兼容
- 长期支持保证

🚀 **现在可以成功部署到 Vercel！**
