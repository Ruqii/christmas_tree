# 🔧 SPA 路由 404 问题修复

## 问题描述

邮件中的卡片链接打开后显示 404 错误：
```
https://christmas-tree-jade.vercel.app/card?to=zhengruqi2019&from=Ruqi&msg=heyhey
```

**错误信息：**
- 浏览器显示 404 Not Found
- Console 显示：`Failed to load resource: the server responded with a status of 404`

---

## 问题原因

这是典型的 **SPA (Single Page Application) 路由问题**。

### 工作原理对比

#### ✅ 本地开发（正常）
```
用户访问 /card
  ↓
Vite Dev Server 返回 index.html
  ↓
React Router 接管，显示 CardPage
  ↓
✅ 正常显示
```

#### ❌ Vercel 部署（404）
```
用户访问 /card
  ↓
Vercel 在 dist 目录查找 card.html
  ↓
文件不存在
  ↓
❌ 返回 404
```

### 根本问题

**React Router 使用客户端路由：**
- 所有路由（`/`, `/card`）都在 JavaScript 中定义
- 实际上只有一个 HTML 文件：`index.html`
- 服务器需要将所有路由请求都返回 `index.html`
- 然后 React Router 在浏览器中处理路由

**Vercel 默认行为：**
- 直接访问 `/card` 时，Vercel 会查找 `dist/card.html`
- 这个文件不存在（我们只有 `dist/index.html`）
- 返回 404

---

## 解决方案

### ✅ 在 `vercel.json` 中添加 rewrites 规则

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

### 规则说明

**正则表达式分解：**
```
/((?!api/).*)
  │  │     │
  │  │     └─ .* 匹配任意字符
  │  └─────── (?!api/) 负向前瞻，排除包含 api/ 的路径
  └────────── / 匹配根路径
```

**效果：**

| 请求路径 | 是否匹配 | 处理方式 |
|---------|---------|---------|
| `/` | ✅ 匹配 | 返回 `index.html` → React Router 显示首页 |
| `/card?to=...` | ✅ 匹配 | 返回 `index.html` → React Router 显示卡片 |
| `/any-route` | ✅ 匹配 | 返回 `index.html` → React Router 处理 |
| `/api/sendCard` | ❌ 不匹配 | 正常访问 API 函数 ✅ |
| `/api/test` | ❌ 不匹配 | 正常访问 API 函数 ✅ |
| `/email-assets/email-bg.jpg` | ✅ 匹配 | 但静态文件优先级更高，正常访问 ✅ |

**关键点：**
- ✅ 所有非 API 路径都返回 `index.html`
- ✅ API 路径（`/api/*`）不受影响
- ✅ 静态文件（在 `dist` 中）优先级高于 rewrites

---

## 部署流程

### 1. 提交更改

```bash
# 查看更改
git status

# 暂存更改
git add vercel.json

# 提交
git commit -m "fix: add SPA routing support with rewrites for /card route"

# 推送（会自动触发 Vercel 重新部署）
git push
```

### 2. 等待部署完成

访问 Vercel Dashboard 查看部署进度，或在终端查看：
```bash
vercel logs
```

### 3. 测试路由

**测试 1：直接访问卡片页面**
```
访问：https://christmas-tree-jade.vercel.app/card?to=test&from=sender&msg=hello
预期：✅ 显示卡片页面（不是 404）
```

**测试 2：首页**
```
访问：https://christmas-tree-jade.vercel.app/
预期：✅ 显示表单页面
```

**测试 3：API 端点**
```bash
curl -X POST https://christmas-tree-jade.vercel.app/api/sendCard \
  -H "Content-Type: application/json" \
  -d '{"recipientEmail":"test@example.com","senderName":"Test","message":"Test"}'

预期：✅ 返回 JSON 响应（不是 HTML）
```

**测试 4：静态资源**
```
访问：https://christmas-tree-jade.vercel.app/email-assets/email-bg.jpg
预期：✅ 显示图片（不是 index.html）
```

---

## 为什么之前删除了 rewrites？

### 历史问题

在之前的配置中，有这样的 rewrites：
```json
{
  "rewrites": [{
    "source": "/((?!api/).*)",
    "destination": "/index.html"
  }]
}
```

**当时遇到的问题：**
- Vite 开发服务器与 Vercel 配置冲突
- API 路由无法正常工作
- 静态文件加载出现问题

**当时的解决方案：**
- 删除了整个 rewrites 配置

**但这导致了新问题：**
- SPA 路由无法工作
- `/card` 页面 404

### 现在的正确配置

现在的配置是正确的：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

**为什么现在可以工作：**
1. ✅ 不再使用过时的 `functions` 配置
2. ✅ Vercel 自动检测 API 函数
3. ✅ rewrites 正则表达式正确排除 `/api/` 路径
4. ✅ 静态文件优先级高于 rewrites

---

## 验证 rewrites 生效

### 方法 1：浏览器测试

1. 访问 https://christmas-tree-jade.vercel.app/card?to=test&from=me&msg=hello
2. 打开浏览器开发者工具 → Network 标签
3. 刷新页面
4. 查看请求：
   - `card?...` 请求应该返回 `index.html` (状态码 200)
   - HTML 内容应该包含 React 代码
   - 页面应该显示卡片，不是 404

### 方法 2：Curl 测试

```bash
# 测试非 API 路径（应返回 HTML）
curl -I https://christmas-tree-jade.vercel.app/card

# 预期输出：
# HTTP/2 200
# content-type: text/html

# 测试 API 路径（应返回 JSON 或错误）
curl -I https://christmas-tree-jade.vercel.app/api/sendCard

# 预期输出：
# HTTP/2 405  (因为是 GET 请求，API 只接受 POST)
# 或其他非 HTML 响应
```

### 方法 3：查看 Vercel 部署日志

```bash
vercel logs --follow
```

查看是否有关于 rewrites 的日志信息。

---

## 常见问题

### Q1: 为什么本地可以，部署就 404？

**A:** 本地开发服务器（Vite）自动处理 SPA 路由，但 Vercel 需要明确配置。

### Q2: rewrites 会影响 API 性能吗？

**A:** 不会。正则表达式 `(?!api/)` 在匹配时就排除了 API 路径，API 请求直接路由到函数。

### Q3: 为什么静态文件不受影响？

**A:** Vercel 的优先级：
1. 静态文件（`dist` 目录中的文件）
2. API 函数（`/api` 目录）
3. Rewrites 规则

静态文件优先级最高，不会被 rewrites 影响。

### Q4: 如果添加更多路由怎么办？

**A:** 不需要修改配置！所有客户端路由都会自动工作：

```typescript
// App.tsx - 添加新路由
<Routes>
  <Route path="/" element={<GeneratorPage />} />
  <Route path="/card" element={<CardPage />} />
  <Route path="/new-route" element={<NewPage />} />  // ✅ 自动支持
</Routes>
```

### Q5: 邮件链接现在会正常工作吗？

**A:** 是的！部署后：
```
https://christmas-tree-jade.vercel.app/card?to=...&from=...&msg=...
  ↓
Vercel 应用 rewrite 规则
  ↓
返回 index.html
  ↓
React Router 解析 URL 参数
  ↓
✅ 显示个性化卡片页面
```

---

## 总结

✅ **问题根源：** SPA 路由需要服务器配置支持

✅ **解决方案：** 在 `vercel.json` 中添加 rewrites 规则

✅ **效果：**
- `/card` 路由正常工作
- API 端点不受影响
- 静态资源正常加载
- 邮件链接可以正常打开

✅ **部署后验证：**
1. 访问 https://christmas-tree-jade.vercel.app/card?to=test&from=me&msg=hello
2. 应该看到卡片页面，不是 404
3. 邮件中的链接可以正常打开

🚀 **现在提交并推送代码，等待部署完成即可！**
